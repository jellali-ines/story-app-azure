// ========================== RESPONSE UTILITIES ==========================

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
exports.successResponse = (res, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    ...data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code (default: 500)
 * @param {Object} details - Additional error details
 */
exports.errorResponse = (res, message = 'Internal Server Error', statusCode = 500, details = {}) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
    ...details,
    timestamp: new Date().toISOString()
  });
};