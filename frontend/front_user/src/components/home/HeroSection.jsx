import React from "react";
import { BookOpen, Sparkles, ChevronRight } from "lucide-react";
import heroImg from "../../assets/img1.png";

const HeroSection = ({ onSignInClick, darkMode}) => {
  // Couleurs par défaut avec support dark mode
  const textPrimary = darkMode ? "text-white" : "text-[#3E1F92]";
  const textSecondary = darkMode ? "text-gray-300" : "text-[#5B4E8C]";
  const bgSecondary = darkMode ? "bg-purple-900/20" : "bg-[#FFE8F2]";
  
  return (
    <section className={`relative w-full min-h-[90vh] overflow-hidden flex flex-col px-4 md:px-8 lg:px-20 ${darkMode ? 'bg-gradient-to-b from-gray-900 to-black' : 'bg-gradient-to-b from-white to-purple-50'}`}>
      {/* HEADER */}
      <div className="w-full flex items-center justify-between py-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${darkMode ? 'bg-purple-900/40' : 'bg-purple-100'}`}>
            <Sparkles className={`w-6 h-6 ${darkMode ? 'text-purple-300' : 'text-[#3E1F92]'}`} />
          </div>
          <span className={`font-bold text-2xl ${textPrimary}`}>StoryTale</span>
        </div>

        <nav className="hidden md:flex gap-6 font-medium">
          {["Home", "Stories", "Genres", "Playlist", "Practice"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className={`${textPrimary} hover:text-[#FF8A3D] transition-colors px-3 py-1 rounded-lg ${darkMode ? 'hover:bg-purple-900/30' : 'hover:bg-purple-50'}`}
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <button
            onClick={onSignInClick}
            className="bg-gradient-to-r from-[#FF8A3D] to-[#FF6B2B] text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all shadow-md"
          >
            Sign In
          </button>
        </div>

        <button className="md:hidden p-2 rounded-lg bg-white/10 backdrop-blur-sm">
          <span className={`text-2xl ${textPrimary}`}>☰</span>
        </button>
      </div>

      {/* Content */}
      <div className="relative flex flex-col lg:flex-row items-center justify-between gap-10 z-10 my-auto py-10">
        {/* TEXT */}
        <div className="lg:w-1/2 flex flex-col gap-6 text-center lg:text-left">
          <div className={`inline-flex items-center gap-2 ${bgSecondary} px-4 py-2 rounded-full w-fit mx-auto lg:mx-0`}>
            <Sparkles className="w-4 h-4 text-[#FF8A3D]" />
            <span className={`font-semibold text-sm ${textPrimary}`}>
              Fun Learning for Kids
            </span>
          </div>

          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${textPrimary} leading-tight`}>
            Discover Magical <br />
            <span className="bg-gradient-to-r from-[#FF8A3D] to-[#FF6B2B] bg-clip-text text-transparent">
              Stories & Adventures
            </span>
          </h1>

          <p className={`text-lg ${textSecondary} max-w-lg mx-auto lg:mx-0`}>
            Interactive, educational, and safe stories designed to help children read, learn, and explore with joy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button className="group bg-gradient-to-r from-[#FF8A3D] to-[#FF6B2B] text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5" />
              Start Reading
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className={`${textPrimary} font-medium hover:text-[#FF8A3D] transition-colors px-6 py-3`}>
              Learn More →
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 justify-center lg:justify-start mt-8">
            <div className="text-center">
              <div className={`text-3xl font-bold ${textPrimary}`}>500+</div>
              <div className={`text-sm ${textSecondary}`}>Stories</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${textPrimary}`}>50K+</div>
              <div className={`text-sm ${textSecondary}`}>Happy Kids</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${textPrimary}`}>100+</div>
              <div className={`text-sm ${textSecondary}`}>Learning Games</div>
            </div>
          </div>
        </div>

        {/* IMAGE */}
        <div className="lg:w-1/2 flex justify-center lg:justify-end relative">
          <div className="relative">
            {/* Floating decoration */}
            <div className={`absolute -top-6 -left-6 w-24 h-24 rounded-full ${darkMode ? 'bg-purple-900/30' : 'bg-purple-100'} blur-xl`}></div>
            <div className={`absolute -bottom-6 -right-6 w-32 h-32 rounded-full ${darkMode ? 'bg-orange-900/20' : 'bg-orange-100'} blur-xl`}></div>
            
            <img
              src={heroImg}
              alt="Kids reading"
              className="relative w-full max-w-md lg:max-w-lg rounded-3xl shadow-2xl hover:scale-[1.02] transition-transform duration-500 z-10"
            />
            
            {/* Floating badge */}
            <div className={`absolute -bottom-4 -right-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-3 rounded-2xl shadow-xl z-20`}>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FF8A3D] to-[#FF6B2B] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-sm">Interactive</div>
                  <div className="text-xs text-gray-500">Reading</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path 
            fill={darkMode ? "#1f2937" : "#ffffff"} 
            fillOpacity="1" 
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;