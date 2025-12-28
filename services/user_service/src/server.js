// ==================== MONITORING (يجب أن يكون أول شيء) ====================
const monitoring = require('./monitoring');

// ==================== DEPENDENCIES ====================
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { notFound, errorHandler } = require("../middleware/errorMiddleware");

dotenv.config();

const app = express();

// ==================== MIDDLEWARE ====================
// CORS - السماح لكل المصادر
app.use(cors({ origin: "*" }));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 📊 Middleware لتتبع كل الطلبات
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    monitoring.trackApiCall(
      req.path,
      duration,
      res.statusCode < 400,
      res.statusCode,
      { method: req.method }
    );
  });
  
  next();
});

// ==================== ROUTES ====================
const foldersRoutes = require('../routes/folders');
const playlistsRoutes = require('../routes/playlists');
const userRoutes = require("../routes/userRoutes");
const storyRoutes = require("../routes/storyRoutes");
const historyRoutes = require("../routes/historyRoutes");
const authRoutes = require("../routes/authRouters");

app.use("/api/folders", foldersRoutes);
app.use("/api/playlists", playlistsRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/history", historyRoutes);

// ==================== HEALTH CHECK ====================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: process.uptime(),
    ...monitoring.getHealthInfo()
  });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// ==================== DATABASE TEST ====================
app.get('/api/test-db', async (req, res) => {
  const dbStart = Date.now();
  
  try {
    // تحقق من حالة الاتصال
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'error',
        message: 'MongoDB not connected',
        readyState: mongoose.connection.readyState
      });
    }

    // اختبر الـ ping
    const adminDb = mongoose.connection.db.admin();
    await adminDb.ping();

    // تتبع عملية DB
    const dbDuration = Date.now() - dbStart;
    monitoring.trackDatabaseOperation('ping', dbDuration, 'admin', true);

    // احصل على المعلومات
    const stats = await mongoose.connection.db.stats();

    res.json({
      status: 'success',
      message: 'MongoDB connected successfully',
      database: mongoose.connection.name || 'AppStories',
      host: mongoose.connection.host,
      collections: stats.collections,
      dataSize: stats.dataSize
    });
  } catch (error) {
    console.error('Database test error:', error);
    
    // تتبع الخطأ
    monitoring.trackException(error, {
      endpoint: '/api/test-db',
      context: 'database_test'
    });

    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date()
    });
  }
});

// ==================== MONGO CONNECTION ====================
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_ATLAS_URI;

if (!mongoUri) {
  console.error('❌ No MongoDB URI configured');
  console.error('   Set MONGO_URI or MONGODB_ATLAS_URI environment variable');
  process.exit(1);
}

console.log(`🔗 Connecting to MongoDB...`);
console.log(`   URI: ${mongoUri.substring(0, 50)}...`);

// ✅ إزالة useNewUrlParser و useUnifiedTopology (deprecated)
mongoose
  .connect(mongoUri, {
    maxPoolSize: 10,
    retryWrites: true,
    w: 'majority'
  })
  .then(() => {
    console.log("✅ MongoDB connecté avec succès");
    console.log(`   Database: ${mongoose.connection.name || 'AppStories'}`);
    
    // تتبع الاتصال
    monitoring.trackEvent('database_connected', {
      database: mongoose.connection.name || 'AppStories'
    });
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion MongoDB:");
    console.error(`   ${err.message}`);
    
    // تتبع الخطأ
    monitoring.trackException(err, { context: 'mongodb_connection' });
    process.exit(1);
  });

// Gestion des événements de connexion
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
  monitoring.trackEvent('database_disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err.message);
  monitoring.trackException(err, { context: 'mongodb_error' });
});

// ==================== ERROR MIDDLEWARE ====================
app.use(notFound);
app.use(errorHandler);

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   DB Test: http://localhost:${PORT}/api/test-db`);
  
  // تتبع بدء السيرفر
  monitoring.trackEvent('server_started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'production'
  });
});

// ==================== GRACEFUL SHUTDOWN ====================
const shutdown = async (signal) => {
  console.log(`${signal} signal received: closing HTTP server`);
  
  // تتبع الإيقاف
  monitoring.trackEvent('server_shutdown', { signal });
  
  // إرسال البيانات قبل الإغلاق
  await monitoring.flush();

  server.close(async () => {
    console.log('HTTP server closed');
    
    try {
      // ✅ إصلاح: استخدام await بدلاً من callback
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
      process.exit(0);
    } catch (err) {
      console.error('Error closing MongoDB:', err.message);
      process.exit(1);
    }
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⚠️ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  monitoring.trackException(err, { context: 'uncaught_exception' });
  monitoring.flush();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  monitoring.trackException(new Error(String(reason)), { context: 'unhandled_rejection' });
});