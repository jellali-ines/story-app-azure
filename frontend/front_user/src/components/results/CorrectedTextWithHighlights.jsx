// ========================== CORRECTED TEXT WITH HIGHLIGHTS (UPDATED) ==========================
import React from 'react';


const CorrectedTextWithHighlights = ({ original, corrected, changes = [] }) => {
  
  // Check that changes is an array
  const safeChanges = Array.isArray(changes) ? changes : [];
  
  // If there are no corrections, display the original text
  if (safeChanges.length === 0 || !corrected) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 text-base leading-relaxed border-2 border-green-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🌟</span>
          <span className="font-bold text-green-700">Perfect! No corrections needed!</span>
        </div>
        <p className="text-gray-700">{original || corrected}</p>
      </div>
    );
  }

  // Create a map of changes by position
  const changesMap = new Map();
  
  safeChanges.forEach((change, index) => {
    if (change && (change.corrected || change.original)) {
      const position = change.position !== undefined ? change.position : index;
      const correctedWord = change.corrected?.toLowerCase() || '';
      const key = `${position}-${correctedWord}`;
      
      changesMap.set(key, {
        original: change.original || '',
        corrected: change.corrected || '',
        type: change.type || 'replacement',
        id: change.id || `change-${index}`
      });
    }
  });

  // Use the corrected text
  const displayText = corrected || original || '';
  const words = displayText.split(/\s+/).filter(word => word.length > 0);

  // If there are no words, display a message
  if (words.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 text-base leading-relaxed border-2 border-gray-200">
        <p className="text-gray-500 italic">No text to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Corrected text with coloring */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 text-base leading-relaxed border-2 border-green-200">
        {words.map((word, index) => {
          // Remove punctuation from the word for comparison
          const cleanWord = word.replace(/[.,!?;:'"()]/g, '').toLowerCase();
          const key = `${index}-${cleanWord}`;
          const changeInfo = changesMap.get(key);
          
          // If there are changes for this word
          if (changeInfo) {
            const highlightColor = 
              changeInfo.type === 'replacement' ? 'bg-green-200 border-green-400' :
              changeInfo.type === 'insertion' ? 'bg-blue-200 border-blue-400' :
              changeInfo.type === 'deletion' ? 'bg-red-200 border-red-400' :
              'bg-yellow-200 border-yellow-400';
            
            const tooltipText = changeInfo.original 
              ? `Was: "${changeInfo.original}"` 
              : 'Added';
            
            return (
              <span
                key={changeInfo.id || `word-${index}`}
                className={`${highlightColor} text-gray-800 font-bold px-1 rounded mx-0.5 border-2 transition-all hover:scale-105 cursor-help`}
                title={tooltipText}
              >
                {word}
              </span>
            );
          }
          
          // Normal word without changes
          return (
            <span 
              key={`word-${index}`} 
              className="text-gray-700 mx-0.5"
            >
              {word}{' '}
            </span>
          );
        })}
      </div>

      {/* Legend - Color guide */}
      {safeChanges.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3 bg-white rounded-lg p-3 border-2 border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200 rounded border-2 border-green-400"></div>
            <span className="text-xs text-gray-600 font-medium">Corrected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-200 rounded border-2 border-blue-400"></div>
            <span className="text-xs text-gray-600 font-medium">Added</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-200 rounded border-2 border-red-400"></div>
            <span className="text-xs text-gray-600 font-medium">Removed</span>
          </div>
          <div className="text-xs text-gray-500 italic ml-2">
            Hover over highlighted words for details
          </div>
        </div>
      )}
    </div>
  );
};

export default CorrectedTextWithHighlights;