// src/constants/themes.js

export const THEMES = {
  // ========== THEME 0: WHITE THEME ==========
  white: {
    name: 'Classic',
    emoji: '⚪',
    
    // Gradients - Soft white gradients
    gradient: 'from-gray-100 via-white to-gray-50',
    darkGradient: 'from-gray-700 via-gray-800 to-gray-900',
    
    // Core Colors
    primary: '#6B7280',      // Gray 500
    secondary: '#9CA3AF',    // Gray 400
    accent: '#EF4444',       // Red 500
    
    // Semantic Colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Backgrounds
    bg: {
      light: '#FFFFFF',
      card: '#FFFFFF',
      cardDark: '#1F2937',
      hover: '#F9FAFB',
      hoverDark: '#374151'
    },
    
    // Text Colors
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      light: '#9CA3AF',
      dark: {
        primary: '#F9FAFB',
        secondary: '#D1D5DB',
        light: '#9CA3AF'
      }
    },
    
    // Borders
    border: {
      light: '#E5E7EB',
      medium: '#D1D5DB',
      dark: '#374151'
    }
  },

  // ========== THEME 1: Rainbow Dreams (Recommended) ==========
  purple: {
    name: 'Magic',
    emoji: '✨',
    
    // Gradients
    gradient: 'from-purple-500 via-pink-500 to-rose-400',
    darkGradient: 'from-purple-700 via-pink-700 to-rose-600',
    
    // Core Colors
    primary: '#8B5CF6',      // Purple 500
    secondary: '#EC4899',    // Pink 500
    accent: '#F59E0B',       // Amber 500
    
    // Semantic Colors
    success: '#10B981',      // Emerald 500
    warning: '#F59E0B',      // Amber 500
    error: '#EF4444',        // Red 500
    info: '#3B82F6',         // Blue 500
    
    // Backgrounds
    bg: {
      light: '#F9FAFB',      // Gray 50
      card: '#FFFFFF',
      cardDark: '#1F2937',
      hover: '#F3F4F6',
      hoverDark: '#374151'
    },
    
    // Text Colors
    text: {
      primary: '#1F2937',    // Gray 800
      secondary: '#6B7280',  // Gray 500
      light: '#9CA3AF',      // Gray 400
      dark: {
        primary: '#F9FAFB',
        secondary: '#D1D5DB',
        light: '#9CA3AF'
      }
    },
    
    // Borders
    border: {
      light: '#E5E7EB',
      medium: '#D1D5DB',
      dark: '#374151'
    }
  },

  // ========== THEME 2: Ocean Adventure ==========
  blue: {
    name: 'Ocean',
    emoji: '🌊',
    
    gradient: 'from-blue-500 via-cyan-500 to-teal-400',
    darkGradient: 'from-blue-700 via-cyan-700 to-teal-600',
    
    primary: '#3B82F6',      // Blue 500
    secondary: '#06B6D4',    // Cyan 500
    accent: '#14B8A6',       // Teal 500
    
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#0EA5E9',         // Sky 500
    
    bg: {
      light: '#F0F9FF',      // Blue 50
      card: '#FFFFFF',
      cardDark: '#1E3A8A',
      hover: '#DBEAFE',
      hoverDark: '#1E40AF'
    },
    
    text: {
      primary: '#1E3A8A',
      secondary: '#3B82F6',
      light: '#93C5FD',
      dark: {
        primary: '#DBEAFE',
        secondary: '#93C5FD',
        light: '#60A5FA'
      }
    },
    
    border: {
      light: '#BFDBFE',
      medium: '#93C5FD',
      dark: '#1E40AF'
    }
  },

  // ========== THEME 3: Nature Explorer ==========
  green: {
    name: 'Nature',
    emoji: '🌿',
    
    gradient: 'from-green-500 via-emerald-500 to-teal-400',
    darkGradient: 'from-green-700 via-emerald-700 to-teal-600',
    
    primary: '#22C55E',      // Green 500
    secondary: '#10B981',    // Emerald 500
    accent: '#14B8A6',       // Teal 500
    
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
    
    bg: {
      light: '#F0FDF4',      // Green 50
      card: '#FFFFFF',
      cardDark: '#064E3B',
      hover: '#DCFCE7',
      hoverDark: '#065F46'
    },
    
    text: {
      primary: '#064E3B',
      secondary: '#059669',
      light: '#6EE7B7',
      dark: {
        primary: '#D1FAE5',
        secondary: '#A7F3D0',
        light: '#6EE7B7'
      }
    },
    
    border: {
      light: '#BBF7D0',
      medium: '#86EFAC',
      dark: '#065F46'
    }
  },

  // ========== THEME 4: Sunshine Joy ==========
  orange: {
    name: 'Sunshine',
    emoji: '🌞',
    
    gradient: 'from-orange-500 via-amber-500 to-yellow-400',
    darkGradient: 'from-orange-700 via-amber-700 to-yellow-600',
    
    primary: '#F97316',      // Orange 500
    secondary: '#F59E0B',    // Amber 500
    accent: '#EAB308',       // Yellow 500
    
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    bg: {
      light: '#FFFBEB',      // Amber 50
      card: '#FFFFFF',
      cardDark: '#78350F',
      hover: '#FEF3C7',
      hoverDark: '#92400E'
    },
    
    text: {
      primary: '#78350F',
      secondary: '#F59E0B',
      light: '#FCD34D',
      dark: {
        primary: '#FEF3C7',
        secondary: '#FDE68A',
        light: '#FCD34D'
      }
    },
    
    border: {
      light: '#FDE68A',
      medium: '#FCD34D',
      dark: '#92400E'
    }
  },

  // ========== THEME 5: Berry Sweet ==========
  pink: {
    name: 'Berry',
    emoji: '🍓',
    
    gradient: 'from-pink-500 via-rose-500 to-red-400',
    darkGradient: 'from-pink-700 via-rose-700 to-red-600',
    
    primary: '#EC4899',      // Pink 500
    secondary: '#F43F5E',    // Rose 500
    accent: '#EF4444',       // Red 500
    
    success: '#10B981',
    warning: '#F59E0B',
    error: '#DC2626',
    info: '#3B82F6',
    
    bg: {
      light: '#FDF2F8',      // Pink 50
      card: '#FFFFFF',
      cardDark: '#831843',
      hover: '#FCE7F3',
      hoverDark: '#9F1239'
    },
    
    text: {
      primary: '#831843',
      secondary: '#DB2777',
      light: '#F9A8D4',
      dark: {
        primary: '#FCE7F3',
        secondary: '#FBCFE8',
        light: '#F9A8D4'
      }
    },
    
    border: {
      light: '#FBCFE8',
      medium: '#F9A8D4',
      dark: '#9F1239'
    }
  },

  // ========== THEME 6: Galaxy Dream ==========
  indigo: {
    name: 'Galaxy',
    emoji: '🌌',
    
    gradient: 'from-indigo-500 via-purple-500 to-pink-400',
    darkGradient: 'from-indigo-700 via-purple-700 to-pink-600',
    
    primary: '#6366F1',      // Indigo 500
    secondary: '#8B5CF6',    // Purple 500
    accent: '#EC4899',       // Pink 500
    
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    bg: {
      light: '#EEF2FF',      // Indigo 50
      card: '#FFFFFF',
      cardDark: '#312E81',
      hover: '#E0E7FF',
      hoverDark: '#3730A3'
    },
    
    text: {
      primary: '#312E81',
      secondary: '#6366F1',
      light: '#A5B4FC',
      dark: {
        primary: '#E0E7FF',
        secondary: '#C7D2FE',
        light: '#A5B4FC'
      }
    },
    
    border: {
      light: '#C7D2FE',
      medium: '#A5B4FC',
      dark: '#3730A3'
    }
  }
};

// ========== HELPER FUNCTIONS ==========

/**
 * Get theme-specific class names
 */
export const getThemeClasses = (themeName, darkMode = false) => {
  const theme = THEMES[themeName] || THEMES.white; // ✅ Default to white theme
  
  return {
    gradient: `bg-gradient-to-r ${darkMode ? theme.darkGradient : theme.gradient}`,
    text: darkMode ? theme.text.dark.primary : theme.text.primary,
    textSecondary: darkMode ? theme.text.dark.secondary : theme.text.secondary,
    bg: darkMode ? theme.bg.cardDark : theme.bg.card,
    border: darkMode ? theme.border.dark : theme.border.light
  };
};

/**
 * Get semantic color for specific purpose
 */
export const getSemanticColor = (themeName, type = 'success') => {
  const theme = THEMES[themeName] || THEMES.white;
  return theme[type] || theme.primary;
};

/**
 * Generate CSS variables for theme
 */
export const generateThemeVars = (themeName, darkMode = false) => {
  const theme = THEMES[themeName] || THEMES.white;
  
  return {
    '--color-primary': theme.primary,
    '--color-secondary': theme.secondary,
    '--color-accent': theme.accent,
    '--color-success': theme.success,
    '--color-warning': theme.warning,
    '--color-error': theme.error,
    '--color-info': theme.info,
    '--color-bg': darkMode ? theme.bg.cardDark : theme.bg.card,
    '--color-text': darkMode ? theme.text.dark.primary : theme.text.primary
  };
};