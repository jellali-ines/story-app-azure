// components/effects/ConfettiEffect.jsx
import React from 'react';

/**
 * Confetti Effect Component
 * Animated confetti celebration effect
 */
const ConfettiEffect = () => {
  const confettiColors = ['#ff6b35', '#f7931e', '#fdc830', '#37ecba', '#72ddf7'];
  
  const confettiPieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 1,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)]
  }));

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {confettiPieces.map((piece) => (
          <div
            key={piece.id}
            className="absolute w-3 h-3 animate-confetti"
            style={{
              left: `${piece.left}%`,
              top: '-10px',
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              transform: 'rotate(45deg)'
            }}
            aria-hidden="true"
          />
        ))}
      </div>
      <style>{`
        @keyframes confetti {
          0% { 
            transform: translateY(0) rotate(0deg); 
            opacity: 1; 
          }
          100% { 
            transform: translateY(100vh) rotate(720deg); 
            opacity: 0; 
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </>
  );
};

export default ConfettiEffect;