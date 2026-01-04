#!/usr/bin/env bash
set -euo pipefail

# ===========================
# Setup Ollama VM on Azure - FIXED VERSION
# ===========================

# Load infrastructure config
if [ ! -f "infra_config.env" ]; then
    echo "❌ Error: infra_config.env not found!"
    echo "Run ./deploy_infra.sh first"
    exit 1
fi

source infra_config.env

# Configuration
VM_NAME="ollama-vm"
VM_SIZE="Standard_D2s_v3"
VM_IMAGE="Ubuntu2204"
ADMIN_USER="azureuser"

echo "=========================================="
echo "🦙 Setting up Ollama VM on Azure"
echo "=========================================="
echo "Resource Group: $RESOURCE_GROUP"
echo "Location: $LOCATION"
echo "VM Name: $VM_NAME"
echo "VM Size: $VM_SIZE"
echo "=========================================="
echo ""

# ===========================
# 1. Generate SSH Key (if not exists)
# ===========================
if [ ! -f ~/.ssh/ollama_vm_rsa ]; then
    echo "🔑 Generating SSH key..."
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/ollama_vm_rsa -N "" -C "ollama-vm"
    echo "✅ SSH key generated"
else
    echo "✅ SSH key already exists"
fi

# ===========================
# 2. Create VM
# ===========================
echo "🖥️  Creating VM..."

az vm create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$VM_NAME" \
  --location "$LOCATION" \
  --image "$VM_IMAGE" \
  --size "$VM_SIZE" \
  --admin-username "$ADMIN_USER" \
  --ssh-key-values ~/.ssh/ollama_vm_rsa.pub \
  --public-ip-sku Standard \
  --output none

echo "✅ VM created"

# Get VM IP
VM_IP=$(az vm show \
  --resource-group "$RESOURCE_GROUP" \
  --name "$VM_NAME" \
  --show-details \
  --query publicIps \
  --output tsv | tr -d '\r')

echo "📍 VM IP: $VM_IP"

# ===========================
# 3. Open Firewall Port 11434
# ===========================
echo "🔥 Opening port 11434 (Ollama)..."

az vm open-port \
  --resource-group "$RESOURCE_GROUP" \
  --name "$VM_NAME" \
  --port 11434 \
  --priority 1001 \
  --output none

echo "✅ Port 11434 opened"

# ===========================
# 4. Wait for VM to be ready
# ===========================
echo "⏳ Waiting for VM to be ready..."
sleep 30

# ===========================
# 5. Install Ollama on VM (FIXED WITH SUDO)
# ===========================
echo "🦙 Installing Ollama on VM..."

# Create installation script with PROPER SUDO
cat > /tmp/install_ollama.sh << 'EOFSCRIPT'
#!/bin/bash
set -e

echo "Installing Ollama..."

# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Configure Ollama to accept external connections (WITH SUDO!)
sudo mkdir -p /etc/systemd/system/ollama.service.d

# Use sudo tee instead of cat with redirect
sudo tee /etc/systemd/system/ollama.service.d/override.conf > /dev/null << 'EOF'
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
EOF

# Reload and restart
sudo systemctl daemon-reload
sudo systemctl restart ollama
sudo systemctl enable ollama

echo "✅ Ollama installed and configured"

# Wait for Ollama to start
sleep 5

# Pull llama3.1:8b model
echo "📥 Pulling llama3.1:8b model (this may take 5-10 minutes)..."
ollama pull llama3.1:8b

echo "✅ Model downloaded!"
echo ""
echo "Testing Ollama..."
ollama list

echo ""
echo "✅ Setup complete!"
EOFSCRIPT

# Copy script to VM
scp -i ~/.ssh/ollama_vm_rsa \
    -o StrictHostKeyChecking=no \
    /tmp/install_ollama.sh \
    ${ADMIN_USER}@${VM_IP}:/tmp/

# Execute script on VM
echo "🔧 Running installation script on VM..."
ssh -i ~/.ssh/ollama_vm_rsa \
    -o StrictHostKeyChecking=no \
    ${ADMIN_USER}@${VM_IP} \
    "chmod +x /tmp/install_ollama.sh && /tmp/install_ollama.sh"

echo "✅ Ollama installed and model pulled"

# ===========================
# 6. Test Ollama
# ===========================
echo ""
echo "🧪 Testing Ollama..."
sleep 5

if curl -s http://${VM_IP}:11434/api/tags | grep -q "llama3.1"; then
    echo "✅ Ollama is working correctly!"
else
    echo "⚠️  Ollama test failed. Checking status..."
    ssh -i ~/.ssh/ollama_vm_rsa ${ADMIN_USER}@${VM_IP} "sudo systemctl status ollama"
fi

# ===========================
# Summary
# ===========================
echo ""
echo "=========================================="
echo "✅ OLLAMA VM SETUP COMPLETE"
echo "=========================================="
echo ""
echo "📋 VM Information:"
echo "  IP Address:    $VM_IP"
echo "  SSH Command:   ssh -i ~/.ssh/ollama_vm_rsa ${ADMIN_USER}@${VM_IP}"
echo "  Ollama URL:    http://${VM_IP}:11434"
echo ""
echo "🔧 Configuration for deployment:"
echo "  OLLAMA_URL=http://${VM_IP}:11434/api/generate"
echo ""
echo "📊 Test Ollama:"
echo "  curl http://${VM_IP}:11434/api/tags"
echo ""
echo "=========================================="
echo ""
echo "💰 Estimated Cost:"
echo "  VM (Standard_D2s_v3): ~$70/month"
echo "  Storage: ~$5/month"
echo "  Total: ~$75/month"
echo ""
echo "🗑️  To delete VM and save money:"
echo "  az vm delete --resource-group $RESOURCE_GROUP --name $VM_NAME --yes"
echo "  az vm deallocate --resource-group $RESOURCE_GROUP --name $VM_NAME"
echo "=========================================="

# Save config
cat > ollama_vm_config.env << EOF
OLLAMA_VM_IP=$VM_IP
OLLAMA_URL=http://${VM_IP}:11434/api/generate
OLLAMA_VM_NAME=$VM_NAME
OLLAMA_VM_SSH_KEY=~/.ssh/ollama_vm_rsa
OLLAMA_VM_USER=$ADMIN_USER
MODEL_NAME=llama3.1:8b
EOF

echo ""
echo "✅ Configuration saved to: ollama_vm_config.env"
echo ""
echo "🎯 Next Step: Deploy applications"
echo "   ./deploy_apps.sh"
echo ""