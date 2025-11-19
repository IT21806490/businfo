// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Bus } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg py-3" : "bg-white/95 backdrop-blur-sm py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <Bus className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Businfo.click</h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Sri Lanka's #1 Bus Guide
              </p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="/" className="text-gray-700 hover:text-blue-600 font-medium">Home</a>
            <a href="/fares" className="text-gray-700 hover:text-blue-600 font-medium">Fares</a>
            <a href="/routes" className="text-gray-700 hover:text-blue-600 font-medium">Routes</a>
            <a href="/normal-time" className="text-gray-700 hover:text-blue-600 font-medium">Timetables</a>
            <a href="/blogs" className="text-gray-700 hover:text-blue-600 font-medium">Blog</a>

            {/* Normal Fares Button - Matched Hero Blue */}
            <a
              href="/fares"
              className="px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900 
              shadow-md hover:shadow-lg hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 transition-all duration-200"
            >
              Normal Fares
            </a>

            {/* Highway Fares Button - Matched Hero Orange */}
            <a
              href="/highway-fares"
              className="px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-600 via-orange-700 to-orange-900 
              shadow-md hover:shadow-lg hover:from-orange-700 hover:via-orange-800 hover:to-orange-900 transition-all duration-200"
            >
              Highway Fares
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3">
            <a href="/" className="block text-gray-700 hover:text-blue-600 font-medium">Home</a>
            <a href="/fares" className="block text-gray-700 hover:text-blue-600 font-medium">Fares</a>
            <a href="/routes" className="block text-gray-700 hover:text-blue-600 font-medium">Routes</a>
            <a href="/timetables" className="block text-gray-700 hover:text-blue-600 font-medium">Timetables</a>
            <a href="/blogs" className="block text-gray-700 hover:text-blue-600 font-medium">Blog</a>

            {/* Mobile Normal Fares */}
            <a
              href="/fares"
              className="block px-5 py-2.5 rounded-xl font-semibold text-white text-center 
              bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900 shadow-md 
              hover:shadow-lg hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 transition-all duration-200"
            >
              Normal Fares
            </a>

            {/* Mobile Highway Fares */}
            <a
              href="/highway-fares"
              className="block px-5 py-2.5 rounded-xl font-semibold text-white text-center 
              bg-gradient-to-r from-orange-600 via-orange-700 to-orange-900 shadow-md 
              hover:shadow-lg hover:from-orange-700 hover:via-orange-800 hover:to-orange-900 transition-all duration-200"
            >
              Highway Fares
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
