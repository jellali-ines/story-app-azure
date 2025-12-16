// components/layout/Footer.jsx
import React from 'react';
import useTheme from '../../hooks/useTheme';

export default function Footer() {
  const { theme } = useTheme('purple');

  return (
    <footer className={`bg-gradient-to-r ${theme.gradient} text-white py-8 mt-12`}>
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <h3 className="text-2xl font-bold">Learning is Fun!</h3>
        </div>
        <p className="text-white/90 text-lg mb-4">Made with love for smart kids like you!</p>
        <div className="flex justify-center gap-6 text-white/80">
          <span>Colorful Learning</span>
          <span>•</span>
          <span>Fun Challenges</span>
          <span>•</span>
          <span>Amazing Results</span>
        </div>
      </div>
    </footer>
  );
}