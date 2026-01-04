import React, { useState } from "react";
import SearchStories from "../components/story/SearchStories";
import StoriesSection from "../components/story/StoriesSection";

const Stories = ({ 
  currentTheme, 
  darkMode, 
  THEMES 
}) => {
  const theme = THEMES[currentTheme] || THEMES.purple;
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (query, filters) => {
    console.log("Searching for:", query, "with filters:", filters);
    setIsSearching(true);
    
    // Simuler une recherche (remplacer par votre API)
    setTimeout(() => {
      // Ici vous feriez un appel API avec les paramètres
      // setSearchResults(results);
      setIsSearching(false);
    }, 1000);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      
      
      {/* Hero Section avec Search */}
      <div className={`relative  ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          {/* Titre */}
          <div className="text-center mb-8">
            <h1 className={`text-3xl md:text-5xl lg:text-6xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Discover <span className="bg-gradient-to-r from-[#FF8A3D] to-[#FF6B2B] bg-clip-text text-transparent">
                Magical Stories
              </span>
            </h1>
            <p className={`text-lg md:text-xl max-w-2xl mx-auto ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Find your next adventure among hundreds of interactive stories for kids
            </p>
          </div>

          {/* Composant de recherche */}
          <SearchStories
            darkMode={darkMode}
            theme={theme}
            onSearch={handleSearch}
          />
        </div>

        {/* Décoration */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      </div>

      {/* Résultats de recherche */}
      {isSearching ? (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF8A3D]"></div>
            <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Searching for stories...
            </p>
          </div>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className={`text-2xl font-bold mb-6 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Search Results ({searchResults.length})
          </h2>
          {/* Afficher les résultats de recherche ici */}
        </div>
      ) : (
        <>
          {/* Sections de stories normales */}
          <StoriesSection
            title="Trending Now"
            apiUrl="https://backend.icyrock-9d46072c.italynorth.azurecontainerapps.io/api/stories/popular"
            itemsPerPage={4}
            darkMode={darkMode}
            theme={theme}
          />
          
          <StoriesSection
            title="Recently Added"
            apiUrl="https://backend.icyrock-9d46072c.italynorth.azurecontainerapps.io/api/stories"
            itemsPerPage={4}
            darkMode={darkMode}
            theme={theme}
          />
          
          <StoriesSection
            title="Editor's Picks"
            apiUrl="https://backend.icyrock-9d46072c.italynorth.azurecontainerapps.io/api/stories/featured"
            itemsPerPage={4}
            darkMode={darkMode}
            theme={theme}
          />
        </>
      )}

      
    </div>
  );
};

export default Stories;