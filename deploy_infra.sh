#!/usr/bin/env bash
set -euo pipefail

# =========================
# Configuration
# =========================
RG="rg-storytelling5"
LOCATION="italynorth"


TIMESTAMP=$(date +%s)
ACR="acrstory${TIMESTAMP:(-6)}"
ENV="env-storytelling"
LAW="law-story"
COSMOS="cosmos-story-${TIMESTAMP:(-6)}"

echo "=========================================="
echo "🚀 Story App - Infrastructure Setup"
echo "=========================================="
echo "Resource Group: $RG"
echo "Location: $LOCATION"
echo "ACR: $ACR"
echo "=========================================="
echo ""

# =========================
# 1. Resource Group
# =========================
echo "📁 Creating Resource Group..."
az group create \
  --name "$RG" \
  --location "$LOCATION" \
  --output none

echo "✅ Resource Group created"

# =========================
# 2. Azure Container Registry
# =========================
echo "🐳 Creating Azure Container Registry..."
az acr create \
  --resource-group "$RG" \
  --name "$ACR" \
  --sku Basic \
  --admin-enabled true \
  --location "$LOCATION" \
  --output none

echo "✅ ACR created: $ACR"

# =========================
# 3. Log Analytics Workspace
# =========================
echo "📊 Creating Log Analytics Workspace..."
az monitor log-analytics workspace create \
  --resource-group "$RG" \
  --workspace-name "$LAW" \
  --location "$LOCATION" \
  --output none

sleep 10

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

echo "✅ Log Analytics created"

# =========================
# 4. Container Apps Environment
# =========================
echo "🌐 Creating Container Apps Environment..."
az containerapp env create \
  --name "$ENV" \
  --resource-group "$RG" \
  --location "$LOCATION" \
  --logs-workspace-id "$LAW_ID" \
  --logs-workspace-key "$LAW_KEY" \
  --output none

echo "✅ Container Apps Environment created"

# =========================
# 5. Cosmos DB (MongoDB API)
# =========================
echo "💾 Creating Cosmos DB (MongoDB API)..."
az cosmosdb create \
  --name "$COSMOS" \
  --resource-group "$RG" \
  --kind MongoDB \
  --locations regionName="$LOCATION" \
  --default-consistency-level Session \
  --enable-free-tier false \
  --output none

echo "✅ Cosmos DB created"

# Wait for Cosmos DB to be ready
echo "⏳ Waiting for Cosmos DB to be ready..."
sleep 30

# =========================
# 6. Application Insights
# =========================
echo "📈 Creating Application Insights..."
az monitor app-insights component create \
  --app "appinsights-story" \
  --location "$LOCATION" \
  --resource-group "$RG" \
  --application-type web \
  --output none

APPINSIGHTS_CONN=$(az monitor app-insights component show \
  --app "appinsights-story" \
  --resource-group "$RG" \
  --query connectionString \
  --output tsv | tr -d '\r')

echo "✅ Application Insights created"

# =========================
# Summary
# =========================
echo ""
echo "=========================================="
echo "✅ INFRASTRUCTURE SETUP COMPLETE"
echo "=========================================="
echo ""
echo "📋 Configuration Values (save these!):"
echo ""
echo "RESOURCE_GROUP=$RG"
echo "LOCATION=$LOCATION"
echo "ACR_NAME=$ACR"
echo "ENV_NAME=$ENV"
echo "COSMOS_NAME=$COSMOS"
echo "LAW_ID=$LAW_ID"
echo "APPINSIGHTS_CONNECTION_STRING=$APPINSIGHTS_CONN"
echo ""
echo "=========================================="
echo "Next step: Edit deploy_apps.sh with these values"
echo "Then run: ./deploy_apps.sh"
echo "=========================================="

# Save to file
cat > infra_config.env << EOF
RESOURCE_GROUP=$RG
LOCATION=$LOCATION
ACR_NAME=$ACR
ENV_NAME=$ENV
COSMOS_NAME=$COSMOS
LAW_ID=$LAW_ID
APPINSIGHTS_CONNECTION_STRING=$APPINSIGHTS_CONN
EOF

echo ""
echo "✅ Configuration saved to: infra_config.env"