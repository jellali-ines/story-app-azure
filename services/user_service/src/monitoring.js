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

    client = appInsights.defaultClient;
    isInitialized = true;
    
    console.log('✅ Application Insights initialized');
    console.log('   Connection String: ' + conn.substring(0, 60) + '...');
    console.log('   Auto-collect Requests: ENABLED');
    console.log('   Live Metrics: ENABLED');
  } catch (err) {
    console.error('⚠️ Failed to initialize Application Insights:', err.message);
    isInitialized = false;
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

  // تحقق من التهيئة
  _isReady() {
    return this.isInitialized && this.client;
  }

  // تتبع أي حدث (Event)
  trackEvent(name, properties = {}) {
    if (!this._isReady()) return;
    
    try {
      this.client.trackEvent({ name, properties });
    } catch (err) {
      console.error('Error tracking event:', err.message);
    }
  }

  // تتبع استدعاءات API
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

  // تتبع العمليات على قاعدة البيانات
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

  // تتبع الاستثناءات
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

  // معلومات صحية عن التطبيق
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

  // إرسال البيانات المتبقية قبل الإغلاق
  async flush() {
    if (!this._isReady()) return;
    
    try {
      // استخدام Promise لضمان الـ flush
      await new Promise((resolve) => {
        this.client.flush({
          callback: (response) => {
            console.log('✅ Application Insights flushed successfully');
            resolve(response);
          }
        });
        
        // Timeout بعد 5 ثوان
        setTimeout(() => {
          console.log('⚠️ Flush timeout after 5s');
          resolve();
        }, 5000);
      });
    } catch (err) {
      console.error('Error flushing Application Insights:', err.message);
    }
  }
}

module.exports = new MonitoringService();