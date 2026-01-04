import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import PronunciationResult from '../components/story/PronunciationResult';


export default function SpeechEvaluation({ referenceText }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const recognitionRef = useRef(null);

  const startRecording = async () => {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setError("Your browser doesn't support audio recording.");
      return;
    }

    // Reset states
    setIsRecording(true);
    setRecognizedText('');
    setResult(null);
    setError(null);
    audioChunks.current = [];

    try {
      // 1. Start MediaRecorder for backend evaluation
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await sendToBackend(blob);
      };

      recorder.start();

      // 2. Start Speech Recognition for real-time display
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            }
          }
          
          if (finalTranscript) {
            setRecognizedText(prev => (prev + ' ' + finalTranscript).trim());
          }
        };

        recognition.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          if (event.error === 'no-speech') {
            setError('No speech detected. Please speak clearly.');
          }
        };

        recognition.start();
        console.log('🎤 Recording and real-time recognition started...');
      }

    } catch (err) {
      console.error("Microphone access error:", err);
      setError("Cannot access microphone. Please allow microphone permission.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    // Stop Speech Recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    setIsRecording(false);
    console.log('🛑 Recording stopped');
  };

  const sendToBackend = async (audioBlob) => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('text', referenceText);

    try {
      const response = await fetch('https://backend.icyrock-9d46072c.italynorth.azurecontainerapps.io/api/evaluate-speech', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Backend server is not running. Please start the Flask server on port 5000.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Evaluation result:', data);
      
      // Validate result has required fields
      if (!data || typeof data.overall_score === 'undefined') {
        throw new Error('Invalid response from server');
      }
      
      setResult(data);
    } catch (err) {
      console.error("Backend error:", err);
      
      // User-friendly error messages
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('❌ Cannot connect to backend server. Please make sure Flask is running on https://backend.icyrock-9d46072c.italynorth.azurecontainerapps.io');
      } else {
        setError(err.message || "Error evaluating pronunciation. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Render highlighted text with color coding
  const renderHighlightedText = () => {
    const refWords = referenceText.toLowerCase().split(/\s+/);
    const recWords = recognizedText.toLowerCase().split(/\s+/);

    return refWords.map((word, index) => {
      const recognizedWord = recWords[index] || '';
      
      let colorClass = 'text-gray-500'; // Not yet spoken
      let bgClass = 'bg-transparent';
      
      if (recognizedWord) {
        if (word === recognizedWord) {
          colorClass = 'text-green-400'; // Correct
          bgClass = 'bg-green-500/10';
        } else {
          // Check similarity
          const similarity = calculateSimilarity(word, recognizedWord);
          if (similarity >= 70) {
            colorClass = 'text-yellow-400'; // Close
            bgClass = 'bg-yellow-500/10';
          } else {
            colorClass = 'text-red-400'; // Wrong
            bgClass = 'bg-red-500/10';
          }
        }
      }

      return (
        <span
          key={index}
          className={`inline-block px-2 py-1 m-1 rounded-md font-medium transition-all duration-300 ${colorClass} ${bgClass}`}
        >
          {refWords[index]}
        </span>
      );
    });
  };

  // Simple similarity calculation
  const calculateSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 100;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return ((longer.length - editDistance) / longer.length) * 100;
  };

  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  return (
    <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          🎤 Pronunciation Practice
        </h2>
        {isRecording && (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full animate-pulse">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-xs text-red-400 font-medium">Recording...</span>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-purple-900/30 border border-purple-700/50 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <Volume2 className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-300">
            <p className="font-semibold mb-1">📖 How to practice:</p>
            <ul className="space-y-1 text-xs">
              <li>• Click the microphone to start</li>
              <li>• Read the text out loud clearly</li>
              <li>• Watch the words change color as you speak</li>
              <li>• Click again to stop and see your score</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span className="text-gray-400">Correct</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-500"></div>
          <span className="text-gray-400">Close</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span className="text-gray-400">Wrong</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-500"></div>
          <span className="text-gray-400">Not spoken</span>
        </div>
      </div>

      {/* Real-time Highlighted Text */}
      <div className="bg-gray-900 p-4 rounded-xl mb-6 min-h-[120px] max-h-[300px] overflow-y-auto">
        <div className="text-base leading-relaxed">
          {renderHighlightedText()}
        </div>
      </div>

      {/* Recording Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={loading}
          className={`relative p-8 rounded-full transition-all duration-300 transform hover:scale-110 shadow-2xl ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600' 
              : loading 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
          }`}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          {loading ? (
            <Loader className="w-10 h-10 text-white animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-10 h-10 text-white" />
          ) : (
            <Mic className="w-10 h-10 text-white" />
          )}
        </button>
      </div>

      {/* Status Messages */}
      {loading && (
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-700/50 rounded-full">
            <Loader className="w-4 h-4 animate-spin text-blue-400" />
            <p className="text-sm text-blue-300">Evaluating your pronunciation...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4 text-center mb-4">
          <p className="text-red-300 text-sm">⚠️ {error}</p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <PronunciationResult result={result} />
      )}
    </div>
  );
}