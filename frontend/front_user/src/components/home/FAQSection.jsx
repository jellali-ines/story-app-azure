import React, { useState } from "react";
import { HelpCircle, ChevronDown, Sparkles } from "lucide-react";

const FAQSection = ({ darkMode }) => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    { 
      q: "What is StoryTale?", 
      a: "StoryTale is an interactive storytelling platform that uses AI to create personalized, educational stories for children. We combine fun narratives with language learning to boost reading skills." 
    },
    { 
      q: "Is StoryTale safe for kids?", 
      a: "Absolutely! All content is carefully reviewed by our team of educators and parents. We have strict content guidelines, no ads, and a completely child-friendly interface." 
    },
    { 
      q: "How does the AI help my child learn?", 
      a: "Our AI adapts story difficulty based on reading level, introduces new vocabulary in context, and creates personalized reading recommendations. It also generates interactive questions to improve comprehension." 
    },
    { 
      q: "What age group is StoryTale for?", 
      a: "StoryTale is designed for children aged 4-12. We have different difficulty levels and content categories to suit various age groups and reading abilities." 
    },
    { 
      q: "Can I track my child's progress?", 
      a: "Yes! Parents get access to a dashboard showing reading time, new words learned, comprehension scores, and personalized recommendations for improvement." 
    },
    { 
      q: "Do you offer offline access?", 
      a: "Yes, you can download stories for offline reading. Our mobile app allows access without internet connection, perfect for car rides or travel." 
    },
  ];

  return (
    <section className={`py-16 md:py-24 ${darkMode ? 'bg-gradient-to-b from-black to-gray-900' : 'bg-gradient-to-b from-white to-purple-50'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Frequently Asked <span className="bg-gradient-to-r from-[#FF8A3D] to-[#FF6B2B] bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-8`}>
            Find answers to common questions about StoryTale
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`rounded-xl overflow-hidden transition-all duration-300 ${
                darkMode 
                  ? openIndex === index 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-gray-800/50 hover:bg-gray-800'
                  : openIndex === index 
                    ? 'bg-white shadow-lg border border-gray-200' 
                    : 'bg-white/50 hover:bg-white'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full flex justify-between items-center p-6 text-left"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-gray-700' : 'bg-purple-100'
                  }`}>
                    <span className={`font-bold ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                      {index + 1}
                    </span>
                  </div>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {faq.q}
                  </h3>
                </div>
                <ChevronDown 
                  className={`w-5 h-5 transition-transform ${darkMode ? 'text-gray-400' : 'text-gray-500'} ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <div className={`pl-12 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {faq.a}
                  </div>
                  {index === 0 && (
                    <div className="mt-4 pl-12">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                        darkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-600'
                      }`}>
                        <Sparkles className="w-3 h-3" />
                        Try it free for 14 days
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={`mt-12 p-6 rounded-2xl text-center ${
          darkMode 
            ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-700/50' 
            : 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100'
        }`}>
          <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Still have questions?
          </h3>
          <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Our support team is here to help you 7 days a week.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className={`px-6 py-3 rounded-full font-semibold transition-all ${
              darkMode 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-purple-500/25' 
                : 'bg-gradient-to-r from-[#FF8A3D] to-[#FF6B2B] hover:shadow-orange-500/25'
            } text-white hover:shadow-lg hover:scale-105`}>
              Contact Support
            </button>
            <button className={`px-6 py-3 rounded-full font-semibold ${
              darkMode 
                ? 'text-purple-300 hover:bg-purple-900/30' 
                : 'text-purple-600 hover:bg-purple-100'
            } transition-colors`}>
              Browse Help Center
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;