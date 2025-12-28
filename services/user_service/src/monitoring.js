const appInsights = require('applicationinsights');

// تهيئة Application Insights
if (process.env.APPINSIGHTS_CONNECTION_STRING) {
  appInsights
    .setup(process.env.APPINSIGHTS_CONNECTION_STRING)
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
  console.log('   Connection String: ' + process.env.APPINSIGHTS_CONNECTION_STRING.substring(0, 60) + '...');
  console.log('   Auto-collect Requests: ENABLED');
  console.log('   Live Metrics: ENABLED');
}

// ✅ احصل على client بعد start()
const client = appInsights.defaultClient;

class MonitoringService {
  trackApiCall(endpoint, duration, success, statusCode = 200, metadata = {}) {
    if (!client) return;
    try {
      client.trackRequest({
        name: endpoint,
        url: endpoint,
        duration: duration,
        resultCode: statusCode,
        success: success,
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
        duration: duration,
        resultCode: success ? 0 : 1,
        success: success,
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
