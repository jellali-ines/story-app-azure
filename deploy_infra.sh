#!/usr/bin/env bash
set -euo pipefail

# =========================
# Configuration
# =========================
RG="rg-storytelling5"
LOCATION="italynorth"

echo "=========================================="
echo "🚀 Story App - Infrastructure Setup"
echo "=========================================="
echo "Resource Group: $RG"
echo "Location: $LOCATION"
echo "=========================================="
echo ""

# =========================
# 1. Resource Group
# =========================
echo "📁 Checking/Creating Resource Group..."
if az group exists --name "$RG" | grep -q true; then
  echo "✅ Resource Group already exists: $RG"
else
  az group create \
    --name "$RG" \
    --location "$LOCATION" \
    --output none
  echo "✅ Resource Group created"
fi

# =========================
# 2. Azure Container Registry
# =========================
echo ""
echo "🐳 Checking/Creating Azure Container Registry..."
ACR_NAME="acrstory606755"

if az acr show --name "$ACR_NAME" --resource-group "$RG" &>/dev/null; then
  echo "✅ ACR already exists: $ACR_NAME"
else
  az acr create \
    --resource-group "$RG" \
    --name "$ACR_NAME" \
    --sku Basic \
    --admin-enabled true \
    --location "$LOCATION" \
    --output none
  echo "✅ ACR created: $ACR_NAME"
fi

# =========================
# 3. Log Analytics Workspace
# =========================
echo ""
echo "📊 Checking/Creating Log Analytics Workspace..."
LAW="law-story"

if az monitor log-analytics workspace show --name "$LAW" --resource-group "$RG" &>/dev/null; then
  echo "✅ Log Analytics already exists: $LAW"
else
  az monitor log-analytics workspace create \
    --resource-group "$RG" \
    --workspace-name "$LAW" \
    --location "$LOCATION" \
    --output none
  
  sleep 10
  echo "✅ Log Analytics created"
fi

LAW_ID=$(az monitor log-analytics workspace show \
  --resource-group "$RG" \
  --workspace-name "$LAW" \
  --query customerId \
  --output tsv | tr -d '\r')

LAW_KEY=$(az monitor log-analytics workspace get-shared-keys \
  --resource-group "$RG" \
  --workspace-name "$LAW" \
  --query primarySharedKey \
  --output tsv | tr -d '\r')

# =========================
# 4. Container Apps Environment
# =========================
echo ""
echo "🌐 Checking/Creating Container Apps Environment..."
ENV="env-storytelling"

if az containerapp env show --name "$ENV" --resource-group "$RG" &>/dev/null; then
  echo "✅ Container Apps Environment already exists: $ENV"
else
  az containerapp env create \
    --name "$ENV" \
    --resource-group "$RG" \
    --location "$LOCATION" \
    --logs-workspace-id "$LAW_ID" \
    --logs-workspace-key "$LAW_KEY" \
    --output none
  echo "✅ Container Apps Environment created"
fi

# =========================
# 5. Application Insights
# =========================
echo ""
echo "📈 Checking/Creating Application Insights..."

if az monitor app-insights component show --app "appinsights-story" --resource-group "$RG" &>/dev/null; then
  echo "✅ Application Insights already exists"
else
  az monitor app-insights component create \
    --app "appinsights-story" \
    --location "$LOCATION" \
    --resource-group "$RG" \
    --application-type web \
    --output none
  echo "✅ Application Insights created"
fi

APPINSIGHTS_CONN=$(az monitor app-insights component show \
  --app "appinsights-story" \
  --resource-group "$RG" \
  --query connectionString \
  --output tsv | tr -d '\r')

# =========================
# Summary
# =========================
echo ""
echo "=========================================="
echo "✅ INFRASTRUCTURE SETUP COMPLETE"
echo "=========================================="
echo ""
echo "📋 Configuration Values:"
echo ""
echo "RESOURCE_GROUP=$RG"
echo "LOCATION=$LOCATION"
echo "ACR_NAME=$ACR_NAME"
echo "ENV_NAME=$ENV"
echo "LAW_ID=$LAW_ID"
echo "APPINSIGHTS_CONNECTION_STRING=$APPINSIGHTS_CONN"
echo ""
echo "=========================================="
echo ""

# =========================
# Create infra_config.env with MongoDB Atlas (✅ جديد)
# =========================
echo "💾 Creating infra_config.env with MongoDB Atlas..."

cat > infra_config.env << EOF
# ===========================
# Azure Configuration
# ===========================
RESOURCE_GROUP=$RG
LOCATION=$LOCATION
ACR_NAME=$ACR_NAME
ENV_NAME=$ENV

# ===========================
# Monitoring & Analytics
# ===========================
LAW_ID=$LAW_ID
APPINSIGHTS_CONNECTION_STRING=$APPINSIGHTS_CONN

# ===========================
# MongoDB Atlas Configuration (✅ بدلاً من Cosmos DB)
# ===========================
MONGODB_ATLAS_URI=mongodb+srv://admin:BM0a7A1cwkcopozO@cluster0.l3awpvu.mongodb.net/AppStories?retryWrites=true&w=majority
MONGO_URI=mongodb+srv://admin:BM0a7A1cwkcopozO@cluster0.l3awpvu.mongodb.net/AppStories?retryWrites=true&w=majority
DATABASE_NAME=AppStories

# ===========================
# Application Configuration
# ===========================
NODE_ENV=production
PORT=5000
FLASK_ENV=production

# ===========================
# Backend Configuration
# ===========================
JWT_SECRET=your-secret-key-here-change-in-production
API_PORT=5000

# ===========================
# Chatbot Configuration
# ===========================
OLLAMA_URL=http://192.168.1.100:11434/api/generate
MODEL_NAME=llama3.1:8b
MAX_REQUESTS_PER_MINUTE=30
MAX_REQUESTS_PER_DAY=1000

# ===========================
# Container Apps URLs
# ===========================
VITE_API_URL=https://backend.bluesmoke-49ce99c2.italynorth.azurecontainerapps.io
VITE_AI_API_URL=https://chatbot.bluesmoke-49ce99c2.italynorth.azurecontainerapps.io
EOF

echo ""
echo "✅ Configuration saved to: infra_config.env"
echo ""
cat infra_config.env
echo ""
echo "=========================================="
echo "✅ Ready for deployment!"
echo "=========================================="
echo ""
echo "Next step: Run deployment script"
echo "  bash deploy_apps.sh"
echo ""
echo "=========================================="