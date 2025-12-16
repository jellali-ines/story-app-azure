const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
require('dotenv').config();

const evaluationRoutes = require('./routes/evaluation.routes');
const statisticsRoutes = require('./routes/statistics.routes');
const errorHandler = require('./middleware/errorHandler');
const { connectDatabase } = require('./config/database');

const app = express();

// MIDDLEWARE
app.use(helmet());
app.use(cors()); // ✅ Simple - Allow ALL origins
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// HEALTH CHECK
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'healthy',
    service: 'evaluation-service',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.json({
    message: '📊 Evaluation Service API',
    version: '1.0.0',
    endpoints: {
      evaluations: '/api/evaluations',
      statistics: '/api/statistics',
      health: '/health'
    }
  });
});

// ROUTES
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/statistics', statisticsRoutes);

// ERROR HANDLING
app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// DATABASE
connectDatabase()
  .then(() => console.log('✅ Database connected'))
  .catch((error) => {
    console.error('❌ Database failed:', error.message);
    process.exit(1);
  });

// START SERVER
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log('\n📊 EVALUATION SERVICE');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🔓 CORS: OPEN (All origins allowed)`);
  console.log('========================\n');
});

module.exports = app;