// ========================== KIDS CARD - WITH THEME COLORS ==========================
import React from 'react';

export default function KidsCard({ 
  children, 
  title, 
  emoji, 
  color = "purple",
  className = "",
  padding = "normal",
  hoverAnimation = true,
  autoButtons = [],
  onButtonClick,
  darkMode = false,
  theme = null // ✅ Add theme
}) {
  
  // ✅ Use dynamic theme colors
  const getColorStyle = () => {
    // If theme is passed, use it
    if (theme) {
      if (darkMode) {
        return `bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-opacity-30`;
      }
      return `bg-gradient-to-br from-gray-50 via-white to-gray-50 border-2`;
    }

    // Fallback: Old static colors
    const colorStyles = {
      purple: {
        light: "bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-200",
        dark: "bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-purple-600/30"
      },
      blue: {
        light: "bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 border-2 border-blue-200",
        dark: "bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-blue-600/30"
      },
      green: {
        light: "bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 border-2 border-green-200",
        dark: "bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-green-600/30"
      },
      orange: {
        light: "bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 border-2 border-orange-200",
        dark: "bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-orange-600/30"
      },
      yellow: {
        light: "bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-50 border-2 border-yellow-200",
        dark: "bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-yellow-600/30"
      },
      red: {
        light: "bg-gradient-to-br from-red-50 via-pink-50 to-red-50 border-2 border-red-200",
        dark: "bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-red-600/30"
      },
      pink: {
        light: "bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 border-2 border-pink-200",
        dark: "bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-pink-600/30"
      },
      indigo: {
        light: "bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50 border-2 border-indigo-200",
        dark: "bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-indigo-600/30"
      }
    };

    const style = colorStyles[color] || colorStyles.purple;
    return darkMode ? style.dark : style.light;
  };

  // ✅ Get border color from theme
  const getBorderColor = () => {
    if (theme) {
      return { borderColor: `${theme.primary}50` };
    }
    return {};
  };

  const paddingStyles = {
    small: "p-4",
    normal: "p-6", 
    large: "p-8"
  };

  const textColor = darkMode ? "text-gray-100" : "text-gray-800";
  const secondaryTextColor = darkMode ? "text-gray-300" : "text-gray-700";

  // ✅ Automatic buttons with theme colors
  const getButtonStyle = (type) => {
    if (theme) {
      const styles = {
        primary: `bg-gradient-to-r from-[${theme.primary}] to-[${theme.secondary}] text-white`,
        warning: `bg-gradient-to-r from-[${theme.warning}] to-[${theme.error}] text-white`,
        fun: `bg-gradient-to-r from-[${theme.info}] to-[${theme.accent}] text-white`,
        success: `bg-gradient-to-r from-[${theme.success}] to-[${theme.info}] text-white`
      };
      return styles[type] || styles.primary;
    }

    // Fallback
    const buttonStyles = {
      primary: darkMode
        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      warning: darkMode
        ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
        : 'bg-gradient-to-r from-orange-500 to-red-500 text-white',
      fun: darkMode
        ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white'
        : 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white',
      success: darkMode
        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
        : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
    };
    return buttonStyles[type] || buttonStyles.primary;
  };

  return (
    <div 
      className={`
        ${getColorStyle()}
        ${paddingStyles[padding] || paddingStyles.normal}
        rounded-3xl shadow-lg backdrop-blur-sm
        ${hoverAnimation ? 'hover:shadow-xl transition-all duration-300 hover:scale-[1.02]' : ''}
        ${className}
      `}
      style={getBorderColor()}
    >
      
      {/* ========== HEADER ========== */}
      {(title || emoji) && (
        <div className="flex items-center gap-3 mb-4">
          {emoji && (
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${
              darkMode ? 'bg-gray-700/50' : 'bg-white/50'
            }`}>
              {emoji}
            </div>
          )}
          {title && (
            <h3 className={`text-xl font-bold ${textColor}`}>
              {title}
            </h3>
          )}
        </div>
      )}
      
      {/* ========== CONTENT ========== */}
      <div className={secondaryTextColor}>
        {children}
      </div>

      {/* ========== AUTO BUTTONS ========== */}
      {autoButtons && autoButtons.length > 0 && (
        <div className="flex gap-3 mt-6 flex-wrap">
          {autoButtons.map((button, index) => (
            <button
              key={index}
              onClick={() => onButtonClick && onButtonClick(button.action)}
              disabled={button.loading}
              className={`
                px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-md
                ${button.loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-lg active:scale-95'}
                ${getButtonStyle(button.type)}
              `}
            >
              {button.loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Loading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {button.icon && <span>{button.icon}</span>}
                  {button.text}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}