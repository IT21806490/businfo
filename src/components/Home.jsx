import React, { useState, useEffect } from "react";
import { Bus, MapPin, Clock, Users, Search, TrendingUp, Shield, Zap, ChevronRight, Star, ArrowRight, Calendar, DollarSign } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import useBlockInspect from "../hooks/useBlockInspect";


// AdSense Placeholder Component
const AdSenseSlot = ({ format = "horizontal", className = "" }) => {
  return (
    <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${className}`}>
      <div className="text-center p-6">
        <p className="text-gray-500 font-medium mb-2">Advertisement</p>
        <p className="text-xs text-gray-400">
          {format === "horizontal" ? "728x90 or 970x90" : format === "vertical" ? "300x600" : "336x280"}
        </p>
        <p className="text-xs text-gray-400 mt-2">Contact for businfo.click</p>
      </div>
    </div>
  );
};

// Main HomePage Component
const HomePage = () => {
  useBlockInspect();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    { name: "Kasun Perera", location: "Colombo", text: "Best bus fare finder in Sri Lanka! Saved me so much time planning my daily commute.", rating: 5 },
    { name: "Nimali Silva", location: "Kandy", text: "Very accurate information. I use it daily for checking routes and fares. Highly recommended!", rating: 5 },
    { name: "Rohan Fernando", location: "Galle", text: "Finally, a reliable source for bus information. The timetables are always up to date.", rating: 5 }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-blue-500/30 backdrop-blur-sm rounded-full text-sm font-medium">
                🚀 Sri Lanka's Most Trusted Bus Information Platform
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                Find Bus Fares & Routes Instantly
              </h1>
              <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
                Access comprehensive bus information across Sri Lanka. Check real-time fares, detailed route maps, accurate timetables, and plan your journey with complete confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/fares" className="inline-flex items-center justify-center px-8 py-4 bg-yellow-400 text-blue-900 font-bold rounded-xl shadow-xl hover:bg-yellow-300 transition-all">
                  Find Fares Now <ChevronRight className="ml-2" />
                </a>
                <a href="/routes" className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all">
                  Explore Routes
                </a>
              </div>
            </div>

            <div className="relative hidden md:block">
              <div className="relative w-full h-96 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-3xl transform rotate-6 opacity-20 blur-xl"></div>
                <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
                  <Bus size={120} className="text-yellow-400 mx-auto" />
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Live bus tracking</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                      <span>Real-time updates</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span>500+ routes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Banner Ad */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdSenseSlot format="horizontal" className="min-h-[90px]" />
      </div>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Trusted by Thousands Across Sri Lanka
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our comprehensive database covers every major bus route in Sri Lanka, providing accurate and up-to-date information to help you travel smarter.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                <Bus className="text-blue-600" size={32} />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">500+</p>
              <p className="text-gray-600 mt-1">Bus Routes</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
                <MapPin className="text-green-600" size={32} />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">2000+</p>
              <p className="text-gray-600 mt-1">Bus Stops</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-2xl mb-4">
                <Clock className="text-yellow-600" size={32} />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">24/7</p>
              <p className="text-gray-600 mt-1">Live Updates</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
                <Users className="text-red-600" size={32} />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">100k+</p>
              <p className="text-gray-600 mt-1">Users</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features with Sidebar Ad */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Everything You Need for Travel
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive bus travel information to make your journey planning easy and efficient.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-6">
                  <Search className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Quick Route Search</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Find the perfect bus route in seconds with detailed fare information and travel times.
                </p>
                <a href="/routes" className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center">
                  Search Routes <ArrowRight size={16} className="ml-2" />
                </a>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mb-6">
                  <DollarSign className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Accurate Fares</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Get precise fare information for any journey including expressway charges.
                </p>
                <a href="/fares" className="text-green-600 font-medium hover:text-green-700 inline-flex items-center">
                  Calculate Fare <ArrowRight size={16} className="ml-2" />
                </a>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl mb-6">
                  <Calendar className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Live Timetables</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Access up-to-date bus schedules and never miss your bus again.
                </p>
                <a href="/timetables" className="text-yellow-600 font-medium hover:text-yellow-700 inline-flex items-center">
                  View Schedules <ArrowRight size={16} className="ml-2" />
                </a>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl mb-6">
                  <Shield className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Verified Data</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  All information is verified and regularly updated by our team.
                </p>
                <a href="/about" className="text-red-600 font-medium hover:text-red-700 inline-flex items-center">
                  Learn More <ArrowRight size={16} className="ml-2" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <AdSenseSlot format="vertical" className="min-h-[600px] hidden lg:flex" />
                <AdSenseSlot format="rectangle" className="min-h-[280px] lg:hidden" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mid Content Ad */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdSenseSlot format="horizontal" className="min-h-[90px]" />
      </div>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              How to Use Businfo.click
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Finding your perfect bus route is simple in three easy steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-2xl font-bold mb-6">
                1
              </div>
              <Bus className="text-blue-600 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Enter Journey</h3>
              <p className="text-gray-600 leading-relaxed">
                Type your starting point and destination to begin your search.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full text-2xl font-bold mb-6">
                2
              </div>
              <MapPin className="text-green-600 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-gray-900 mb-3">View Routes</h3>
              <p className="text-gray-600 leading-relaxed">
                Browse all available routes with complete details and fares.
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-600 text-white rounded-full text-2xl font-bold mb-6">
                3
              </div>
              <Zap className="text-yellow-600 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Travel Smart</h3>
              <p className="text-gray-600 leading-relaxed">
                Plan your journey with confidence using accurate information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Ad */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdSenseSlot format="horizontal" className="min-h-[90px]" />
      </div>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-12">
            What Our Users Say
          </h2>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12 border border-white/20">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={24} className="fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-xl md:text-2xl mb-6 italic">
              {testimonials[activeTestimonial].text}
            </p>
            <p className="font-bold text-lg">{testimonials[activeTestimonial].name}</p>
            <p className="text-blue-200">{testimonials[activeTestimonial].location}</p>
            
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeTestimonial ? 'bg-yellow-400 w-8' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-yellow-400 to-yellow-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg md:text-xl text-blue-800 mb-8">
            Join over 100,000 satisfied users who trust Businfo.click
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/fares" className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-xl hover:bg-blue-700 transition-all">
              Find Your Fare <ChevronRight className="ml-2" />
            </a>
            <a href="/routes" className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all">
              Browse Routes
            </a>
          </div>
        </div>
      </section>

      <Footer />
      
    </div>
  );
};

export default HomePage;