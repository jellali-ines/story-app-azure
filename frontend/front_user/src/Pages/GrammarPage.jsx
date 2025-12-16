// pages/GrammarPage.js
import { useState } from "react";
import { XCircle, Zap, RefreshCw } from 'lucide-react';
import KidsCard from '../components/ui/KidsCard';
import KidsButton from '../components/ui/KidsButton';
import GrammarResult from '../components/results/GrammarResult';
import ConfettiEffect from '../components/effects/ConfettiEffect';
import useGrammarAnalysis from '../hooks/useGrammarAnalysis';
import { THEMES } from '../constants/themes';

export default function GrammarPage({ darkMode, theme }) {
  const [inputText, setInputText] = useState('The hare run very fast and say he will win the race. The tortoise was slow but keep walking every day. Hare sleep in middle of race and tortoise finally reach finish line before hare. Hare too late and learn lesson. Moral slow and steady win race.');
  
  const { loading, result, error, showConfetti, analyzeGrammar, clearResult } = useGrammarAnalysis();

  // ✅ Simplified variables
  const textareaClasses = darkMode 
    ? "w-full h-48 p-6 border-4 rounded-3xl bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/30"
    : "w-full h-48 p-6 border-4 rounded-3xl bg-white/90 border-purple-200 text-gray-800 placeholder:text-purple-300 focus:border-purple-400 focus:ring-purple-100";

  const statsCardClasses = darkMode 
    ? "rounded-2xl p-5 border-2 border-gray-700 bg-gray-800/50"
    : "rounded-2xl p-5 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50";

  const handleGrammarCheck = () => {
    if (!inputText.trim()) {
      alert('Please enter some text to check!');
      return;
    }
    analyzeGrammar(inputText);
  };

  const handleClear = () => {
    setInputText('');
    clearResult();
  };

  // ✅ Get theme colors (short version)
  const getThemeColor = (type = 'primary') => {
    if (!theme || !theme.name) return THEMES.purple[type];
    
    const themeName = theme.name.toLowerCase();
    const foundTheme = Object.values(THEMES).find(
      themeConfig => themeConfig.name.toLowerCase() === themeName
    );
    
    const currentTheme = foundTheme || THEMES.purple;
    return currentTheme[type] || currentTheme.primary;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {showConfetti && <ConfettiEffect />}
      
    

      {/* ✅ Current theme indicator */}
      <div className="text-center mb-6">
        <div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md shadow-lg text-white font-bold"
          style={{
            background: `linear-gradient(135deg, ${getThemeColor('primary')}, ${getThemeColor('secondary')})`
          }}
        >
          <span className="text-2xl">{theme.emoji}</span>
          <span>Current Theme: {theme.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ========== INPUT SECTION ========== */}
        <div className="lg:col-span-2">
          <KidsCard 
            title="✍️ Write Your Text" 
            darkMode={darkMode}
            theme={theme}
          >
            <div className="space-y-6">
              {/* Textarea */}
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your story here... Let's make it awesome! ✨"
                  className={textareaClasses}
                  disabled={loading}
                />
                {/* ✅ This button is enough - small and elegant */}
                {inputText && (
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
                  onClick={handleGrammarCheck}
                  disabled={loading || !inputText.trim()}
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
                      Check My Grammar!
                    </>
                  )}
                </KidsButton>
              </div>

              {/* ✅ Text Statistics - using theme colors */}
              <div className={statsCardClasses}>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div 
                      className="text-2xl font-bold"
                      style={{ color: getThemeColor('primary') }}
                    >
                      {inputText.split(/\s+/).filter(w => w).length}
                    </div>
                    <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Words
                    </div>
                  </div>
                  <div>
                    <div 
                      className="text-2xl font-bold"
                      style={{ color: getThemeColor('secondary') }}
                    >
                      {inputText.length}
                    </div>
                    <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Characters
                    </div>
                  </div>
                  <div>
                    <div 
                      className="text-2xl font-bold"
                      style={{ color: getThemeColor('accent') }}
                    >
                      {inputText.split(/[.!?]+/).filter(s => s.trim()).length}
                    </div>
                    <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Sentences
                    </div>
                  </div>
                </div>
                
                {/* ✅ Positive encouragement for children */}
                {inputText.length > 0 && (
                  <div className="text-center mt-4">
                    <div className={`text-lg font-bold mb-1 ${
                      darkMode ? 'text-green-400' : 'text-green-600'
                    }`}>
                      {inputText.split(/\s+/).filter(w => w).length >= 15 ? '🏆 Amazing creativity!' : 
                       inputText.split(/\s+/).filter(w => w).length >= 8 ? '⭐ Excellent writing!' : 
                       '🌱 Great start!'}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      ✨ You have {inputText.split(/\s+/).filter(w => w).length} creative words
                    </div>
                  </div>
                )}
              </div>

              {/* ✅ API Status */}
              {error && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">⚠️</div>
                    <div className="flex-1">
                      <p className="text-red-700 font-bold text-sm">
                        Connection Error
                      </p>
                      <p className="text-red-600 text-xs mt-1">
                        {error}
                      </p>
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
            title="📊 Grammar Results" 
            darkMode={darkMode}
            theme={theme}
          >
            <GrammarResult result={result} loading={loading} error={error} theme={theme} />
          </KidsCard>
          
          {/* ✅ Progress Summary - using theme */}
          {result && (
            <KidsCard 
              title="🎯 Your Progress" 
              darkMode={darkMode}
              theme={theme}
            >
              <div className="space-y-4">
                {/* Score Badge */}
                <div className="text-center mb-4">
                  <div 
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full text-white shadow-lg mb-2"
                    style={{
                      background: `linear-gradient(135deg, ${getThemeColor('primary')}, ${getThemeColor('secondary')})`
                    }}
                  >
                    <span className="text-3xl font-bold">
                      {Math.round(result.score || 0)}
                    </span>
                  </div>
                  <div className={`text-sm font-medium ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Overall Score
                  </div>
                </div>

                {/* Detailed Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      📝 Grammar Score:
                    </span>
                    <span 
                      className="font-bold text-lg"
                      style={{ color: getThemeColor('success') }}
                    >
                      {result.score?.toFixed(1) || 0}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      🔄 Similarity:
                    </span>
                    <span 
                      className="font-bold text-lg"
                      style={{ color: getThemeColor('info') }}
                    >
                      {result.similarity?.toFixed(1) || 0}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      ✏️ Corrections:
                    </span>
                    <span 
                      className="font-bold text-lg"
                      style={{ color: getThemeColor('warning') }}
                    >
                      {result.changes?.length || 0}
                    </span>
                  </div>
                </div>

                {/* Motivational Message */}
                <div 
                  className="mt-4 p-3 rounded-xl text-center"
                  style={{
                    background: `linear-gradient(135deg, ${getThemeColor('primary')}20, ${getThemeColor('secondary')}20)`,
                    border: `2px solid ${getThemeColor('primary')}30`
                  }}
                >
                  <div 
                    className="text-sm font-bold"
                    style={{ color: getThemeColor('primary') }}
                  >
                    {result.score >= 90 
                      ? '🌟 Outstanding!' 
                      : result.score >= 70 
                        ? '💪 Great Job!' 
                        : '📚 Keep Learning!'}
                  </div>
                </div>
              </div>
            </KidsCard>
          )}
        </div>
      </div>
    </div>
  );
}