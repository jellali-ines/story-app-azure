// ========================== STATISTICS ROUTES - FIXED ==========================
const express = require('express');
const router = express.Router();
const Evaluation = require('../models/Evaluation.model');

// ========================== GET OVERALL STATISTICS ==========================
router.get('/', async (req, res) => {
  try {
    console.log('Fetching overall statistics...');

    // Get total count
    const totalEvaluations = await Evaluation.countDocuments();

    // Get counts by type
    const grammarCount = await Evaluation.countDocuments({ type: 'grammar' });
    const storyCount = await Evaluation.countDocuments({ type: 'story' });

    // Calculate average score
    const evaluations = await Evaluation.find().select('score');
    const avgScore = evaluations.length > 0
      ? evaluations.reduce((sum, e) => sum + (e.score || 0), 0) / evaluations.length
      : 0;

    // Get recent activity
    const recentActivity = await Evaluation.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('type score createdAt userId');

    // Get top scores
    const topScores = await Evaluation.find()
      .sort({ score: -1 })
      .limit(5)
      .select('userId type score createdAt');

    const statistics = {
      totalEvaluations,
      avgScore: Math.round(avgScore * 10) / 10,
      totalGrammarChecks: grammarCount,
      totalStoryEvaluations: storyCount
    };

    console.log('Statistics:', statistics);

    return res.json({
      success: true,
      statistics,
      recentActivity,
      topScores
    });

  } catch (error) {
    console.error(' Statistics error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

// ========================== GET USER STATISTICS ==========================
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    console.log(`Fetching statistics for user: ${userId}`);

    // Total evaluations
    const totalEvaluations = await Evaluation.countDocuments({ userId });

    // By type
    const grammarCount = await Evaluation.countDocuments({ userId, type: 'grammar' });
    const storyCount = await Evaluation.countDocuments({ userId, type: 'story' });

    // Average score
    const evaluations = await Evaluation.find({ userId }).select('score');
    const avgScore = evaluations.length > 0
      ? evaluations.reduce((sum, e) => sum + (e.score || 0), 0) / evaluations.length
      : 0;

    // Best and worst
    const bestScore = await Evaluation.findOne({ userId })
      .sort({ score: -1 })
      .select('type score createdAt');

    const worstScore = await Evaluation.findOne({ userId })
      .sort({ score: 1 })
      .select('type score createdAt');

    // Recent evaluations
    const recentEvaluations = await Evaluation.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('type score statistics.wordCount createdAt');

    return res.json({
      success: true,
      userId,
      statistics: {
        totalEvaluations,
        averageScore: Math.round(avgScore * 10) / 10,
        byType: {
          grammar: grammarCount,
          story: storyCount
        },
        bestScore,
        worstScore
      },
      recentEvaluations
    });

  } catch (error) {
    console.error(' User statistics error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user statistics'
    });
  }
});

// ========================== GET STATISTICS BY TYPE ==========================
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;

    if (!['grammar', 'story'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid type. Must be grammar or story'
      });
    }

    // Total count
    const total = await Evaluation.countDocuments({ type });

    // Average score
    const evaluations = await Evaluation.find({ type }).select('score');
    const avgScore = evaluations.length > 0
      ? evaluations.reduce((sum, e) => sum + (e.score || 0), 0) / evaluations.length
      : 0;

    const maxScore = evaluations.length > 0
      ? Math.max(...evaluations.map(e => e.score || 0))
      : 0;

    const minScore = evaluations.length > 0
      ? Math.min(...evaluations.map(e => e.score || 0))
      : 0;

    // Top scores
    const topScores = await Evaluation.find({ type })
      .sort({ score: -1 })
      .limit(10)
      .select('userId score statistics.wordCount createdAt');

    // Recent
    const recent = await Evaluation.find({ type })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('userId score statistics.wordCount createdAt');

    return res.json({
      success: true,
      type,
      statistics: {
        total,
        averageScore: Math.round(avgScore * 10) / 10,
        maxScore,
        minScore
      },
      topScores,
      recentEvaluations: recent
    });

  } catch (error) {
    console.error('❌ Type statistics error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch type statistics'
    });
  }
});

module.exports = router;