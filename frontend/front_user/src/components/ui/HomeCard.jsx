// ========================== PROJECT CARD COMPONENT ==========================
import React from 'react';

export default function HomeCard({ 
  project,      // Project information
  theme,        // Current theme
  darkMode,     // Dark mode status
  onClick       // Click handler function
}) {
  
  return (
    <button
      onClick={() => onClick(project)}
      disabled={!project.available}
      className={`
        group relative overflow-hidden rounded-2xl p-6 md:p-8
        transition-all duration-300 transform 
        ${project.available 
          ? 'hover:scale-105 hover:shadow-xl cursor-pointer' 
          : 'cursor-not-allowed'
        }
        ${darkMode 
          ? project.type === 'admin'
            ? 'bg-gradient-to-br from-purple-900/30 to-gray-800 border-2 border-purple-700/50'
            : 'bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700'
          : project.type === 'admin'
            ? 'bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200'
            : 'bg-white border-2 border-gray-200'
        }
        ${!project.available && 'opacity-70'}
      `}
    >
      {/* ==================== Gradient Hover Effect ==================== */}
      {project.available && (
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
          style={{
            background: project.type === 'admin'
              ? `linear-gradient(135deg, ${theme.primary}, #8B5CF6)`
              : `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
          }}
        />
      )}

      {/* ==================== Badges ==================== */}
      <div className="absolute top-3 right-3 flex flex-col gap-1 z-20">
        {/* "Coming Soon" badge */}
        {!project.available && (
          <div 
            className="px-2 py-1 text-xs font-bold rounded-full shadow-lg animate-pulse"
            style={{ 
              backgroundColor: theme.warning,
              color: 'white'
            }}
          >
            Soon
          </div>
        )}
        
        {/* "Admin" badge */}
        {project.type === 'admin' && project.available && (
          <div 
            className="px-2 py-1 text-xs font-bold rounded-full shadow-lg"
            style={{ 
              backgroundColor: theme.primary,
              color: 'white'
            }}
          >
            Admin
          </div>
        )}
      </div>

      {/* ==================== Main Content ==================== */}
      <div className="relative z-10 text-center">
        
        {/* Icon */}
        <div 
          className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-all"
          style={{
            background: project.type === 'admin'
              ? `linear-gradient(135deg, ${theme.primary}, #8B5CF6)`
              : `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
          }}
        >
          {project.icon ? (
            <project.icon className="w-8 h-8" />
          ) : (
            <span className="text-2xl md:text-3xl">{project.emoji}</span>
          )}
        </div>

        {/* Project Name */}
        <h2 className={`text-lg md:text-xl font-bold mb-2 transition-colors ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {project.name}
        </h2>

        {/* Description */}
        <p className={`text-xs md:text-sm transition-colors ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {project.description}
        </p>

        {/* Status Indicator (Available / Coming Soon) */}
        <div className="mt-4">
          {project.available ? (
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${
              darkMode ? 'bg-green-900/30' : 'bg-green-100'
            }`}>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className={`text-xs font-medium ${
                darkMode ? 'text-green-400' : 'text-green-700'
              }`}>
                Available
              </span>
            </div>
          ) : (
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${
              darkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'
            }`}>
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className={`text-xs font-medium ${
                darkMode ? 'text-yellow-400' : 'text-yellow-700'
              }`}>
                Coming Soon
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ==================== Overlay for Unavailable Cards ==================== */}
      {!project.available && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className={`text-4xl font-bold opacity-10 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            SOON
          </div>
        </div>
      )}
    </button>
  );
}