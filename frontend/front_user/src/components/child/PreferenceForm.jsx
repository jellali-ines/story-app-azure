import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Import images for the first question
import adventureImg from "../../assets/storyGenres/adventure.jpg";
import animalsImg from "../../assets/storyGenres/animaux.jpg";
import fairytaleImg from "../../assets/storyGenres/fairytale.jpg";
import fantasyImg from "../../assets/storyGenres/fantasy.jpg";
import scifiImg from "../../assets/storyGenres/sciencefiction.jpg";
import mysteryImg from "../../assets/storyGenres/mystery.jpg";

// Character images
import princessImg from "../../assets/characters/princess.jpg";
import superheroImg from "../../assets/characters/superhero.jpg";
import childImg from "../../assets/characters/child.jpg";
import robotImg from "../../assets/characters/robot.jpg";
import animalCharacterImg from "../../assets/characters/animal.jpg";

// Emotion images
import joyImg from "../../assets/emotions/joy.jpg";
import surpriseImg from "../../assets/emotions/surprise.jpg";
import suspenseImg from "../../assets/emotions/curious.jpg";
import fearImg from "../../assets/emotions/fear.jpg";
import calmImg from "../../assets/emotions/calm.jpg";

const questions = [
  {
    question: "What kinds of stories do you enjoy the most?",
    options: [
      { label: "Adventure", img: adventureImg },
      { label: "Animals", img: animalsImg },
      { label: "Fairy Tales", img: fairytaleImg },
      { label: "Fantasy", img: fantasyImg },
      { label: "Science Fiction", img: scifiImg },
      { label: "Mystery", img: mysteryImg },
    ],
  },
  {
    question: "Who do you like reading about?",
    options: [
      { label: "Princesses & Princes", img: princessImg },
      { label: "Superheroes", img: superheroImg },
      { label: "Funny Animals", img: animalCharacterImg },
      { label: "Friendly Robots", img: robotImg },
      { label: "Kids like you!", img: childImg },
    ],
  },
  {
    question: "How do you want a story to make you feel?",
    options: [
      { label: "Happy 😊", img: joyImg },
      { label: "Surprised 😮", img: surpriseImg },
      { label: "Curious 🔍", img: suspenseImg },
      { label: "A little scared 👻", img: fearImg },
      { label: "Calm & Dreamy ✨", img: calmImg },
    ],
  },
  {
    question: "How long should your stories be?",
    options: [
      "Very short (2-3 minutes) ",
      "Short (4-5 minutes) ",
      "Medium (6-8 minutes) ",
    ],
  },
];

const PreferencesForm = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  // Récupérer userId depuis localStorage
  const userId = localStorage.getItem("userId");
  const kidId =localStorage.getItem("selectedKidId");

  const handleSelect = (option) => {
    const value = option.label || option;
    setAnswers((prev) => ({
      ...prev,
      [step]: step === 3 ? [value] : prev[step]?.includes(value)
        ? prev[step].filter((v) => v !== value)
        : [...(prev[step] || []), value],
    }));
  };

  const handleNext = () => {
    if (step === questions.length - 1) {
      savePreferences();
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => step > 0 && setStep(step - 1);

  const handleSkipAll = () => setShowSkipConfirm(true);

  const confirmSkipAll = () => {
    setShowSkipConfirm(false);
    navigate(`/stories?child=${kidId}`);
    

  };

  const cancelSkipAll = () => setShowSkipConfirm(false);

  const savePreferences = async () => {
    setLoading(true);

    const payload = {
      preferred_genres: answers[0] || [],
      preferred_characters: answers[1] || [],
      preferred_emotions: answers[2] || [],
      preferred_reading_time: answers[3]?.[0] || null
    };

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${userId}/kids/${kidId}/preferences`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const data = await response.json();
        alert(data.message || "Failed to save preferences");
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
  <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">

    {/* Cercle 100% */}
    <div className="relative w-48 h-48 mx-auto mb-8">
      {/* Cercle extérieur */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full rounded-full border-8 border-orange-200"></div>
      </div>

      {/* Cercle intérieur */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-40 h-40 rounded-full bg-orange-500 flex items-center justify-center">
          <span className="text-white text-4xl font-extrabold">100%</span>
        </div>
      </div>
    </div>

    {/* Titre */}
    <h2 className="text-3xl font-bold text-orange-700 mb-6">
      🎉 Setup Complete!
    </h2>
<p className="text-center text-gray-600 max-w-md mb-8">
          Your preferences have been saved successfully. We'll use these to create personalized stories just for you!
        </p>
    {/* Bouton */}
    <button
      onClick={() => navigate(`/stories?child=${kidId}`)}
      className="px-8 py-3 bg-orange-500 text-white rounded-lg text-lg font-medium hover:bg-orange-600 transition disabled:opacity-50"
      disabled={loading}
    >
      Start 
    </button>
  </div>
</div>

    );
  }
const currentQuestion = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center p-5 w-full">
      {showSkipConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4 text-center">This is very important!</h3>
            <p className="text-center text-gray-600 mb-6">
              We <span className="font-bold">strongly recommend</span> that you answer these questions to get the best personalized story experience.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={cancelSkipAll} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={confirmSkipAll} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">Skip All</button>
            </div>
          </div>
        </div>
      )}

      {/* Card */}
      <div className="bg-white w-full max-w-xl rounded-xl shadow-lg overflow-hidden">
        {/* Header with progress */}
        <div className="px-6 pt-6 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">{currentQuestion.question}</h3>
          <button onClick={handleSkipAll} className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50">Skip All</button>
        </div>

        <div className="px-6 mt-4 mb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div className="h-2 bg-orange-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Options */}
        <div className="px-6 grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {currentQuestion.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleSelect(option)}
              className={`flex flex-col items-center border-2 p-2 rounded-xl hover:scale-105 transition-all ${
                answers[step]?.includes(option.label || option)
                  ? "border-orange-500 bg-orange-50 shadow-sm"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {option.img && <img src={option.img} className="w-full h-24 object-cover rounded-lg mb-2" alt="" />}
              <span className="text-gray-800 font-medium text-center text-sm">{option.label || option}</span>
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div className="px-6 pb-6 flex justify-between items-center">
          <div className="flex gap-3">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className={`px-4 py-2 rounded-lg font-medium ${step === 0 ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"}`}
            >
              ← Back
            </button>
          </div>

          <button
            onClick={handleNext}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
          >
            {step === questions.length - 1 ? "Finish 🎯" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesForm;
