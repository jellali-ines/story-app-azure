// ========================== ERROR HANDLER MIDDLEWARE ==========================
// Centralized error handling for the gateway

const errorHandler = (err, req, res, next) => {
  console.error('\n ========================== ERROR ==========================');
  console.error('Path:', req.path);
  console.error('Method:', req.method);
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  console.error('===========================================================\n');

  // Connection refused (service unavailable)
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Unable to connect to the requested service',
      service: err.address
    });
  }

  // Timeout error
  if (err.code === 'ECONNABORTED') {
    return res.status(504).json({
      error: 'Gateway Timeout',
      message: 'The service took too long to respond'
    });
  }

  // Axios response error (from downstream service)
  if (err.response) {
    return res.status(err.response.status).json(
      err.response.data || { 
        error: 'Service Error',
        message: 'An error occurred in the downstream service'
      }
    );
  }

  // Axios request error (no response)
  if (err.request) {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Unable to reach the requested service'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.details
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Something went wrong on our side'
  });
};

module.exports = errorHandler;