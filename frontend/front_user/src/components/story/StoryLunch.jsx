import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ArrowLeft,
  Heart,
  MoreVertical,
  AlertCircle,
  Maximize,
  Minimize
} from 'lucide-react';
import { useApp } from "../../hooks/useAppState";
import AddToFolderModal from "../modals/AddToFolderModal";
import CreateFolderModal from "../modals/CreateFolderModal";
import SpeechToText from './SpeechToText';
import AIAssistant from './AIAssistant'; // 👈 Import AIAssistant

// ============= CONSTANTS =============
const CONSTANTS = {
  MAX_SENTENCE_LENGTH: 120,
  WORDS_PER_SECOND: 2.5,
  MIN_SEGMENT_DURATION: 3,
  UPDATE_INTERVAL: 100,
  SKIP_SECONDS: 10,
  API_BASE_URL: 'https://backend.icyrock-9d46072c.italynorth.azurecontainerapps.io',
  FALLBACK_AUDIO: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
};

// ============= CUSTOM HOOKS =============
const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const elementRef = useRef(null);

  const enterFullscreen = useCallback(async () => {
    if (!elementRef.current) return;
    
    try {
      if (elementRef.current.requestFullscreen) {
        await elementRef.current.requestFullscreen();
      } else if (elementRef.current.webkitRequestFullscreen) {
        await elementRef.current.webkitRequestFullscreen();
      } else if (elementRef.current.mozRequestFullScreen) {
        await elementRef.current.mozRequestFullScreen();
      } else if (elementRef.current.msRequestFullscreen) {
        await elementRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (err) {
      console.error('Error entering fullscreen:', err);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
      setIsFullscreen(false);
    } catch (err) {
      console.error('Error exiting fullscreen:', err);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  return { isFullscreen, toggleFullscreen, elementRef };
};

const useAudioPlayer = (audioUrl, transcription, onSegmentChange) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [totalTime, setTotalTime] = useState('00:00');
  const [error, setError] = useState(null);
  
  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  const formatTime = useCallback((seconds) => {
    if (isNaN(seconds)) return '00:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }, []);

  const updateCurrentSegment = useCallback((time) => {
    if (!transcription.length) return;
    const segment = transcription.find(s => time >= s.start && time <= s.end);
    if (segment) {
      onSegmentChange(segment.id);
    }
  }, [transcription, onSegmentChange]);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    setProgress(isNaN(progressPercent) ? 0 : progressPercent);
    setCurrentTime(formatTime(audio.currentTime));
    setTotalTime(formatTime(audio.duration));
  }, [formatTime]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
        setError('Failed to play audio');
      });
      setIsPlaying(true);
      intervalRef.current = setInterval(() => {
        updateCurrentSegment(audio.currentTime);
      }, CONSTANTS.UPDATE_INTERVAL);
    } else {
      audio.pause();
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [updateCurrentSegment]);

  const handleProgressChange = useCallback((e) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const value = parseFloat(e.target.value);
    setProgress(value);
    const time = (value / 100) * audio.duration;
    audio.currentTime = time;
    updateCurrentSegment(time);
  }, [updateCurrentSegment]);

  const skip = useCallback((seconds) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    audioRef,
    isPlaying,
    progress,
    currentTime,
    totalTime,
    error,
    togglePlay,
    handleProgressChange,
    handleTimeUpdate,
    skip
  };
};

// ============= UTILITY FUNCTIONS =============
const splitTextIntoSentences = (text) => {
  if (!text) return [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  const grouped = [];
  let buffer = '';
  
  sentences.forEach(sentence => {
    if ((buffer + sentence).length < CONSTANTS.MAX_SENTENCE_LENGTH) {
      buffer += (buffer ? ' ' : '') + sentence;
    } else {
      if (buffer) grouped.push(buffer);
      buffer = sentence;
    }
  });
  
  if (buffer) grouped.push(buffer);
  return grouped;
};

const createDynamicTranscription = (text) => {
  const parts = splitTextIntoSentences(text);
  let totalTime = 0;
  
  return parts.map((part, index) => {
    const words = part.split(/\s+/).filter(Boolean);
    const duration = Math.max(
      CONSTANTS.MIN_SEGMENT_DURATION,
      words.length / CONSTANTS.WORDS_PER_SECOND
    );
    const wordDuration = duration / words.length;
    
    const wordTimings = words.map((word, wordIndex) => ({
      text: word,
      start: totalTime + wordIndex * wordDuration,
      end: totalTime + (wordIndex + 1) * wordDuration,
    }));
    
    const segment = {
      id: index,
      text: part,
      start: totalTime,
      end: totalTime + duration,
      words: wordTimings
    };
    
    totalTime += duration;
    return segment;
  });
};

// ============= SUB COMPONENTS =============
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 p-4">
    <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 bg-gray-700 rounded w-48"></div>
      <div className="h-96 bg-gray-700 rounded-3xl"></div>
      <div className="h-32 bg-gray-700 rounded-3xl"></div>
      <div className="h-64 bg-gray-700 rounded-3xl"></div>
    </div>
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
    <div className="bg-red-900/40 border-2 border-red-500 rounded-2xl p-8 max-w-md text-center">
      <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">Error Occurred</h2>
      <p className="text-gray-300 mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl text-white font-semibold transition"
      >
        Retry
      </button>
    </div>
  </div>
);

const AudioPlayer = ({ 
  audioRef, 
  audioUrl, 
  isPlaying, 
  progress, 
  currentTime, 
  totalTime,
  onTogglePlay, 
  onProgressChange, 
  onTimeUpdate, 
  onSkip 
}) => (
  <div className="mt-6 bg-gray-800/60 backdrop-blur-sm p-6 rounded-3xl shadow-xl">
    <audio
      ref={audioRef}
      src={audioUrl}
      onTimeUpdate={onTimeUpdate}
      onError={(e) => console.error('Audio error:', e)}
      preload="metadata"
    />
    
    <input
      type="range"
      min="0"
      max="100"
      step="0.1"
      value={progress}
      onChange={onProgressChange}
      className="w-full mb-4 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
      aria-label="Audio progress"
    />
    
    <div className="flex justify-center items-center gap-6">
      <button
        onClick={() => onSkip(-CONSTANTS.SKIP_SECONDS)}
        className="text-white hover:text-purple-400 transition p-2"
        aria-label="Rewind 10 seconds"
      >
        <SkipBack size={28} />
      </button>
      
      <button
        onClick={onTogglePlay}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 p-5 rounded-full transition shadow-lg"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
      </button>
      
      <button
        onClick={() => onSkip(CONSTANTS.SKIP_SECONDS)}
        className="text-white hover:text-purple-400 transition p-2"
        aria-label="Forward 10 seconds"
      >
        <SkipForward size={28} />
      </button>
    </div>
    
    <div className="flex justify-between text-sm text-gray-300 mt-4 font-mono">
      <span>{currentTime}</span>
      <span>{totalTime}</span>
    </div>
  </div>
);

const WordHighlighter = ({ words, currentTime }) => (
  <>
    {words.map((word, index) => {
      const isActive = currentTime >= word.start && currentTime <= word.end;
      return (
        <motion.span
          key={index}
          className={`mr-1 transition-colors duration-150 ${
            isActive ? "text-green-400 font-bold" : "text-white"
          }`}
          animate={isActive ? { scale: 1.05 } : { scale: 1 }}
        >
          {word.text}
        </motion.span>
      );
    })}
  </>
);

const TranscriptionOverlay = ({ segment, currentTime, isFullscreen, onToggleFullscreen }) => (
  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[92%] pointer-events-none">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/80 backdrop-blur-md px-6 py-4 rounded-xl text-center shadow-2xl"
    >
      <p className={`font-semibold leading-relaxed ${isFullscreen ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'}`}>
        {segment ? (
          <WordHighlighter words={segment.words} currentTime={currentTime} />
        ) : (
          <span className="text-gray-400">▶️ Play audio to display transcription</span>
        )}
      </p>
    </motion.div>
    
    <button
      onClick={onToggleFullscreen}
      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 backdrop-blur-sm p-2 rounded-lg transition pointer-events-auto"
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      {isFullscreen ? (
        <Minimize className="text-white" size={20} />
      ) : (
        <Maximize className="text-white" size={20} />
      )}
    </button>
  </div>
);

const FullTranscription = ({ transcription, currentSegmentIndex, currentTime }) => (
  <div className="mt-8 bg-gray-800/40 backdrop-blur-sm p-6 rounded-3xl shadow-xl">
    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
      📖 Full Text
    </h3>
    <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
      {transcription.map((segment, index) => (
        <motion.p
          key={segment.id}
          className={`p-4 rounded-lg transition-all duration-300 ${
            index === currentSegmentIndex
              ? "bg-purple-900/50 border-r-4 border-purple-500 shadow-lg"
              : "bg-gray-900/30"
          }`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <WordHighlighter words={segment.words} currentTime={currentTime} />
        </motion.p>
      ))}
    </div>
  </div>
);

// ============= MAIN COMPONENT =============
function LunchStory({ darkMode }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    setCurrentStory,
    currentStory,
    favoriteStoriesIds,
    handleStoryHeartClick,
    showAddToFolder,
    setShowAddToFolder,
    showCreateFolder
  } = useApp();

  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [evaluationMode, setEvaluationMode] = useState(false);
  const [activePanel, setActivePanel] = useState('recording'); // 'recording' or 'assistant'

  const { isFullscreen, toggleFullscreen, elementRef: fullscreenRef } = useFullscreen();

  const transcription = useMemo(() => {
    if (!story?.text) return [];
    return createDynamicTranscription(story.text);
  }, [story?.text]);

  const audioUrl = story?.audio_url || CONSTANTS.FALLBACK_AUDIO;

  const {
    audioRef,
    isPlaying,
    progress,
    currentTime,
    totalTime,
    error: audioError,
    togglePlay,
    handleProgressChange,
    handleTimeUpdate,
    skip
  } = useAudioPlayer(audioUrl, transcription, setCurrentSegmentIndex);

  const isStoryFavorite = currentStory && favoriteStoriesIds.includes(currentStory._id);
  const currentSegment = transcription[currentSegmentIndex];
  const currentTimeSeconds = audioRef.current?.currentTime || 0;

  const fetchStory = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${CONSTANTS.API_BASE_URL}/api/stories/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load story: ${response.status}`);
      }
      
      const data = await response.json();
      const storyData = data.data || data;

      if (!storyData || !storyData.text) {
        throw new Error('Received data is incorrect');
      }

      setStory(storyData);
      setCurrentStory(storyData);
    } catch (err) {
      console.error('Error fetching story:', err);
      setError(err.message || 'An error occurred while loading the story');
    } finally {
      setLoading(false);
    }
  }, [id, setCurrentStory]);

  useEffect(() => {
    fetchStory();
  }, [fetchStory]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage message={error} onRetry={fetchStory} />;
  if (!story) return <ErrorMessage message="Story not found" onRetry={() => navigate('/stories')} />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900"
    >
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800 p-4 flex justify-between items-center">
        <button
          onClick={() => navigate('/stories')}
          className="text-white hover:text-purple-400 transition p-2"
          aria-label="Back"
        >
          <ArrowLeft size={24} />
        </button>
        
        <h1 className="text-white font-bold text-lg truncate max-w-[60%]">
          {story.title}
        </h1>
        
        <div className="flex gap-3">
          <button
            onClick={handleStoryHeartClick}
            className="text-white hover:scale-110 transition p-2"
            aria-label={isStoryFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              size={24}
              className={isStoryFavorite ? "fill-purple-500 text-purple-500" : ""}
            />
          </button>
          <button
            onClick={() => setShowAddToFolder(true)}
            className="text-white hover:text-purple-400 transition p-2"
            aria-label="More options"
          >
            <MoreVertical size={24} />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className={`grid gap-8 ${evaluationMode ? 'lg:grid-cols-3' : 'grid-cols-1'}`}>
          
          {/* LEFT COLUMN - Story Content */}
          <div className={evaluationMode ? 'lg:col-span-2' : ''}>
            
            {/* IMAGE WITH OVERLAY */}
            <div 
              ref={fullscreenRef}
              className={`relative rounded-3xl overflow-hidden shadow-2xl transition-all ${
                isFullscreen ? 'bg-black flex items-center justify-center' : ''
              }`}
            >
              <img
                src={story.image_url}
                alt={story.title}
                className={`object-cover transition-all ${
                  isFullscreen 
                    ? 'w-full h-screen max-h-screen' 
                    : 'w-full h-72 md:h-96'
                }`}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x600?text=Story+Image';
                }}
              />
              <TranscriptionOverlay 
                segment={currentSegment} 
                currentTime={currentTimeSeconds}
                isFullscreen={isFullscreen}
                onToggleFullscreen={toggleFullscreen}
              />
            </div>

            {/* AUDIO PLAYER */}
            <AudioPlayer
              audioRef={audioRef}
              audioUrl={audioUrl}
              isPlaying={isPlaying}
              progress={progress}
              currentTime={currentTime}
              totalTime={totalTime}
              onTogglePlay={togglePlay}
              onProgressChange={handleProgressChange}
              onTimeUpdate={handleTimeUpdate}
              onSkip={skip}
            />

            {audioError && (
              <div className="mt-4 bg-red-900/40 border border-red-500 rounded-xl p-4 text-center text-white">
                {audioError}
              </div>
            )}

            {/* FULL TEXT */}
            <FullTranscription
              transcription={transcription}
              currentSegmentIndex={currentSegmentIndex}
              currentTime={currentTimeSeconds}
            />
          </div>

          {/* RIGHT COLUMN - Interactive Panel */}
          <AnimatePresence>
            {evaluationMode && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="lg:col-span-1"
              >
                {/* Panel Tabs */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setActivePanel('assistant')}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold transition ${
                      activePanel === 'assistant'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    🤖 AI Assistant
                  </button>
                  <button
                    onClick={() => setActivePanel('recording')}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold transition ${
                      activePanel === 'recording'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    🎤 Recording
                  </button>
                </div>

                {/* Panel Content */}
<div className="h-[calc(100vh-250px)] min-h-[600px]">                  {activePanel === 'assistant' ? (
                    <AIAssistant story={story} currentSegment={currentSegment} />
                  ) : (
                    <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-3xl p-6 shadow-2xl h-full overflow-y-auto custom-scrollbar">
                      <h2 className="text-2xl font-bold text-white mb-6 text-center sticky top-0 bg-gray-800/95 backdrop-blur-md py-3 -mx-6 px-6 z-10 rounded-t-3xl">
                        🎤 Voice Recording
                      </h2>

                      <SpeechToText referenceText={currentSegment?.text || story?.text || ""} />

                      <div className="mt-6 pt-4 border-t border-gray-700 sticky bottom-0 bg-gray-800/95 backdrop-blur-md -mx-6 px-6 pb-3 rounded-b-3xl">
                        <p className="text-sm text-gray-400 mb-2">Current Text:</p>
                        <div className="bg-gray-900/50 rounded-lg p-3 min-h-[60px] max-h-32 overflow-y-auto">
                          <p className="text-white leading-relaxed text-sm">
                            {currentSegment?.text || "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* TOGGLE BUTTON */}
        <div className="flex justify-center mt-10 mb-6">
          <motion.button
            onClick={() => setEvaluationMode(!evaluationMode)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-2xl text-white font-bold shadow-lg transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {evaluationMode ? "❌ Close Training Mode" : "🎓 Start Learning Mode"}
          </motion.button>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {showAddToFolder && <AddToFolderModal />}
        {showCreateFolder && <CreateFolderModal />}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.6);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.8);
        }
      `}</style>
    </motion.div>
  );
}

export default LunchStory;