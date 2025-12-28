process.env.APPLICATIONINSIGHTS_CONFIGURATION_CONTENT = "";
process.env.AZURE_MONITOR_OPENTELEMETRY_EXPORTER = "disabled";



const appInsights = require('applicationinsights');

// 🔐 Récupération correcte de la variable Azure
const conn = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;

// =====================
// Initialisation AI
// =====================
if (conn) {
  appInsights
    .setup(conn)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true, false)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(true)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
    .start();

  console.log('✅ Application Insights initialized');
  console.log('   Connection String: ' + conn.substring(0, 60) + '...');
  console.log('   Auto-collect Requests: ENABLED');
  console.log('   Live Metrics: ENABLED');
} else {
  console.log('⚠️ Application Insights disabled (no connection string)');
}

// =====================
// Client sécurisé
// =====================
const client = appInsights.defaultClient;

if (!client) {
  console.log("⚠️ Application Insights client not available");
}

// =====================
// Monitoring Service
// =====================
class MonitoringService {

  trackApiCall(endpoint, duration, success, statusCode = 200, metadata = {}) {
    if (!client) return;
    try {
      client.trackRequest({
        name: endpoint,
        url: endpoint,
        duration,
        resultCode: statusCode,
        success,
        properties: metadata
      });
    } catch (err) {
      console.error('Error tracking API call:', err.message);
    }
  }

  trackDatabaseOperation(operation, duration, collection, success = true) {
    if (!client) return;
    try {
      client.trackDependency({
        target: 'MongoDB',
        name: operation,
        data: collection,
        duration,
        resultCode: success ? 0 : 1,
        success,
        dependencyTypeName: 'MongoDB'
      });
    } catch (err) {
      console.error('Error tracking DB operation:', err.message);
    }
  }

  trackEvent(name, properties = {}) {
    if (!client) return;
    try {
      client.trackEvent({ name, properties });
    } catch (err) {
      console.error('Error tracking event:', err.message);
    }
  }

  trackException(error, properties = {}) {
    if (!client) return;
    try {
      client.trackException({ exception: error, properties });
    } catch (err) {
      console.error('Error tracking exception:', err.message);
    }
  }

  getHealthInfo() {
    const mem = process.memoryUsage();
    return {
      memory: {
        rss: Math.round(mem.rss / 1024 / 1024) + 'MB',
        heapUsed: Math.round(mem.heapUsed / 1024 / 1024) + 'MB'
      },
      uptime: Math.round(process.uptime()) + 's',
      appInsightsEnabled: !!client
    };
  }

  flush() {
    if (client) {
      try {
        client.flush();
      } catch (err) {
        console.error('Error flushing:', err.message);
      }
    }
  }
}

module.exports = new MonitoringService();
