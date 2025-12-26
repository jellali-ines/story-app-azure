import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Send, Mic, Volume2, Sparkles, Book, Loader2, Zap, Trash2, Copy, RotateCcw, Settings, X } from 'lucide-react';

const BACKEND_URL = 'http://localhost:5002/api';

// Toast Notification Component
const Toast = ({ message, type, onClose }) => (
  <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in ${
    type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500'
  } text-white`}>
    <span>{message}</span>
    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded">
      <X size={16} />
    </button>
  </div>
);

// Settings Modal Component
const SettingsModal = ({ isOpen, onClose, settings, onSettingsChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Settings className="text-emerald-600" size={28} />
            Settings
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Voice Speed */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Voice Speed: {settings.voiceSpeed.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.voiceSpeed}
              onChange={(e) => onSettingsChange({ ...settings, voiceSpeed: parseFloat(e.target.value) })}
              className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Font Size: {settings.fontSize}px
            </label>
            <input
              type="range"
              min="14"
              max="24"
              step="2"
              value={settings.fontSize}
              onChange={(e) => onSettingsChange({ ...settings, fontSize: parseInt(e.target.value) })}
              className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Auto Play Voice */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Auto-play Responses</span>
            <button
              onClick={() => onSettingsChange({ ...settings, autoPlayVoice: !settings.autoPlayVoice })}
              className={`w-12 h-6 rounded-full transition ${
                settings.autoPlayVoice ? 'bg-emerald-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition ${
                settings.autoPlayVoice ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Sound Effects */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Sound Effects</span>
            <button
              onClick={() => onSettingsChange({ ...settings, soundEffects: !settings.soundEffects })}
              className={`w-12 h-6 rounded-full transition ${
                settings.soundEffects ? 'bg-emerald-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition ${
                settings.soundEffects ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-xl font-bold transition"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default function AIAssistant({ story, currentSegment }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hello! I\'m your AI assistant! Ask me anything about the story! 🎉✨',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [stats, setStats] = useState({
    questionsAsked: 0,
    wordsExplained: 0,
    requestsToday: 0,
    remainingToday: 100
  });
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [activeTab, setActiveTab] = useState('chat');
  const [toast, setToast] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [wordExplanation, setWordExplanation] = useState(null);
  const [hoveredWord, setHoveredWord] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [settings, setSettings] = useState({
    voiceSpeed: 0.9,
    fontSize: 18,
    autoPlayVoice: true,
    soundEffects: true
  });
  const [lastUserMessage, setLastUserMessage] = useState('');
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    checkConnection();
    fetchStats();
  }, []);

  // Show toast notification
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Play sound effect
  const playSound = useCallback((type) => {
    if (!settings.soundEffects) return;
    const audio = new Audio();
    audio.volume = 0.3;
    if (type === 'send') {
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGJ1/LMeSwGI3bH8N+RQAoUXbPp7KlWFApFn+DyvmwhBjCI1/LLeSsGI3bH8N+RQAoUXbPp7KlWFApFnuHyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuHyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuHyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuDyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuDyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuDyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuDyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuDyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuDyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuDyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuDyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuDyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuDyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuDyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuDyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuDyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuDyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuDyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7A==';
    } else if (type === 'receive') {
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGJ1/LMeSwGI3bH8N+RQAoUXbPp7KlWFApFn+DyvmwhBjCI1/LLeSsGI3bH8N+RQAoUXbPp7KlWFApFnuHyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuHyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuHyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuDyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuDyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuDyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuDyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuDyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuDyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuDyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuDyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuDyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuDyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuDyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7KhWFApFnuDyvmwhBjGI1/LLeSsGI3bH8N+RQAoUXbPp7A==';
    }
    audio.play().catch(() => {});
  }, [settings.soundEffects]);

  const checkConnection = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      if (response.ok) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(prev => ({
          ...prev,
          requestsToday: data.requests_today || 0,
          remainingToday: data.remaining_today || 100
        }));
      }
    } catch (error) {
      console.warn('Failed to fetch stats:', error.message);
    }
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      showToast('Browser does not support speech recognition', 'error');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = useCallback((text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = settings.voiceSpeed;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }, [settings.voiceSpeed]);

  const sendMessage = async (userMessage) => {
    if (!userMessage.trim()) return;

    if (connectionStatus !== 'connected') {
      showToast('⚠️ Backend is not connected! Please start the server.', 'error');
      return;
    }

    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);
    setLastUserMessage(userMessage);
    playSound('send');

    try {
      const fullStoryText = story?.text || '';

      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          story_context: fullStoryText
        })
      });

      const data = await response.json();

      if (response.status === 429) {
        const errorMessage = {
          role: 'assistant',
          content: `⏱️ ${data.error}\n\nPlease wait a moment before asking another question!`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        showToast('Rate limit reached. Please wait.', 'error');
      } else if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      } else {
        const newAssistantMessage = {
          role: 'assistant',
          content: data.reply,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, newAssistantMessage]);
        setStats(prev => ({
          ...prev,
          questionsAsked: prev.questionsAsked + 1
        }));
        
        fetchStats();
        playSound('receive');
        if (settings.autoPlayVoice) {
          speakText(data.reply);
        }
      }

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: '😔 Sorry, something went wrong. Please make sure the backend server is running!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setConnectionStatus('error');
      showToast('Failed to send message. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const retryLastMessage = () => {
    if (lastUserMessage) {
      sendMessage(lastUserMessage);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: '👋 Chat cleared! Ask me anything about the story! 🎉✨',
      timestamp: new Date()
    }]);
    showToast('Chat cleared successfully!', 'success');
  };

  const copyMessage = useCallback((content) => {
    navigator.clipboard.writeText(content).then(() => {
      showToast('Message copied to clipboard!', 'success');
    });
  }, [showToast]);

  const deleteMessage = useCallback((index) => {
    setMessages(prev => prev.filter((_, i) => i !== index));
    showToast('Message deleted', 'success');
  }, [showToast]);

  const explainWord = async (word) => {
    setIsLoading(true);
    setWordExplanation(null);
    playSound('send');
    try {
      const response = await fetch(`${BACKEND_URL}/explain-word`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: word,
          story_context: story?.text || ''
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Show explanation in Words tab
        setWordExplanation({
          word: data.word,
          explanation: data.explanation
        });
        
        setStats(prev => ({
          ...prev,
          wordsExplained: prev.wordsExplained + 1
        }));
        playSound('receive');
        if (settings.autoPlayVoice) {
          speakText(data.explanation);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Failed to explain word', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWordHover = (word, event) => {
    const rect = event.target.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setHoveredWord(word);
  };

  const handleWordLeave = () => {
    setHoveredWord(null);
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'disconnected': return 'bg-red-500';
      case 'checking': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'disconnected': return 'Disconnected';
      case 'checking': return 'Checking...';
      default: return 'Error';
    }
  };

  const displayMessages = useMemo(() => {
    return messages.filter(m => m.role !== 'system');
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl shadow-2xl overflow-hidden">
      
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
              <Sparkles className="text-yellow-300" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold">AI Assistant</h2>
              <p className="text-green-100 text-xs">Ask me anything! 🎯</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
              title="Settings"
            >
              <Settings size={18} />
            </button>
            <button
              onClick={checkConnection}
              className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
            >
              🔄
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
              activeTab === 'chat'
                ? 'bg-white text-emerald-700 shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Sparkles size={16} />
            💬 Chat
          </button>
          <button
            onClick={() => setActiveTab('words')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
              activeTab === 'words'
                ? 'bg-white text-teal-700 shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Book size={16} />
            📖 Words
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className={`px-4 py-2 ${connectionStatus === 'connected' ? 'bg-green-50' : 'bg-red-50'} text-center`}>
        <div className={`text-xs font-semibold flex items-center justify-center gap-2 ${connectionStatus === 'connected' ? 'text-green-700' : 'text-red-700'}`}>
          <div className={`w-2 h-2 ${getStatusColor()} rounded-full animate-pulse`} />
          <span>{getStatusText()}</span>
        </div>
      </div>

      {/* Messages - Chat Tab */}
      {activeTab === 'chat' && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {displayMessages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}
              >
                <div className="relative">
                  <div
                    className={`max-w-[85%] p-5 rounded-3xl shadow-lg ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                        : 'bg-white text-gray-800 border-2 border-emerald-200'
                    }`}
                    style={{ fontSize: `${settings.fontSize}px` }}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="text-emerald-600" size={22} />
                        <span className="font-bold text-emerald-600 text-base">AI Assistant</span>
                      </div>
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Message Actions */}
                    <div className="flex gap-2 mt-3">
                      {message.role === 'assistant' && (
                        <button
                          onClick={() => speakText(message.content)}
                          className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                          title="Listen"
                        >
                          <Volume2 size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => copyMessage(message.content)}
                        className={`flex items-center gap-1 ${
                          message.role === 'user' ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                        } text-sm font-medium`}
                        title="Copy"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => deleteMessage(index)}
                        className={`flex items-center gap-1 ${
                          message.role === 'user' ? 'text-white/80 hover:text-white' : 'text-red-600 hover:text-red-800'
                        } text-sm font-medium`}
                        title="Delete"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-5 rounded-3xl shadow-lg border-2 border-emerald-200">
                  <div className="flex items-center gap-3">
                    <Loader2 className="text-emerald-600 animate-spin" size={24} />
                    <span className="text-gray-600 text-base">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Actions Bar */}
          <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-200 flex justify-between items-center">
            <button
              onClick={clearChat}
              className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm font-medium transition"
            >
              <Trash2 size={16} />
              Clear Chat
            </button>
            
            {lastUserMessage && (
              <button
                onClick={retryLastMessage}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition"
              >
                <RotateCcw size={16} />
                Retry
              </button>
            )}
          </div>
        </>
      )}

      {/* Word Explainer Tab */}
      {activeTab === 'words' && currentSegment && connectionStatus === 'connected' && (
        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-teal-50 to-emerald-50 min-h-0 relative">
          
          {/* Hover Tooltip */}
          {hoveredWord && (
            <div 
              className="fixed z-50 pointer-events-none animate-fade-in"
              style={{
                left: `${tooltipPosition.x}px`,
                top: `${tooltipPosition.y}px`,
                transform: 'translate(-50%, -100%)'
              }}
            >
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-xl shadow-2xl border-2 border-white">
                <p className="font-bold text-sm whitespace-nowrap">
                  👆 Click to explain "{hoveredWord}"
                </p>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-teal-600"></div>
              </div>
            </div>
          )}

          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-white p-5 rounded-2xl border-2 border-teal-300 shadow-lg">
              <div className="text-center mb-4">
                <Book size={32} className="text-teal-600 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  Click on any word to learn! 📚
                </h3>
                <p className="text-sm text-gray-600">Hover over a word to preview!</p>
              </div>
              
              <div 
                className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-teal-200 leading-relaxed text-center"
              >
                {currentSegment.text.split(' ').map((word, idx) => (
                  <button
                    key={idx}
                    onClick={() => explainWord(word.replace(/[.,!?]/g, ''))}
                    onMouseEnter={(e) => handleWordHover(word.replace(/[.,!?]/g, ''), e)}
                    onMouseLeave={handleWordLeave}
                    disabled={isLoading}
                    className="inline-block bg-white hover:bg-emerald-200 active:bg-emerald-300 disabled:opacity-50 text-gray-800 hover:text-emerald-900 px-3 py-1.5 rounded-lg m-1 transition-all text-sm font-medium shadow-sm hover:shadow-md hover:scale-105 border border-emerald-200 hover:border-emerald-400 cursor-pointer"
                  >
                    {word}
                  </button>
                ))}
              </div>
              
              {isLoading && (
                <div className="mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 p-4 rounded-xl border border-emerald-300">
                  <Loader2 className="text-teal-600 animate-spin" size={24} />
                  <span className="text-gray-700 font-semibold text-sm">Getting explanation...</span>
                </div>
              )}
            </div>

            {/* Explanation Display */}
            {wordExplanation && !isLoading && (
              <div className="bg-white p-5 rounded-2xl border-2 border-emerald-300 shadow-lg animate-slide-in">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-emerald-600" size={24} />
                    <h4 className="text-xl font-bold text-emerald-700">
                      📖 {wordExplanation.word}
                    </h4>
                  </div>
                  <button
                    onClick={() => setWordExplanation(null)}
                    className="text-gray-500 hover:text-gray-700 transition p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200 mb-3">
                  <p className="text-gray-800 leading-relaxed text-base">
                    {wordExplanation.explanation}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => speakText(wordExplanation.explanation)}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-2.5 px-4 rounded-xl font-bold transition shadow-md flex items-center justify-center gap-2 text-sm"
                  >
                    <Volume2 size={18} />
                    Listen
                  </button>
                  <button
                    onClick={() => copyMessage(wordExplanation.explanation)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2.5 px-4 rounded-xl font-bold transition shadow-md flex items-center justify-center gap-2 text-sm"
                  >
                    <Copy size={18} />
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'words' && !currentSegment && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-gray-500">
            <Book size={64} className="mx-auto mb-4 text-teal-400" />
            <p className="text-lg font-semibold">No story segment selected</p>
            <p className="text-sm mt-2">Please play the story to see words</p>
          </div>
        </div>
      )}

      {activeTab === 'words' && connectionStatus !== 'connected' && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-gray-500">
            <Book size={64} className="mx-auto mb-4 text-red-400" />
            <p className="text-lg font-semibold">Backend not connected</p>
            <p className="text-sm mt-2">Start the backend to use word explanations</p>
          </div>
        </div>
      )}

      {/* Input - Only visible in Chat tab */}
      {activeTab === 'chat' && (
        <div className="p-4 bg-white border-t-2 border-emerald-200">
          <div className="flex gap-2">
            <button
              onClick={toggleVoiceInput}
              disabled={isLoading || connectionStatus !== 'connected'}
              className={`p-3 rounded-xl transition shadow-md ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50'
              }`}
            >
              <Mic size={24} />
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage(inputValue)}
              placeholder={connectionStatus === 'connected' ? "Ask anything..." : "Backend not connected..."}
              disabled={isLoading || connectionStatus !== 'connected'}
              className="flex-1 px-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-600 disabled:bg-gray-100"
            />

            <button
              onClick={() => sendMessage(inputValue)}
              disabled={isLoading || !inputValue.trim() || connectionStatus !== 'connected'}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white p-3 rounded-xl transition shadow-md"
            >
              <Send size={24} />
            </button>
          </div>

          {isListening && (
            <p className="text-center text-red-600 mt-2 font-semibold animate-pulse">
              🎤 Listening...
            </p>
          )}
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, -100%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -100%) scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}