// ========================== KIDS BUTTON - DYNAMIC THEME COLORS ==========================
import React from 'react';
import { RefreshCw, Zap, Award, Sparkles } from 'lucide-react';

/**
 * Kids Button Component - With Dynamic Theme Support
 * Buttons change colors according to the selected theme
 */
const KidsButton = ({ 
  children, 
  onClick, 
  disabled = false, 
  loading = false,
  theme, 
  type = "primary",
  size = "lg",
  icon = null,
  className = "",
  fullWidth = false
}) => {
  
  // ✅ Use dynamic theme colors instead of static ones
  const getButtonStyles = () => {
    if (!theme) {
      // Fallback colors if theme is not provided
      return 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600';
    }

    const buttonStyles = {
      primary: {
        background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
        hover: `linear-gradient(135deg, ${theme.primary}dd, ${theme.secondary}dd)`
      },
      success: {
        background: `linear-gradient(135deg, ${theme.success}, ${theme.info})`,
        hover: `linear-gradient(135deg, ${theme.success}dd, ${theme.info}dd)`
      },
      warning: {
        background: `linear-gradient(135deg, ${theme.warning}, ${theme.error})`,
        hover: `linear-gradient(135deg, ${theme.warning}dd, ${theme.error}dd)`
      },
      fun: {
        background: `linear-gradient(135deg, ${theme.info}, ${theme.accent})`,
        hover: `linear-gradient(135deg, ${theme.info}dd, ${theme.accent}dd)`
      },
      magic: {
        background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
        hover: `linear-gradient(135deg, ${theme.primary}dd, ${theme.accent}dd)`
      }
    };

    return buttonStyles[type] || buttonStyles.primary;
  };

  // Size configurations
  const sizeStyles = {
    sm: "px-4 py-2 text-sm rounded-xl",
    md: "px-6 py-3 text-base rounded-2xl", 
    lg: "px-8 py-4 text-lg rounded-3xl",
    xl: "px-10 py-5 text-xl rounded-3xl"
  };

  // Icon mapping
  const iconMap = {
    zap: <Zap className="w-4 h-4" />,
    award: <Award className="w-4 h-4" />,
    sparkles: <Sparkles className="w-4 h-4" />,
    refresh: <RefreshCw className="w-4 h-4" />
  };

  // Get icon
  const getIcon = () => {
    if (loading) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (icon && iconMap[icon]) return iconMap[icon];
    return null;
  };

  const styles = getButtonStyles();

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        background: styles.background,
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.background = styles.hover;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.background = styles.background;
        }
      }}
      className={`
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        text-white font-bold
        hover:scale-105 transition-all duration-300 
        active:scale-95 transform
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        disabled:active:scale-100
        flex items-center justify-center gap-3
        border-2 border-white border-opacity-30
        hover:border-opacity-50
        relative overflow-hidden
        group
        shadow-lg hover:shadow-xl
        ${className}
      `}
      aria-disabled={disabled || loading}
      aria-busy={loading}
    >
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      
      {/* Button content */}
      {getIcon()}
      <span className="relative z-10">
        {loading ? 'Loading...' : children}
      </span>
      
      {/* Sparkle effect for magic type */}
      {type === 'magic' && !loading && (
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-transparent opacity-30 animate-pulse" />
        </div>
      )}
    </button>
  );
};

export default KidsButton;