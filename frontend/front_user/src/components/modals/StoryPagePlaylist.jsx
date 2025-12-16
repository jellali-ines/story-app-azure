import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2,
  BookOpen,
  Clock,
  Sparkles,
  ArrowLeft,
  Heart,
  MoreVertical,
  Folder
} from 'lucide-react';
import { useApp } from '../hooks/useAppState';
import AddToFolderModal from '../components/modals/AddToFolderModal';
import CreateFolderModal from '../components/modals/CreateFolderModal';

export default function StoryPage({ darkMode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [story, setStory] = useState(null);
  const [transcription, setTranscription] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [storyTotalLength, setStoryTotalLength] = useState('00:00');
  const [storyCurrentTime, setStoryCurrentTime] = useState('00:00');
  const [audioProgress, setAudioProgress] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentText, setCurrentText] = useState("");
  const [volume, setVolume] = useState(80);
  const [isStoryFavorite, setIsStoryFavorite] = useState(false);
  const [showAddToFolder, setShowAddToFolder] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  
  const intervalRef = useRef(null);
  const currentAudio = useRef();
  const progressBarRef = useRef();

  const { favorites, addToFavorites, removeFromFavorites } = useApp();

  // Récupérer l'histoire depuis l'API
  const fetchStory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/stories/${id}`);
      if (!response.ok) throw new Error('Erreur de chargement');
      
      const data = await response.json();
      const storyData = data.data || data;
      
      setStory(storyData);
      
      // Check if story is in favorites
      if (favorites.some(fav => fav.id === storyData.id)) {
        setIsStoryFavorite(true);
      }
      
      // Simuler la transcription depuis l'audio
      await getTranscription();
      await getAudio();
      
    } catch (error) {
      console.error("Error loading story:", error);
      setStory(null);
    } finally {
      setLoading(false);
    }
  };

  const getTranscription = async () => {
    try {
      // Simuler la transcription - à remplacer par votre API
      const mockTranscription = [
        { start: 0, end: 5, text: "One hot summer day when there had been no rain for months" },
        { start: 5, end: 10, text: "and all the ponds and rivers had dried up." },
        { start: 10, end: 15, text: "A thirsty crow was searching for water." },
        { start: 15, end: 20, text: "At last, he spotted a pitcher of cool water in a garden" },
        { start: 20, end: 25, text: "and flew down to take a drink, but when he put his head" },
        { start: 25, end: 30, text: "into the neck of the picture, it was only half full" },
        { start: 30, end: 35, text: "and the crow could not reach the water." },
      ];
      
      setTranscription(mockTranscription);
      
    } catch (error) {
      console.error("Error fetching transcription:", error);
    }
  };

  const getAudio = async () => {
    try {
      // Simuler l'audio - à remplacer par votre API
      const mockAudioUrl = story?.audio_url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
      setAudioUrl(mockAudioUrl);
      
    } catch (error) {
      console.error("Error fetching audio:", error);
    }
  };

  const handleMusicProgressBar = (e) => {
    const newProgress = parseInt(e.target.value);
    setAudioProgress(newProgress);
    
    if (currentAudio.current) {
      const newTime = (newProgress / 100) * currentAudio.current.duration;
      currentAudio.current.currentTime = newTime;
    }
  };

  const handleStoryHeartClick = () => {
    if (isStoryFavorite) {
      removeFromFavorites(story.id);
      setIsStoryFavorite(false);
    } else {
      addToFavorites(story);
      setIsStoryFavorite(true);
    }
  };

  const handleAudioPlay = () => {
    if (!currentAudio.current) return;
    
    if (currentAudio.current.paused) {
      currentAudio.current.play();
      setIsAudioPlaying(true);
      
      intervalRef.current = setInterval(() => {
        const currentTime = currentAudio.current.currentTime;
        const currentSegment = transcription.find(
          (seg) => currentTime >= seg.start && currentTime <= seg.end
        );
        setCurrentText(currentSegment ? currentSegment.text : "");
      }, 100);
    } else {
      currentAudio.current.pause();
      setIsAudioPlaying(false);
      clearInterval(intervalRef.current);
    }
  };

  const handleAudioUpdate = () => {
    if (!currentAudio.current) return;
    
    // Durée totale
    const duration = currentAudio.current.duration;
    if (duration && !isNaN(duration)) {
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      const totalLength = `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
      setStoryTotalLength(totalLength);
    }
    
    // Temps actuel
    const currentTime = currentAudio.current.currentTime;
    const currentMin = Math.floor(currentTime / 60);
    const currentSec = Math.floor(currentTime % 60);
    const currentTimeStr = `${currentMin < 10 ? `0${currentMin}` : currentMin}:${currentSec < 10 ? `0${currentSec}` : currentSec}`;
    setStoryCurrentTime(currentTimeStr);
    
    // Progression
    const progress = duration > 0 ? parseInt((currentTime / duration) * 100) : 0;
    setAudioProgress(isNaN(progress) ? 0 : progress);
  };

  const plus10sec = () => {
    if (!currentAudio.current) return;
    
    const newTime = currentAudio.current.currentTime + 10;
    currentAudio.current.currentTime = Math.min(newTime, currentAudio.current.duration);
    
    const progress = (newTime / currentAudio.current.duration) * 100;
    setAudioProgress(progress);
  };

  const min10sec = () => {
    if (!currentAudio.current) return;
    
    const newTime = currentAudio.current.currentTime - 10;
    currentAudio.current.currentTime = Math.max(newTime, 0);
    
    const progress = (newTime / currentAudio.current.duration) * 100;
    setAudioProgress(progress);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    
    if (currentAudio.current) {
      currentAudio.current.volume = newVolume / 100;
    }
  };

  useEffect(() => {
    fetchStory();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (currentAudio.current) {
        currentAudio.current.pause();
      }
    };
  }, [id]);

  useEffect(() => {
    if (!currentAudio.current) return;
    
    const updateSubtitle = () => {
      const currentTime = currentAudio.current.currentTime;
      const currentSegment = transcription.find(
        (seg) => currentTime >= seg.start && currentTime <= seg.end
      );
      setCurrentText(currentSegment ? currentSegment.text : "");
    };

    currentAudio.current.addEventListener("timeupdate", updateSubtitle);

    return () => {
      if (currentAudio.current) {
        currentAudio.current.removeEventListener("timeupdate", updateSubtitle);
      }
    };
  }, [transcription]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#FF8A3D] to-[#FF6B2B] animate-pulse mx-auto mb-6" />
            <BookOpen className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-white" />
          </div>
          <p className={`text-xl font-semibold mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Préparation de l'histoire audio...
          </p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
            darkMode ? 'bg-purple-900' : 'bg-gradient-to-r from-[#FF8A3D] to-[#FF6B2B]'
          }`}>
            <span className="text-4xl">🔊</span>
          </div>
          <h2 className={`text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Histoire audio non trouvée
          </h2>
          <button
            onClick={() => navigate('/stories')}
            className={`px-8 py-3 rounded-full font-bold text-lg transition-all duration-300
              flex items-center gap-2 mx-auto hover:scale-105 hover:shadow-xl
              ${darkMode 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                : 'bg-gradient-to-r from-[#FF8A3D] to-[#FF6B2B] text-white'
              }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Retour aux histoires
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900"
    >
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/playlists')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all bg-slate-800 text-gray-300 hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Stories
          </button>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleStoryHeartClick}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-all"
              aria-label={isStoryFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart 
                className={`w-5 h-5 ${isStoryFavorite ? 'fill-purple-500 text-purple-500' : 'text-gray-400'}`}
              />
            </button>
            
            <button 
              onClick={() => setShowAddToFolder(true)}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-all"
              aria-label="Add to playlist"
            >
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Story Image */}
        <div className="relative mb-8">
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src={story.image_url}
              alt={story.title}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Story Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">
                {story.title}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800/70 text-gray-300">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">Histoire audio</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800/70 text-gray-300">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{story.reading_time || "5 mins"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Player Section */}
        <div className="rounded-3xl p-6 mb-8 bg-gray-800/50 border border-gray-700 shadow-xl">
          {/* Subtitles */}
          <div className={`mb-8 p-6 rounded-2xl text-center transition-all duration-300 ${currentText ? 'scale-105' : 'scale-100'} bg-purple-900/30 border border-purple-800/30`}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span className="font-medium text-gray-300">
                Transcription en direct
              </span>
            </div>
            <p className="text-lg md:text-xl font-medium text-white min-h-[60px] flex items-center justify-center">
              {currentText || "Lancez l'audio pour voir la transcription en direct..."}
            </p>
          </div>

          {/* Audio Element */}
          <audio 
            src={audioUrl} 
            ref={currentAudio} 
            key={audioUrl} 
            onLoadedMetadata={handleAudioUpdate} 
            onTimeUpdate={handleAudioUpdate}
            onEnded={() => {
              setIsAudioPlaying(false);
              clearInterval(intervalRef.current);
            }}
          />

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">{storyCurrentTime}</span>
              <span className="text-gray-400">{storyTotalLength}</span>
            </div>
            <input
              type="range"
              ref={progressBarRef}
              value={audioProgress}
              onChange={handleMusicProgressBar}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${audioProgress}%, #374151 ${audioProgress}%, #374151 100%)`
              }}
            />
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Volume Control */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Volume2 className="w-5 h-5 text-gray-400" />
              <input
                type="range"
                value={volume}
                onChange={handleVolumeChange}
                className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${volume}%, #374151 ${volume}%, #374151 100%)`
                }}
              />
              <span className="text-sm w-10 text-gray-400">{volume}%</span>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-6">
              <button
                onClick={min10sec}
                className="p-3 rounded-full transition-all duration-300 hover:scale-110 bg-gray-800 text-gray-300 hover:bg-gray-700"
                title="Reculer 10 secondes"
              >
                <SkipBack className="w-6 h-6" />
              </button>

              <button
                onClick={handleAudioPlay}
                className="p-5 rounded-full transition-all duration-300 hover:scale-110 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl"
              >
                {isAudioPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 ml-1" />
                )}
              </button>

              <button
                onClick={plus10sec}
                className="p-3 rounded-full transition-all duration-300 hover:scale-110 bg-gray-800 text-gray-300 hover:bg-gray-700"
                title="Avancer 10 secondes"
              >
                <SkipForward className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Story Text */}
        <div className="rounded-3xl p-6 md:p-8 bg-gray-800/30 border border-gray-700 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-purple-900/30">
              <BookOpen className="w-6 h-6 text-purple-300" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              Texte complet de l'histoire
            </h2>
          </div>
          
          <div className="leading-relaxed text-lg text-gray-300">
            {story.text ? (
              story.text.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-6">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="italic">
                One hot summer day when there had been no rain for months and all the ponds and rivers had dried up. 
                A thirsty crow was searching for water. At last, he spotted a pitcher of cool water in a garden and 
                flew down to take a drink, but when he put his head into the neck of the picture, it was only half full, 
                and the crow could not reach the water.
                <br /><br />
                The poor crow knew that if he did not get a drink, soon, he would die of thirst. He had to find some 
                way of getting to the water in the picture as he looked around, wondering what to do. He saw some pebbles 
                on the path and he had an idea, he picked up a pebble in his beak and dropped it into the pitcher. 
                The water level rose a little. The bird got another pebble and dropped it in the water. A little more. 
                The crow worked very hard, dropping more and more bubbles into the picture until the water was almost at the top, 
                at last, the bird was able to reach the water, and he drank and drank until he could drink no more. 
                His clever idea had saved his life.
              </p>
            )}
          </div>
          
          {/* View Playlists Button */}
          <button 
            onClick={() => navigate('/playlists')}
            className="w-full mt-8 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
          >
            <Folder className="w-5 h-5" />
            View All Playlists
          </button>
        </div>
      </div>

      {/* Modals */}
      {showAddToFolder && <AddToFolderModal />}
      {showCreateFolder && <CreateFolderModal />}
    </motion.div>
  );
}