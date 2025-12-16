import React from "react";

const Header = () => {
  return (
    <header className="w-full flex items-center justify-between px-6 md:px-20 py-4 bg-white shadow-md sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-300 rounded-full flex items-center justify-center font-bold text-white">
          ST
        </div>
        <span className="text-purple-900 font-bold text-xl">StoryTale</span>
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex gap-8 text-purple-900 font-medium">
        <a href="#home" className="hover:text-orange-400 transition">Home</a>
        <a href="#stories" className="hover:text-orange-400 transition">Stories</a>
        <a href="#about" className="hover:text-orange-400 transition">About</a>
        <a href="#contact" className="hover:text-orange-400 transition">Contact</a>
      </nav>

      {/* Action Button */}
      <div className="hidden md:block">
        <button className="bg-[#FF8A3D] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#FF7A1B] shadow-md transition"
>
          Sign In
        </button>
      </div>

      {/* Mobile Burger */}
      <div className="md:hidden">
        <button className="text-purple-900 font-bold text-2xl">☰</button>
      </div>
    </header>
  );
};

export default Header;
