const appInsights = require('applicationinsights');

if (process.env.APPINSIGHTS_CONNECTION_STRING) {
  appInsights
    .setup(process.env.APPINSIGHTS_CONNECTION_STRING)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .start();
  
  console.log('✅ Application Insights initialized');
}

const client = appInsights.defaultClient;

class MonitoringService {
  trackApiCall(endpoint, duration, success, statusCode = 200, metadata = {}) {
    if (!client) return;
    client.trackMetric({
      name: 'api_call_duration_ms',
      value: duration,
      properties: { endpoint, success: String(success), statusCode: String(statusCode), ...metadata }
    });
  }

  trackDatabaseOperation(operation, duration, collection, success = true) {
    if (!client) return;
    client.trackMetric({
      name: 'db_operation_duration_ms',
      value: duration,
      properties: { operation, collection, success: String(success) }
    });
  }

  trackEvent(name, properties = {}) {
    if (!client) return;
    client.trackEvent({ name, properties });
  }

  trackException(error, properties = {}) {
    if (!client) return;
    client.trackException({ exception: error, properties });
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
    if (client) client.flush();
  }
}

module.exports = new MonitoringService();
