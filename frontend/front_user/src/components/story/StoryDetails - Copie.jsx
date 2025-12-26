import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Sparkles, Share2, Heart, Clock, Users, Volume2 } from "lucide-react";
import StoriesSection from "./StoriesSection";

export default function StoryDetails({ 
  currentTheme, 
  darkMode, 
  THEMES 
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  const theme = THEMES[currentTheme] || THEMES.purple;

  useEffect(() => {
    fetch(`http://localhost:5000/api/stories/${id}`)
      .then((res) => res.json())
      .then((data) => {
        const storyData = data.data || data;
        setStory(storyData);
      })
      .catch((err) => console.error("Error loading story:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = () => {
    if (navigator.share && story) {
      navigator.share({
        title: story.title,
        text: `Check out this story: ${story.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // Ici: API call pour liker
    console.log(isLiked ? "Unliked" : "Liked", story.title);
  };

  
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FF8A3D] border-t-transparent mb-4"></div>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading magical story...
          </p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <span className="text-3xl">📚</span>
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Story Not Found
          </h2>
          <button
            onClick={() => navigate('/stories')}
            className={`mt-4 px-6 py-2 rounded-full font-semibold transition-all ${
              darkMode 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                : 'bg-gradient-to-r from-[#FF8A3D] to-[#FF6B2B] text-white'
            } hover:scale-105`}
          >
            <ArrowLeft className="inline w-4 h-4 mr-2" />
            Back to Stories
          </button>
        </div>
      </div>
    );
  }

  const first40Words = story.text?.split(" ").slice(0, 40).join(" ") + "…" || "No description available.";

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-b from-gray-900 to-black' : 'bg-gradient-to-b from-white to-gray-50'}`}>
      
      {/* Header */}
      <div className={`sticky top-0 z-50 ${darkMode ? 'bg-gray-900/80 backdrop-blur-md' : 'bg-white/80 backdrop-blur-sm'} border-b ${
        darkMode ? 'border-gray-800' : 'border-gray-200'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/stories')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gray-800' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                title="Share story"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Story Detail */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          
          {/* IMAGE */}
          <div className="relative">
            <div className={`relative overflow-hidden rounded-2xl ${
              darkMode ? 'bg-gray-800/50' : 'bg-white'
            } border ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}>
              <img
                src={story.image_url}
                alt={story.title}
                className="w-full h-[400px] object-cover transition-transform duration-500 hover:scale-105"
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {story.genre && (
                  <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                    darkMode 
                      ? 'bg-gray-900/90 text-gray-300' 
                      : 'bg-white/90 text-gray-700'
                  } backdrop-blur-sm shadow-sm`}>
                    {story.genre}
                  </span>
                )}
                
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  darkMode 
                    ? 'bg-gray-900/90 text-gray-300' 
                    : 'bg-white/90 text-gray-700'
                } backdrop-blur-sm shadow-sm`}>
                  <Clock className="w-4 h-4" />
                  <span>{story.reading_time || "10 mins"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-6">
            <div>
              <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {story.title}
              </h1>
              
              <p className={`text-lg leading-relaxed mb-6 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {first40Words}
              </p>
            </div>

            {/* Stats avec LIKES */}
            <div className={`grid grid-cols-3 gap-3 p-4 rounded-xl ${
              darkMode ? 'bg-gray-800/30' : 'bg-gray-100/50'
            }`}>
              <div className="text-center">
                <Users className={`w-5 h-5 mx-auto mb-1 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`} />
                <div className={`text-lg font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {story.readers || "1K+"}
                </div>
                <div className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Readers
                </div>
              </div>
              
              <div className="text-center">
                <button
                  onClick={handleLike}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Heart className={`w-5 h-5 mx-auto mb-1 ${
                    isLiked 
                      ? 'text-red-500 fill-red-500' 
                      : darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`} />
                </button>
                <div className={`text-lg font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {story.likes || "245"}
                </div>
                <div className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Likes
                </div>
              </div>
              
              <div className="text-center">
                <Sparkles className={`w-5 h-5 mx-auto mb-1 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`} />
                <div className={`text-lg font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {story.difficulty || "Easy"}
                </div>
                <div className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Level
                </div>
              </div>
            </div>

            {/* Action Buttons - Start Reading & Listen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Reading Button */}
              <button
                onClick={() => navigate(`/story/read/${story.story_id}`)}
                className={`py-4 rounded-xl font-bold text-lg transition-all duration-300
                  flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98]
                  ${darkMode 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-purple-500/25' 
                    : 'bg-gradient-to-r from-[#FF8A3D] to-[#FF6B2B] text-white hover:shadow-orange-500/25'
                  } shadow-lg hover:shadow-xl`}
              >
                <BookOpen className="w-6 h-6" />
                Start Reading
              </button>

              {/* Listen Button */}
              <button
                onClick={() => navigate(`/story/listen/${story.story_id}`)}
                className={`py-4 rounded-xl font-bold text-lg transition-all duration-300
                  flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98]
                  border-2 ${darkMode 
                    ? 'border-purple-500 text-purple-300 hover:bg-purple-900/30' 
                    : 'border-[#FF8A3D] text-[#FF8A3D] hover:bg-orange-50'
                  }`}
              >
                <Volume2 className="w-6 h-6" />
                Listen
              </button>
            </div>

            {/* Share Button - Full width */}
            <button
              onClick={handleShare}
              className={`w-full py-3 rounded-xl font-medium transition-all duration-300
                border ${darkMode 
                  ? 'border-gray-700 text-gray-300 hover:bg-gray-800' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                } flex items-center justify-center gap-2`}
            >
              <Share2 className="w-5 h-5" />
              Share This Story
            </button>
          </div>
        </div>

        
      </div>
      {/* Similar Stories */}
        <StoriesSection
          title="More Like This"
          apiUrl="http://localhost:5000/api/stories/popular"
          itemsPerPage={4}
          darkMode={darkMode}
          theme={theme}
        />
    </div>
  );
}