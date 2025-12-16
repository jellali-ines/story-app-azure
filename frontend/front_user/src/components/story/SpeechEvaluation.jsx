import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import PronunciationResult from './PronunciationResult';

export default function StoryWithRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [childTranscript, setChildTranscript] = useState('');
  const [score, setScore] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);

  const storyText =
    "One hot summer day when there had been no rain for months";

  // ===== Start Recording =====
  const startRecording = async () => {
    setIsRecording(true);
    setChildTranscript('');
    setScore(null);
    audioChunksRef.current = [];

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      setRecordedBlob(blob);
      sendToBackend(blob);
    };

    recorder.start();

    // Speech Recognition (live)
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let finalText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript + ' ';
          }
        }
        setChildTranscript((prev) => prev + finalText);
      };

      recognition.start();
    }
  };

  // ===== Stop Recording =====
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  // ===== Send Audio to Flask =====
  const sendToBackend = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('text', storyText);

    const res = await fetch('http://localhost:5000/api/evaluate-speech', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setScore(data.score);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 grid grid-cols-2 gap-6">
      {/* ===== LEFT ===== */}
      <div className="bg-gray-800 p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-4">📖 Story</h2>

        <p className="text-lg leading-relaxed mb-4">
          {storyText.split('').map((char, i) => {
            const childChar = childTranscript[i] || '';
            const ok =
              char.toLowerCase() === childChar.toLowerCase();

            return (
              <span
                key={i}
                className={
                  ok
                    ? 'text-green-400 font-bold'
                    : childChar
                    ? 'text-red-400'
                    : 'text-gray-300'
                }
              >
                {char}
              </span>
            );
          })}
        </p>

        {score !== null && <PronunciationResult score={score} />}
      </div>

      {/* ===== RIGHT ===== */}
      <div className="bg-gray-800 p-6 rounded-xl flex flex-col items-center">
        <h2 className="text-xl font-bold mb-6">🎤 Read Aloud</h2>

        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-6 rounded-full ${
            isRecording ? 'bg-red-500' : 'bg-blue-500'
          }`}
        >
          {isRecording ? <MicOff size={36} /> : <Mic size={36} />}
        </button>

        <div className="mt-6 bg-gray-900 p-4 rounded w-full min-h-[120px]">
          {childTranscript || 'Start reading the story...'}
        </div>
      </div>
    </div>
  );
}
