import React from "react";
import { Book, Brain, Gamepad2, Star, Sparkles, Shield, Users, Target } from "lucide-react";

const FeaturesSection = ({ darkMode }) => {
  const features = [
    {
      title: "Safe & Kid-Friendly",
      description: "All content is carefully selected to be age-appropriate, safe, and fun.",
      icon: <Shield className="w-8 h-8" />,
      gradient: "from-blue-500 to-cyan-400",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "AI Language Boost",
      description: "Smart AI adapts stories to your child's reading level and supports vocabulary.",
      icon: <Brain className="w-8 h-8" />,
      gradient: "from-purple-500 to-pink-500",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: "Interactive Learning",
      description: "Mini-games and activities make learning playful and memorable.",
      icon: <Gamepad2 className="w-8 h-8" />,
      gradient: "from-green-500 to-emerald-400",
      iconBg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Personalized Journey",
      description: "Recommendations and progress tracking tailored to each child.",
      icon: <Target className="w-8 h-8" />,
      gradient: "from-orange-500 to-amber-400",
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
    },
    {
      title: "Vast Story Library",
      description: "500+ stories across genres from fairy tales to educational adventures.",
      icon: <Book className="w-8 h-8" />,
      gradient: "from-red-500 to-rose-400",
      iconBg: "bg-red-100 dark:bg-red-900/30",
    },
    {
      title: "Parent Community",
      description: "Connect with other parents and share reading experiences.",
      icon: <Users className="w-8 h-8" />,
      gradient: "from-indigo-500 to-violet-400",
      iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
    },
  ];

  return (
    <section className={`py-16 md:py-24 ${darkMode ? 'bg-gradient-to-b from-gray-900 to-black' : 'bg-gradient-to-b from-purple-50 to-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#FF8A3D] to-[#FF6B2B] text-white mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Why Choose Us</span>
          </div>
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Everything Kids Love About <span className="bg-gradient-to-r from-[#FF8A3D] to-[#FF6B2B] bg-clip-text text-transparent">StoryTale</span>
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Designed to help children learn faster, read better, and enjoy every moment of discovery.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative p-6 rounded-2xl transition-all duration-300 hover:-translate-y-2 ${
                darkMode 
                  ? 'bg-gray-800/50 backdrop-blur-sm hover:bg-gray-800 border border-gray-700' 
                  : 'bg-white hover:shadow-2xl shadow-lg border border-gray-100'
              }`}
            >
              {/* Icon */}
              <div className={`w-16 h-16 rounded-xl ${feature.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <div className={`bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                  {feature.icon}
                </div>
              </div>

              {/* Content */}
              <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {feature.title}
              </h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                {feature.description}
              </p>

              {/* Learn More Link */}
              <div className="flex items-center text-sm font-medium text-[#FF8A3D] opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more
                <span className="ml-1">→</span>
              </div>

              {/* Decorative corner */}
              <div className={`absolute top-0 right-0 w-12 h-12 rounded-bl-2xl ${
                darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;