// ========================== HOMEPAGE.JSX - COMPLETE VERSION ==========================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import HomeCard from '../components/ui/HomeCard';

export default function HomePage({ theme, darkMode }) {
  const navigate = useNavigate();

  // ==================== Projects List ====================
  const projects = [
    {
      id: 1,
      name: 'Grammar Checker',
      emoji: '✍️',
      path: '/grammar',
      available: true,
      description: 'Check and improve your grammar',
      type: 'user'
    },
    {
      id: 2,
      name: 'Story Evaluator',
      emoji: '📚',
      path: '/story',
      available: true,
      description: 'Evaluate your story summaries',
      type: 'user'
    },
    {
      id: 3,
      name: 'Vocabulary Builder',
      emoji: '📖',
      path: '/vocabulary',
      available: false,
      description: 'Expand your vocabulary',
      type: 'user'
    },
    {
      id: 4,
      name: 'Writing Practice',
      emoji: '🌟',
      path: '/writing',
      available: false,
      description: 'Practice creative writing',
      type: 'user'
    },
    {
      id: 5,
      name: 'Admin Dashboard',
      emoji: '👑',
      path: '/admin',
      available: true,
      description: 'View all evaluations and statistics',
      type: 'admin'
    }
  ];

  // ==================== Card Click Function ====================
  const handleCardClick = (project) => {
    if (project.available) {
      navigate(project.path);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-6xl w-full">
        
        {/* ==================== Main Title ==================== */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-5xl font-bold mb-3 transition-colors ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Choose Your Learning Path
          </h1>
          
          <p className={`text-lg transition-colors ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Select a tool to start learning ✨
          </p>
        </div>

        {/* ==================== Cards Grid ==================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
          {projects.map((project) => (
            <HomeCard
              key={project.id}
              project={project}
              theme={theme}
              darkMode={darkMode}
              onClick={handleCardClick}
            />
          ))}
        </div>

      
         
      </div>
    </div>
  );
}