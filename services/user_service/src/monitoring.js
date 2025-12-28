const appInsights = require('applicationinsights');

// 🔐 قراءة متغير البيئة
const conn = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || null;

// =====================
// تهيئة Application Insights
// =====================
let client = null;
let isInitialized = false;

if (conn) {
  try {
    // تهيئة بسيطة وآمنة
    appInsights.setup(conn);
    
    // تفعيل الميزات الأساسية
    appInsights.Configuration
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true)
      .setUseDiskRetryCaching(true)
      .setSendLiveMetrics(true);  // ✅ تفعيل Live Metrics
    
    // بدء التتبع
    appInsights.start();
    
    client = appInsights.defaultClient;
    
    if (client) {
      isInitialized = true;
      console.log('✅ Application Insights initialized');
      console.log('   Connection String: ' + conn.substring(0, 60) + '...');
      console.log('   Auto-collect Requests: ENABLED');
      console.log('   Live Metrics: ENABLED');
    } else {
      console.error('⚠️ Application Insights client not available');
    }
  } catch (err) {
    console.error('⚠️ Failed to initialize Application Insights:', err.message);
    console.error('   Stack:', err.stack);
    isInitialized = false;
    client = null;
  }
} else {
  console.log('⚠️ Application Insights disabled (no connection string)');
}

// =====================
// Monitoring Service
// =====================
class MonitoringService {
  constructor() {
    this.client = client;
    this.isInitialized = isInitialized;
  }

  _isReady() {
    return this.isInitialized && this.client;
  }

  trackEvent(name, properties = {}) {
    if (!this._isReady()) return;
    
    try {
      this.client.trackEvent({ name, properties });
    } catch (err) {
      console.error('Error tracking event:', err.message);
    }
  }

  trackApiCall(endpoint, duration, success, statusCode = 200, metadata = {}) {
    if (!this._isReady()) return;
    
    try {
      this.client.trackRequest({
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
    if (!this._isReady()) return;
    
    try {
      this.client.trackDependency({
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

  trackException(error, properties = {}) {
    if (!this._isReady()) return;
    
    try {
      this.client.trackException({
        exception: error,
        properties
      });
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
      appInsightsEnabled: this.isInitialized
    };
  }

  async flush() {
    if (!this._isReady()) return;
    
    try {
      // flush بسيط وآمن
      await new Promise((resolve) => {
        try {
          this.client.flush({
            callback: (response) => {
              console.log('✅ Application Insights flushed');
              resolve(response);
            }
          });
        } catch (err) {
          console.error('Flush error:', err.message);
          resolve();
        }
        
        // Timeout بعد 3 ثوان
        setTimeout(() => {
          resolve();
        }, 3000);
      });
    } catch (err) {
      console.error('Error flushing:', err.message);
    }
  }
}

module.exports = new MonitoringService();