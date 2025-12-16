// components/results/ProgressCard.jsx
import React from 'react';
import KidsCard from '../ui/KidsCard';
import useTheme from '../../hooks/useTheme';

export default function ProgressCard({ inputText, result, type = 'grammar' }) {
  const { theme } = useTheme('purple');
  
  return (
    <KidsCard title="Your Progress" theme={theme}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Today's Score:</span>
          <span className="font-bold text-green-600 text-lg">
            {result ? (type === 'grammar' ? result.score.toFixed(1) : result.overallGrade.toFixed(1)) + '%' : '0%'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Words Written:</span>
          <span className="font-bold text-blue-600 text-lg">
            {inputText.split(/\s+/).filter(w => w).length}
          </span>
        </div>
        <div className="text-center mt-4">
          <span className="text-sm text-purple-600 font-bold">
            {!result ? 'Ready to play?' : 'Amazing work!'}
          </span>
        </div>
      </div>
    </KidsCard>
  );
}