import React, { useState, useMemo, useCallback } from 'react';
import TabbedResult from './TabbedResult';

const ERROR_CONFIG = {
  spelling: { 
    icon: '🔤', 
    color: 'red', 
    bg: 'bg-red-50', 
    border: 'border-red-200', 
    text: 'text-red-600' 
  },
  grammar: { 
    icon: '✏️', 
    color: 'orange', 
    bg: 'bg-orange-50', 
    border: 'border-orange-200', 
    text: 'text-orange-600' 
  },
  punctuation: { 
    icon: '📌', 
    color: 'blue', 
    bg: 'bg-blue-50', 
    border: 'border-blue-200', 
    text: 'text-blue-600' 
  },
  style: { 
    icon: '🎨', 
    color: 'purple', 
    bg: 'bg-purple-50', 
    border: 'border-purple-200', 
    text: 'text-purple-600' 
  }
};

const StatCard = React.memo(({ label, value, colorClass }) => (
  <div className={`bg-gradient-to-br ${colorClass} rounded-xl p-4 text-center border-2 shadow-sm`}>
    <div className="text-sm text-gray-600 mb-2 font-medium">{label}</div>
    <div className={`text-3xl font-bold ${colorClass.split(' ')[2]}`}>
      {value}
    </div>
  </div>
));

StatCard.displayName = 'StatCard';

const ErrorSummaryCard = React.memo(({ type, data, isExpanded, onToggle }) => {
  const config = ERROR_CONFIG[type] || ERROR_CONFIG.style;
  
  if (data.count === 0) return null;
  
  return (
    <div>
      <button
        onClick={onToggle}
        className={`${config.bg} border-2 ${config.border} rounded-xl p-3 text-left hover:shadow-md transition-all hover:scale-105 w-full`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <div className="text-xs text-gray-600 capitalize font-medium">{type}</div>
              <div className={`text-2xl font-bold ${config.text}`}>{data.count}</div>
            </div>
          </div>
          <span className="text-gray-400 text-lg">
            {isExpanded ? '−' : '+'}
          </span>
        </div>
      </button>

      {isExpanded && data.examples && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200 animate-fadeIn mt-2">
          <div className="font-semibold text-gray-800 mb-3 capitalize text-lg">
            {type} Examples:
          </div>
          <div className="space-y-3">
            {data.examples.slice(0, 3).map((example, idx) => (
              <div key={idx} className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
                {example.message && (
                  <div className="text-gray-700 mb-2 text-sm">{example.message}</div>
                )}
                {example.suggestion && (
                  <div className="text-green-700 font-semibold text-sm flex items-center gap-2">
                    <span className="text-green-500">→</span>
                    <span>Suggestion: {example.suggestion}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

ErrorSummaryCard.displayName = 'ErrorSummaryCard';

const GrammarResult = ({ result, loading, error, theme }) => {
  const [expandedErrors, setExpandedErrors] = useState(null);

  //  Memoize expensive calculations
  const stats = useMemo(() => {
    if (!result) return null;
    
    const totalErrors = result.errorAnalysis 
      ? Object.values(result.errorAnalysis).reduce((sum, cat) => sum + (cat.count || 0), 0)
      : 0;
    const hasErrors = totalErrors > 0;
    const score = Math.round(result.score || 0);
    
    return { totalErrors, hasErrors, score };
  }, [result]);

  //  Use useCallback for event handlers
  const toggleErrorExpansion = useCallback((type) => {
    setExpandedErrors(prev => prev === type ? null : type);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-8 text-center animate-pulse">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          </div>
          <p className="text-purple-800 font-bold text-lg">Analyzing your text...</p>
          <p className="text-purple-600 text-sm mt-2">AI is working its magic ✨</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-8 text-center border-2 border-red-200 shadow-lg">
        <div className="text-6xl mb-4 animate-bounce">⚠️</div>
        <h3 className="text-xl font-bold text-red-800 mb-2">Oops! Something went wrong</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-bold hover:from-red-600 hover:to-orange-600 transition-all hover:scale-105 shadow-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  // No result state
  if (!result || !stats) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4 animate-bounce">✏️</div>
        <p className="text-lg text-gray-600 font-medium">Submit your text to see results</p>
        <p className="text-sm text-gray-500 mt-2">Let's check your grammar together! 🎯</p>
      </div>
    );
  }

  const { totalErrors, hasErrors } = stats;

  return (
    <div className="space-y-4">
      {/* Error Summary */}
      {hasErrors && result.errorAnalysis && (
        <div className="bg-white rounded-2xl p-5 border-2 border-red-200 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">🔍</span>
              Issues Found
            </h4>
            <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-bold shadow-sm">
              {totalErrors} total
            </span>
          </div>
          
          {/* Quick Summary Grid */}
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(result.errorAnalysis).map(([type, data]) => (
              <ErrorSummaryCard
                key={type}
                type={type}
                data={data}
                isExpanded={expandedErrors === type}
                onToggle={() => toggleErrorExpansion(type)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tabbed Result */}
      <div className="bg-white rounded-2xl border-2 border-purple-200 overflow-hidden shadow-md">
        <TabbedResult result={result} theme={theme} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Similarity"
          value={`${Math.round(result.similarity || 0)}%`}
          colorClass="from-blue-50 to-cyan-50 border-blue-200 text-blue-600"
        />
        <StatCard
          label="Changes"
          value={result.changes?.length || 0}
          colorClass="from-green-50 to-emerald-50 border-green-200 text-green-600"
        />
        <StatCard
          label="Fixed"
          value={(result.statistics?.errors_before || 0) - (result.statistics?.errors_after || 0)}
          colorClass="from-orange-50 to-amber-50 border-orange-200 text-orange-600"
        />
      </div>

      {/* Encouragement Message */}
      <div className={`bg-gradient-to-br rounded-2xl p-5 border-2 text-center shadow-md ${
        hasErrors 
          ? 'from-purple-50 to-pink-50 border-purple-200'
          : 'from-green-50 to-emerald-50 border-green-200'
      }`}>
        <p className="text-gray-700 font-medium">
          {hasErrors ? (
            <>
              <span className="font-bold text-purple-600">Great effort!</span> Review the corrections to improve your writing skills 📚
            </>
          ) : (
            <>
              <span className="font-bold text-green-600">Excellent work!</span> Your grammar is perfect! Keep it up! 🎉
            </>
          )}
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default React.memo(GrammarResult);