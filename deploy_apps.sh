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

echo "=========================================="
echo "🚀 Story App - Deployment with MongoDB Atlas"
echo "=========================================="
echo "Resource Group: $RESOURCE_GROUP"
echo "ACR: $ACR_NAME"
echo "Database: MongoDB Atlas"
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
# 3. Deploy Backend
# =========================
echo ""
echo "🚀 Deploying Backend with MongoDB Atlas..."

az containerapp update \
  --name "backend" \
  --resource-group "$RESOURCE_GROUP" \
  --image "${ACR_SERVER}/backend:latest" \
  --set-env-vars \
    "NODE_ENV=production" \
    "PORT=5000" \
    "MONGO_URI=${MONGO_ATLAS_URI}" \
    "JWT_SECRET=supersecretkey"

BACKEND_URL=$(az containerapp show \
  --name "backend" \
  --resource-group "$RESOURCE_GROUP" \
  --query properties.configuration.ingress.fqdn \
  --output tsv | tr -d '\r')

echo "✅ Backend deployed: https://$BACKEND_URL"

# =========================
# 4. Deploy AI Backend
# =========================
echo ""
echo "🤖 Deploying AI Backend..."

az containerapp update \
  --name "chatbot" \
  --resource-group "$RESOURCE_GROUP" \
  --image "${ACR_SERVER}/chatbot:latest"

CHATBOT_URL=$(az containerapp show \
  --name "chatbot" \
  --resource-group "$RESOURCE_GROUP" \
  --query properties.configuration.ingress.fqdn \
  --output tsv | tr -d '\r')

echo "✅ AI Backend deployed: https://$CHATBOT_URL"

# =========================
# 5. Deploy Frontend
# =========================
echo ""
echo "🎨 Deploying Frontend..."

az containerapp update \
  --name "frontend" \
  --resource-group "$RESOURCE_GROUP" \
  --image "${ACR_SERVER}/frontend:latest"

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
echo "✅ DEPLOYMENT COMPLETE WITH MONGODB ATLAS"
echo "=========================================="
echo ""
echo "🌐 Application URLs:"
echo "  Frontend:    https://$FRONTEND_URL"
echo "  Backend:     https://$BACKEND_URL"
echo "  AI Backend:  https://$CHATBOT_URL"
echo ""
echo "📊 Database:"
echo "  MongoDB Atlas Cluster0"
echo "  Stories: 19 documents"
echo ""
echo "=========================================="