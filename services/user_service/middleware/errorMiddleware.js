// middleware/errorMiddleware.js

// 404 Middleware
const notFound = (req, res, next) => {
  const error = new Error(`URL non trouvée : ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global Error Handler
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Gestion des erreurs MongoDB duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate field: la valeur existe déjà";
  }

  // Validation Mongoose
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(", ");
  }

  res.status(statusCode).json({
    message: message,
    error_type: err.name,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = {
  notFound,
  errorHandler
};
