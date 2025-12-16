// hooks/useTheme.js
import { useState } from 'react';
import { THEMES } from '../constants/themes';

/**
 * Custom hook for theme management
 * Handles theme selection and dark mode
 */
export const useTheme = (initialTheme = 'purple') => {
  const [currentTheme, setCurrentTheme] = useState(initialTheme);
  const [darkMode, setDarkMode] = useState(false);
  
  const theme = THEMES[currentTheme];
  
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };
  
  const changeTheme = (themeName) => {
    if (THEMES[themeName]) {
      setCurrentTheme(themeName);
    }
  };
  
  return {
    currentTheme,
    setCurrentTheme: changeTheme,
    darkMode,
    setDarkMode,
    toggleDarkMode,
    theme,
    availableThemes: THEMES
  };
};



export default useTheme;