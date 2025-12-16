const Evaluation = require('../models/Evaluation.model');
const { successResponse, errorResponse } = require('../utils/response');
const asyncHandler = require('../middleware/asyncHandler');

// ========================== CREATE EVALUATION ==========================
exports.createEvaluation = asyncHandler(async (req, res) => {
  const { userId, type, originalText, result, metadata } = req.body;

  // التحقق من المدخلات
  if (!type || !['grammar', 'story'].includes(type)) {
    return errorResponse(res, 'Invalid evaluation type', 400);
  }

  if (!originalText || !originalText.trim()) {
    return errorResponse(res, 'Original text is required', 400);
  }

  if (!result) {
    return errorResponse(res, 'Result is required', 400);
  }

  // إنشاء التقييم
  const evaluation = new Evaluation({
    userId: userId || 'anonymous',
    type,
    originalText,
    result,
    metadata: {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      ...metadata
    }
  });

  await evaluation.save();

  console.log(`✅ Evaluation created: ${evaluation.id} (${type})`);

  return successResponse(res, {
    message: 'Evaluation saved successfully',
    evaluation: evaluation.toPublicJSON()
  }, 201);
});

// ========================== GET ALL EVALUATIONS ==========================
exports.getAllEvaluations = asyncHandler(async (req, res) => {
  const { limit = 10, offset = 0, type, userId } = req.query;

  const query = {};
  if (type) query.type = type;
  if (userId) query.userId = userId;

  const evaluations = await Evaluation.find(query)
    .sort({ createdAt: -1 })
    .skip(parseInt(offset))
    .limit(parseInt(limit))
    .select('userId type score statistics.wordCount createdAt');

  const total = await Evaluation.countDocuments(query);

  return successResponse(res, {
    evaluations,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: total > parseInt(offset) + parseInt(limit)
    }
  });
});

// ========================== GET EVALUATION BY ID ==========================
exports.getEvaluationById = asyncHandler(async (req, res) => {
  const { evaluationId } = req.params;

  const evaluation = await Evaluation.findById(evaluationId);

  if (!evaluation) {
    return errorResponse(res, 'Evaluation not found', 404);
  }

  return successResponse(res, { evaluation });
});

// ========================== GET USER EVALUATIONS ==========================
exports.getUserEvaluations = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { limit = 10, offset = 0, type } = req.query;

  const query = { userId };
  if (type) query.type = type;

  const evaluations = await Evaluation.find(query)
    .sort({ createdAt: -1 })
    .skip(parseInt(offset))
    .limit(parseInt(limit));

  const total = await Evaluation.countDocuments(query);

  return successResponse(res, {
    userId,
    evaluations,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: total > parseInt(offset) + parseInt(limit)
    }
  });
});

// ========================== GET EVALUATION HISTORY ==========================
exports.getHistory = asyncHandler(async (req, res) => {
  const { userId, limit = 10, offset = 0, type } = req.query;

  const query = {};
  if (userId) query.userId = userId;
  if (type) query.type = type;

  const history = await Evaluation.find(query)
    .sort({ createdAt: -1 })
    .skip(parseInt(offset))
    .limit(parseInt(limit))
    .select('userId type score originalText statistics createdAt');

  const total = await Evaluation.countDocuments(query);

  return successResponse(res, {
    history,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: total > parseInt(offset) + parseInt(limit)
    }
  });
});

// ========================== DELETE EVALUATION ==========================
exports.deleteEvaluation = asyncHandler(async (req, res) => {
  const { evaluationId } = req.params;

  const evaluation = await Evaluation.findByIdAndDelete(evaluationId);

  if (!evaluation) {
    return errorResponse(res, 'Evaluation not found', 404);
  }

  console.log(`🗑️ Evaluation deleted: ${evaluationId}`);

  return successResponse(res, {
    message: 'Evaluation deleted successfully',
    evaluationId
  });
});

// ========================== DELETE USER EVALUATIONS ==========================
exports.deleteUserEvaluations = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const result = await Evaluation.deleteMany({ userId });

  console.log(`🗑️ Deleted ${result.deletedCount} evaluations for user: ${userId}`);

  return successResponse(res, {
    message: 'User evaluations deleted successfully',
    deletedCount: result.deletedCount
  });
});

// ========================== BULK CREATE EVALUATIONS ==========================
exports.bulkCreateEvaluations = asyncHandler(async (req, res) => {
  const { evaluations } = req.body;

  if (!Array.isArray(evaluations) || evaluations.length === 0) {
    return errorResponse(res, 'Evaluations array is required', 400);
  }

  const created = await Evaluation.insertMany(evaluations);

  console.log(`✅ Bulk created ${created.length} evaluations`);

  return successResponse(res, {
    message: 'Evaluations created successfully',
    count: created.length
  }, 201);
});