// ========================== STORY PAGE - FIXED & COMPLETE ==========================
import React, { useState, useEffect } from 'react';
import { XCircle, Award, RefreshCw, Zap } from 'lucide-react';
import KidsCard from '../components/ui/KidsCard';
import KidsButton from '../components/ui/KidsButton';
import StoryResult from '../components/results/StoryResult';
import ConfettiEffect from '../components/effects/ConfettiEffect';
import useGrammarAnalysis from '../hooks/useGrammarAnalysis';
import { getOriginalStory } from '../services/api';
import { THEMES } from '../constants/themes';

export default function StoryPage({ darkMode, theme }) {
  const [storyInput, setStoryInput] = useState('');
  const [originalStory, setOriginalStory] = useState('');
  const [loadingStory, setLoadingStory] = useState(true);
  
  const { loading, result, error, showConfetti, evaluateStory, clearResult } = useGrammarAnalysis();

  // Load original story on mount
  useEffect(() => {
    const fetchOriginalStory = async () => {
      try {
        const response = await getOriginalStory();
        setOriginalStory(response.story);
      } catch (err) {
        console.error('Failed to load original story:', err);
        setOriginalStory(`The Little Birds in the Magical Forest
In a faraway forest full of giant trees and colorful flowers, lived little birds who loved to play and sing. Among them was a small bird named Toto.
Toto loved flying fast, but he didn't always listen to his friends' advice. The big bird said to him: "Toto, take your time and watch the path before you fly so fast!"
But Toto didn't listen and flew very quickly between the trees, until he bumped into a large branch and fell to the ground.
His friends came to help him, and a small duck said: "Look, Toto, speed alone is not enough. You need to be careful too!"
Toto learned an important lesson: to be careful and listen to others' advice. From that day, he flew carefully and enjoyed playing and singing with his friends in the magical forest.
Moral: Speed alone is not enough; caution and listening to advice make life better and safer.`);
      } finally {
        setLoadingStory(false);
      }
    };

    fetchOriginalStory();
  }, []);

  const handleStoryEvaluation = () => {
    if (!storyInput.trim()) {
      alert('Please write your story summary first!');
      return;
    }
    evaluateStory(storyInput);
  };

  const handleClear = () => {
    setStoryInput('');
    clearResult();
  };

  // Calculate stats
  const wordCount = storyInput.split(/\s+/).filter(w => w).length;
  const progressPercent = Math.min(100, Math.round((wordCount / 50) * 100));
  
  return (
<div className="max-w-7xl mx-auto px-4 py-8">
      {showConfetti && <ConfettiEffect />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* ========== INPUT SECTION ========== */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* ===== ORIGINAL STORY ===== */}
{/* ===== ORIGINAL STORY ===== */}
<KidsCard 
  title="📖 Original Story" 
  darkMode={darkMode}
>
  {loadingStory ? (
    <div className="text-center py-8">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full  to-cyan-500 flex items-center justify-center">
        <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
      </div>
      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-lg font-medium`}>Loading story...</p>
    </div>
  ) : (
    <div className={`rounded-2xl p-6 shadow-inner border-2 max-h-80 overflow-y-auto ${
      darkMode 
        ? 'bg-gray-800 border-gray-700 text-gray-200' 
        : ' border-blue-200 text-gray-800'
    }`}>
      <div className="text-lg leading-loose whitespace-pre-line font-medium">
        {originalStory}
      </div>
    </div>
  )}
</KidsCard>

          {/* ===== YOUR SUMMARY ===== */}
          <KidsCard 
            title="✍️ Your Summary" 
            color="purple"
            darkMode={darkMode}
          >
            <div className="space-y-6">
              
              {/* Textarea */}
              <div className="relative">
                <textarea
                  value={storyInput}
                  onChange={(e) => setStoryInput(e.target.value)}
                  placeholder="Write your amazing story summary here... 📝✨"
                  className={`w-full h-48 p-6 border-4 rounded-3xl focus:ring-4 transition-all text-lg resize-none font-medium ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/30' 
                      : 'bg-white/90 border-purple-200 text-gray-800 placeholder:text-purple-300 focus:border-purple-400 focus:ring-purple-100'
                  }`}
                  disabled={loading}
                />
                {storyInput && (
                  <button
                    onClick={handleClear}
                    className={`absolute top-4 right-4 p-2 rounded-xl transition-all hover:scale-110 ${
                      darkMode 
                        ? 'bg-red-900/50 hover:bg-red-800 text-red-300' 
                        : 'bg-red-100 hover:bg-red-200 text-red-600'
                    }`}
                    title="Clear text"
                    disabled={loading}
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-4">
                <KidsButton 
                  onClick={handleStoryEvaluation}
                  disabled={loading || !storyInput.trim()}
                  theme={theme}
                  type="primary"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Magic Happening...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Evaluate Story!
                    </>
                  )}
                </KidsButton>
                
               
              </div>

            {/* Progress Bar & Stats - Statistics and progress bar */}
{storyInput && (
  <div className={`rounded-2xl p-5 border-2 shadow-sm ${
    darkMode 
      ? 'bg-gray-800/50 border-gray-700' 
      : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
  }`}>
    
    {/* Stats Grid - Statistics grid */}
    <div className="grid grid-cols-3 gap-3 mb-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600">{wordCount}</div>
        <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Words</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-pink-600">{progressPercent}%</div>
        <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Progress</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">
          {storyInput.split(/[.!?]+/).filter(s => s.trim()).length}
        </div>
        <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sentences</div>
      </div>
    </div>

    {/* Progress Bar - Progress bar */}
    <div>
      <div className={`w-full h-3 rounded-full overflow-hidden mb-2 ${
        darkMode ? 'bg-gray-700' : 'bg-gray-200'
      }`}>
        <div 
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
      <div className={`text-xs text-center font-medium ${
        darkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {wordCount < 10 
          ? '✍️ Great start...' 
          : wordCount < 30 
            ? '📝 Keep creating...' 
            : '🌟 Great achievement!'}
      </div>
    </div>

    {/*  Positive encouragement for children */}
    <div className="text-center mt-4">
      <div className={`text-lg font-bold mb-1 ${
        darkMode ? 'text-green-400' : 'text-green-600'
      }`}>
        {wordCount >= 40 ? '🏆 Amazing creativity!' : 
         wordCount >= 25 ? '⭐ Excellent writing!' : 
         wordCount >= 15 ? '✨ Excellent progress!' : 
         wordCount >= 5 ? '🌱 Promising start!' :
         '💫 Keep writing!'}
      </div>
      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {wordCount >= 30 ? `🎉 You have ${wordCount} creative words!` :
         wordCount >= 15 ? `✨ ${wordCount} creative words!` :
         `🌱 ${wordCount} beautiful words!`}
      </div>
    </div>
  </div>
)}
              {/* Error Message */}
              {error && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">⚠️</div>
                    <div className="flex-1">
                      <p className="text-red-700 font-bold text-sm">Connection Error</p>
                      <p className="text-red-600 text-xs mt-1">{error}</p>
                      <p className="text-red-500 text-xs mt-2">
                        💡 Tip: Check if the API Gateway is running on port 5000
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </KidsCard>
        </div>

        {/* ========== RESULTS SECTION ========== */}
        <div className="space-y-6">
          
          {/* Main Results */}
          <KidsCard 
            title=" Story Results" 
            color=""
            darkMode={darkMode}
          >
            {/*  Fix: Pass theme to StoryResult */}
            <StoryResult result={result} loading={loading} error={error} theme={theme} />
          </KidsCard>
        </div>
      </div>
    </div>
  );
}