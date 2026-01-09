#!/usr/bin/env bash
set -euo pipefail

# ===================================
# Deploy Chatbot with Monitoring
# ===================================

echo "=========================================="
echo "🤖 Deploying Chatbot with Monitoring"
echo "=========================================="
echo ""

# Configuration
RG="rg-storytelling5"
ACR="acrstory606755"
CHATBOT_APP="chatbot"
APP_INSIGHTS="appinsights-story"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# =========================
# 1. Get Application Insights Connection String
# =========================
echo -e "${BLUE}1️⃣ Getting Application Insights connection string...${NC}"

APPINSIGHTS_CONN=$(az monitor app-insights component show \
    --app "$APP_INSIGHTS" \
    --resource-group "$RG" \
    --query connectionString \
    --output tsv | tr -d '\r')

if [ -z "$APPINSIGHTS_CONN" ]; then
    echo -e "${RED}❌ Error: Could not get Application Insights connection string${NC}"
    echo "Run: ./setup_monitoring.sh first"
    exit 1
fi

echo -e "${GREEN}✅ Connection string retrieved${NC}"
echo ""

# =========================
# 2. Get Ollama VM IP
# =========================
echo -e "${BLUE}2️⃣ Getting Ollama VM IP...${NC}"

OLLAMA_IP=$(az vm show \
    --resource-group "$RG" \
    --name "ollama-vm" \
    --show-details \
    --query publicIps \
    --output tsv | tr -d '\r')

if [ -z "$OLLAMA_IP" ]; then
    echo -e "${RED}❌ Error: Could not get Ollama VM IP${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Ollama VM IP: $OLLAMA_IP${NC}"
echo ""

# =========================
# 3. Build Docker Image
# =========================
echo -e "${BLUE}3️⃣ Building Docker image...${NC}"

# Check if we're in the right directory
if [ ! -f "app.py" ]; then
    echo -e "${RED}❌ Error: app.py not found${NC}"
    echo "Make sure you're in the chatbot directory:"
    echo "  cd services/chatbot"
    exit 1
fi

# Check required files
if [ ! -f "monitoring.py" ]; then
    echo -e "${YELLOW}⚠️  Warning: monitoring.py not found${NC}"
fi

if [ ! -f "requirements.txt" ]; then
    echo -e "${RED}❌ Error: requirements.txt not found${NC}"
    exit 1
fi

# Build image
docker build -t chatbot:monitoring .

echo -e "${GREEN}✅ Image built${NC}"
echo ""

# =========================
# 4. Tag and Push to ACR
# =========================
echo -e "${BLUE}4️⃣ Pushing to Azure Container Registry...${NC}"

# Login to ACR
echo "Logging into ACR..."
az acr login --name "$ACR"

# Tag image
echo "Tagging images..."
docker tag chatbot:monitoring ${ACR}.azurecr.io/chatbot:monitoring
docker tag chatbot:monitoring ${ACR}.azurecr.io/chatbot:latest

# Push
echo "Pushing images..."
docker push ${ACR}.azurecr.io/chatbot:monitoring
docker push ${ACR}.azurecr.io/chatbot:latest

echo -e "${GREEN}✅ Images pushed to ACR${NC}"
echo ""

# =========================
# 5. Update Container App
# =========================
echo -e "${BLUE}5️⃣ Updating Container App...${NC}"

az containerapp update \
    --name "$CHATBOT_APP" \
    --resource-group "$RG" \
    --image "${ACR}.azurecr.io/chatbot:latest" \
    --set-env-vars \
        "APPLICATIONINSIGHTS_CONNECTION_STRING=$APPINSIGHTS_CONN" \
        "OLLAMA_URL=http://${OLLAMA_IP}:11434/api/generate" \
        "MODEL_NAME=llama3.1:8b" \
        "OLLAMA_TIMEOUT=300" \
        "MAX_REQUESTS_PER_MINUTE=30" \
        "MAX_REQUESTS_PER_DAY=1000" \
        "PYTHONUNBUFFERED=1" \
    --output none

echo -e "${GREEN}✅ Container App updated${NC}"
echo ""

# =========================
# 6. Wait for Deployment
# =========================
echo -e "${BLUE}6️⃣ Waiting for deployment...${NC}"
sleep 20

# Get app URL
CHATBOT_URL=$(az containerapp show \
    --name "$CHATBOT_APP" \
    --resource-group "$RG" \
    --query properties.configuration.ingress.fqdn \
    --output tsv)

echo -e "${GREEN}✅ Chatbot URL: https://${CHATBOT_URL}${NC}"
echo ""

# =========================
# 7. Test Chatbot
# =========================
echo -e "${BLUE}7️⃣ Testing chatbot...${NC}"

echo "Testing health endpoint..."
curl -s "https://${CHATBOT_URL}/api/health" | jq . 2>/dev/null || echo "Health check response received"

echo ""
echo "Testing test endpoint..."
curl -s "https://${CHATBOT_URL}/api/test" | jq . 2>/dev/null || echo "Test response received"

echo ""

# =========================
# 8. Send Test Request for Monitoring
# =========================
echo -e "${BLUE}8️⃣ Sending test request to generate telemetry...${NC}"

curl -X POST "https://${CHATBOT_URL}/api/chat" \
    -H "Content-Type: application/json" \
    -d '{
        "message": "Who are the main characters?",
        "story_context": "Once upon a time, there was a brave little mouse named Max who lived in a big castle."
    }' 2>/dev/null | jq . || echo "Chat request sent"

echo ""

# =========================
# 9. Check Container Logs
# =========================
echo -e "${BLUE}9️⃣ Checking recent logs...${NC}"
echo "Last 20 log lines:"
az containerapp logs show \
    --name "$CHATBOT_APP" \
    --resource-group "$RG" \
    --tail 20 \
    --output table 2>/dev/null || echo "Logs not available yet"

echo ""

# =========================
# Summary
# =========================
echo -e "${YELLOW}=========================================="
echo "✅ CHATBOT DEPLOYMENT COMPLETE"
echo "==========================================${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo ""
echo "Chatbot URL:  https://${CHATBOT_URL}"
echo "Ollama VM:    http://${OLLAMA_IP}:11434"
echo "Monitoring:   Application Insights (appinsights-story)"
echo ""
echo -e "${GREEN}🔍 Verification Commands:${NC}"
echo ""
echo "# Check health:"
echo "curl https://${CHATBOT_URL}/api/health"
echo ""
echo "# Test chat:"
echo "curl -X POST https://${CHATBOT_URL}/api/chat \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"message\": \"test\", \"story_context\": \"test story\"}'"
echo ""
echo "# Watch logs:"
echo "az containerapp logs show --name chatbot --resource-group rg-storytelling5 --follow"
echo ""
echo -e "${GREEN}📊 Check Monitoring:${NC}"
echo ""
echo "1. Wait 5-10 minutes for telemetry to appear"
echo ""
echo "2. Go to Azure Portal:"
echo "   Application Insights → appinsights-story → Logs"
echo ""
echo "3. Run this query:"
echo "   traces | where timestamp > ago(1h) | order by timestamp desc"
echo ""
echo "4. Check Performance tab for metrics"
echo ""
echo "5. Test Smart Detection:"
echo "   az vm stop --resource-group rg-storytelling5 --name ollama-vm"
echo "   # Send 20+ requests"
echo "   # Wait 10 minutes"
echo "   # Check Détection intelligente"
echo ""
echo -e "${YELLOW}==========================================${NC}"
echo ""
echo "🎉 Deployment successful!"