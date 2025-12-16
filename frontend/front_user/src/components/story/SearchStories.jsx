import React, { useState } from "react";
import { Sparkles, X } from "lucide-react";

const SearchStories = ({ darkMode,  onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Genres populaires
  const popularGenres = [
    { name: "Adventure", emoji: "🏝️", color: "from-blue-500 to-cyan-500" },
    { name: "Fantasy", emoji: "🐉", color: "from-purple-500 to-pink-500" },
    { name: "Animals", emoji: "🐾", color: "from-green-500 to-emerald-500" },
    { name: "Space", emoji: "🚀", color: "from-indigo-500 to-blue-500" },
    { name: "Magic", emoji: "✨", color: "from-yellow-500 to-orange-500" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleGenreClick = (genre) => {
    setSearchQuery(genre);
    if (onSearch) {
      onSearch(genre);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <div className="w-full">
      {/* Barre de recherche minimaliste */}
      <div className="relative max-w-2xl mx-auto mb-10">
        <form onSubmit={handleSubmit} className="relative">
          {/* Input de recherche */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stories, adventures, or genres..."
            className={`w-full px-6 py-4 rounded-2xl border-2 text-lg font-medium
              transition-all duration-300 focus:outline-none focus:scale-[1.02]
              ${darkMode 
                ? 'bg-gray-800/80 border-gray-700 text-white placeholder-gray-400 focus:border-[#FF8A3D]' 
                : 'bg-white/90 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-[#FF8A3D]'
              } backdrop-blur-sm`}
          />

          {/* Bouton clear (X) */}
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className={`absolute right-32 top-1/2 transform -translate-y-1/2 p-2 rounded-full
                transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Bouton de recherche avec étincelle */}
          <button
            type="submit"
            disabled={!searchQuery.trim()}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 rounded-xl font-semibold
              transition-all duration-300 flex items-center gap-2
              ${searchQuery.trim() 
                ? 'bg-gradient-to-r from-[#FF8A3D] to-[#FF6B2B] text-white hover:scale-105 hover:shadow-lg' 
                : darkMode 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            <Sparkles className="w-4 h-4" />
            Search
          </button>
        </form>
      </div>

      {/* Genres populaires seulement */}
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap gap-3 justify-center">
          {popularGenres.map((genre) => (
            <button
              key={genre.name}
              onClick={() => handleGenreClick(genre.name)}
              className={`group relative px-4 py-3 rounded-xl font-medium
                transition-all duration-300 hover:scale-105 hover:shadow-lg
                ${darkMode 
                  ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-800' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                } border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <span className="flex items-center gap-2">
                <span className="text-xl">{genre.emoji}</span>
                <span>{genre.name}</span>
              </span>
              
              {/* Effet de gradient subtil au hover */}
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${genre.color} 
                opacity-0 group-hover:opacity-10 transition-opacity duration-300 -z-10`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchStories;