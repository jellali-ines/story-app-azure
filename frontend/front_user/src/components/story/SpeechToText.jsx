import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Volume2, RotateCcw, CheckCircle, XCircle, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SpeechToText = ({ referenceText = "This is a sample text to practice reading." }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US'; // English only
      recognitionRef.current.maxAlternatives = 1;

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
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          console.log('No speech detected, continuing...');
        } else if (event.error === 'aborted') {
          console.log('Recognition aborted');
        }
      };

      recognitionRef.current.onend = () => {
        // Auto-restart if still recording
        if (isRecording) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.log('Recognition restart failed:', e);
          }
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Recognition cleanup');
        }
      }
    };
  }, [isRecording]);

  // Compare texts and calculate accuracy
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

    // Helper function for better word matching
    const wordsMatch = (word1, word2) => {
      if (word1 === word2) return true;
      
      // Remove punctuation
      const clean1 = word1.replace(/[^\w\s]|_/g, "");
      const clean2 = word2.replace(/[^\w\s]|_/g, "");
      
      if (clean1 === clean2) return true;
      
      // Check if one contains the other (for plurals, tenses, etc)
      if (clean1.length > 3 && clean2.length > 3) {
        const longer = clean1.length > clean2.length ? clean1 : clean2;
        const shorter = clean1.length > clean2.length ? clean2 : clean1;
        
        // Check similarity (at least 75%)
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

    // Add extra words
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

  // Get feedback based on accuracy
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
      
      // Start speech recognition after a small delay
      setTimeout(() => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error('Failed to start recognition:', e);
          }
        }
      }, 100);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Cannot access microphone. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Recognition already stopped');
        }
      }

      setTimeout(() => {
        setIsProcessing(false);
      }, 1500);
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
    setTranscribedText('');
    setAudioUrl(null);
    setHasRecorded(false);
    setShowResults(false);
    setComparison(null);
    audioChunksRef.current = [];
  };

  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Recording Controls */}
      <div className="flex flex-col items-center gap-4">
        
        {!isRecording && !hasRecorded && (
          <motion.button
            onClick={startRecording}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 p-6 rounded-full shadow-xl transition"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Start recording"
          >
            <Mic size={40} className="text-white" />
          </motion.button>
        )}

        {isRecording && (
          <motion.button
            onClick={stopRecording}
            className="bg-red-600 hover:bg-red-700 p-6 rounded-full shadow-xl transition animate-pulse"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Stop recording"
          >
            <Square size={40} className="text-white" />
          </motion.button>
        )}

        {hasRecorded && !showResults && (
          <div className="flex gap-3">
            <motion.button
              onClick={playRecording}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 shadow-lg transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Volume2 size={20} />
              Listen
            </motion.button>
            
            <motion.button
              onClick={analyzeRecording}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 shadow-lg transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Award size={20} />
              Analyze
            </motion.button>
            
            <motion.button
              onClick={reset}
              className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 shadow-lg transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw size={20} />
              Reset
            </motion.button>
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

      {/* Transcribed Text Preview */}
      {transcribedText && !showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 rounded-xl p-4 border border-gray-700"
        >
          <p className="text-sm text-gray-400 mb-2">Transcribed Text:</p>
          <p className="text-white leading-relaxed">{transcribedText}</p>
        </motion.div>
      )}

      {/* Results Display */}
      <AnimatePresence>
        {showResults && comparison && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            
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
            </div>

            {/* Word by Word Comparison */}
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-400" />
                Detailed Comparison:
              </h4>
              
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {comparison.wordComparison.map((word, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      word.isCorrect
                        ? 'bg-green-900/20 border-green-500/30'
                        : word.isMissing
                        ? 'bg-red-900/20 border-red-500/30'
                        : word.isExtra
                        ? 'bg-yellow-900/20 border-yellow-500/30'
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
                          word.isExtra ? 'text-yellow-400' :
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
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <motion.button
                onClick={reset}
                className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-xl text-white font-bold flex items-center gap-2 shadow-lg transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw size={20} />
                Try Again
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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