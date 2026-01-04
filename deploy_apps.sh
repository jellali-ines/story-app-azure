#!/usr/bin/env bash
set -euo pipefail

# =========================
# MongoDB Atlas Configuration
# =========================
MONGO_ATLAS_URI="mongodb+srv://admin:BM0a7A1cwkcopozO@cluster0.l3awpvu.mongodb.net/AppStories?retryWrites=true&w=majority"

# =========================
# Azure Configuration
# =========================
RESOURCE_GROUP="rg-storytelling5"
ACR_NAME="acrstory606755"
ENV_NAME="env-storytelling"

# Load Ollama config if exists
if [ -f "ollama_vm_config.env" ]; then
    source ollama_vm_config.env
    echo "✅ Loaded Ollama config: $OLLAMA_URL"
else
    echo "⚠️  ollama_vm_config.env not found, using default"
    OLLAMA_URL="http://172.213.217.70:11434/api/generate"
fi

echo "=========================================="
echo "🚀 Story App - Deployment with MongoDB Atlas"
echo "=========================================="
echo "Resource Group: $RESOURCE_GROUP"
echo "ACR: $ACR_NAME"
echo "Database: MongoDB Atlas"
echo "Ollama: $OLLAMA_URL"
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

# AI Backend
echo "📦 Building AI Backend..."
cd services/chatbot
docker build -t "${ACR_SERVER}/chatbot:latest" .
docker push "${ACR_SERVER}/chatbot:latest"
cd ../..
echo "✅ AI Backend pushed"

# Frontend
echo "📦 Building Frontend..."
cd frontend/front_user
docker build \
  --build-arg VITE_API_URL=https://backend.bluesmoke-49ce99c2.italynorth.azurecontainerapps.io \
  --build-arg VITE_AI_API_URL=https://chatbot.bluesmoke-49ce99c2.italynorth.azurecontainerapps.io \
  --target production \
  -t "${ACR_SERVER}/frontend:latest" .
docker push "${ACR_SERVER}/frontend:latest"
cd ../..
echo "✅ Frontend pushed"

# =========================
# Get Application Insights Connection String
# =========================
echo ""
echo "📊 Getting Application Insights..."
APPINSIGHTS_CONN=$(az monitor app-insights component show \
  --app appinsights-story \
  --resource-group "$RESOURCE_GROUP" \
  --query connectionString \
  --output tsv | tr -d '\r')

echo "✅ Application Insights configured"

# =========================
# 3. Deploy Backend (CREATE or UPDATE)
# =========================
echo ""
echo "🚀 Deploying Backend..."

if az containerapp show --name backend --resource-group "$RESOURCE_GROUP" &>/dev/null; then
  echo "Backend exists, updating..."
  az containerapp update \
    --name backend \
    --resource-group "$RESOURCE_GROUP" \
    --image "${ACR_SERVER}/backend:latest" \
    --set-env-vars \
      NODE_ENV=production \
      PORT=5000 \
      "MONGO_URI=${MONGO_ATLAS_URI}" \
      "MONGODB_ATLAS_URI=${MONGO_ATLAS_URI}" \
      "APPLICATIONINSIGHTS_CONNECTION_STRING=${APPINSIGHTS_CONN}" \
      JWT_SECRET=supersecretkey
else
  echo "Backend doesn't exist, creating..."
  az containerapp create \
    --name backend \
    --resource-group "$RESOURCE_GROUP" \
    --environment "$ENV_NAME" \
    --image "${ACR_SERVER}/backend:latest" \
    --target-port 5000 \
    --ingress external \
    --registry-server "$ACR_SERVER" \
    --registry-username "$ACR_USER" \
    --registry-password "$ACR_PASS" \
    --env-vars \
      NODE_ENV=production \
      PORT=5000 \
      "MONGO_URI=${MONGO_ATLAS_URI}" \
      "MONGODB_ATLAS_URI=${MONGO_ATLAS_URI}" \
      "APPLICATIONINSIGHTS_CONNECTION_STRING=${APPINSIGHTS_CONN}" \
      JWT_SECRET=supersecretkey \
    --cpu 0.5 --memory 1Gi \
    --min-replicas 1 --max-replicas 3
fi

BACKEND_URL=$(az containerapp show \
  --name backend \
  --resource-group "$RESOURCE_GROUP" \
  --query properties.configuration.ingress.fqdn \
  --output tsv | tr -d '\r')

echo "✅ Backend deployed: https://$BACKEND_URL"

# =========================
# 4. Deploy Chatbot (CREATE or UPDATE)
# =========================
echo ""
echo "🤖 Deploying Chatbot..."

if az containerapp show --name chatbot --resource-group "$RESOURCE_GROUP" &>/dev/null; then
  echo "Chatbot exists, updating..."
  az containerapp update \
    --name chatbot \
    --resource-group "$RESOURCE_GROUP" \
    --image "${ACR_SERVER}/chatbot:latest" \
    --set-env-vars \
      FLASK_ENV=production \
      "OLLAMA_URL=${OLLAMA_URL}" \
      MODEL_NAME=llama3.1:8b \
      MAX_REQUESTS_PER_MINUTE=30 \
      MAX_REQUESTS_PER_DAY=1000 \
      "APPLICATIONINSIGHTS_CONNECTION_STRING=${APPINSIGHTS_CONN}"
else
  echo "Chatbot doesn't exist, creating..."
  az containerapp create \
    --name chatbot \
    --resource-group "$RESOURCE_GROUP" \
    --environment "$ENV_NAME" \
    --image "${ACR_SERVER}/chatbot:latest" \
    --target-port 5002 \
    --ingress external \
    --registry-server "$ACR_SERVER" \
    --registry-username "$ACR_USER" \
    --registry-password "$ACR_PASS" \
    --env-vars \
      FLASK_ENV=production \
      "OLLAMA_URL=${OLLAMA_URL}" \
      MODEL_NAME=llama3.1:8b \
      MAX_REQUESTS_PER_MINUTE=30 \
      MAX_REQUESTS_PER_DAY=1000 \
      "APPLICATIONINSIGHTS_CONNECTION_STRING=${APPINSIGHTS_CONN}" \
    --cpu 0.5 --memory 1Gi \
    --min-replicas 1 --max-replicas 3
fi

CHATBOT_URL=$(az containerapp show \
  --name chatbot \
  --resource-group "$RESOURCE_GROUP" \
  --query properties.configuration.ingress.fqdn \
  --output tsv | tr -d '\r')

echo "✅ Chatbot deployed: https://$CHATBOT_URL"

# =========================
# 5. Deploy Frontend (CREATE or UPDATE)
# =========================
echo ""
echo "🎨 Deploying Frontend..."

if az containerapp show --name frontend --resource-group "$RESOURCE_GROUP" &>/dev/null; then
  echo "Frontend exists, updating..."
  az containerapp update \
    --name frontend \
    --resource-group "$RESOURCE_GROUP" \
    --image "${ACR_SERVER}/frontend:latest" \
    --set-env-vars \
      "VITE_API_URL=https://$BACKEND_URL" \
      "VITE_AI_API_URL=https://$CHATBOT_URL"
else
  echo "Frontend doesn't exist, creating..."
  az containerapp create \
    --name frontend \
    --resource-group "$RESOURCE_GROUP" \
    --environment "$ENV_NAME" \
    --image "${ACR_SERVER}/frontend:latest" \
    --target-port 80 \
    --ingress external \
    --registry-server "$ACR_SERVER" \
    --registry-username "$ACR_USER" \
    --registry-password "$ACR_PASS" \
    --env-vars \
      "VITE_API_URL=https://$BACKEND_URL" \
      "VITE_AI_API_URL=https://$CHATBOT_URL" \
    --cpu 0.25 --memory 0.5Gi \
    --min-replicas 1 --max-replicas 5
fi

FRONTEND_URL=$(az containerapp show \
  --name frontend \
  --resource-group "$RESOURCE_GROUP" \
  --query properties.configuration.ingress.fqdn \
  --output tsv | tr -d '\r')

echo "✅ Frontend deployed: https://$FRONTEND_URL"

# =========================
# Summary
# =========================
echo ""
echo "=========================================="
echo "✅ DEPLOYMENT COMPLETE"
echo "=========================================="
echo ""
echo "🌐 Application URLs:"
echo "  Frontend:    https://$FRONTEND_URL"
echo "  Backend:     https://$BACKEND_URL"
echo "  Chatbot:     https://$CHATBOT_URL"
echo ""
echo "📊 Database:"
echo "  MongoDB Atlas Cluster0"
echo ""
echo "🦙 AI Model:"
echo "  Ollama: $OLLAMA_URL"
echo "  Model: llama3.1:8b"
echo ""
echo "🧪 Test the application:"
echo "  Backend Health:  curl https://$BACKEND_URL/health"
echo "  Chatbot Health:  curl https://$CHATBOT_URL/api/health"
echo "  Frontend:        Open https://$FRONTEND_URL in browser"
echo ""
echo "=========================================="