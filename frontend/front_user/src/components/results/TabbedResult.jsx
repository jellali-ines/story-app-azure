// ========================== TABBED RESULT (UPDATED) ==========================
import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import CorrectedTextWithHighlights from "./CorrectedTextWithHighlights";


const TabbedResult = ({ result, theme }) => {
  const [activeTab, setActiveTab] = useState('correctedText');

  const tabs = [
    { 
      id: 'correctedText', 
      label: 'Corrected Text', 
      icon: '📄',
      theme: theme
    },
    { 
      id: 'analysis', 
      label: 'Analysis', 
      icon: '🔍',
      theme: theme
    },
    { 
      id: 'tips', 
      label: 'Tips', 
      icon: '🌟',
      theme: theme
    }
  ];

    if (!result) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg">✍️</p>
        <p className="mt-2">Submit your text to see results</p>
      </div>
    );
  }

const totalChanges = result?.changes?.length ?? 0;
const errorsBefore = result?.statistics?.errors_before ?? 0;
const errorsAfter = result?.statistics?.errors_after ?? 0;
const errorsFixed = Math.max(0, errorsBefore - errorsAfter);

  return (
    <div className="space-y-4">
      {/* Main Score Display */}
      <div className={`text-center bg-gradient-to-r ${theme.gradient} text-white p-4 rounded-2xl shadow-lg`}>
        <div className="text-3xl font-bold">{Math.round(result.score || 0)}%</div>
        <div className="text-sm mt-1">
          {result.statistics?.score_badge || '📝 Good Work!'}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-gray-100 p-2 rounded-2xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? `bg-gradient-to-r ${tab.theme.gradient} text-white shadow-lg` 
                : 'text-gray-600 hover:bg-white/50'
            }`}
            aria-selected={activeTab === tab.id}
          >
            <span className="text-lg">{tab.icon}</span>
            <div className="text-xs mt-1">{tab.label}</div>
          </button>
        ))}
      </div>

 {/* Tab Content */}
      <div className="min-h-[200px]">
        {/* Corrected Text Tab */}
        {activeTab === 'correctedText' && (
          <div className="space-y-4">
            <div className={`bg-white rounded-xl p-4 border-2 ${theme.gradient}/20 shadow-sm`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">✨</span>
                <h4 className="font-bold text-gray-800">Corrected Text with Highlights</h4>
              </div>
              
              <CorrectedTextWithHighlights 
                original={result.original}
                corrected={result.corrected}
                changes={result.changes || []}
              />
            </div>

            {/* Summary Stats */}
            {totalChanges === 0 ? (
              <div className={`bg-gradient-to-r ${theme.gradient}/10 rounded-lg p-4 border-2 ${theme.gradient}/20 text-center`}>
                <span className="text-3xl">🌟</span>
                <p className="text-purple-800 font-bold mt-2">Perfect! No errors found!</p>
                <p className="text-purple-600 text-sm mt-1">Keep up the excellent work!</p>
              </div>
            ) : (
              <div className={`bg-gradient-to-r ${theme.gradient}/10 rounded-lg p-3 border-2 ${theme.gradient}/20`}>
                <p className="text-sm text-blue-800 text-center">
                  <strong>{totalChanges}</strong> correction{totalChanges > 1 ? 's' : ''} made
                  {errorsFixed > 0 && ` • ${errorsFixed} error${errorsFixed > 1 ? 's' : ''} fixed`}
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`bg-gradient-to-r ${theme.gradient}/10 p-4 rounded-lg text-center border-2 ${theme.gradient}/20`}>
                <div className="text-xl font-bold text-blue-600">
                  {Math.round(result.similarity || 0)}%
                </div>
                <div className="text-sm text-gray-600">Similarity</div>
              </div>
              <div className={`bg-gradient-to-r ${theme.gradient}/10 p-4 rounded-lg text-center border-2 ${theme.gradient}/20`}>
                <div className="text-xl font-bold text-green-600">
                  {totalChanges}
                </div>
                <div className="text-sm text-gray-600">Corrections</div>
              </div>
            </div>

            {/* Detailed Stats */}
            {result.statistics && (
              <div className={`bg-white rounded-xl p-4 border-2 ${theme.gradient}/20`}>
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  Detailed Analysis
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Words:</span>
                    <span className="font-bold text-gray-800">
                      {result.statistics.words || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Errors Before:</span>
                    <span className="font-bold text-red-600">
                      {result.statistics.errors_before || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Errors After:</span>
                    <span className="font-bold text-green-600">
                      {result.statistics.errors_after || 0}
                    </span>
                  </div>
                 
                </div>
              </div>
            )}

            {/* Correction Types */}
            {result.changes && result.changes.length > 0 && (
              <div className="bg-white rounded-xl p-4 border-2 border-orange-200">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🔧</span>
                  Corrections Made ({result.changes.length})
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {result.changes.slice(0, 10).map((change, index) => (
                    <div 
                      key={change.id || index} 
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${
                          change.type === 'replacement' ? 'bg-orange-100 text-orange-800' :
                          change.type === 'insertion' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {change.type === 'replacement' ? '🔄' :
                           change.type === 'insertion' ? '➕' : '🔧'}
                        </span>
                        <span className="text-sm text-gray-600 truncate">
                          {change.original || '___'}
                        </span>
                        <ArrowRight className="text-gray-400 flex-shrink-0" size={12} />
                        <span className="text-sm text-gray-800 font-medium truncate">
                          {change.corrected || '___'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {result.changes.length > 10 && (
                    <div className="text-center text-sm text-gray-500 mt-2">
                      + {result.changes.length - 10} more correction{result.changes.length - 10 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        
        )}
        
        {/* Tips Tab */}
        {activeTab === 'tips' && (
          <div className="space-y-3">
            <div className={`flex items-center gap-3 p-4 bg-gradient-to-r /10 rounded-lg border-2 /20`}>
              <span className="text-3xl">💡</span>
              <div>
                <div className="font-bold text-gray-800">Review Your Corrections</div>
                <div className="text-sm text-gray-600">
                  Look at the highlighted changes to learn from your mistakes
                </div>
              </div>
            </div>
            
            <div className={`flex items-center gap-3 p-4 bg-gradient-to-r /10 rounded-lg border-2 /20`}>
              <span className="text-3xl">✅</span>
              <div>
                <div className="font-bold text-gray-800">Practice Makes Perfect</div>
                <div className="text-sm text-gray-600">
                  Keep writing and checking to improve your grammar skills
                </div>
              </div>
            </div>
            
            <div className={`flex items-center gap-3 p-4 bg-gradient-to-r /10 rounded-lg border-2 ${theme.gradient}/20`}>
              <span className="text-3xl">📚</span>
              <div>
                <div className="font-bold text-gray-800">Read More</div>
                <div className="text-sm text-gray-600">
                  Reading helps you learn correct grammar naturally
                </div>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-4 bg-gradient-to-r /10 rounded-lg border-2 /20`}>
              <span className="text-3xl">🎯</span>
              <div>
                <div className="font-bold text-gray-800">Focus on Common Errors</div>
                <div className="text-sm text-gray-600">
                  Pay attention to the types of mistakes you make most often
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabbedResult;