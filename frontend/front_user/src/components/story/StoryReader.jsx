import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { 
  ArrowLeft, 
  BookOpen, 
  Share2, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  Sparkles,
  Lightbulb,
  BookText,
  Star,
  Volume2,
  Type,
  Heart,
  Palette
} from "lucide-react";

export default function ReadTheStory({ 
  currentTheme, 
  setCurrentTheme,
  darkMode, 
  THEMES 
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState("normal");
  const [selectedWord, setSelectedWord] = useState(null);
  const [wordDefinition, setWordDefinition] = useState(null);
  const [definitionLoading, setDefinitionLoading] = useState(false);
  const [isPlayingPronunciation, setIsPlayingPronunciation] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [complexWords, setComplexWords] = useState(new Set()); // Stocker les mots complexes
  const [complexWordsLoading, setComplexWordsLoading] = useState(false);
  
  const contentRef = useRef(null);
  const definitionPopupRef = useRef(null);
  const themeSelectorRef = useRef(null);
  const audioRef = useRef(null);

  // Fonction pour diviser le texte en paragraphes logiques
  const splitIntoSentences = (text) => {
    if (!text) return [];
    
    const normalizedText = text
      .replace(/Mr\./g, 'Mr')
      .replace(/Mrs\./g, 'Mrs')
      .replace(/Dr\./g, 'Dr')
      .replace(/etc\./g, 'etc');
    
    const sentences = normalizedText.match(/[^.!?]+[.!?]+/g) || [text];
    
    const paragraphs = [];
    let currentParagraph = [];
    
    sentences.forEach((sentence, index) => {
      currentParagraph.push(sentence.trim());
      
      if (currentParagraph.length >= 4 || 
          index === sentences.length - 1 ||
          currentParagraph.join(' ').length > 300) {
        paragraphs.push(currentParagraph.join(' '));
        currentParagraph = [];
      }
    });
    
    if (currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join(' '));
    }
    
    return paragraphs.length > 0 ? paragraphs : [text];
  };

  // Fonction pour obtenir la prononciation
  const getPronunciationUrl = (word) => {
    const encodedWord = encodeURIComponent(word);
    return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodedWord}`;
  };

  const playPronunciation = (word) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const audioUrl = getPronunciationUrl(word);
    audioRef.current = new Audio(audioUrl);
    
    audioRef.current.onplay = () => setIsPlayingPronunciation(true);
    audioRef.current.onended = () => setIsPlayingPronunciation(false);
    audioRef.current.onerror = () => {
      setIsPlayingPronunciation(false);
      console.error("Erreur de lecture audio");
    };
    
    audioRef.current.play().catch(e => {
      console.error("Erreur de lecture:", e);
      setIsPlayingPronunciation(false);
    });
  };

  const stopPronunciation = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingPronunciation(false);
    }
  };

  // Fonction pour détecter les mots complexes
  const detectComplexWords = async (text) => {
  setComplexWordsLoading(true);
  try {
    const response = await fetch('http://localhost:8000/detect_complex_words', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("Mots complexes détectés:", data);

    // data est directement une liste de mots, donc on fait :
    const complexWordsSet = new Set(
  (Array.isArray(data) ? data : (data.complex_words || [])).map(word => word.toLowerCase())
);

    setComplexWords(complexWordsSet);

    return complexWordsSet;
  } catch (error) {
    console.error("Erreur lors de la détection des mots complexes :", error);
    setComplexWords(new Set());
    return new Set();
  } finally {
    setComplexWordsLoading(false);
  }
};


  // Fonction pour obtenir la définition d'un mot
  const fetchWordDefinition = async (word) => {
    setDefinitionLoading(true);
    setSelectedWord(word);

    try {
      const response = await fetch(`http://localhost:8000/word_info/${word}`);
      if (!response.ok) throw new Error("Erreur réseau");
      
      const data = await response.json();

      setWordDefinition({
        word: data.word,
        definition: data.definition || "Définition indisponible",
        example: data.example || `Exemple d'utilisation : "${word}" est utilisé dans ce contexte.`,
        pronunciation: `/${word.toLowerCase().replace(/[aeiou]/g, '')}/`,
        wordType: data.type || "Mot courant",
        emoji: data.emoji || null,
        isComplex: data.is_complex
      });
    } catch (error) {
      console.error("Erreur lors de la récupération du mot :", error);
      setWordDefinition({
        word,
        definition: `Le mot "${word}" est considéré comme complexe et mérite d'être étudié !`,
        example: `Exemple d'utilisation : "${word}" apparaît dans ce texte.`,
        pronunciation: `/${word.toLowerCase()}/`,
        wordType: "Mot complexe",
        isComplex: true
      });
    } finally {
      setDefinitionLoading(false);
    }
  };

  // Rendre seulement les mots complexes cliquables
  const renderTextWithClickableWords = (text) => {
    if (!text) return "";
    
    // Diviser le texte en mots et ponctuation
    const words = text.split(/(\s+)/);
    
    return words.map((word, index) => {
      // Nettoyer le mot (enlever la ponctuation à la fin)
      const cleanWord = word.replace(/[.,!?;:()\[\]{}'"]/g, '').toLowerCase();
      
      // Vérifier si c'est un mot complexe
      const isComplexWord = complexWords.has(cleanWord) && cleanWord.length > 2 && /\w+/i.test(cleanWord);
      
      if (isComplexWord) {
        // Pour le mot affiché, garder la casse originale
        const originalWord = word.replace(/[.,!?;:()\[\]{}'"]/g, '');
        
        return (
          <span
            key={index}
            onClick={() => fetchWordDefinition(originalWord)}
            className={`complex-word cursor-pointer transition-all duration-200 inline-block
              relative group
              ${selectedWord === originalWord
                ? darkMode 
                  ? 'text-purple-300 font-bold' 
                  : 'text-[#FF8A3D] font-bold'
                : darkMode
                  ? 'text-yellow-300 hover:text-yellow-200'
                  : 'text-orange-600 hover:text-orange-700'
              }`}
            title={`Cliquer pour la définition de "${originalWord}"`}
          >
            {word}
            {/* Ligne subtile au survol */}
            <span className={`absolute bottom-0 left-0 w-0 h-[2px] group-hover:w-full transition-all duration-300
              ${darkMode ? 'bg-yellow-400/70' : 'bg-orange-500/70'}`} />
            {/* Pointille sous le mot pour indiquer qu'il est cliquable */}
            <span className={`absolute -bottom-1 left-0 w-full h-[1px] border-b-2 border-dotted
              ${darkMode ? 'border-yellow-500/50' : 'border-orange-400/50'}`} />
          </span>
        );
      }
      
      // Mot non complexe - afficher normalement
      return <span key={index}>{word}</span>;
    });
  };

  useEffect(() => {
    const fetchStory = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/stories/${id}`);
        if (!response.ok) throw new Error('Erreur réseau');
        
        const data = await response.json();
        const storyData = data.data || data;
        const paragraphs = splitIntoSentences(storyData.text || '');
        
        setStory({
          ...storyData,
          pages: paragraphs,
          totalPages: paragraphs.length
        });
        
        // Détecter les mots complexes dans tout le texte
        if (storyData.text) {
          await detectComplexWords(storyData.text);
        }
      } catch (err) {
        console.error("Erreur de chargement:", err);
        setStory(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();

    // Fermer la popup en cliquant à l'extérieur
    const handleClickOutside = (event) => {
      // Fermer la popup de définition
      if (definitionPopupRef.current && 
          !definitionPopupRef.current.contains(event.target) &&
          !event.target.closest('.complex-word')) {
        setSelectedWord(null);
        setWordDefinition(null);
        stopPronunciation();
      }
      
      // Fermer le sélecteur de thème
      if (themeSelectorRef.current && 
          !themeSelectorRef.current.contains(event.target) &&
          !event.target.closest('[data-theme-button]')) {
        setShowThemeSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      stopPronunciation();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [id]);

  // Re-détecter les mots complexes quand on change de page
  useEffect(() => {
    if (story?.pages?.[currentPage - 1]) {
      detectComplexWords(story.pages[currentPage - 1]);
    }
  }, [currentPage, story]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (contentRef.current?.requestFullscreen) {
        contentRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const handleFontSize = (size) => {
    setFontSize(size);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: story?.title || 'StoryTale',
        text: `Je lis "${story?.title}" sur StoryTale !`,
        url: window.location.href,
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert("Lien copié !");
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    // API call pour liker l'histoire
  };

  const nextPage = () => {
    if (story?.pages && currentPage < story.pages.length) {
      setCurrentPage(prev => prev + 1);
      setSelectedWord(null);
      setWordDefinition(null);
      stopPronunciation();
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      setSelectedWord(null);
      setWordDefinition(null);
      stopPronunciation();
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#FF8A3D] to-[#FF6B2B] animate-pulse mx-auto mb-6" />
            <BookOpen className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-white" />
          </div>
          <p className={`text-xl font-semibold mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Chargement de l'histoire...
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
            <span className="text-4xl">📚</span>
          </div>
          <h2 className={`text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Histoire non trouvée
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

  if (complexWordsLoading) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
        Détection des mots complexes...
      </p>
    </div>
  );
}


  const currentContent = story.pages?.[currentPage - 1] || "";
  const totalPages = story.pages?.length || 1;
  const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

  // Tailles de police
  const fontSizeClasses = {
    small: "text-base md:text-lg",
    normal: "text-lg md:text-xl",
    large: "text-xl md:text-2xl"
  };

  return (
    <div 
      ref={contentRef}
      className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}
    >
      {/* Popup de définition */}
      {(selectedWord || wordDefinition) && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div 
            ref={definitionPopupRef}
            className={`max-w-md w-full rounded-2xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            {/* Header */}
            <div className={`p-6 rounded-t-2xl ${darkMode ? 'bg-purple-900/50' : 'bg-gradient-to-r from-orange-50 to-purple-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${darkMode ? 'bg-purple-700' : 'bg-gradient-to-r from-[#FF8A3D] to-[#FF6B2B]'}`}>
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Dictionnaire
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-sm px-2 py-0.5 rounded-full ${darkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-700'}`}>
                        Mot complexe
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedWord(null);
                    setWordDefinition(null);
                    stopPronunciation();
                  }}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {definitionLoading ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4">
                    <div className={`rounded-full border-4 animate-spin ${darkMode ? 'border-gray-700 border-t-purple-500' : 'border-gray-200 border-t-[#FF8A3D]'}`} />
                  </div>
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    Recherche de la définition...
                  </p>
                </div>
              ) : wordDefinition ? (
                <div className="space-y-6">
                  {/* Word with pronunciation */}
                  <div className="text-center">
                    <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-yellow-300' : 'text-orange-600'}`}>
                      {wordDefinition.word}
                    </h2>
                    
                    {/* Pronunciation row */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                        {wordDefinition.pronunciation}
                      </div>
                      
                      {/* Pronunciation button */}
                      <button
                        onClick={() => isPlayingPronunciation ? stopPronunciation() : playPronunciation(wordDefinition.word)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all
                          ${isPlayingPronunciation
                            ? darkMode
                              ? 'bg-purple-700 text-white'
                              : 'bg-[#FF8A3D] text-white'
                            : darkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        <Volume2 className={`w-4 h-4 ${isPlayingPronunciation ? 'animate-pulse' : ''}`} />
                        <span className="text-sm">{isPlayingPronunciation ? 'En cours...' : 'Écouter'}</span>
                      </button>
                    </div>
                    
                    {/* Word type */}
                    {wordDefinition.wordType && (
                      <div className={`inline-block px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-700'}`}>
                        {wordDefinition.wordType} • Mot complexe
                      </div>
                    )}
                  </div>

                  {/* Definition Card */}
                  <div className={`p-5 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="flex items-start gap-3">
                      <BookText className={`w-5 h-5 mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <div>
                        <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Définition
                        </h4>
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                          {wordDefinition.definition}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Example Card */}
                  {wordDefinition.example && (
                    <div className={`p-5 rounded-xl ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                      <div className="flex items-start gap-3">
                        <Star className={`w-5 h-5 mt-1 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`} />
                        <div>
                          <h4 className={`font-semibold mb-2 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                            Exemple
                          </h4>
                          <p className={`italic ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {wordDefinition.example}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
            
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className={`sticky top-0 z-40 ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-lg border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/story/${id}`)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all
                  ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'} shadow`}
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>
            </div>

            {/* Right side - Controls */}
            <div className="flex items-center gap-2">
              {/* Taille de police */}
              <div className={`flex items-center gap-1 p-1 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <button
                  onClick={() => handleFontSize("small")}
                  className={`px-3 py-1 rounded text-sm ${fontSize === "small" ? (darkMode ? 'bg-purple-600 text-white' : 'bg-[#FF8A3D] text-white') : (darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')}`}
                  title="Petite police"
                >
                  <span className="text-xs">A⁻</span>
                </button>
                <button
                  onClick={() => handleFontSize("normal")}
                  className={`px-3 py-1 rounded text-sm ${fontSize === "normal" ? (darkMode ? 'bg-purple-600 text-white' : 'bg-[#FF8A3D] text-white') : (darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')}`}
                  title="Taille normale"
                >
                  <span className="text-base">A</span>
                </button>
                <button
                  onClick={() => handleFontSize("large")}
                  className={`px-3 py-1 rounded text-sm ${fontSize === "large" ? (darkMode ? 'bg-purple-600 text-white' : 'bg-[#FF8A3D] text-white') : (darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')}`}
                  title="Grande police"
                >
                  <span className="text-lg">A⁺</span>
                </button>
              </div>

              {/* Like Button */}
              <button
                onClick={toggleLike}
                className={`p-2 rounded-lg transition-all duration-200 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
                  ${isLiked ? 'text-red-500' : (darkMode ? 'text-gray-400' : 'text-gray-600')}`}
                title={isLiked ? "Retirer le like" : "Ajouter un like"}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>

              {/* Theme Button */}
              <div className="relative" ref={themeSelectorRef}>
                <button
                  data-theme-button
                  onClick={() => setShowThemeSelector(!showThemeSelector)}
                  className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'}`}
                  title="Changer le thème"
                >
                  <Palette className="w-5 h-5" />
                </button>

                {/* Theme Selector Dropdown */}
                {showThemeSelector && (
                  <div className={`absolute top-full right-0 mt-2 w-48 rounded-xl shadow-2xl z-50
                    ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                    <div className="p-3">
                      <div className="space-y-2">
                        {THEMES.map((theme) => (
                          <button
                            key={theme.name}
                            onClick={() => {
                              setCurrentTheme(theme);
                              setShowThemeSelector(false);
                            }}
                            className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-left
                              ${currentTheme.name === theme.name 
                                ? darkMode 
                                  ? 'bg-purple-600 text-white' 
                                  : 'bg-[#FF8A3D] text-white'
                                : darkMode 
                                ? 'hover:bg-gray-700' 
                                : 'hover:bg-gray-100'
                              }`}
                          >
                            <span>{theme.name}</span>
                            {currentTheme.name === theme.name && (
                              <span className="text-xs">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'}`}
                title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'}`}
                title="Partager"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
              <div 
                className={`h-full rounded-full transition-all duration-300 ${darkMode ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-[#FF8A3D] to-[#FF6B2B]'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Page {currentPage} sur {totalPages}
              </span>
              <span className={darkMode ? 'text-purple-300' : 'text-[#FF8A3D]'}>
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Story Content Container */}
        <div className={`rounded-2xl p-6 md:p-8 ${darkMode ? 'bg-gray-800/30' : 'bg-white/50'} backdrop-blur-sm`}>
          
          {/* Page indicator et conseil */}
          <div className={`mb-8 p-4 rounded-xl text-center ${darkMode ? 'bg-purple-900/20 border border-purple-800/30' : 'bg-orange-50 border border-orange-200'}`}>
            <div className="flex flex-col items-center gap-2">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Sparkles className="w-3 h-3" />
                <span className="text-sm">Page {currentPage} sur {totalPages}</span>
              </div>
              <p className={`text-sm mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                💡 <span className="font-semibold">Astuce :</span> Les{" "}
                <span className={`font-bold ${darkMode ? 'text-yellow-300' : 'text-orange-600'}`}>mots complexes</span>
                {" "}sont soulignés en pointillés. Cliquez dessus pour voir leur définition !
                {complexWordsLoading && " (Détection des mots complexes en cours...)"}
              </p>
              {complexWords.size > 0 && (
                <p className={`text-xs mt-1 ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                  ✓ {complexWords.size} mot{complexWords.size > 1 ? 's' : ''} complexe{complexWords.size > 1 ? 's' : ''} détecté{complexWords.size > 1 ? 's' : ''} sur cette page
                </p>
              )}
            </div>
          </div>

          {/* Story Content */}
          <div className={`leading-relaxed font-serif ${fontSizeClasses[fontSize]} ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            {currentContent.split('\n').map((paragraph, pIndex) => (
              <p key={pIndex} className="mb-6 md:mb-8 relative">
                {renderTextWithClickableWords(paragraph)}
              </p>
            ))}
          </div>

          {/* Page Navigation */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-700/30 dark:border-gray-300/30">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 
                (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}`}
            >
              <ChevronLeft className="w-5 h-5" />
              Précédent
            </button>

            <div className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
              {currentPage} / {totalPages}
            </div>

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 
                (darkMode 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90' 
                  : 'bg-gradient-to-r from-[#FF8A3D] to-[#FF6B2B] text-white hover:opacity-90'
                )}`}
            >
              Suivant
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Style pour les mots complexes */}
      <style jsx>{`
        .complex-word:hover {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}