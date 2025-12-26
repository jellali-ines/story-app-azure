import React from 'react';
import { Star, CheckCircle, AlertCircle, XCircle, Trophy, Target } from 'lucide-react';

export default function PronunciationResult({ result }) {
  // Safety check
  if (!result) {
    return (
      <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4 text-center">
        <p className="text-red-300">⚠️ No evaluation result available</p>
      </div>
    );
  }

  const { 
    overall_score = 0, 
    accuracy_score = 0,
    correct_words = 0,
    total_words = 0,
    word_analysis = [],
    recognized_text = '',
    feedback = {
      emoji: '😊',
      message: 'Keep trying!',
      suggestion: 'Practice more'
    }
  } = result;

  const getStars = (score) => {
    if (score >= 90) return 5;
    if (score >= 75) return 4;
    if (score >= 60) return 3;
    if (score >= 40) return 2;
    return 1;
  };

  const stars = getStars(overall_score);

  const getWordStatusIcon = (status) => {
    switch(status) {
      case 'correct':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'close':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'wrong':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'missing':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getWordStatusColor = (status) => {
    switch(status) {
      case 'correct':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'close':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'wrong':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'missing':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  return (
    <div className="space-y-6 mt-6 animate-fadeIn">
      
      {/* Overall Score Card */}
      <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-700/50 rounded-2xl p-6">
        
        {/* Stars */}
        <div className="flex justify-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-8 h-8 transition-all duration-300 ${
                i < stars 
                  ? 'text-yellow-400 fill-yellow-400 scale-110' 
                  : 'text-gray-600'
              }`} 
            />
          ))}
        </div>
        
        {/* Score */}
        <div className="text-center mb-4">
          <div className="text-6xl font-bold text-white mb-2">
            {Math.round(overall_score)}%
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Target className="w-4 h-4" />
            <span className="text-sm">{correct_words}/{total_words} words correct</span>
          </div>
        </div>
        
        {/* Feedback */}
        <div className="text-center">
          <div className="text-4xl mb-2">{feedback.emoji}</div>
          <p className="text-xl font-semibold text-white mb-2">
            {feedback.message}
          </p>
          <p className="text-sm text-gray-400">
            {feedback.suggestion}
          </p>
        </div>
      </div>

      {/* Accuracy Breakdown */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-semibold text-gray-300">Performance Breakdown</h3>
        </div>
        
        <div className="space-y-3">
          <ScoreBar label="Accuracy" score={accuracy_score} color="purple" />
          <ScoreBar 
            label="Completion" 
            score={(correct_words / total_words) * 100} 
            color="blue" 
          />
        </div>
      </div>

      {/* What You Said */}
      {recognized_text && (
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
            💬 What we heard:
          </h3>
          <p className="text-gray-400 text-sm italic leading-relaxed">
            "{recognized_text}"
          </p>
        </div>
      )}

      {/* Word-by-Word Analysis */}
      {word_analysis && word_analysis.length > 0 && (
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            📝 Detailed Word Analysis
          </h3>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {word_analysis.map((word, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${getWordStatusColor(word.status)}`}
              >
                <div className="flex items-center gap-2">
                  {getWordStatusIcon(word.status)}
                  <span className="font-medium">
                    {word.reference || word.recognized || '—'}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  {word.recognized && word.reference !== word.recognized && (
                    <span className="text-xs opacity-75">
                      You said: "{word.recognized}"
                    </span>
                  )}
                  {word.score !== undefined && (
                    <span className="text-xs font-bold px-2 py-1 rounded bg-black/20">
                      {Math.round(word.score)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="mt-4 pt-3 border-t border-gray-700 grid grid-cols-4 gap-2 text-center text-xs">
            <StatBadge 
              label="Correct" 
              count={word_analysis.filter(w => w.status === 'correct').length}
              color="green"
            />
            <StatBadge 
              label="Close" 
              count={word_analysis.filter(w => w.status === 'close').length}
              color="yellow"
            />
            <StatBadge 
              label="Wrong" 
              count={word_analysis.filter(w => w.status === 'wrong').length}
              color="red"
            />
            <StatBadge 
              label="Missing" 
              count={word_analysis.filter(w => w.status === 'missing').length}
              color="gray"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Score Bar Component
function ScoreBar({ label, score, color }) {
  const colorMap = {
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
  };

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300 font-medium">{Math.round(score)}%</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorMap[color]} transition-all duration-500`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
}

// Stat Badge Component
function StatBadge({ label, count, color }) {
  const colorMap = {
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    red: 'bg-red-500/20 text-red-400',
    gray: 'bg-gray-500/20 text-gray-400',
  };

  return (
    <div className={`p-2 rounded-lg ${colorMap[color]}`}>
      <div className="font-bold text-lg">{count}</div>
      <div className="text-xs opacity-75">{label}</div>
    </div>
  );
}