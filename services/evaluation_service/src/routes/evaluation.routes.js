// ========================== EVALUATION ROUTES - COMPLETE & FIXED ==========================
const express = require('express');
const router = express.Router();
const Evaluation = require('../models/Evaluation.model');

// ========================== HELPER: Format Evaluation ==========================
const formatEvaluation = (evaluation) => {
  if (!evaluation) return null;
  
  const plain = evaluation.toObject ? evaluation.toObject() : evaluation;
  
  return {
    ...plain,
    _id: plain._id.toString(),
    id: plain._id.toString()
  };
};

const formatEvaluations = (evaluations) => {
  return evaluations.map(formatEvaluation);
};

// ========================== CREATE EVALUATION ==========================
router.post('/', async (req, res) => {
  try {
    const { userId, type, originalText, result, score, statistics } = req.body;

    console.log('📝 Creating evaluation:', { userId, type, score });

    // Validation
    if (!type || !['grammar', 'story'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid type. Must be grammar or story'
      });
    }

    if (!originalText || !originalText.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Original text is required'
      });
    }

    // Create evaluation
    const evaluation = new Evaluation({
      userId: userId || 'anonymous',
      type,
      originalText,
      result: result || {},
      score: score || 0,
      statistics: statistics || {},
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      }
    });

    await evaluation.save();

    console.log(`✅ Evaluation saved: ${evaluation._id}`);

    return res.status(201).json({
      success: true,
      message: 'Evaluation saved successfully',
      evaluation: {
        _id: evaluation._id.toString(),
        id: evaluation._id.toString(),
        userId: evaluation.userId,
        type: evaluation.type,
        score: evaluation.score,
        createdAt: evaluation.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Create error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to save evaluation',
      message: error.message
    });
  }
});

// ========================== GET ALL EVALUATIONS ==========================
router.get('/', async (req, res) => {
  try {
    const { limit = 10, offset = 0, type, userId } = req.query;

    const query = {};
    if (type) query.type = type;
    if (userId) query.userId = userId;

    console.log('📋 Fetching evaluations:', query);

    const evaluations = await Evaluation.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .select('userId type score statistics.wordCount createdAt')
      .lean();

    const total = await Evaluation.countDocuments(query);

    console.log(`✅ Found ${evaluations.length} evaluations`);

    // ✅ Format evaluations with proper IDs
    const formatted = evaluations.map(e => ({
      ...e,
      _id: e._id.toString(),
      id: e._id.toString()
    }));

    return res.json({
      success: true,
      evaluations: formatted,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ Get all error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch evaluations',
      message: error.message
    });
  }
});

// ========================== GET HISTORY ==========================
router.get('/history', async (req, res) => {
  try {
    const { userId, limit = 10, offset = 0, type } = req.query;

    const query = {};
    if (userId) query.userId = userId;
    if (type) query.type = type;

    console.log('📜 Fetching history:', query);

    const history = await Evaluation.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .select('userId type score originalText statistics createdAt')
      .lean(); // ✅ Convert to plain JavaScript objects

    const total = await Evaluation.countDocuments(query);

    console.log(`✅ Found ${history.length} evaluations`);

    // ✅ Format history with proper IDs
    const formatted = history.map(item => ({
      ...item,
      _id: item._id.toString(),
      id: item._id.toString()
    }));

    // ✅ Log first item for debugging
    if (formatted.length > 0) {
      console.log('📊 First evaluation:', {
        _id: formatted[0]._id,
        id: formatted[0].id,
        userId: formatted[0].userId,
        type: formatted[0].type
      });
    }

    return res.json({
      success: true,
      history: formatted,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ History error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch history',
      message: error.message
    });
  }
});

// ========================== GET BY ID ==========================
router.get('/:evaluationId', async (req, res) => {
  try {
    const { evaluationId } = req.params;

    console.log(`🔍 Fetching evaluation: ${evaluationId}`);

    // ✅ Validate ObjectId format
    if (!evaluationId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid evaluation ID format'
      });
    }

    const evaluation = await Evaluation.findById(evaluationId).lean();

    if (!evaluation) {
      console.log(`❌ Evaluation not found: ${evaluationId}`);
      return res.status(404).json({
        success: false,
        error: 'Evaluation not found'
      });
    }

    console.log(`✅ Evaluation found: ${evaluationId}`);

    // ✅ Format with proper IDs
    const formatted = {
      ...evaluation,
      _id: evaluation._id.toString(),
      id: evaluation._id.toString()
    };

    return res.json({
      success: true,
      evaluation: formatted
    });
  } catch (error) {
    console.error('❌ Get by ID error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch evaluation',
      message: error.message
    });
  }
});

// ========================== DELETE ==========================
router.delete('/:evaluationId', async (req, res) => {
  try {
    const { evaluationId } = req.params;

    console.log(`🗑️ Delete request for: ${evaluationId}`);

    // ✅ Validate ObjectId format
    if (!evaluationId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log(`❌ Invalid ID format: ${evaluationId}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid evaluation ID format',
        received: evaluationId
      });
    }

    const evaluation = await Evaluation.findByIdAndDelete(evaluationId);

    if (!evaluation) {
      console.log(`❌ Evaluation not found: ${evaluationId}`);
      return res.status(404).json({
        success: false,
        error: 'Evaluation not found',
        evaluationId
      });
    }

    console.log(`✅ Successfully deleted: ${evaluationId}`);

    return res.json({
      success: true,
      message: 'Evaluation deleted successfully',
      evaluationId,
      deletedEvaluation: {
        _id: evaluation._id.toString(),
        userId: evaluation.userId,
        type: evaluation.type,
        score: evaluation.score
      }
    });
  } catch (error) {
    console.error('❌ Delete error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete evaluation',
      message: error.message
    });
  }
});

// ========================== DELETE ALL USER EVALUATIONS ==========================
router.delete('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`🗑️ Deleting all evaluations for user: ${userId}`);

    const result = await Evaluation.deleteMany({ userId });

    console.log(`✅ Deleted ${result.deletedCount} evaluations for: ${userId}`);

    return res.json({
      success: true,
      message: `Deleted ${result.deletedCount} evaluations`,
      userId,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Delete user evaluations error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete user evaluations',
      message: error.message
    });
  }
});

module.exports = router;