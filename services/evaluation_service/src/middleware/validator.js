// ========================== VALIDATOR MIDDLEWARE ==========================
const { errorResponse } = require('../utils/response');

// ========================== VALIDATE EVALUATION ==========================
exports.validateEvaluation = (req, res, next) => {
  const { type, originalText, result } = req.body;

  // Validate type
  if (!type) {
    return errorResponse(res, 'Type is required', 400);
  }

  if (!['grammar', 'story'].includes(type)) {
    return errorResponse(res, 'Type must be either "grammar" or "story"', 400);
  }

  // Validate originalText
  if (!originalText) {
    return errorResponse(res, 'Original text is required', 400);
  }

  if (typeof originalText !== 'string') {
    return errorResponse(res, 'Original text must be a string', 400);
  }

  if (originalText.trim().length === 0) {
    return errorResponse(res, 'Original text cannot be empty', 400);
  }

  // Validate result
  if (!result) {
    return errorResponse(res, 'Result is required', 400);
  }

  if (typeof result !== 'object') {
    return errorResponse(res, 'Result must be an object', 400);
  }

  next();
};

// ========================== VALIDATE QUERY PARAMS ==========================
exports.validatePagination = (req, res, next) => {
  const { limit, offset } = req.query;

  if (limit && (isNaN(limit) || limit < 1)) {
    return errorResponse(res, 'Limit must be a positive number', 400);
  }

  if (offset && (isNaN(offset) || offset < 0)) {
    return errorResponse(res, 'Offset must be a non-negative number', 400);
  }

  next();
};

// ========================== VALIDATE USER ID ==========================
exports.validateUserId = (req, res, next) => {
  const { userId } = req.params;

  if (!userId || userId.trim().length === 0) {
    return errorResponse(res, 'User ID is required', 400);
  }

  next();
};