import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Volume2, RotateCcw, CheckCircle, XCircle, Award } from 'lucide-react';

const SpeechToText = ({ referenceText = "This is a sample text to practice reading." }) => {
  // ===== ALL STATE DECLARATIONS =====
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [comparison, setComparison] = useState(null);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTeaching, setIsTeaching] = useState(false);
  const [currentTeachingWord, setCurrentTeachingWord] = useState('');
  const [teachingProgress, setTeachingProgress] = useState(0);
  const [totalWordsToTeach, setTotalWordsToTeach] = useState(0);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const isRecognitionActive = useRef(false);
  const teachingCancelledRef = useRef(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => {
        isRecognitionActive.current = true;
      };

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setTranscribedText(prev => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        isRecognitionActive.current = false;
      };

      recognitionRef.current.onend = () => {
        isRecognitionActive.current = false;
        if (isRecording) {
          setTimeout(() => startRecognition(), 100);
        }
      };
    }

    return () => stopRecognition();
  }, [isRecording]);

  const startRecognition = () => {
    if (!recognitionRef.current || isRecognitionActive.current) return;
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.log('Recognition start error:', error);
    }
  };

  const stopRecognition = () => {
    if (!recognitionRef.current || !isRecognitionActive.current) return;
    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.log('Recognition stop error:', error);
    }
    isRecognitionActive.current = false;
  };

  const compareTexts = (reference, transcribed) => {
    const refWords = reference.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const transWords = transcribed.toLowerCase().trim().split(/\s+/).filter(Boolean);
    
    if (transWords.length === 0) {
      return {
        accuracy: 0,
        correctWords: 0,
        totalWords: refWords.length,
        wordComparison: refWords.map(word => ({
          reference: word,
          transcribed: '',
          isCorrect: false,
          isMissing: true,
          isExtra: false
        }))
      };
    }
    
    let correctWords = 0;
    const wordComparison = [];

    const wordsMatch = (word1, word2) => {
      if (word1 === word2) return true;
      const clean1 = word1.replace(/[^\w\s]|_/g, "");
      const clean2 = word2.replace(/[^\w\s]|_/g, "");
      if (clean1 === clean2) return true;
      
      if (clean1.length > 3 && clean2.length > 3) {
        const longer = clean1.length > clean2.length ? clean1 : clean2;
        const shorter = clean1.length > clean2.length ? clean2 : clean1;
        if (longer.includes(shorter)) {
          const similarity = shorter.length / longer.length;
          return similarity >= 0.75;
        }
      }
      return false;
    };

    refWords.forEach((refWord, index) => {
      const transWord = transWords[index] || '';
      const isCorrect = wordsMatch(refWord, transWord);
      if (isCorrect) correctWords++;
      
      wordComparison.push({
        reference: refWord,
        transcribed: transWord,
        isCorrect,
        isMissing: !transWord,
        isExtra: false
      });
    });

    if (transWords.length > refWords.length) {
      for (let i = refWords.length; i < transWords.length; i++) {
        wordComparison.push({
          reference: '',
          transcribed: transWords[i],
          isCorrect: false,
          isMissing: false,
          isExtra: true
        });
      }
    }

    const accuracy = Math.round((correctWords / refWords.length) * 100);
    
    return {
      accuracy: Math.min(100, Math.max(0, accuracy)),
      correctWords,
      totalWords: refWords.length,
      wordComparison
    };
  };

  const getFeedback = (accuracy) => {
    if (accuracy >= 90) return { emoji: '🌟', text: 'Excellent! Your pronunciation is amazing!', color: 'text-green-400' };
    if (accuracy >= 75) return { emoji: '👍', text: 'Very good! Keep practicing', color: 'text-blue-400' };
    if (accuracy >= 60) return { emoji: '💪', text: 'Good! Try again', color: 'text-yellow-400' };
    return { emoji: '📖', text: 'Try reading slowly and clearly', color: 'text-orange-400' };
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setHasRecorded(true);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTranscribedText('');
      setShowResults(false);
      setComparison(null);
      
      setTimeout(() => startRecognition(), 300);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Cannot access microphone. Please allow microphone access.');
    }
  };

  const stopRecordingHandler = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      stopRecognition();
      setTimeout(() => setIsProcessing(false), 1500);
    }
  };

  const analyzeRecording = () => {
    if (!transcribedText.trim()) {
      alert('No text detected. Please try recording again.');
      return;
    }
    const result = compareTexts(referenceText, transcribedText);
    setComparison(result);
    setShowResults(true);
  };

  const reset = () => {
    stopRecognition();
    setTranscribedText('');
    setAudioUrl(null);
    setHasRecorded(false);
    setShowResults(false);
    setComparison(null);
    setIsRecording(false);
    audioChunksRef.current = [];
  };

  const playRecording = () => {
    if (audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => setIsPlayingRecording(true);
      audio.onended = () => {
        setIsPlayingRecording(false);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setIsPlayingRecording(false);
        audioRef.current = null;
      };

      audio.play();
    }
  };

  const stopPlayingRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setIsPlayingRecording(false);
    }
  };

  const teachIncorrectWords = () => {
    if (!comparison) return;

    const incorrectWords = comparison.wordComparison
      .filter(word => !word.isCorrect && word.reference && !word.isExtra)
      .map(word => word.reference);

    if (incorrectWords.length === 0) {
      alert('Perfect! No words to practice. All words are correct! 🌟');
      return;
    }

    setIsTeaching(true);
    setTotalWordsToTeach(incorrectWords.length);
    setTeachingProgress(0);
    teachingCancelledRef.current = false;

    let currentIndex = 0;
    let repeatCount = 0;

    const speakWord = () => {
      if (teachingCancelledRef.current || currentIndex >= incorrectWords.length) {
        setIsTeaching(false);
        setCurrentTeachingWord('');
        return;
      }

      const word = incorrectWords[currentIndex];
      setCurrentTeachingWord(word);
      setTeachingProgress(currentIndex + 1);

      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.7;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';

      utterance.onend = () => {
        if (teachingCancelledRef.current) return;
        
        repeatCount++;
        
        if (repeatCount < 2) {
          setTimeout(() => speakWord(), 500);
        } else {
          repeatCount = 0;
          currentIndex++;
          if (currentIndex < incorrectWords.length) {
            setTimeout(() => speakWord(), 1000);
          } else {
            setIsTeaching(false);
            setCurrentTeachingWord('');
          }
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    speakWord();
  };

  const stopTeaching = () => {
    teachingCancelledRef.current = true;
    window.speechSynthesis.cancel();
    setIsTeaching(false);
    setCurrentTeachingWord('');
  };

  return (
    <div className="space-y-6">
      
      {/* Recording Controls */}
      <div className="flex flex-col items-center gap-4">
        
        {!isRecording && !hasRecorded && (
          <button
            onClick={startRecording}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 p-6 rounded-full shadow-xl transition hover:scale-110 active:scale-95"
            aria-label="Start recording"
          >
            <Mic size={40} className="text-white" />
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecordingHandler}
            className="bg-red-600 hover:bg-red-700 p-6 rounded-full shadow-xl transition animate-pulse"
            aria-label="Stop recording"
          >
            <Square size={40} className="text-white" />
          </button>
        )}

        {hasRecorded && !showResults && (
          <div className="flex gap-3">
            <button
              onClick={isPlayingRecording ? stopPlayingRecording : playRecording}
              className={`${
                isPlayingRecording 
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                  : 'bg-purple-600 hover:bg-purple-700'
              } px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 shadow-lg transition hover:scale-105 active:scale-95`}
            >
              <Volume2 size={20} />
              {isPlayingRecording ? 'Stop' : 'Listen'}
            </button>
            
            <button
              onClick={analyzeRecording}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 shadow-lg transition hover:scale-105 active:scale-95"
            >
              <Award size={20} />
              Analyze
            </button>
            
            <button
              onClick={reset}
              className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 shadow-lg transition hover:scale-105 active:scale-95"
            >
              <RotateCcw size={20} />
              Reset
            </button>
          </div>
        )}

        <div className="text-center">
          {isRecording && (
            <p className="text-red-400 font-semibold animate-pulse flex items-center gap-2 justify-center">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              Recording...
            </p>
          )}
          {isProcessing && (
            <p className="text-yellow-400 font-semibold">Processing...</p>
          )}
        </div>
      </div>

      {/* Transcribed Text - Before Analysis */}
      {transcribedText && !showResults && (
        <div
          className="bg-gray-900/50 rounded-xl p-4 border border-gray-700 opacity-100 translate-y-0 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Transcribed Text:</p>
            {isPlayingRecording && (
              <div className="flex items-center gap-2 text-green-400 animate-pulse">
                <Volume2 size={16} />
                <span className="text-sm font-semibold">Playing...</span>
              </div>
            )}
          </div>
          <p className="text-white leading-relaxed">{transcribedText}</p>
        </div>
      )}

      {/* Transcribed Text - After Analysis (Colored) */}
      {transcribedText && showResults && comparison && (
        <div
          className="bg-gray-900/50 rounded-xl p-4 border border-gray-700 opacity-100 translate-y-0 transition-all"
        >
          <p className="text-sm text-gray-400 mb-2">✍️ What I said:</p>
          <p className="text-lg leading-relaxed">
            {comparison.wordComparison.map((word, index) => {
              if (!word.transcribed) return null;
              return (
                <span
                  key={index}
                  className={`${
                    word.isCorrect 
                      ? 'text-green-400 font-semibold' 
                      : word.isExtra
                      ? 'text-yellow-400 font-semibold'
                      : 'text-red-400 font-semibold'
                  } mr-1`}
                >
                  {word.transcribed}
                </span>
              );
            })}
          </p>
        </div>
      )}

      {/* Results Display */}
      {showResults && comparison && (
        <div
          className="space-y-4 opacity-100 scale-100 transition-all"
        >
          
          {/* Teaching Indicator */}
          {isTeaching && (
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-4 shadow-2xl opacity-100 translate-y-0 transition-all"
            >
              <div className="text-center">
                <div className="text-5xl mb-4 animate-pulse">🔊</div>
                <div className="text-2xl font-bold mb-2">Teaching...</div>
                <div className="text-4xl font-black mb-4 text-yellow-300">
                  "{currentTeachingWord}"
                </div>
                <div className="text-sm text-blue-200 mb-3">
                  Word {teachingProgress} of {totalWordsToTeach}
                </div>
                <div className="w-full bg-blue-900/50 rounded-full h-3 mb-4">
                  <div 
                    className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(teachingProgress / totalWordsToTeach) * 100}%` }}
                  ></div>
                </div>
                <button
                  onClick={stopTeaching}
                  className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg text-white font-semibold transition hover:scale-105 active:scale-95"
                >
                  ⏹ Stop
                </button>
              </div>
            </div>
          )}

          {/* Score Card */}
          <div className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 shadow-2xl">
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">{getFeedback(comparison.accuracy).emoji}</div>
              <h3 className="text-3xl font-bold text-white mb-2">
                {comparison.accuracy}%
              </h3>
              <p className={`text-lg font-semibold ${getFeedback(comparison.accuracy).color}`}>
                {getFeedback(comparison.accuracy).text}
              </p>
            </div>
            
            <div className="flex justify-around text-center mt-4 pt-4 border-t border-purple-500/30">
              <div>
                <p className="text-green-400 text-2xl font-bold">{comparison.correctWords}</p>
                <p className="text-gray-400 text-sm">Correct Words</p>
              </div>
              <div>
                <p className="text-white text-2xl font-bold">{comparison.totalWords}</p>
                <p className="text-gray-400 text-sm">Total Words</p>
              </div>
            </div>

            {/* Current Text (Reference) - Colored */}
            <div className="mt-4 pt-4 border-t border-purple-500/30">
              <p className="text-sm text-gray-400 mb-2">📄 Reference Text:</p>
              <p className="text-base leading-relaxed">
                {comparison.wordComparison.map((word, index) => (
                  <span
                    key={index}
                    className={`${
                      word.isCorrect 
                        ? 'text-green-400 font-semibold' 
                        : 'text-red-400 font-semibold'
                    } mr-1`}
                  >
                    {word.reference}
                  </span>
                ))}
              </p>
            </div>
          </div>

          {/* Word by Word Comparison */}
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <CheckCircle size={20} className="text-green-400" />
              Detailed Comparison:
            </h4>
            
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {comparison.wordComparison.map((word, index) => {
                if (word.isExtra && !word.reference) {
                  return (
                    <div
                      key={index}
                      className="p-3 rounded-lg border bg-yellow-900/20 border-yellow-500/30"
                    >
                      <div className="flex items-center gap-2">
                        <XCircle size={16} className="text-yellow-400 flex-shrink-0" />
                        <span className="text-yellow-400 font-medium">
                          Extra word: "{word.transcribed}"
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        This word was not in the reference text
                      </p>
                    </div>
                  );
                }
                
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      word.isCorrect
                        ? 'bg-green-900/20 border-green-500/30'
                        : word.isMissing
                        ? 'bg-red-900/20 border-red-500/30'
                        : 'bg-red-900/20 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        {word.isCorrect ? (
                          <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                        ) : (
                          <XCircle size={16} className="text-red-400 flex-shrink-0" />
                        )}
                        <span className="text-white font-medium">{word.reference || '—'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <span className={`font-medium ${
                          word.isCorrect ? 'text-green-400' : 
                          word.isMissing ? 'text-red-400 line-through' :
                          'text-red-400'
                        }`}>
                          {word.transcribed || '(missing)'}
                        </span>
                      </div>
                    </div>
                    
                    {!word.isCorrect && word.reference && word.transcribed && (
                      <p className="text-xs text-gray-400 mt-1">
                        Expected: {word.reference}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={teachIncorrectWords}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl text-white font-bold flex items-center gap-2 shadow-lg transition hover:scale-105 active:scale-95"
            >
              <Volume2 size={20} />
              Teach Me
            </button>
            
            <button
              onClick={reset}
              className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-xl text-white font-bold flex items-center gap-2 shadow-lg transition hover:scale-105 active:scale-95"
            >
              <RotateCcw size={20} />
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Browser Support Warning */}
      {!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
        <div className="bg-yellow-900/40 border border-yellow-500 rounded-xl p-4 text-center">
          <p className="text-yellow-300 text-sm">
            ⚠️ Your browser doesn't support speech recognition. Please use Chrome or Edge.
          </p>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.6);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.8);
        }
      `}</style>
    </div>
  );
};

export default SpeechToText;