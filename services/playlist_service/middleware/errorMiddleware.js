// middleware/errorMiddleware.js

// Middleware pour les routes non trouvées (404)
const notFound = (req, res, next) => {
  const error = new Error(`Route non trouvée - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware de gestion d'erreurs global
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log pour le développement
  console.error('❌ Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.message = 'ID de format invalide';
    error.statusCode = 400;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    error.message = `${field} doit être unique. Cette valeur existe déjà.`;
    error.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors).map(val => val.message).join(', ');
    error.statusCode = 400;
  }

  // Défaut
  const statusCode = error.statusCode || res.statusCode || 500;
  const message = error.message || 'Erreur serveur interne';

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = { notFound, errorHandler };