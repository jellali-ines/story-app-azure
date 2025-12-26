import React, { useEffect, useState } from "react";
import axios from "axios";
import StoryCard from "./StoryCard";
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp, Clock } from "lucide-react";

const StoriesSection = ({
  title = "Stories",
  apiUrl,
  itemsPerPage = 4,
  darkMode,
  theme
}) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        console.log('📡 Fetching stories from:', apiUrl);
        const res = await axios.get(apiUrl);

        // Cherche l'array à partir de différentes clés possibles
        const data =
          res.data?.stories ||
          res.data?.trendingStories ||
          res.data?.recommendedStories ||
          res.data?.recent ||
          res.data ||
          [];

        // Assure que c'est bien un tableau
        setStories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Erreur lors du fetch des stories:", err);
        console.error("📋 URL demandée:", apiUrl);
        console.error("📋 Status:", err.response?.status);
        console.error("📋 Message:", err.response?.data);
        setStories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [apiUrl]);

  const visibleStories = stories.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleNext = () => {
    if (startIndex + itemsPerPage < stories.length) {
      setStartIndex(startIndex + 1);
    }
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  return (
    <div className={`w-full py-12 ${darkMode ? 'bg-gray-900' : 'white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER avec icône */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            {/* Icône selon le type de section */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              title.includes('Trending') 
                ? 'bg-gradient-to-r from-orange-500 to-red-500'
                : 'bg-gradient-to-r from-purple-500 to-pink-500'
            }`}>
              {title.includes('Trending') ? (
                <TrendingUp className="w-6 h-6 text-white" />
              ) : (
                <Clock className="w-6 h-6 text-white" />
              )}
            </div>
            
            <div>
              <h2 className={`text-3xl md:text-4xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {title}
              </h2>
              <p className={`text-sm mt-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {stories.length} stories available
              </p>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3">
            <button
              onClick={handlePrev}
              disabled={startIndex === 0}
              className={`p-3 rounded-xl transition-all ${
                darkMode 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50' 
                  : 'bg-white text-gray-700 shadow hover:bg-gray-50 disabled:opacity-50'
              } disabled:cursor-not-allowed`}
              aria-label="Previous stories"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              disabled={startIndex + itemsPerPage >= stories.length}
              className={`p-3 rounded-xl transition-all ${
                darkMode 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50' 
                  : 'bg-white text-gray-700 shadow hover:bg-gray-50 disabled:opacity-50'
              } disabled:cursor-not-allowed`}
              aria-label="Next stories"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* GRID ou Loading/Empty State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(itemsPerPage)].map((_, i) => (
              <div
                key={i}
                className={`rounded-3xl animate-pulse ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-200'
                } h-80`}
              />
            ))}
          </div>
        ) : visibleStories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleStories.map((story, index) => (
              <StoryCard
                key={`story-${startIndex}-${index}-${story.story_id || story.id || Math.random()}`}
                id={story.story_id || story.id}
                title={story.title}
                reading_time={story.reading_time || story.duration}
                image_url={story.image_url || story.cover_image}
                genre={story.genre || story.category}
                difficulty={story.difficulty || story.level}
                rating={story.rating || story.average_rating}
                darkMode={darkMode}
                theme={theme}
              />
            ))}
          </div>
        ) : (
          <div className={`text-center py-12 rounded-2xl ${
            darkMode ? 'bg-gray-800/50' : 'bg-white'
          }`}>
            <Sparkles className={`w-12 h-12 mx-auto mb-4 ${
              darkMode ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              No stories found
            </h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Check back later for new stories!
            </p>
          </div>
        )}

        {/* Pagination dots */}
        {stories.length > itemsPerPage && (
          <div className="flex justify-center items-center gap-2 mt-8">
            {Array.from({ length: Math.ceil(stories.length / itemsPerPage) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setStartIndex(i * itemsPerPage)}
                className={`w-2 h-2 rounded-full transition-all ${
                  startIndex === i * itemsPerPage
                    ? darkMode
                      ? 'bg-purple-500 w-8'
                      : 'bg-[#FF8A3D] w-8'
                    : darkMode
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to page ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoriesSection;