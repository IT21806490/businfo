// src/components/Footer.jsx
import React from "react";
import { Bus } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Branding */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Bus className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Businfo.click</h3>
            </div>
            <p className="text-sm text-gray-400">
              Your trusted companion for hassle-free bus travel across Sri Lanka.
              Real-time information at your fingertips.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-blue-400">Home</a></li>
              <li><a href="/fares" className="hover:text-blue-400">Find Fares</a></li>
              <li><a href="/routes" className="hover:text-blue-400">Bus Routes</a></li>
              <li><a href="/about" className="hover:text-blue-400">About Us</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/fares" className="hover:text-blue-400">Normal Way Fares</a></li>
              <li><a href="/highway-fares" className="hover:text-blue-400">Expressway Fares</a></li>
              <li><a href="/routes" className="hover:text-blue-400">Route Planning</a></li>
              <li><a href="/contact" className="hover:text-blue-400">Contact Support</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/privacy" className="hover:text-blue-400">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-blue-400">Terms of Service</a></li>
              <li><a href="/disclaimer" className="hover:text-blue-400">Disclaimer</a></li>
              <li><a href="/contact" className="hover:text-blue-400">Contact Us</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© {currentYear} Businfo.click. All rights reserved. Made with ❤️ for Sri Lankan travelers</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
