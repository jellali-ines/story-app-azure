// ========================== HEADER - With Theme Dropdown ==========================
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Sun, Moon, Menu, X, Shield, Palette, ChevronDown, BookOpen, Layers, Music, Book, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { THEMES } from '../../constants/themes';

export default function Header({ 
  currentTheme, 
  setCurrentTheme, 
  darkMode, 
  setDarkMode 
}) {

  const theme = THEMES[currentTheme] || THEMES.purple;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  //  Dropdown state - Controls theme dropdown open/close
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setThemeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  //  Header background from theme system
  const headerBg = darkMode
    ? `bg-gradient-to-r ${theme.darkGradient}`
    : `bg-gradient-to-r ${theme.gradient}`;

  return (
    <header className={`${headerBg} text-white shadow-2xl transition-all duration-500 sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">

        {/* ===================== TOP BAR ===================== */}
        <div className="flex items-center justify-between">

          {/* -------- LOGO -------- */}
          <div className="flex items-center gap-4 md:gap-6">
            <Link to="/" className="flex items-center gap-4 md:gap-6">
              <div
                className={`
                  w-12 h-12 md:w-16 md:h-16 rounded-3xl flex items-center justify-center 
                  shadow-2xl transition-transform hover:scale-110
                  ${darkMode 
                    ? `bg-gradient-to-br ${theme.darkGradient}`
                    : 'bg-white/20 backdrop-blur-md animate-bounce'}
                `}
              >
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-yellow-300" />
              </div>

              <div>
                <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
                  StoryTale
                </h1>
                <p className="text-white/90 text-sm md:text-base hidden sm:block font-medium">
                  Magical Stories & Adventures ✨
                </p>
              </div>
            </Link>
          </div>

          {/* -------- DESKTOP NAVIGATION -------- */}
          <nav className="hidden md:flex items-center gap-2" aria-label="Main navigation">
            {/* Stories Button */}
            <Link
              to="/stories"
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl font-bold
                transition-all hover:scale-105 whitespace-nowrap
                ${darkMode
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-white/20 text-white hover:bg-white/30'}
              `}
            >
              <BookOpen className="w-4 h-4" />
              Stories
            </Link>

            {/* Genres Button */}
            <Link
              to="/genres"
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl font-bold
                transition-all hover:scale-105 whitespace-nowrap
                ${darkMode
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-white/20 text-white hover:bg-white/30'}
              `}
            >
              <Layers className="w-4 h-4" />
              Genres
            </Link>

            {/* Playlist Button */}
            <Link
              to="/playlist"
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl font-bold
                transition-all hover:scale-105 whitespace-nowrap
                ${darkMode
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-white/20 text-white hover:bg-white/30'}
              `}
            >
              <Music className="w-4 h-4" />
              Playlist
            </Link>

            {/* View All Playlists Button - إضافته هنا في المكان الصحيح */}
            <Link
              to="/playlists"
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl font-bold
                transition-all hover:scale-105 whitespace-nowrap
                ${darkMode
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-white/20 text-white hover:bg-white/30'}
              `}
            >
              <List className="w-4 h-4" />
              View All Playlists
            </Link>

            {/* Practice Button */}
            <Link
              to="/practice"
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl font-bold
                transition-all hover:scale-105 whitespace-nowrap
                ${darkMode
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-white/20 text-white hover:bg-white/30'}
              `}
            >
              <Book className="w-4 h-4" />
              Practice
            </Link>
          </nav>

          {/* -------- DESKTOP CONTROLS -------- */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Admin Link */}
            <Link
              to="/admin"
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl font-bold
                transition-all hover:scale-105
                ${darkMode
                  ? 'bg-purple-900/40 text-purple-200 hover:bg-purple-800/60'
                  : 'bg-white/20 text-white hover:bg-white/30'}
              `}
            >
              <Shield className="w-4 h-4" />
              Admin
            </Link>

            {/* Theme Dropdown Button  */}
            <div className="relative" ref={dropdownRef}>
              {/* Main button to open dropdown */}
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl font-bold
                  transition-all hover:scale-105
                  ${darkMode
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-white/20 text-white hover:bg-white/30'}
                `}
                aria-expanded={themeDropdownOpen}
                aria-label="Select theme"
              >
                <Palette className="w-4 h-4" />
                <span>Themes</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${themeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Theme dropdown menu */}
              {themeDropdownOpen && (
                <div
                  className={`
                    absolute top-full right-0 mt-2 w-48 rounded-2xl shadow-2xl
                    overflow-hidden z-50 animate-slideDown
                    ${darkMode
                      ? 'bg-gray-800 border-2 border-gray-700'
                      : 'bg-white/95 backdrop-blur-lg border-2 border-white/20'}
                  `}
                  role="menu"
                  aria-label="Theme selection"
                >
                  {/* Display all available themes */}
                  {Object.entries(THEMES).map(([key, t]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setCurrentTheme(key); // Change theme
                        setThemeDropdownOpen(false); // Close dropdown
                      }}
                      className={`
                        w-full px-4 py-3 text-left flex items-center gap-3
                        transition-all font-bold focus:outline-none focus:ring-2 focus:ring-white/50
                        ${currentTheme === key
                          ? darkMode
                            ? `bg-gradient-to-r ${t.darkGradient} text-white`
                            : `bg-gradient-to-r ${t.gradient} text-white`
                          : darkMode
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                      role="menuitem"
                      aria-checked={currentTheme === key}
                    >
                      <span className="text-2xl" role="img" aria-label={t.name}>{t.emoji}</span>
                      <span>{t.name}</span>
                      {currentTheme === key && <span className="ml-auto" aria-hidden="true">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark/Light mode toggle button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`
                p-3 rounded-2xl transition-all hover:scale-110 shadow-lg
                focus:outline-none focus:ring-2 focus:ring-white/50
                ${darkMode
                  ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                  : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30'}
              `}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* -------- MOBILE MENU BUTTON -------- */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`
              md:hidden p-2 rounded-xl transition-all
              focus:outline-none focus:ring-2 focus:ring-white/50
              ${darkMode
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-white/20 hover:bg-white/30'}
            `}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* ===================== MOBILE MENU ===================== */}
        {mobileMenuOpen && (
          <div
            className={`
              md:hidden mt-4 rounded-2xl p-4 animate-slideDown shadow-xl
              ${darkMode
                ? 'bg-gray-800/95 backdrop-blur-sm border-2 border-gray-700'
                : 'bg-white/95 backdrop-blur-sm'}
            `}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >

            {/* --- NAVIGATION LINKS --- */}
            <div className="flex flex-col gap-2 mb-4">
              {/* Home Link */}
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  px-6 py-3 rounded-xl font-bold text-center transition-all
                  flex items-center justify-center gap-2
                  focus:outline-none focus:ring-2 focus:ring-white/50
                  ${darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white/20 text-gray-800 hover:bg-white/30'}
                `}
              >
                <span role="img" aria-label="Home">🏠</span>
                Home
              </Link>

              {/* Stories Link */}
              <Link
                to="/stories"
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  px-6 py-3 rounded-xl font-bold text-center transition-all
                  flex items-center justify-center gap-2
                  focus:outline-none focus:ring-2 focus:ring-white/50
                  ${darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white/20 text-gray-800 hover:bg-white/30'}
                `}
              >
                <BookOpen className="w-5 h-5" />
                Stories
              </Link>

              {/* Genres Link */}
              <Link
                to="/genres"
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  px-6 py-3 rounded-xl font-bold text-center transition-all
                  flex items-center justify-center gap-2
                  focus:outline-none focus:ring-2 focus:ring-white/50
                  ${darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white/20 text-gray-800 hover:bg-white/30'}
                `}
              >
                <Layers className="w-5 h-5" />
                Genres
              </Link>

              {/* Playlist Link */}
              <Link
                to="/playlist"
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  px-6 py-3 rounded-xl font-bold text-center transition-all
                  flex items-center justify-center gap-2
                  focus:outline-none focus:ring-2 focus:ring-white/50
                  ${darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white/20 text-gray-800 hover:bg-white/30'}
                `}
              >
                <Music className="w-5 h-5" />
                Playlist
              </Link>

              {/* View All Playlists Link - في القائمة المتنقلة */}
              <Link
                to="/playlists"
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  px-6 py-3 rounded-xl font-bold text-center transition-all
                  flex items-center justify-center gap-2
                  focus:outline-none focus:ring-2 focus:ring-white/50
                  ${darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white/20 text-gray-800 hover:bg-white/30'}
                `}
              >
                <List className="w-5 h-5" />
                Playlist
              </Link>

              {/* Practice Link */}
              <Link
                to="/practice"
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  px-6 py-3 rounded-xl font-bold text-center transition-all
                  flex items-center justify-center gap-2
                  focus:outline-none focus:ring-2 focus:ring-white/50
                  ${darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white/20 text-gray-800 hover:bg-white/30'}
                `}
              >
                <Book className="w-5 h-5" />
                Practice
              </Link>

              {/* Admin Link */}
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  px-6 py-3 rounded-xl font-bold text-center transition-all
                  flex items-center justify-center gap-2
                  focus:outline-none focus:ring-2 focus:ring-white/50
                  ${darkMode
                    ? 'bg-purple-900/50 text-purple-300 hover:bg-purple-800'
                    : 'bg-purple-500/20 text-purple-700 hover:bg-purple-500/30'}
                `}
              >
                <Shield className="w-5 h-5" />
                Admin Dashboard
              </Link>
            </div>

            {/* --- MOBILE CONTROLS --- */}
            <div
              className={`
                flex items-center justify-between pt-4 border-t
                ${darkMode ? 'border-gray-700' : 'border-gray-300'}
              `}
            >
              <span className="text-sm text-gray-700 dark:text-white/80 font-medium">
                Theme & Mode:
              </span>

              {/* Dark Mode Button */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`
                  p-2 rounded-xl transition-all
                  focus:outline-none focus:ring-2 focus:ring-white/50
                  ${darkMode
                    ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                    : 'bg-white/20 text-gray-800 hover:bg-white/30'}
                `}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            {/*  Mobile Theme Selection - Vertical and Organized ⭐⭐⭐ */}
            <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
              <p className="text-sm text-gray-700 dark:text-white/80 font-medium mb-3">
                Select Theme:
              </p>
              <div className="flex flex-col gap-2" role="radiogroup" aria-label="Theme selection">
                {Object.entries(THEMES).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setCurrentTheme(key); // Change theme
                      setMobileMenuOpen(false); // Close menu
                    }}
                    className={`
                      px-4 py-3 rounded-xl text-sm font-bold transition-all
                      flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-white/50
                      ${currentTheme === key
                        ? darkMode
                          ? `bg-gradient-to-r ${t.darkGradient} text-white scale-105 shadow-lg`
                          : 'bg-gray-800 text-white scale-105 shadow-lg'
                        : darkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-white/20 text-gray-800 hover:bg-white/30'
                      }
                    `}
                    role="radio"
                    aria-checked={currentTheme === key}
                    aria-label={`Select ${t.name} theme`}
                  >
                    <span className="text-xl" role="img" aria-hidden="true">{t.emoji}</span>
                    <span>{t.name}</span>
                    {currentTheme === key && <span className="ml-auto" aria-hidden="true">✓</span>}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Animation */}
      <style>{`
        @keyframes slideDown {
          from { 
            opacity: 0; 
            transform: translateY(-10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
          will-change: transform, opacity;
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .animate-slideDown {
            animation: none;
          }
        }
      `}</style>
    </header>
  );
}