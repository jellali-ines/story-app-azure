import React from "react";
import { FaPlay, FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const StoryCard = ({ 
  id, 
  title, 
  reading_time, 
  image_url,
  darkMode = false,
  theme = null
}) => {
  const navigate = useNavigate();

  const openStory = () => {
    navigate(`/story/${id}`);
  };

  // Couleurs dynamiques selon le theme et dark mode
  const getCardStyle = () => {
    if (darkMode) {
      // Mode sombre avec couleurs du thème
      return {
        background: theme 
          ? `linear-gradient(135deg, ${theme.primary}15, ${theme.secondary}10)` 
          : '#1a1a2e',
        borderColor: theme 
          ? `${theme.primary}30` 
          : '#2d3748',
        textColor: '#e2e8f0',
        secondaryTextColor: '#a0aec0',
        buttonBg: theme 
          ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` 
          : 'linear-gradient(135deg, #FF8A3D, #FF6B2B)'
      };
    }
    
    // Mode clair (design original)
    return {
      background: '#fffaf5',
      borderColor: '#fed7aa',
      textColor: '#26024D',
      secondaryTextColor: '#4a5568',
      buttonBg: 'linear-gradient(135deg, #FF8A3D, #FF6B2B)'
    };
  };

  const styles = getCardStyle();

  return (
    <div
      onClick={openStory}
      className={`
        relative rounded-3xl shadow-lg overflow-hidden w-[300px] 
        transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl 
        mx-auto cursor-pointer border
        ${darkMode ? 'border-opacity-30' : 'border-orange-200'}
      `}
      style={{
        background: styles.background,
        borderColor: styles.borderColor,
      }}
    >
      {/* IMAGE - Garde exactement le même effet */}
      <div
        className="w-[90%] h-[180px] mx-auto mt-4 rounded-[35px] overflow-hidden shadow-md 
        [clip-path:polygon(0%_7%,50%_0%,100%_7%,100%_93%,50%_100%,0%_93%)]
        transition-transform duration-300 hover:scale-105"
      >
        <img
          src={image_url}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
      </div>

      {/* TEXT - Avec couleurs dynamiques */}
      <div className="px-5 pb-6 pt-3">
        <h3 
          className="text-[14px] font-semibold"
          style={{ color: styles.textColor }}
        >
          {title}
        </h3>
        <p 
          className="text-[12px] flex items-center gap-1"
          style={{ color: styles.secondaryTextColor }}
        >
          <FaClock /> {reading_time || "10 mins"}
        </p>
      </div>

      {/* PLAY BUTTON - Avec gradient dynamique */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/story/${id}`);
        }}
        className="absolute bottom-4 right-4 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-md
        transition-all duration-200 hover:scale-110"
        style={{ background: styles.buttonBg }}
      >
        <FaPlay />
      </button>

      {/* Effet décoratif subtil selon le thème */}
      {theme && (
        <div 
          className="absolute top-0 right-0 w-20 h-20 opacity-10 rounded-full"
          style={{
            background: `radial-gradient(circle, ${theme.primary} 0%, transparent 70%)`
          }}
        />
      )}
    </div>
  );
};

export default StoryCard;