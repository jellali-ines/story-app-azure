import { useState } from "react";

const faqs = [
  { 
    q: "What is StoryTale?", 
    a: "StoryTale is a platform that offers interactive, AI-powered stories designed to help children improve reading and language skills." 
  },
  { 
    q: "Is StoryTale safe for kids?", 
    a: "Absolutely. All stories, visuals, and activities are carefully reviewed to ensure they are child-friendly and educational." 
  },
  { 
    q: "How does the AI help my child learn?", 
    a: "The AI adapts stories based on reading level, highlights new vocabulary, and offers personalized exercises." 
  },
  { 
    q: "Can my child use StoryTale on any device?", 
    a: "Yes! StoryTale works on phones, tablets, and computers for easy learning anywhere." 
  },
];

const FAQItem = ({ faq, isOpen, onClick }) => (
  <div className="border-b border-gray-200">
    <button
      onClick={onClick}
      className="w-full flex justify-between items-center py-4 px-5 bg-orange-50 hover:bg-orange-100 rounded-lg transition"
    >
      <span className="font-semibold text-[#26024D]">{faq.q}</span>
      <span className="text-xl font-bold">{isOpen ? "-" : "+"}</span>
    </button>
    {isOpen && (
      <div className="px-5 py-3 text-gray-700 bg-orange-50 rounded-b-lg animate-fadeIn">
        {faq.a}
      </div>
    )}
  </div>
);

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full max-w-4xl mx-auto my-16 px-4">
<h2 className="text-4xl font-bold text-[#3E1F92] mb-8 text-center">
Frequently Asked Questions
</h2>


<div className="space-y-4">
{faqs.map((faq, index) => (
<div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
<button
onClick={() => toggle(index)}
className="w-full flex justify-between items-center py-4 px-5 bg-[#FFF6E9] hover:bg-[#FFECD2] transition"
>
<span className="font-semibold text-[#3E1F92]">{faq.q}</span>
<span className="text-xl font-bold">{openIndex === index ? "-" : "+"}</span>
</button>
{openIndex === index && (
<div className="px-5 py-3 text-gray-700 bg-[#FFF9F1]">
{faq.a}
</div>
)}
</div>
))}
</div>
</section>
  );
};

export default FAQSection;
