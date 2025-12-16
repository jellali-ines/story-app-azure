const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Import Routes
const storiesRoutes = require('./routes/stories');
const playlistsRoutes = require('./routes/playlists');
const foldersRoutes = require('./routes/folders');

// Initialisation Express
const app = express();

// Connexion à la base de données
connectDB();

// Middleware - Configuration CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logger middleware (pour le développement)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Routes API
app.use('/api/stories', storiesRoutes);
app.use('/api/playlists', playlistsRoutes);
app.use('/api/folders', foldersRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    status: 'OK', 
    message: 'Bedtime Story API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Route racine
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bienvenue sur l\'API Bedtime Stories',
    version: '1.0.0',
    documentation: '/api/health pour vérifier l\'état du serveur'
  });
});

// Middleware pour les routes non trouvées
app.use(notFound);

// Middleware de gestion d'erreurs (doit être le dernier)
app.use(errorHandler);

// Démarrage du serveur
const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log('=================================');
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log('=================================');
});

// Gestion propre de l'arrêt
process.on('SIGTERM', () => {
  console.log(' SIGTERM reçu. Arrêt propre du serveur...');
  server.close(() => {
    console.log(' Serveur arrêté proprement');
    process.exit(0);
  });
});

module.exports = app;