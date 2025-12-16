// ========================== EVALUATION MODEL - WITH INDEXES ==========================
const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: 'anonymous'
  },
  type: {
    type: String,
    required: true,
    enum: ['grammar', 'story']
  },
  originalText: {
    type: String,
    required: true
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  statistics: {
    wordCount: { type: Number, default: 0 },
    errorsFound: { type: Number, default: 0 },
    changesMade: { type: Number, default: 0 }
  },
  metadata: {
    userAgent: String,
    ipAddress: String
  }
}, {
  timestamps: true
});

// ✅ FIX: Add indexes for better query performance
// Index for user queries sorted by date
evaluationSchema.index({ userId: 1, createdAt: -1 });

// Index for type queries sorted by date
evaluationSchema.index({ type: 1, createdAt: -1 });

// Compound index for user + type queries
evaluationSchema.index({ userId: 1, type: 1, createdAt: -1 });

// Index for score-based queries (leaderboards)
evaluationSchema.index({ score: -1 });

// Index for statistics queries
evaluationSchema.index({ createdAt: -1 });

// ========================== METHODS ==========================

// Get overall statistics (keeping for backward compatibility)
evaluationSchema.statics.getOverallStatistics = async function() {
  const [stats] = await this.aggregate([
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
  ]);

  return stats || {
    totalEvaluations: 0,
    avgScore: 0,
    totalGrammarChecks: 0,
    totalStoryEvaluations: 0
  };
};

// Get user statistics
evaluationSchema.statics.getUserStatistics = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        avgScore: { $avg: '$score' }
      }
    }
  ]);

  return stats.reduce((acc, stat) => {
    acc[stat._id] = {
      count: stat.count,
      avgScore: Math.round(stat.avgScore * 10) / 10
    };
    return acc;
  }, {});
};

// Get top scores
evaluationSchema.statics.getTopScores = async function(type = null, limit = 10) {
  const query = type ? { type } : {};
  
  return this.find(query)
    .sort({ score: -1 })
    .limit(limit)
    .select('userId type score statistics.wordCount createdAt')
    .lean();
};

// Public JSON representation
evaluationSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    userId: this.userId,
    type: this.type,
    score: this.score,
    statistics: this.statistics,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const Evaluation = mongoose.model('Evaluation', evaluationSchema);

module.exports = Evaluation;