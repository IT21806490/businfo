import React, { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import logoImage from "../images/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [faresDropdown, setFaresDropdown] = useState(false);
  const menuRef = useRef(null);
  const [menuHeight, setMenuHeight] = useState(0);

  // Calculate height dynamically for smooth slide
  useEffect(() => {
    if (menuRef.current) {
      setMenuHeight(menuRef.current.scrollHeight);
    }
  }, [isOpen]);

  return (
    <header className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-4 md:py-6">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img
            src={logoImage}
            alt="BUSINFO.CLICK Logo"
            className="w-10 h-10 md:w-12 md:h-12 object-contain"
          />
          <h1 className="text-2xl md:text-3xl font-extrabold">Businfo.Click</h1>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-8 font-medium text-base md:text-lg items-center">
          <a href="/" className="hover:text-yellow-400 transition">
            Home
          </a>

          {/* Desktop Fares Dropdown on Hover */}
          <div className="relative group">
            <button className="flex items-center space-x-1 px-2 py-1 hover:text-yellow-400 transition font-semibold cursor-default">
              <span>Fares</span>
              <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
            </button>

            <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
              <a
                href="/fares"
                className="block px-4 py-2 hover:bg-gray-700 rounded-t-lg transition font-medium"
              >
                Normal way
              </a>
              <a
                href="/highway-fares"
                className="block px-4 py-2 hover:bg-gray-700 rounded-b-lg transition font-medium"
              >
                Expressway
              </a>
            </div>
          </div>

          <a href="/routes" className="hover:text-yellow-400 transition">
            Routes
          </a>
          <a href="/contact" className="hover:text-yellow-400 transition">
            Contact
          </a>
        </nav>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        ref={menuRef}
        className={`md:hidden overflow-hidden bg-gray-800 transition-all duration-300 ease-in-out`}
        style={{
          maxHeight: isOpen ? `${menuHeight}px` : "0px",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <a
          href="/"
          className="block px-4 py-2 hover:text-yellow-400 transition-opacity duration-300"
        >
          Home
        </a>

        {/* Mobile Fares */}
        <div className="relative">
          <button
            onClick={() => setFaresDropdown(!faresDropdown)}
            className="w-full text-left px-4 py-2 hover:text-yellow-400 flex justify-between items-center font-semibold"
          >
            <span>Fares</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${
                faresDropdown ? "rotate-180" : ""
              }`}
            />
          </button>
          {faresDropdown && (
            <div className="bg-gray-700 ml-2 rounded shadow-lg">
              <a
                href="/fares"
                className="block px-4 py-2 hover:bg-gray-600 transition font-medium"
              >
                Normal Way
              </a>
              <a
                href="/highway-fares"
                className="block px-4 py-2 hover:bg-gray-600 transition font-medium"
              >
                Expressway
              </a>
            </div>
          )}
        </div>

        <a
          href="/routes"
          className="block px-4 py-2 hover:text-yellow-400 transition-opacity duration-300"
        >
          Routes
        </a>
        <a
          href="/contact"
          className="block px-4 py-2 hover:text-yellow-400 transition-opacity duration-300"
        >
          Contact
        </a>
      </div>

      {/* Tailwind Keyframe Animation */}
      <style jsx>{`
        @keyframes slideBounce {
          0% {
            transform: translateY(-20px);
            opacity: 0;
          }
          60% {
            transform: translateY(10px);
            opacity: 1;
          }
          80% {
            transform: translateY(-5px);
          }
          100% {
            transform: translateY(0);
          }
        }
        .animate-slideBounce {
          animation: slideBounce 0.4s ease forwards;
        }
      `}</style>
    </header>
  );
};

export default Navbar;
