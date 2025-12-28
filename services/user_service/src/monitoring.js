// src/monitoring.js
const appInsights = require('applicationinsights');

// تهيئة Application Insights مع Live Metrics
if (process.env.APPINSIGHTS_CONNECTION_STRING) {
  appInsights
    .setup(process.env.APPINSIGHTS_CONNECTION_STRING)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true, false)  // false لتقليل الضوضاء
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(true)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
    .start();
  
  console.log('✅ Application Insights initialized');
  console.log('   Connection String: ' + process.env.APPINSIGHTS_CONNECTION_STRING.substring(0, 60) + '...');
  console.log('   Auto-collect Requests: ENABLED');
  console.log('   Live Metrics: ENABLED');
} else {
  console.log('⚠️  APPINSIGHTS_CONNECTION_STRING not found');
}

const client = appInsights.defaultClient;

class MonitoringService {
  // Track API calls
  trackApiCall(endpoint, duration, success, statusCode = 200, metadata = {}) {
    if (!client) return;
    
    client.trackRequest({
      name: endpoint,
      url: endpoint,
      duration: duration,
      resultCode: statusCode,
      success: success,
      properties: metadata
    });
  }

  // Track database operations
  trackDatabaseOperation(operation, duration, collection, success = true) {
    if (!client) return;
    
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

  // Track events
  trackEvent(name, properties = {}) {
    if (!client) return;
    
    client.trackEvent({
      name: name,
      properties: properties
    });
  }

  // Track exceptions
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
      appInsightsEnabled: !!client,
      liveMetricsEnabled: true
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