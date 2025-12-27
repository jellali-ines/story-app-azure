#!/bin/bash
# setup_monitoring.sh
# Complete monitoring setup for Story App

set -euo pipefail

echo "=========================================="
echo "🔍 Setting up Application Monitoring"
echo "=========================================="
echo ""

# Configuration
RG="rg-storytelling5"
LOCATION="italynorth"
APP_INSIGHTS="appinsights-story"
ACTION_GROUP="alerting-story"
BACKEND_APP="backend"
CHATBOT_APP="chatbot"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# =========================
# 1. Create Application Insights
# =========================
echo -e "${BLUE}1️⃣ Creating Application Insights...${NC}"

if az monitor app-insights component show \
    --app "$APP_INSIGHTS" \
    --resource-group "$RG" &>/dev/null; then
    echo -e "${GREEN}✅ Application Insights already exists${NC}"
else
    az monitor app-insights component create \
        --app "$APP_INSIGHTS" \
        --location "$LOCATION" \
        --resource-group "$RG" \
        --application-type web \
        --retention-time 30 \
        --output none
    echo -e "${GREEN}✅ Application Insights created${NC}"
fi

# Get connection string
APPINSIGHTS_CONN=$(az monitor app-insights component show \
    --app "$APP_INSIGHTS" \
    --resource-group "$RG" \
    --query connectionString \
    --output tsv | tr -d '\r')

APPINSIGHTS_KEY=$(az monitor app-insights component show \
    --app "$APP_INSIGHTS" \
    --resource-group "$RG" \
    --query instrumentationKey \
    --output tsv | tr -d '\r')

echo "Connection String: $APPINSIGHTS_CONN"
echo ""

# =========================
# 2. Create Action Groups
# =========================
echo -e "${BLUE}2️⃣ Creating Alert Action Group...${NC}"

if az monitor action-group show \
    --name "$ACTION_GROUP" \
    --resource-group "$RG" &>/dev/null; then
    echo -e "${GREEN}✅ Action Group already exists${NC}"
else
    az monitor action-group create \
        --name "$ACTION_GROUP" \
        --resource-group "$RG" \
        --output none
    echo -e "${GREEN}✅ Action Group created${NC}"
fi

# Add email action (modify email address)
read -p "Enter email for alerts: " ALERT_EMAIL

az monitor action-group update \
    --name "$ACTION_GROUP" \
    --resource-group "$RG" \
    --add-action email-receiver AlertEmail --email-address "$ALERT_EMAIL" \
    --output none 2>/dev/null || true

echo -e "${GREEN}✅ Alert email configured: $ALERT_EMAIL${NC}"
echo ""

# =========================
# 3. Create Alert Rules
# =========================
echo -e "${BLUE}3️⃣ Creating Alert Rules...${NC}"

# Get Application Insights resource ID
APPINSIGHTS_ID=$(az monitor app-insights component show \
    --app "$APP_INSIGHTS" \
    --resource-group "$RG" \
    --query id \
    --output tsv)

# Alert 1: High Error Rate
echo "Creating: High Error Rate Alert..."
az monitor metrics alert create \
    --name "story-app-high-error-rate" \
    --resource-group "$RG" \
    --scopes "$APPINSIGHTS_ID" \
    --condition "avg Failed Requests > 10" \
    --window-size 5m \
    --evaluation-frequency 1m \
    --description "Triggers when error rate exceeds 1%" \
    --output none 2>/dev/null || echo "Alert may already exist"

# Alert 2: High Response Time
echo "Creating: Slow Response Alert..."
az monitor metrics alert create \
    --name "story-app-slow-responses" \
    --resource-group "$RG" \
    --scopes "$APPINSIGHTS_ID" \
    --condition "avg Server Response Time > 5000" \
    --window-size 5m \
    --evaluation-frequency 1m \
    --description "Triggers when response time exceeds 5 seconds" \
    --output none 2>/dev/null || echo "Alert may already exist"

# Alert 3: Low Availability
echo "Creating: Low Availability Alert..."
az monitor metrics alert create \
    --name "story-app-low-availability" \
    --resource-group "$RG" \
    --scopes "$APPINSIGHTS_ID" \
    --condition "avg Availability < 95" \
    --window-size 5m \
    --evaluation-frequency 1m \
    --description "Triggers when availability drops below 95%" \
    --output none 2>/dev/null || echo "Alert may already exist"

echo -e "${GREEN}✅ Alert rules created${NC}"
echo ""

# =========================
# 4. Update Container Apps with Monitoring
# =========================
echo -e "${BLUE}4️⃣ Updating Container Apps with Monitoring...${NC}"

# Update Backend
echo "Configuring Backend monitoring..."
az containerapp update \
    --name "$BACKEND_APP" \
    --resource-group "$RG" \
    --set-env-vars "APPINSIGHTS_CONNECTION_STRING=$APPINSIGHTS_CONN" \
    --output none
echo -e "${GREEN}✅ Backend configured${NC}"

# Update Chatbot
echo "Configuring Chatbot monitoring..."
az containerapp update \
    --name "$CHATBOT_APP" \
    --resource-group "$RG" \
    --set-env-vars "APPINSIGHTS_CONNECTION_STRING=$APPINSIGHTS_CONN" \
    --output none
echo -e "${GREEN}✅ Chatbot configured${NC}"
echo ""

# =========================
# 5. Create Diagnostic Settings
# =========================
echo -e "${BLUE}5️⃣ Creating Diagnostic Settings...${NC}"

# Get Log Analytics Workspace ID
LAW_ID=$(az monitor log-analytics workspace show \
    --name "law-story" \
    --resource-group "$RG" \
    --query id \
    --output tsv 2>/dev/null)

if [ -n "$LAW_ID" ]; then
    # Create diagnostic setting for Application Insights
    az monitor diagnostic-settings create \
        --name "appinsights-to-law" \
        --resource "$APPINSIGHTS_ID" \
        --workspace "$LAW_ID" \
        --logs '[{"category":"AppAvailabilityResults","enabled":true},{"category":"AppBrowserTimings","enabled":true},{"category":"AppEvents","enabled":true},{"category":"AppMetrics","enabled":true}]' \
        --output none 2>/dev/null || true
    
    echo -e "${GREEN}✅ Diagnostic settings configured${NC}"
fi
echo ""

# =========================
# 6. Create Query Workbook
# =========================
echo -e "${BLUE}6️⃣ Creating Monitoring Workbook...${NC}"

# Create KQL query file for monitoring
cat > /tmp/monitoring-queries.kql << 'EOFKQL'
// Request Performance
requests
| where timestamp > ago(24h)
| summarize 
    TotalRequests=count(),
    SuccessfulRequests=count(success==true),
    FailedRequests=count(success==false),
    AvgDuration=avg(duration),
    MaxDuration=max(duration),
    P95Duration=percentile(duration, 95),
    P99Duration=percentile(duration, 99)
| extend SuccessRate = round(100.0*SuccessfulRequests/TotalRequests, 2)

// Error Analysis
exceptions
| where timestamp > ago(24h)
| summarize Count=count() by exceptionType, outerMessage
| order by Count desc

// Dependency Performance
dependencies
| where timestamp > ago(24h)
| summarize 
    Calls=count(),
    AvgDuration=avg(duration),
    P95Duration=percentile(duration, 95)
by target, name

// Custom Events (Data Drift)
customEvents
| where name == "DataDriftDetected"
| summarize by tostring(customDimensions.featureName), tostring(customDimensions.driftPercentage)
EOFKQL

echo -e "${GREEN}✅ KQL queries saved to /tmp/monitoring-queries.kql${NC}"
echo ""

# =========================
# 7. Summary
# =========================
echo -e "${YELLOW}=========================================="
echo "✅ MONITORING SETUP COMPLETE"
echo "==========================================${NC}"
echo ""
echo -e "${BLUE}📋 Configuration Summary:${NC}"
echo ""
echo "Application Insights:"
echo "  Name: $APP_INSIGHTS"
echo "  Instrumentation Key: $APPINSIGHTS_KEY"
echo "  Connection String: ${APPINSIGHTS_CONN:0:50}..."
echo ""
echo "Action Group:"
echo "  Name: $ACTION_GROUP"
echo "  Email: $ALERT_EMAIL"
echo ""
echo "Active Alerts:"
echo "  ✓ High Error Rate (> 1%)"
echo "  ✓ Slow Responses (> 5s)"
echo "  ✓ Low Availability (< 95%)"
echo ""
echo -e "${BLUE}📊 Monitoring Links:${NC}"
echo ""
echo "Application Insights:"
echo "  https://portal.azure.com/#@/resource/subscriptions/{subscription-id}/resourceGroups/$RG/providers/microsoft.insights/components/$APP_INSIGHTS/overview"
echo ""
echo "Log Analytics:"
echo "  https://portal.azure.com/#@/resource/subscriptions/{subscription-id}/resourceGroups/$RG/providers/microsoft.operationalinsights/workspaces/law-story/overview"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "1. Add instrumentation to Node.js backend:"
echo "   npm install applicationinsights"
echo ""
echo "2. Add to backend entry point:"
echo "   require('applicationinsights').setup().start();"
echo ""
echo "3. Update container apps with connection string"
echo "4. Verify logs in Application Insights"
echo ""
echo -e "${YELLOW}==========================================${NC}"
echo ""

# Save configuration
cat > monitoring_config.env << EOF
# Application Insights Configuration
APPINSIGHTS_CONNECTION_STRING=$APPINSIGHTS_CONN
APPINSIGHTS_INSTRUMENTATION_KEY=$APPINSIGHTS_KEY
APP_INSIGHTS_NAME=$APP_INSIGHTS

# Action Group
ACTION_GROUP_NAME=$ACTION_GROUP
ALERT_EMAIL=$ALERT_EMAIL

# Resource IDs
APPINSIGHTS_RESOURCE_ID=$APPINSIGHTS_ID
LAW_RESOURCE_ID=$LAW_ID

# Resource Group
RESOURCE_GROUP=$RG
LOCATION=$LOCATION
EOF

echo -e "${GREEN}✅ Configuration saved to monitoring_config.env${NC}"
echo ""