import React, { useState } from 'react';
import CorrectedTextWithHighlights from "./CorrectedTextWithHighlights";



// Score Display Component
const ScoreDisplay = React.memo(({ result, theme }) => (
  <div 
    className="text-center text-white p-6 rounded-2xl shadow-lg"
    style={{
      background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
    }}
  >
    <div className="text-5xl mb-2">{result.gradeEmoji || '📚'}</div>
    <div className="text-4xl font-bold">{Math.round(result.overallGrade)}%</div>
    <div className="text-xl mt-1">{result.gradeText || 'Great Work!'}</div>
  </div>
));

ScoreDisplay.displayName = 'ScoreDisplay';

// Quick Stats Component
const QuickStats = React.memo(({ result, theme }) => (
  <div className="grid grid-cols-3 gap-2">
    <StatBox 
      icon="✨" 
      label="Grammar" 
      value={`${Math.round(result.grammarScore || 0)}%`}
      color={theme.primary}
    />
    <StatBox 
      icon="📊" 
      label="Coverage" 
      value={`${Math.round(result.coverage || 0)}%`}
      color={theme.success}
    />
    <StatBox 
      icon="🔤" 
      label="Words" 
      value={result.wordCount || 0}
      color={theme.secondary}
    />
  </div>
));

QuickStats.displayName = 'QuickStats';

// Stat Box Component
const StatBox = React.memo(({ icon, label, value, color }) => (
  <div 
    className="rounded-xl p-3 text-center border-2"
    style={{
      backgroundColor: `${color}10`,
      borderColor: `${color}30`
    }}
  >
    <div className="text-2xl mb-1">{icon}</div>
    <div className="text-xs text-gray-600">{label}</div>
    <div 
      className="text-xl font-bold"
      style={{ color }}
    >
      {value}
    </div>
  </div>
));

StatBox.displayName = 'StatBox';

// Tab Navigation Component
const TabNavigation = React.memo(({ tabs, activeTab, onTabChange }) => (
  <div className="flex gap-2 bg-gray-100 p-2 rounded-2xl overflow-x-auto">
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className={`flex-1 min-w-[80px] py-3 px-2 rounded-xl text-sm font-bold transition-all ${
          activeTab === tab.id 
            ? 'text-white shadow-lg transform scale-105' 
            : 'text-gray-600 hover:bg-white/50'
        }`}
        style={
          activeTab === tab.id 
            ? { background: `linear-gradient(135deg, ${tab.theme.primary}, ${tab.theme.secondary})` }
            : {}
        }
      >
        <div className="text-xl mb-1">{tab.icon}</div>
        <div className="text-xs">{tab.label}</div>
      </button>
    ))}
  </div>
));

TabNavigation.displayName = 'TabNavigation';

// Overview Tab Component
const OverviewTab = React.memo(({ result, theme }) => (
  <div className="space-y-4 animate-fadeIn">
    {/* AI Feedback */}
    {result.feedback && (
      <div 
        className="rounded-xl p-4 border-2"
        style={{
          background: `linear-gradient(135deg, ${theme.warning}10, ${theme.accent}10)`,
          borderColor: `${theme.warning}30`
        }}
      >
        <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
          <span className="text-2xl">💬</span>
          AI Teacher Feedback
        </h4>
        <div className="text-sm text-gray-800 leading-relaxed">{result.feedback}</div>
      </div>
    )}

    {/* Coverage Summary */}
    {result.keyPointsScores && Object.keys(result.keyPointsScores).length > 0 && (
      <div 
        className="rounded-xl p-4 border-2"
        style={{
          backgroundColor: `${theme.success}10`,
          borderColor: `${theme.success}30`
        }}
      >
        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Coverage Summary
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(result.keyPointsScores).map(([category, score]) => (
            <div key={category} className="bg-white rounded-lg p-3 text-center">
              <div 
                className="text-2xl font-bold"
                style={{ color: theme.success }}
              >
                {Math.round(score)}%
              </div>
              <div className="text-xs text-gray-600 capitalize mt-1">
                {category.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Error Summary */}
    {result.errorAnalysis && (
      <ErrorSummary errorAnalysis={result.errorAnalysis} theme={theme} />
    )}
  </div>
));

OverviewTab.displayName = 'OverviewTab';

// Error Summary Component
const ErrorSummary = React.memo(({ errorAnalysis, theme }) => (
  <div 
    className="rounded-xl p-4 border-2"
    style={{
      backgroundColor: `${theme.error}10`,
      borderColor: `${theme.error}30`
    }}
  >
    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
      <span className="text-2xl">🔧</span>
      Grammar Summary
    </h4>
    <div className="grid grid-cols-4 gap-2">
      {Object.entries(errorAnalysis).map(([type, data]) => (
        data.count > 0 && (
          <div key={type} className="bg-white rounded-lg p-2 text-center">
            <div 
              className="text-xl font-bold"
              style={{ color: theme.error }}
            >
              {data.count}
            </div>
            <div className="text-xs text-gray-600 capitalize">{type}</div>
          </div>
        )
      ))}
    </div>
  </div>
));

ErrorSummary.displayName = 'ErrorSummary';

// Corrections Tab Component
const CorrectionsTab = React.memo(({ result, theme }) => (
  <div className="space-y-4 animate-fadeIn">
    {result.corrected && (
      <div 
        className="rounded-xl p-4 border-2"
        style={{
          backgroundColor: `${theme.success}10`,
          borderColor: `${theme.success}30`
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">✏️</span>
          <h4 className="font-bold text-gray-800">Your Corrected Text</h4>
        </div>
        
        <CorrectedTextWithHighlights 
          original={result.original}
          corrected={result.corrected}
          changes={result.grammarChanges || []}
          theme={theme}
        />
      </div>
    )}

    {result.errorAnalysis && (
      <DetailedErrors errorAnalysis={result.errorAnalysis} theme={theme} />
    )}
  </div>
));

CorrectionsTab.displayName = 'CorrectionsTab';

// Detailed Errors Component
const DetailedErrors = React.memo(({ errorAnalysis, theme }) => {
  const icons = {
    spelling: '🔤',
    grammar: '✏️',
    punctuation: '📌',
    style: '🎨'
  };

  return (
    <div 
      className="rounded-xl p-4 border-2"
      style={{
        backgroundColor: `${theme.warning}10`,
        borderColor: `${theme.warning}30`
      }}
    >
      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span className="text-2xl">🔍</span>
        Error Details
      </h4>
      <div className="space-y-3">
        {Object.entries(errorAnalysis).map(([type, data]) => {
          if (data.count === 0) return null;
          
          return (
            <div key={type} className="bg-white rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{icons[type]}</span>
                <span className="font-semibold capitalize">{type}</span>
                <span 
                  className="ml-auto px-2 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: `${theme.error}20`,
                    color: theme.error
                  }}
                >
                  {data.count}
                </span>
              </div>
              {data.examples && data.examples.slice(0, 3).map((example, idx) => (
                <div key={idx} className="text-sm text-gray-700 ml-7 mb-1">
                  {example.suggestion && `→ ${example.suggestion}`}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
});

DetailedErrors.displayName = 'DetailedErrors';

// Elements Tab Component (Characters, Locations, Actions)
const ElementsTab = React.memo(({ result, theme }) => {
  if (!result.storyAnalysis?.student_elements) return null;

  const { characters, locations, actions } = result.storyAnalysis.student_elements;

  return (
    <div className="space-y-4 animate-fadeIn">
      {characters?.length > 0 && (
        <ElementSection 
          icon="👥" 
          title="Characters Found" 
          items={characters} 
          color={theme.primary}
          type="badge"
        />
      )}

      {locations?.length > 0 && (
        <ElementSection 
          icon="📍" 
          title="Locations Found" 
          items={locations} 
          color={theme.success}
          type="badge"
        />
      )}

      {actions?.length > 0 && (
        <ElementSection 
          icon="⚡" 
          title="Key Actions" 
          items={actions.slice(0, 5)} 
          color={theme.secondary}
          type="action"
        />
      )}
    </div>
  );
});

ElementsTab.displayName = 'ElementsTab';

// Element Section Component
const ElementSection = React.memo(({ icon, title, items, color, type }) => (
  <div 
    className="rounded-xl p-4 border-2"
    style={{
      backgroundColor: `${color}10`,
      borderColor: `${color}30`
    }}
  >
    <div className="flex items-center gap-2 mb-3">
      <span className="text-2xl">{icon}</span>
      <h4 className="font-bold text-gray-800">{title}</h4>
      <span 
        className="ml-auto px-3 py-1 rounded-full text-sm font-bold"
        style={{
          backgroundColor: `${color}20`,
          color: color
        }}
      >
        {items.length}
      </span>
    </div>
    
    {type === 'badge' ? (
      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <span 
            key={idx} 
            className="px-4 py-2 rounded-full text-sm font-medium border-2"
            style={{
              backgroundColor: `${color}20`,
              color: color,
              borderColor: `${color}30`
            }}
          >
            {item}
          </span>
        ))}
      </div>
    ) : (
      <div className="space-y-2">
        {items.map((action, idx) => (
          <div 
            key={idx} 
            className="flex items-center gap-2 rounded px-3 py-2"
            style={{ backgroundColor: `${color}20` }}
          >
            <span className="font-bold" style={{ color }}>•</span>
            <span className="text-sm" style={{ color }}>
              {action.subject && <span className="font-semibold">{action.subject}</span>}
              {action.subject && ' '}
              <span className="font-bold">{action.verb}</span>
              {action.object && ' '}
              {action.object && <span className="italic">{action.object}</span>}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
));

ElementSection.displayName = 'ElementSection';

// Tips Tab Component
const TipsTab = React.memo(({ result, theme }) => (
  <div className="space-y-3 animate-fadeIn">
    <div 
      className="rounded-xl p-4 border-2"
      style={{
        background: `linear-gradient(135deg, ${theme.info}10, ${theme.primary}10)`,
        borderColor: `${theme.primary}30`
      }}
    >
      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span className="text-2xl">💡</span>
        Personalized Tips for You
      </h4>
      
      <div className="space-y-2">
        {result.coverage < 80 && (
          <TipCard 
            icon="📝" 
            title="Include More Details" 
            description="Try to mention more characters, locations, and events"
            color={theme.info}
          />
        )}
        
        {result.grammarScore < 85 && (
          <TipCard 
            icon="✏️" 
            title="Review Grammar Rules" 
            description="Check the Corrections tab to learn from your mistakes"
            color={theme.warning}
          />
        )}
        
        {result.wordCount < 50 && (
          <TipCard 
            icon="📖" 
            title="Write More" 
            description="Add more descriptive sentences to make your story richer"
            color={theme.secondary}
          />
        )}
        
        <TipCard 
          icon="🌟" 
          title="Keep Practicing!" 
          description="Every story you write makes you a better writer"
          color={theme.accent}
          highlight
        />
      </div>
    </div>
  </div>
));

TipsTab.displayName = 'TipsTab';

// Tip Card Component
const TipCard = React.memo(({ icon, title, description, color, highlight }) => (
  <div 
    className={`flex items-start gap-3 p-3 rounded-lg ${highlight ? 'border-2' : ''}`}
    style={{
      backgroundColor: highlight 
        ? `linear-gradient(135deg, ${color}20, ${color}20)` 
        : `${color}20`,
      ...(highlight && { borderColor: `${color}30` })
    }}
  >
    <span className="text-2xl">{icon}</span>
    <div>
      <div className={`${highlight ? 'font-bold' : 'font-semibold'} text-gray-800`}>{title}</div>
      <div className={`text-sm ${highlight ? 'text-gray-700' : 'text-gray-600'}`}>{description}</div>
    </div>
  </div>
));

TipCard.displayName = 'TipCard';

// ==================== MAIN COMPONENT ====================

const StoryResult = ({ result, loading, error, theme }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div 
          className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-8 text-center animate-pulse shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${theme.primary}10, ${theme.secondary}10)`,
            border: `2px solid ${theme.primary}20`
          }}
        >
          <div 
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
            }}
          >
            <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          </div>
          <p className="font-bold text-lg mb-2" style={{ color: theme.primary }}>
            Evaluating your story...
          </p>
          <p className="text-sm" style={{ color: theme.secondary }}>
            AI is working its magic ✨
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div 
        className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-8 text-center border-2 shadow-lg"
        style={{
          borderColor: `${theme.error}30`,
          background: `linear-gradient(135deg, ${theme.error}10, ${theme.warning}10)`
        }}
      >
        <div className="text-6xl mb-4 animate-bounce">⚠️</div>
        <h3 className="text-xl font-bold mb-2" style={{ color: theme.error }}>
          Oops! Something went wrong
        </h3>
        <p className="mb-4" style={{ color: theme.error }}>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 text-white rounded-2xl font-bold transition-all hover:scale-105 shadow-md"
          style={{
            background: `linear-gradient(135deg, ${theme.error}, ${theme.warning})`
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // No result state
  if (!result) {
    return (
      <div className="text-center py-12 px-6">
        <div 
          className="mt-6 p-4 rounded-2xl mx-auto max-w-xs"
          style={{
            backgroundColor: `${theme.primary}10`,
            border: `2px dashed ${theme.primary}30`
          }}
        >
          <div className="flex justify-center space-x-2 mb-2">
            <span className="text-2xl animate-pulse" style={{ color: theme.primary }}>📝</span>
            <span className="text-2xl animate-pulse" style={{ color: theme.secondary }}>✨</span>
            <span className="text-2xl animate-pulse" style={{ color: theme.primary }}>🎯</span>
          </div>
          <p className="text-xs font-medium" style={{ color: theme.primary }}>
            Write your story and click "Evaluate"
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊', theme },
    { id: 'corrections', label: 'Corrections', icon: '✔️', theme },
    { id: 'elements', label: 'Elements', icon: '📝', theme },
    { id: 'tips', label: 'Tips', icon: '💡', theme }
  ];

  return (
    <div className="space-y-4">
      <ScoreDisplay result={result} theme={theme} />
      <QuickStats result={result} theme={theme} />
      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="min-h-[300px]">
        {activeTab === 'overview' && <OverviewTab result={result} theme={theme} />}
        {activeTab === 'corrections' && <CorrectionsTab result={result} theme={theme} />}
        {activeTab === 'elements' && <ElementsTab result={result} theme={theme} />}
        {activeTab === 'tips' && <TipsTab result={result} theme={theme} />}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default React.memo(StoryResult);