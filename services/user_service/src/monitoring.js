// src/monitoring.js
const appInsights = require('applicationinsights');

// تهيئة Application Insights
if (process.env.APPINSIGHTS_CONNECTION_STRING) {
  appInsights
    .setup(process.env.APPINSIGHTS_CONNECTION_STRING)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)           // ✅ يتتبع HTTP requests تلقائياً
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true, true)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(true)               // ✅ لـ Live Metrics
    .start();
  
  console.log('✅ Application Insights initialized');
  console.log('   Auto-collect Requests: ENABLED');
} else {
  console.log('⚠️  APPINSIGHTS_CONNECTION_STRING not found');
}

const client = appInsights.defaultClient;

class MonitoringService {
  // Track API calls كـ Requests (ليس Metrics!)
  trackApiCall(endpoint, duration, success, statusCode = 200, metadata = {}) {
    if (!client) return;
    
    // استخدم trackRequest بدلاً من trackMetric
    client.trackRequest({
      name: endpoint,
      url: endpoint,
      duration: duration,
      resultCode: statusCode,
      success: success,
      properties: metadata
    });
  }

  // Track database operations كـ Dependencies
  trackDatabaseOperation(operation, duration, collection, success = true) {
    if (!client) return;
    
    // استخدم trackDependency بدلاً من trackMetric
    client.trackDependency({
      target: 'MongoDB',
      name: operation,
      data: collection,
      duration: duration,
      resultCode: success ? 0 : 1,
      success: success,
      dependencyTypeName: 'MongoDB'
    });
  }

  // Track business events
  trackEvent(name, properties = {}) {
    if (!client) return;
    
    client.trackEvent({
      name: name,
      properties: properties
    });
  }

  // Track errors with context
  trackException(error, properties = {}) {
    if (!client) return;
    
    client.trackException({
      exception: error,
      properties: properties
    });
  }

  // Get health info
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

  // Flush data
  flush() {
    if (client) {
      client.flush();
    }
  }
}

module.exports = new MonitoringService();