// ========================== THEME SELECTOR - PROFESSIONAL VERSION ==========================
import React from 'react';

/**
 * Theme Selector Component - Professional Edition
 * Displays theme buttons with emojis and names
 * Fully supports dark mode and accessibility
 */
const ThemeSelector = ({ currentTheme, onThemeChange, themes, darkMode = false }) => {
  
  return (
    <div className="flex gap-2 flex-wrap">
      {Object.entries(themes).map(([key, theme]) => {
        const isActive = currentTheme === key;
        
        return (
          <button
            key={key}
            onClick={() => onThemeChange(key)}
            className={`
              group relative px-4 py-2 rounded-2xl text-sm font-bold 
              transition-all duration-300 flex items-center gap-2
              ${isActive
                ? darkMode
                  ? `bg-gradient-to-r ${theme.gradient} text-white scale-110 shadow-xl ring-2 ring-white/30`
                  : `bg-gradient-to-r ${theme.gradient} text-white scale-110 shadow-xl ring-2 ring-white/50`
                : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-105 hover:shadow-md'
                  : 'bg-white/80 text-gray-700 hover:bg-white hover:scale-105 hover:shadow-md'
              }
            `}
            aria-label={`Select ${theme.name} theme`}
            aria-pressed={isActive}
          >
            {/* Emoji Icon */}
            <span className={`text-lg transition-transform ${
              isActive ? 'scale-110' : 'group-hover:scale-110'
            }`}>
              {theme.emoji}
            </span>
            
            {/* Theme Name */}
            <span className="hidden sm:inline">
              {theme.name}
            </span>

            {/* Active Indicator */}
            {isActive && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ThemeSelector;