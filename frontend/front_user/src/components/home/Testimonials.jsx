import React from "react";
import { Star, Quote, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

const Testimonials = ({ darkMode }) => {
  const testimonials = [
    {
      name: "Amal Ben Saad",
      role: "Parent – Sfax",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
      text: "StoryTale helped my daughter learn 50+ new words in just one month while genuinely enjoying the stories! The vocabulary games are brilliant.",
      rating: 5,
      accent: "from-blue-500 to-cyan-400",
    },
    {
      name: "Mourad Khelifi",
      role: "Elementary Teacher – Tunis",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
      text: "I use StoryTale in my classroom daily. The AI adapts perfectly to different reading levels, making differentiated instruction much easier.",
      rating: 5,
      accent: "from-purple-500 to-pink-500",
    },
    {
      name: "Sarah Lahmar",
      role: "Parent – Sousse",
      image: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w-400&h=400&fit=crop&crop=face",
      text: "My twins (6 & 8) both love StoryTale. One reads advanced stories while the other gets simplified versions. Perfect for siblings with different abilities!",
      rating: 5,
      accent: "from-orange-500 to-amber-400",
    },
    {
      name: "Karim Trabelsi",
      role: "Language Specialist – Bizerte",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      text: "The progress tracking dashboard gives me clear insights into each child's development. As an educator, I appreciate the detailed analytics.",
      rating: 5,
      accent: "from-green-500 to-emerald-400",
    },
  ];

  return (
    <section className={`py-16 md:py-24 relative ${darkMode ? 'bg-gradient-to-b from-gray-900 to-black' : 'bg-gradient-to-b from-purple-50 to-white'}`}>
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#FF8A3D] to-[#FF6B2B] text-white mb-4">
            <Quote className="w-4 h-4" />
            <span className="text-sm font-semibold">Testimonials</span>
          </div>
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Loved by <span className="bg-gradient-to-r from-[#FF8A3D] to-[#FF6B2B] bg-clip-text text-transparent">Parents & Educators</span>
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Join thousands of families across Tunisia who help their kids grow through joyful reading.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`group relative p-6 rounded-2xl transition-all duration-300 hover:-translate-y-2 ${
                darkMode 
                  ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:bg-gray-800' 
                  : 'bg-white shadow-lg hover:shadow-2xl border border-gray-100'
              }`}
            >
              {/* Quote icon */}
              <div className={`absolute -top-3 -left-3 w-12 h-12 rounded-full flex items-center justify-center ${
                darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-[#FF8A3D] to-[#FF6B2B]'
              }`}>
                <Quote className="w-5 h-5 text-white" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#FF8A3D] text-[#FF8A3D]" />
                ))}
              </div>

              {/* Testimonial text */}
              <p className={`text-lg mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r ${testimonial.accent} flex items-center justify-center`}>
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {testimonial.name}
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {testimonial.role}
                  </p>
                </div>
              </div>

              {/* Accent decoration */}
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${testimonial.accent} opacity-5 rounded-full -translate-y-6 translate-x-6`}></div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className={`mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-2xl ${
          darkMode 
            ? 'bg-gray-800/30 border border-gray-700' 
            : 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100'
        }`}>
          {[
            { value: "10K+", label: "Happy Kids" },
            { value: "500+", label: "Interactive Stories" },
            { value: "98%", label: "Parent Satisfaction" },
            { value: "50+", label: "Learning Games" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-3xl md:text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stat.value}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <button className={`px-8 py-4 rounded-full font-semibold transition-all ${
            darkMode 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-purple-500/25' 
              : 'bg-gradient-to-r from-[#FF8A3D] to-[#FF6B2B] hover:shadow-orange-500/25'
          } text-white hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2 mx-auto`}>
            <Sparkles className="w-5 h-5" />
            Join StoryTale Today
          </button>
          <p className={`mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Start your child's reading adventure with a 14-day free trial
          </p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;