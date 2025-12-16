// ========================== ERROR HANDLER MIDDLEWARE ==========================
const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('\n❌ ========================== ERROR ==========================');
  console.error('Path:', req.path);
  console.error('Method:', req.method);
  console.error('Error Name:', err.name);
  console.error('Error Message:', err.message);
  console.error('Stack:', err.stack);
  console.error('===========================================================\n');

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return errorResponse(res, 'Validation Error', 400, { errors });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return errorResponse(res, 'Invalid ID format', 400);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return errorResponse(res, `Duplicate value for field: ${field}`, 409);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expired', 401);
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'Internal Server Error';

  return errorResponse(res, message, statusCode);
};

module.exports = errorHandler;