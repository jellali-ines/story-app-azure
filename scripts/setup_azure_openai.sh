#!/usr/bin/env bash
set -euo pipefail

# =========================
# Load Infrastructure Config
# =========================
if [ ! -f "infra_config.env" ]; then
    echo "❌ Error: infra_config.env not found!"
    echo "Run ./deploy_infra.sh first"
    exit 1
fi

source infra_config.env

# =========================
# Azure OpenAI Configuration
# =========================
OPENAI_NAME="story-openai-$(date +%s | tail -c 6)"
OPENAI_REGIONS=(
  "eastus" "eastus2" "southcentralus" "westus" "westus2" "centralus"
  "westeurope" "northeurope" "francecentral" "francesouth"
  "germanywestcentral" "germanynorth" "swedencentral" "sweden"
  "uksouth" "ukwest" "canadacentral" "canadaeast"
  "japaneast" "japanwest" "koreacentral" "koreasouth"
  "australiaeast" "australiasoutheast" "brazilsouth"
)


echo "=========================================="
echo "🤖 Setting up Azure OpenAI"
echo "Resource Group: $RESOURCE_GROUP"
echo "OpenAI Name: $OPENAI_NAME"
echo "=========================================="
echo ""

# =========================
# Register Provider if needed
# =========================
if ! az provider show --namespace Microsoft.CognitiveServices >/dev/null 2>&1; then
    echo "⚠️  Registering Microsoft.CognitiveServices provider..."
    az provider register --namespace Microsoft.CognitiveServices --wait
fi

# =========================
# 1. Try creating OpenAI in multiple regions
# =========================
CREATED=false
for REGION in "${OPENAI_REGIONS[@]}"; do
    echo "🔍 Trying region: $REGION ..."
    if az cognitiveservices account create \
      --name "$OPENAI_NAME" \
      --resource-group "$RESOURCE_GROUP" \
      --kind "OpenAI" \
      --sku "S0" \
      --location "$REGION" \
      --yes \
      --output none 2>/dev/null; then
        echo "✅ Azure OpenAI Resource created in $REGION"
        OPENAI_LOCATION=$REGION
        CREATED=true
        break
    else
        echo "⚠️ Region $REGION not available, trying next..."
    fi
done

if [ "$CREATED" = false ]; then
    echo "❌ Failed to create Azure OpenAI in all regions."
    exit 1
fi

sleep 15

# =========================
# 2. Deploy GPT-3.5-Turbo Model
# =========================
echo "🚀 Deploying GPT-3.5-Turbo model..."
az cognitiveservices account deployment create \
  --name "$OPENAI_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --deployment-name "gpt-35-turbo" \
  --model-name "gpt-35-turbo" \
  --model-version "0613" \
  --model-format "OpenAI" \
  --sku-capacity 10 \
  --sku-name "Standard" \
  --output none

echo "✅ Model deployed: gpt-35-turbo"

# =========================
# 3. Get Endpoint and Keys
# =========================
echo ""
echo "🔑 Getting credentials..."
ENDPOINT=$(az cognitiveservices account show \
  --name "$OPENAI_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query properties.endpoint \
  --output tsv | tr -d '\r')

KEY=$(az cognitiveservices account keys list \
  --name "$OPENAI_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query key1 \
  --output tsv | tr -d '\r')

# =========================
# Summary
# =========================
echo ""
echo "=========================================="
echo "✅ AZURE OPENAI SETUP COMPLETE"
echo "=========================================="
echo ""
echo "📋 Configuration:"
echo ""
echo "AZURE_OPENAI_ENDPOINT=$ENDPOINT"
echo "AZURE_OPENAI_KEY=$KEY"
echo "AZURE_OPENAI_DEPLOYMENT=gpt-35-turbo"
echo "AZURE_OPENAI_API_VERSION=2024-02-15-preview"
echo "LOCATION=$OPENAI_LOCATION"
echo ""
echo "=========================================="

# Save to file
cat > azure_openai_config.env << EOF
AZURE_OPENAI_ENDPOINT=$ENDPOINT
AZURE_OPENAI_KEY=$KEY
AZURE_OPENAI_DEPLOYMENT=gpt-35-turbo
AZURE_OPENAI_API_VERSION=2024-02-15-preview
LOCATION=$OPENAI_LOCATION
EOF

echo "✅ Configuration saved to: azure_openai_config.env"
