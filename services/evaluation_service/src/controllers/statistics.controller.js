// ========================== STATISTICS CONTROLLER - OPTIMIZED ==========================
const Evaluation = require('../models/Evaluation.model');
const { successResponse, errorResponse } = require('../utils/response');
const asyncHandler = require('../middleware/asyncHandler');

// ========================== GET OVERALL STATISTICS ==========================
exports.getOverallStatistics = asyncHandler(async (req, res) => {
  // FIX: Use single aggregation instead of multiple queries
  const [stats] = await Evaluation.aggregate([
    {
      $facet: {
        overall: [
          {
            $group: {
              _id: null,
              totalEvaluations: { $sum: 1 },
              avgScore: { $avg: '$score' },
              totalGrammarChecks: {
                $sum: { $cond: [{ $eq: ['$type', 'grammar'] }, 1, 0] }
              },
              totalStoryEvaluations: {
                $sum: { $cond: [{ $eq: ['$type', 'story'] }, 1, 0] }
              }
            }
          }
        ],
        recentActivity: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          { $project: { type: 1, score: 1, createdAt: 1, userId: 1 } }
        ],
        topScores: [
          { $sort: { score: -1 } },
          { $limit: 5 },
          { $project: { userId: 1, type: 1, score: 1, createdAt: 1 } }
        ]
      }
    }
  ]);

  const statistics = stats.overall[0] || {
    totalEvaluations: 0,
    avgScore: 0,
    totalGrammarChecks: 0,
    totalStoryEvaluations: 0
  };

  statistics.avgScore = Math.round(statistics.avgScore * 10) / 10;

  console.log('Statistics:', statistics);

  return successResponse(res, {
    statistics,
    recentActivity: stats.recentActivity,
    topScores: stats.topScores
  });
});

// ========================== GET USER STATISTICS - OPTIMIZED ==========================
exports.getUserStatistics = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return errorResponse(res, 'User ID is required', 400);
  }

  console.log(`Fetching statistics for user: ${userId}`);

  //  FIX: Single aggregation query instead of 5+ separate queries
  const [userStats] = await Evaluation.aggregate([
    { $match: { userId } },
    {
      $facet: {
        // Overall stats
        overall: [
          {
            $group: {
              _id: null,
              totalEvaluations: { $sum: 1 },
              avgScore: { $avg: '$score' },
              grammarCount: {
                $sum: { $cond: [{ $eq: ['$type', 'grammar'] }, 1, 0] }
              },
              storyCount: {
                $sum: { $cond: [{ $eq: ['$type', 'story'] }, 1, 0] }
              }
            }
          }
        ],
        // Best score
        bestScore: [
          { $sort: { score: -1 } },
          { $limit: 1 },
          { $project: { type: 1, score: 1, createdAt: 1 } }
        ],
        // Worst score
        worstScore: [
          { $sort: { score: 1 } },
          { $limit: 1 },
          { $project: { type: 1, score: 1, createdAt: 1 } }
        ],
        // Recent evaluations
        recentEvaluations: [
          { $sort: { createdAt: -1 } },
          { $limit: 10 },
          { $project: { type: 1, score: 1, 'statistics.wordCount': 1, createdAt: 1 } }
        ]
      }
    }
  ]);

  const overall = userStats.overall[0] || {
    totalEvaluations: 0,
    avgScore: 0,
    grammarCount: 0,
    storyCount: 0
  };

  return successResponse(res, {
    userId,
    statistics: {
      totalEvaluations: overall.totalEvaluations,
      averageScore: Math.round(overall.avgScore * 10) / 10,
      byType: {
        grammar: overall.grammarCount,
        story: overall.storyCount
      },
      bestScore: userStats.bestScore[0] || null,
      worstScore: userStats.worstScore[0] || null
    },
    recentEvaluations: userStats.recentEvaluations
  });
});

// ========================== GET STATISTICS BY TYPE - OPTIMIZED ==========================
exports.getStatisticsByType = asyncHandler(async (req, res) => {
  const { type } = req.params;

  if (!['grammar', 'story'].includes(type)) {
    return errorResponse(res, 'Invalid type', 400);
  }

  // FIX: Single aggregation instead of 4 separate queries
  const [typeStats] = await Evaluation.aggregate([
    { $match: { type } },
    {
      $facet: {
        // Overall stats
        overall: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              avgScore: { $avg: '$score' },
              maxScore: { $max: '$score' },
              minScore: { $min: '$score' }
            }
          }
        ],
        // Top scores
        topScores: [
          { $sort: { score: -1 } },
          { $limit: 10 },
          { $project: { userId: 1, score: 1, 'statistics.wordCount': 1, createdAt: 1 } }
        ],
        // Recent evaluations
        recent: [
          { $sort: { createdAt: -1 } },
          { $limit: 10 },
          { $project: { userId: 1, score: 1, 'statistics.wordCount': 1, createdAt: 1 } }
        ]
      }
    }
  ]);

  const overall = typeStats.overall[0] || {
    total: 0,
    avgScore: 0,
    maxScore: 0,
    minScore: 0
  };

  return successResponse(res, {
    type,
    statistics: {
      total: overall.total,
      averageScore: Math.round(overall.avgScore * 10) / 10,
      maxScore: overall.maxScore,
      minScore: overall.minScore
    },
    topScores: typeStats.topScores,
    recentEvaluations: typeStats.recent
  });
});

// ========================== GET DAILY STATISTICS ==========================
exports.getDailyStatistics = asyncHandler(async (req, res) => {
  const { days = 7 } = req.query;
  const daysCount = parseInt(days);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysCount);

  const dailyStats = await Evaluation.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 },
        avgScore: { $avg: '$score' },
        grammarCount: {
          $sum: { $cond: [{ $eq: ['$type', 'grammar'] }, 1, 0] }
        },
        storyCount: {
          $sum: { $cond: [{ $eq: ['$type', 'story'] }, 1, 0] }
        }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  // Format the results
  const formattedStats = dailyStats.map(stat => ({
    date: `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}-${String(stat._id.day).padStart(2, '0')}`,
    count: stat.count,
    averageScore: Math.round(stat.avgScore * 10) / 10,
    grammarCount: stat.grammarCount,
    storyCount: stat.storyCount
  }));

  return successResponse(res, {
    days: daysCount,
    statistics: formattedStats
  });
});

// ========================== GET SCORE DISTRIBUTION ==========================
exports.getScoreDistribution = asyncHandler(async (req, res) => {
  const { type } = req.query;

  const query = type ? { type } : {};

  const distribution = await Evaluation.aggregate([
    { $match: query },
    {
      $bucket: {
        groupBy: '$score',
        boundaries: [0, 20, 40, 60, 80, 100],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          avgScore: { $avg: '$score' }
        }
      }
    }
  ]);

  const labels = ['0-20', '20-40', '40-60', '60-80', '80-100'];
  const formattedDistribution = distribution.map((bucket, index) => ({
    range: labels[index],
    count: bucket.count,
    averageScore: Math.round(bucket.avgScore * 10) / 10
  }));

  return successResponse(res, {
    type: type || 'all',
    distribution: formattedDistribution
  });
});

// ========================== GET LEADERBOARD ==========================
exports.getLeaderboard = asyncHandler(async (req, res) => {
  const { type, limit = 10 } = req.query;
  const maxLimit = Math.min(parseInt(limit), 100); // FIX: Add max limit

  const query = type ? { type } : {};

  const leaderboard = await Evaluation.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$userId',
        totalEvaluations: { $sum: 1 },
        avgScore: { $avg: '$score' },
        maxScore: { $max: '$score' },
        totalWords: { $sum: '$statistics.wordCount' }
      }
    },
    { $sort: { avgScore: -1 } },
    { $limit: maxLimit }
  ]);

  const formattedLeaderboard = leaderboard.map((entry, index) => ({
    rank: index + 1,
    userId: entry._id,
    totalEvaluations: entry.totalEvaluations,
    averageScore: Math.round(entry.avgScore * 10) / 10,
    maxScore: entry.maxScore,
    totalWords: entry.totalWords
  }));

  return successResponse(res, {
    type: type || 'all',
    leaderboard: formattedLeaderboard
  });
});