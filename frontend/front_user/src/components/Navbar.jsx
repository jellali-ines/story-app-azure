import { useState } from "react";
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  BookOpenIcon,
  HomeIcon,
  HeartIcon,
} from "@heroicons/react/24/solid";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* LOGO */}
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-orange-500">StoryTale</h1>
        </div>

        {/* DESKTOP NAV LINKS */}
        <nav className="hidden md:flex items-center gap-8 font-medium text-gray-700">

          <button className="flex items-center gap-1 hover:text-orange-500 transition">
            <HomeIcon className="h-5 w-5" /> Home
          </button>

          <button className="flex items-center gap-1 hover:text-orange-500 transition">
            <BookOpenIcon className="h-5 w-5" /> Library
          </button>

          <button className="flex items-center gap-1 hover:text-orange-500 transition">
            <HeartIcon className="h-5 w-5" /> Playlist
          </button>

          {/* SEARCH BAR */}
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-64">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search stories..."
              className="bg-transparent outline-none ml-2 w-full"
            />
          </div>
        </nav>

        {/* PROFILE */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            <UserCircleIcon className="h-7 w-7 text-gray-600" />
            <span className="font-medium">Kid</span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 bg-white w-48 rounded-lg shadow-lg border border-gray-200 z-20">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                Edit Profile
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                Logout
              </button>
            </div>
          )}
        </div>

        {/* MOBILE BURGER */}
        <button
          className="md:hidden p-2 rounded-md bg-gray-100"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 p-4 space-y-3">

          <button className="flex items-center gap-2 w-full py-2 hover:text-orange-500">
            <HomeIcon className="h-5 w-5" /> Home
          </button>

          <button className="flex items-center gap-2 w-full py-2 hover:text-orange-500">
            <BookOpenIcon className="h-5 w-5" /> Library
          </button>

          <button className="flex items-center gap-2 w-full py-2 hover:text-orange-500">
            <HeartIcon className="h-5 w-5" /> Playlist
          </button>

          {/* Search */}
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none ml-2 w-full"
            />
          </div>

          <hr className="border-gray-300" />

          {/* PROFILE MOBILE */}
          <button className="flex items-center gap-2 w-full py-2 hover:text-orange-500">
            <UserCircleIcon className="h-5 w-5" /> Edit Profile
          </button>
          <button className="flex items-center gap-2 w-full py-2 text-red-500">
            <ArrowLeftOnRectangleIcon className="h-5 w-5" /> Logout
          </button>
        </div>
      )}
    </header>
  );
}
