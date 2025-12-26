#!/usr/bin/env bash
set -euo pipefail

# =========================
# Load Configurations
# =========================
if [ ! -f "infra_config.env" ]; then
    echo "❌ Error: infra_config.env not found!"
    echo "Run ./deploy_infra.sh first"
    exit 1
fi

source infra_config.env

if [ ! -f "ollama_vm_config.env" ]; then
    echo "❌ Error: ollama_vm_config.env not found!"
    echo "Run ./setup_ollama_vm.sh first"
    exit 1
fi

source ollama_vm_config.env

echo "=========================================="
echo "🚀 Story App - Deployment with Ollama VM"
echo "=========================================="
echo "Resource Group: $RESOURCE_GROUP"
echo "ACR: $ACR_NAME"
echo "Ollama VM: $OLLAMA_VM_IP"
echo "=========================================="
echo ""

# =========================
# 1. ACR Login
# =========================
echo "🔐 Logging into ACR..."
az acr login --name "$ACR_NAME"

ACR_SERVER="${ACR_NAME}.azurecr.io"
ACR_USER=$(az acr credential show --name "$ACR_NAME" --query username --output tsv | tr -d '\r')
ACR_PASS=$(az acr credential show --name "$ACR_NAME" --query "passwords[0].value" --output tsv | tr -d '\r')

echo "✅ ACR login successful"

# =========================
# 2. Build & Push Images
# =========================
echo ""
echo "🐳 Building and pushing Docker images..."
echo ""

# Backend
echo "📦 Building Backend..."
cd services/user_service
docker build -t "${ACR_SERVER}/backend:latest" .
docker push "${ACR_SERVER}/backend:latest"
cd ../..
echo "✅ Backend pushed"

# AI Backend (with Ollama)
echo "📦 Building AI Backend (Ollama)..."
cd services/chatbot
docker build -t "${ACR_SERVER}/chatbot:latest" .
docker push "${ACR_SERVER}/chatbot:latest"
cd ../..
echo "✅ AI Backend pushed"

# Frontend
echo "📦 Building Frontend..."
cd frontend/front_user
docker build --target production -t "${ACR_SERVER}/frontend:latest" .
docker push "${ACR_SERVER}/frontend:latest"
cd ../..
echo "✅ Frontend pushed"

# =========================
# 3. Get Cosmos Connection
# =========================
echo ""
echo "🔗 Getting Cosmos DB connection string..."
COSMOS_CONN=$(az cosmosdb keys list \
  --name "$COSMOS_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --type connection-strings \
  --query "connectionStrings[0].connectionString" \
  --output tsv | tr -d '\r')

echo "✅ Connection string retrieved"

# =========================
# 4. Deploy Backend
# =========================
echo ""
echo "🚀 Deploying Backend..."

if az containerapp show --name "backend" --resource-group "$RESOURCE_GROUP" >/dev/null 2>&1; then
    echo "Updating existing backend..."
    az containerapp update \
      --name "backend" \
      --resource-group "$RESOURCE_GROUP" \
      --image "${ACR_SERVER}/backend:latest" \
      --output none
else
    echo "Creating new backend..."
    az containerapp create \
      --name "backend" \
      --resource-group "$RESOURCE_GROUP" \
      --environment "$ENV_NAME" \
      --image "${ACR_SERVER}/backend:latest" \
      --ingress external \
      --target-port 5000 \
      --registry-server "$ACR_SERVER" \
      --registry-username "$ACR_USER" \
      --registry-password "$ACR_PASS" \
      --env-vars \
        "NODE_ENV=production" \
        "PORT=5000" \
        "MONGODB_URI=${COSMOS_CONN}" \
        "APPLICATIONINSIGHTS_CONNECTION_STRING=${APPINSIGHTS_CONNECTION_STRING}" \
      --min-replicas 1 \
      --max-replicas 3 \
      --cpu 0.5 \
      --memory 1Gi \
      --output none
fi

BACKEND_URL=$(az containerapp show \
  --name "backend" \
  --resource-group "$RESOURCE_GROUP" \
  --query properties.configuration.ingress.fqdn \
  --output tsv | tr -d '\r')

echo "✅ Backend deployed: https://$BACKEND_URL"

# =========================
# 5. Deploy AI Backend (with Ollama VM)
# =========================
echo ""
echo "🤖 Deploying AI Backend with Ollama VM..."

if az containerapp show --name "chatbot" --resource-group "$RESOURCE_GROUP" >/dev/null 2>&1; then
    echo "Updating existing chatbot..."
    az containerapp update \
      --name "chatbot" \
      --resource-group "$RESOURCE_GROUP" \
      --image "${ACR_SERVER}/chatbot:latest" \
      --set-env-vars \
        "OLLAMA_URL=${OLLAMA_URL}" \
        "MODEL_NAME=${MODEL_NAME}" \
      --output none
else
    echo "Creating new chatbot with Ollama VM..."
    az containerapp create \
      --name "chatbot" \
      --resource-group "$RESOURCE_GROUP" \
      --environment "$ENV_NAME" \
      --image "${ACR_SERVER}/chatbot:latest" \
      --ingress external \
      --target-port 5002 \
      --registry-server "$ACR_SERVER" \
      --registry-username "$ACR_USER" \
      --registry-password "$ACR_PASS" \
      --env-vars \
        "FLASK_ENV=production" \
        "OLLAMA_URL=${OLLAMA_URL}" \
        "MODEL_NAME=${MODEL_NAME}" \
        "MAX_REQUESTS_PER_MINUTE=30" \
        "MAX_REQUESTS_PER_DAY=1000" \
        "APPLICATIONINSIGHTS_CONNECTION_STRING=${APPINSIGHTS_CONNECTION_STRING}" \
      --min-replicas 1 \
      --max-replicas 3 \
      --cpu 0.5 \
      --memory 1Gi \
      --output none
fi

CHATBOT_URL=$(az containerapp show \
  --name "chatbot" \
  --resource-group "$RESOURCE_GROUP" \
  --query properties.configuration.ingress.fqdn \
  --output tsv | tr -d '\r')

echo "✅ AI Backend deployed: https://$CHATBOT_URL"

# =========================
# 6. Deploy Frontend
# =========================
echo ""
echo "🎨 Deploying Frontend..."

if az containerapp show --name "frontend" --resource-group "$RESOURCE_GROUP" >/dev/null 2>&1; then
    echo "Updating existing frontend..."
    az containerapp update \
      --name "frontend" \
      --resource-group "$RESOURCE_GROUP" \
      --image "${ACR_SERVER}/frontend:latest" \
      --output none
else
    echo "Creating new frontend..."
    az containerapp create \
      --name "frontend" \
      --resource-group "$RESOURCE_GROUP" \
      --environment "$ENV_NAME" \
      --image "${ACR_SERVER}/frontend:latest" \
      --ingress external \
      --target-port 80 \
      --registry-server "$ACR_SERVER" \
      --registry-username "$ACR_USER" \
      --registry-password "$ACR_PASS" \
      --env-vars \
        "VITE_API_URL=https://${BACKEND_URL}" \
        "VITE_AI_API_URL=https://${CHATBOT_URL}" \
      --min-replicas 1 \
      --max-replicas 5 \
      --cpu 0.25 \
      --memory 0.5Gi \
      --output none
fi

FRONTEND_URL=$(az containerapp show \
  --name "frontend" \
  --resource-group "$RESOURCE_GROUP" \
  --query properties.configuration.ingress.fqdn \
  --output tsv | tr -d '\r')

echo "✅ Frontend deployed: https://$FRONTEND_URL"

# =========================
# Summary
# =========================
echo ""
echo "=========================================="
echo "✅ DEPLOYMENT COMPLETE WITH OLLAMA VM"
echo "=========================================="
echo ""
echo "🌐 Application URLs:"
echo "  Frontend:    https://$FRONTEND_URL"
echo "  Backend:     https://$BACKEND_URL"
echo "  AI Backend:  https://$CHATBOT_URL"
echo ""
echo "🦙 Ollama VM:"
echo "  IP:          $OLLAMA_VM_IP"
echo "  SSH:         ssh -i ~/.ssh/ollama_vm_rsa ${OLLAMA_VM_USER}@${OLLAMA_VM_IP}"
echo "  Ollama URL:  $OLLAMA_URL"
echo ""
echo "📊 Monitoring:"
echo "  Azure Portal: https://portal.azure.com"
echo "  Resource Group: $RESOURCE_GROUP"
echo ""
echo "💰 Monthly Costs (Estimated):"
echo "  Container Apps: ~$30"
echo "  Cosmos DB: ~$25"
echo "  Ollama VM: ~$70"
echo "  Total: ~$125/month"
echo ""
echo "🗑️  To delete everything:"
echo "  az group delete --name $RESOURCE_GROUP --yes --no-wait"
echo "=========================================="