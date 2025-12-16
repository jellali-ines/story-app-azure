
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const grammarRoutes = require('./routes/grammar.routes');
const storyRoutes = require('./routes/story.routes');
const evaluationRoutes = require('./routes/evaluation.routes');
const paymentRoutes=require('./routes/admin/payment.routes');
const userRoutes=require('./routes/admin/user.routes');
const authRoutes=require('./routes/admin/auth.routes');
const texttospeechRoutes=require("./routes/admin/text_to_speech.routes")
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ========================== MIDDLEWARE ==========================
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:4000',
    ];
    
    // السماح بالطلبات بدون origin (مثل mobile apps أو curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ========================== HEALTH CHECK ==========================
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.json({
    message: ' Grammar Fun API Gateway',
    version: '1.0.0',
    endpoints: {
      grammar: '/api/grammar',
      story: '/api/story',
      evaluation: '/api/evaluation',
      payment:'/api/admin/payment',
      user:'/api/admin/user'
    }
  });
});

// ========================== ROUTES ==========================
app.use('/api/grammar', grammarRoutes);
app.use('/api/story', storyRoutes);
app.use('/api/evaluation', evaluationRoutes);
app.use('/api/admin/payment', paymentRoutes);
app.use('/api/admin/user', userRoutes);
app.use('/api/admin/story', storyRoutes);
app.use('/api/admin/auth',authRoutes);
app.use('/api/admin/texttospeech',texttospeechRoutes);


// ========================== ERROR HANDLING ==========================
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// ========================== START SERVER ==========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n ========================== API GATEWAY ==========================');
  console.log(` Server running on: http://localhost:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Grammar Service: ${process.env.GRAMMAR_SERVICE_URL || 'http://localhost:7860'}`);
  console.log(` Evaluation Service: ${process.env.EVALUATION_SERVICE_URL || 'http://localhost:4000'}`);
  console.log('==================================================================\n');
});

module.exports = app;