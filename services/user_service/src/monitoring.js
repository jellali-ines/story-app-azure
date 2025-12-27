// src/monitoring.js
const appInsights = require('applicationinsights');

// 👇 هذا المهم! تهيئة Application Insights
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
  // Track API calls
  trackApiCall(endpoint, duration, success, statusCode = 200, metadata = {}) {
    if (!client) return;
    
    client.trackMetric({
      name: 'api_call_duration_ms',
      value: duration,
      properties: { 
        endpoint, 
        success: String(success),
        statusCode: String(statusCode),
        ...metadata 
      }
    });
  }

  // Track database operations
  trackDbOperation(operation, duration, collection, success = true) {
    if (!client) return;
    
    client.trackMetric({
      name: 'db_operation_duration_ms',
      value: duration,
      properties: { 
        operation, 
        collection,
        success: String(success)
      }
    });
  }

  // Track business events
  trackStoryCreated(storyId, userId, length) {
    if (!client) return;
    
    client.trackEvent({
      name: 'story_created',
      properties: {
        storyId,
        userId,
        storyLength: String(length)
      }
    });
  }

  // Track errors with context
  trackError(error, context = {}) {
    if (!client) return;
    
    client.trackException({
      exception: error,
      properties: context
    });
  }

  // Track data drift
  trackDataDrift(featureName, driftPercentage, severity) {
    if (!client) return;
    
    client.trackEvent({
      name: 'data_drift_detected',
      properties: {
        featureName,
        driftPercentage: driftPercentage.toFixed(2),
        severity
      }
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
      uptime: Math.round(process.uptime()) + 's'
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