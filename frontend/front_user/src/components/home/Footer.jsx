import React from "react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 shadow-sm mt-10">
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-6">
        
        {/* TOP: Logo + Menu */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <a className="flex items-center mb-4 sm:mb-0">
            <span className="self-center text-2xl font-bold text-orange-600">
              Read The Story
            </span>
          </a>

          <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-700 sm:mb-0">
            <li>
              <a href="#" className="hover:text-orange-600 me-4 md:me-6">About</a>
            </li>
            <li>
              <a href="#" className="hover:text-orange-600 me-4 md:me-6">Privacy Policy</a>
            </li>
            <li>
              <a href="#" className="hover:text-orange-600 me-4 md:me-6">Licensing</a>
            </li>
            <li>
              <a href="#" className="hover:text-orange-600">Contact</a>
            </li>
          </ul>
        </div>

        {/* SEPARATOR */}
        <hr className="my-6 border-gray-300 sm:mx-auto" />

        {/* COPYRIGHT */}
        <span className="block text-sm text-gray-600 sm:text-center">
          © 2025 <span className="text-orange-600 font-semibold">Read The Story</span>. All Rights Reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
