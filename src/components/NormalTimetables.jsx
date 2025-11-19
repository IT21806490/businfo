import React, { useState, useEffect, useRef, useCallback } from "react";
import timetableNormal from "../data/timetable_normal.json";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Bus, RefreshCw, Trash2, MapPin, Clock, TrendingUp, ArrowRight, ChevronRight, Star, Award, Users, Zap, AlertCircle, X as CloseIcon, ChevronDown, ChevronUp } from "lucide-react";
import useBlockInspect from "../hooks/useBlockInspect";

const NormalTimetables = () => {
  useBlockInspect();

  // State for data and filtering
  const [groupedTimetables, setGroupedTimetables] = useState([]);
  const [filteredTimetables, setFilteredTimetables] = useState([]);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 2;

  // State for UI/UX
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [language, setLanguage] = useState("en");
  const [expandedRoutes, setExpandedRoutes] = useState({});
  const [isLoading, setIsLoading] = useState(true); // NEW: Loading state for initial animation

  const originRef = useRef(null);
  const destinationRef = useRef(null);
  const searchCardRef = useRef(null);
  const debounceTimer = useRef(null);

  const tips = {
    en: "This page shows all normal bus timetables for your travel needs. Departure times are sorted for easy planning. Compare different routes to find the best schedule.",
    si: "මෙහිදී ඔබගේ ගමන් අවශ්‍යතාව සදහා සාමාන්‍ය බස් වේලා සටහන් සියල්ල පෙන්වන අතර, පිටවීම් වේලාවන් සුබට කිරීම සඳහා වින්‍යාස කර ඇත.",
    ta: "இந்தப் பக்கம் உங்கள் பயணத் தேவைகளுக்கான அனைத்து சாதாரண பேருந்து நேர அட்டவணைகளையும் காட்டுகிறது.",
  };

  const languages = [
    { code: "en", label: "English" },
    { code: "si", label: "සිංහල" },
    { code: "ta", label: "தமிழ்" },
  ];

  // Refactored timeToMinutes to useCallback
  const timeToMinutes = useCallback((time12hr) => {
    if (!time12hr || typeof time12hr !== "string") return 0;
    const parts = time12hr.match(/(\d+)[.:](\d+)\s*(AM|PM)/i);
    if (!parts) return 0;
    let hour = parseInt(parts[1], 10);
    const minute = parseInt(parts[2], 10);
    const period = parts[3].toUpperCase();
    if (period === "PM" && hour < 12) hour += 12;
    else if (period === "AM" && hour === 12) hour = 0;
    return hour * 60 + minute;
  }, []);

  // Group timetables and prepare suggestions (Run once on mount)
  useEffect(() => {
    setIsLoading(true); // Start loading

    const startTime = Date.now();

    const grouped = timetableNormal.reduce((acc, t) => {
      const routeNo = t.route_no;
      const originVal = t.origin || "N/A";
      const destinationVal = t.destination || "N/A";
      const via = t.via ? t.via.trim() : "";
      // Use a unique key for the route card
      const key = `${routeNo}-${originVal}-${destinationVal}-${via}`;

      if (!acc[key]) {
        acc[key] = { route_no: routeNo, origin: originVal, destination: destinationVal, via, schedules: [], key }; // Added key to route object
      }

      acc[key].schedules.push({
        departure_time: t.departure_time || "N/A",
        from: t.origin || "N/A",
        sort_key: timeToMinutes(t.departure_time),
      });

      return acc;
    }, {});

    const finalGroupedArray = Object.values(grouped).map((route) => ({
      ...route,
      route_name: `${route.origin} ➜ ${route.destination}${route.via ? ` via ${route.via}` : ""}`,
      schedules: route.schedules.sort((a, b) => a.sort_key - b.sort_key),
    }));

    setGroupedTimetables(finalGroupedArray);
    setFilteredTimetables(finalGroupedArray);

    const origins = [...new Set(finalGroupedArray.map((r) => r.origin))];
    const destinations = [...new Set(finalGroupedArray.map((r) => r.destination))];
    setOriginSuggestions(origins);
    setDestinationSuggestions(destinations);

    // Ensure a minimum delay for the animation effect (e.g., 300ms)
    const delay = 300 - (Date.now() - startTime);
    setTimeout(() => setIsLoading(false), Math.max(0, delay));

  }, [timeToMinutes]); // Dependency added for useCallback

  // Filter timetables based on origin/destination search (Debounced)
  useEffect(() => {
    // Basic debounce logic to avoid filtering on every keystroke
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {

      if (!origin && !destination) {
        setFilteredTimetables(groupedTimetables);
        return;
      }

      const filtered = groupedTimetables.filter((route) => {
        const originMatch = origin ? route.origin.toLowerCase().includes(origin.toLowerCase()) : true;
        const destinationMatch = destination ? route.destination.toLowerCase().includes(destination.toLowerCase()) : true;
        return originMatch && destinationMatch;
      });

      setFilteredTimetables(filtered);
      setCurrentPage(1);
      setExpandedRoutes({}); // Reset expansion when filters change

    }, 250); // 250ms debounce time

    return () => clearTimeout(debounceTimer.current);

  }, [origin, destination, groupedTimetables]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (originRef.current && !originRef.current.contains(event.target)) setShowOriginSuggestions(false);
      if (destinationRef.current && !destinationRef.current.contains(event.target)) setShowDestinationSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectOrigin = (val) => {
    setOrigin(val);
    setShowOriginSuggestions(false);
  };
  const selectDestination = (val) => {
    setDestination(val);
    setShowDestinationSuggestions(false);
  };
  const swapOriginDestination = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };
  const clearSelections = () => {
    setOrigin("");
    setDestination("");
  };

  // Toggles the expanded state for a specific route
  const toggleScheduleExpansion = (routeKey) => {
    setExpandedRoutes(prev => ({
      ...prev,
      [routeKey]: !prev[routeKey],
    }));
  };

  // Pagination
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredTimetables.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(filteredTimetables.length / cardsPerPage);

  // Conditional styling for animation when data is ready
  const contentClasses = isLoading
    ? "opacity-0 transform translate-y-4 transition-all duration-700 ease-out"
    : "opacity-100 transform translate-y-0 transition-all duration-700 ease-out";


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      <Navbar />

      <section className="pt-24 pb-12 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white relative overflow-hidden">
        {/* ... Background/Blur ... */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            {/* THIS DIV WRAPS THE HERO TEXT AND APPLIES THE SLIDE-DOWN ANIMATION */}
          <div className={`text-center mb-6 ${contentClasses}`}>
            <div className="inline-block px-4 py-2 bg-blue-500/30 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              🚍 Sri Lanka's #1 Bus Timetable Finder
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
              Normal Bus Timetables & Schedules
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Get instant access to {groupedTimetables.length}+ normal bus schedules, real-time departures, and expert travel tips
            </p>
          </div>
        </div>
      </section>

    {/* -------------------- Main Content Starts Here -------------------- */}

      {/* Trust Badges */}
      <section className={`bg-white py-8 shadow-sm ${contentClasses}`}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 text-center">
          <div className="p-4 rounded-xl bg-blue-50 shadow-md hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer">
            <Users size={32} className="mx-auto text-blue-600 mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-blue-700">{groupedTimetables.length}+</p>
            <p className="text-gray-600 text-sm sm:text-base font-semibold">Timetables Available</p>
          </div>
          <div className="p-4 rounded-xl bg-green-50 shadow-md hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer">
            <Star size={32} className="mx-auto text-green-600 mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-green-700">{originSuggestions.length}+</p>
            <p className="text-gray-600 text-sm sm:text-base font-semibold">Origins Covered</p>
            </div>
          <div className="p-4 rounded-xl bg-yellow-50 shadow-md hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer">
            <Award size={32} className="mx-auto text-yellow-600 mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-yellow-700">100k+</p>
            <p className="text-gray-600 text-sm sm:text-base font-semibold">Happy Users</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className={`flex-1 px-4 sm:px-6 py-12 ${contentClasses}`}>
        <div className="max-w-5xl mx-auto">
          {/* Language Switcher */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-6 py-2 rounded-lg border-2 transition-all duration-300 font-medium transform active:scale-95 hover:scale-105 ${
                  language === lang.code
                    ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 mb-10 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-start gap-4">
              <TrendingUp className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 How it works</h3>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{tips[language] || tips['en']}</p>
                <div className="bg-white rounded-lg p-3 mt-4 border border-blue-200">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    Example: Colombo ➜ Kandy | කොළඹ ➜ මහනුවර | கொழும்பு ➜ கண்டி
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Card (Reference point for sticky button) */}
          <div
            ref={searchCardRef}
            className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 mb-10 border-2 border-gray-100 hover:shadow-2xl transition-all duration-300"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-700 mb-8 text-center">
              🔍 Search Timetables
            </h2>

            {/* Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="relative" ref={originRef}>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  <MapPin className="inline mr-2" size={18} />
                  Starting Point
                </label>
                <input
                  type="text"
                  placeholder="Enter starting location..."
                  value={origin}
                  onChange={(e) => {
                    setOrigin(e.target.value);
                    setShowOriginSuggestions(true);
                  }}
                  onFocus={() => setShowOriginSuggestions(true)}
                  className="w-full border-2 border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-md transition-all text-base hover:border-blue-400"
                  autoComplete="off"
                />
                {showOriginSuggestions && originSuggestions.length > 0 && (
                  <ul className="absolute z-20 w-full max-h-48 overflow-y-auto bg-white border-2 border-gray-300 rounded-xl mt-2 shadow-xl animate-slide-down">
                    {originSuggestions
                      .filter((o) => o.toLowerCase().includes(origin.toLowerCase()))
                      .map((o, idx) => (
                        <li
                          key={idx}
                          onClick={() => selectOrigin(o)}
                          className="cursor-pointer px-4 py-3 hover:bg-blue-500 hover:text-white transition-all font-medium border-b border-gray-100 last:border-b-0 transform hover:scale-105 hover:pl-6"
                        >
                          <MapPin className="inline mr-2" size={16} />
                          {o}
                        </li>
                      ))}
                  </ul>
                )}
              </div>

              <div className="relative" ref={destinationRef}>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  <MapPin className="inline mr-2" size={18} />
                  Destination
                </label>
                <input
                  type="text"
                  placeholder="Enter destination..."
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setShowDestinationSuggestions(true);
                  }}
                  onFocus={() => setShowDestinationSuggestions(true)}
                  className="w-full border-2 border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-md transition-all text-base hover:border-blue-400"
                  autoComplete="off"
                />
                {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                  <ul className="absolute z-20 w-full max-h-48 overflow-y-auto bg-white border-2 border-gray-300 rounded-xl mt-2 shadow-xl animate-slide-down">
                    {destinationSuggestions
                      .filter((d) => d.toLowerCase().includes(destination.toLowerCase()))
                      .map((d, idx) => (
                        <li
                          key={idx}
                          onClick={() => selectDestination(d)}
                          className="cursor-pointer px-4 py-3 hover:bg-blue-500 hover:text-white transition-all font-medium border-b border-gray-100 last:border-b-0 transform hover:scale-105 hover:pl-6"
                        >
                          <MapPin className="inline mr-2" size={16} />
                          {d}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-2">
              <button
                onClick={swapOriginDestination}
                disabled={!origin || !destination}
                className="flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transform active:scale-95 hover:scale-105 shadow-md hover:shadow-lg"
              >
                <RefreshCw size={18} className="mr-2" /> Swap
              </button>

              <button
                onClick={clearSelections}
                className="flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 font-semibold transform active:scale-95 hover:scale-105 shadow-md hover:shadow-lg"
              >
                <Trash2 size={18} className="mr-2" /> Clear
              </button>
            </div>
          </div>

          {/* AdSense Placement (High Visibility) */}
          <div className="text-center my-8">
            <div className="bg-gray-200 p-4 text-gray-600 rounded-lg text-sm border-2 border-gray-300">
              {/* This is where your Google AdSense Responsive Ad Unit will go */}
              [Contact for AdSense Placement - businfo.click]
            </div>
            </div>

         {/* Results Section */}
<div className="min-h-96">
  {filteredTimetables.length === 0 && (origin || destination) ? (
    <div className="bg-white rounded-3xl shadow-lg p-12 text-center border-2 border-gray-200">
      <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
      <p className="text-red-700 text-xl font-bold mb-2">
        Journey Not Found
      </p>
      <p className="text-gray-600 text-base">
        No timetables found for this journey. Try different locations.
      </p>
    </div>
  ) : (
    <div className="space-y-6">

      {/* Count Summary */}
      <div className="text-center mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 shadow">
        <p className="text-2xl sm:text-3xl font-bold text-gray-900">
          ✓ Found <span className="text-blue-600 text-3xl sm:text-4xl">{filteredTimetables.length}</span> timetable{filteredTimetables.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Improved Timetable Cards */}
      {currentCards.map((route, index) => {
            // Determine the subset of schedules to display
            const isExpanded = expandedRoutes[route.key];
            const schedulesToShow = isExpanded ? route.schedules : route.schedules.slice(0, 12);
            const hasMoreSchedules = route.schedules.length > 12;

            return (
        <div
          key={route.key} // Use the unique key
          className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border-2 border-gray-200 hover:shadow-2xl hover:border-blue-300 transition-all duration-300"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 border-gray-100">
            <div className="mb-3 sm:mb-0">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-800 flex items-center">
                <Bus className="text-blue-600 mr-3 flex-shrink-0" size={30} />
                {route.origin}
                <ArrowRight className="mx-2 text-blue-500" size={24} />
                {route.destination}
              </h3>
              {route.via && (
                    <p className="text-sm text-purple-600 mt-2 ml-10 font-bold flex items-center p-1 bg-purple-50 rounded-md max-w-fit">
                  via {route.via}
                </p>
              )}
            </div>

            <div className="bg-blue-600 text-white font-bold text-lg px-5 py-2 rounded-full shadow-lg flex items-center">
              Route No: {route.route_no}
            </div>
          </div>

          {/* Times Section */}
          <div className="mt-4">
            <h4 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
              <Clock className="text-green-600 mr-2" />
              Departure Times
            </h4>

            {/* Times Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {schedulesToShow.map((schedule, schIndex) => (
                <div
                  key={schIndex}
                  className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-200 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02]"
                >
                  <span className="text-xl font-bold text-gray-900 block">
                    {schedule.departure_time}
                  </span>
                  <p className="text-xs text-gray-500 mt-1 flex items-center justify-center">
                    <MapPin size={12} className="mr-1 text-blue-500" />
                    from {schedule.from}
                  </p>
                </div>
              ))}
            </div>

            {/* Show More/Less Button */}
            {hasMoreSchedules && (
              <button
                onClick={() => toggleScheduleExpansion(route.key)}
                className="w-full mt-6 p-3 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center"
              >
                {isExpanded ? (
                    <>
                        <ChevronUp size={20} className="mr-2" /> Show Less (Showing {route.schedules.length} times)
                    </>
                ) : (
                    <>
                        <ChevronDown size={20} className="mr-2" /> Show All {route.schedules.length} Times
                    </>
                )}
              </button>
            )}
          </div>
        </div>
      )})}
    </div>
  )}
</div>


          {/* Pagination Controls */}
          {filteredTimetables.length > cardsPerPage && (
            <div className="flex justify-center items-center space-x-3 mt-10">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-3 bg-blue-600 text-white rounded-full disabled:bg-gray-300 disabled:text-gray-500 hover:bg-blue-700 transition-colors transform active:scale-95 shadow-lg"
                aria-label="Previous Page"
              >
                <ChevronRight size={20} className="transform rotate-180" />
              </button>

              <span className="text-lg font-semibold text-gray-700 bg-gray-100 px-4 py-2 rounded-lg shadow-inner">
                Page <strong className="text-blue-600">{currentPage}</strong> of <strong className="text-blue-600">{totalPages}</strong>
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-3 bg-blue-600 text-white rounded-full disabled:bg-gray-300 disabled:text-gray-500 hover:bg-blue-700 transition-colors transform active:scale-95 shadow-lg"
                aria-label="Next Page"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </main>

 {/* FAQ Section for SEO */}
      <section className={`bg-gray-100 py-12 ${contentClasses}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="font-bold text-lg text-blue-700 mb-2">How accurate is the distance information?</h3>
              <p className="text-gray-600 text-sm">Our data is updated regularly from official bus operators to ensure maximum accuracy for your journey planning.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="font-bold text-lg text-blue-700 mb-2">Can I book tickets directly?</h3>
              <p className="text-gray-600 text-sm">Use our platform to find routes, and then contact the bus operators or use their booking systems directly.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="font-bold text-lg text-blue-700 mb-2">Which service type should I choose?</h3>
              <p className="text-gray-600 text-sm">Normal buses are budget-friendly, Semi coaches offer comfort, and AC buses provide premium experience with air conditioning.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="font-bold text-lg text-blue-700 mb-2">Is the travel time guaranteed?</h3>
              <p className="text-gray-600 text-sm">Travel times are estimates based on normal traffic conditions. Actual times may vary based on traffic and road conditions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className={`bg-blue-50 py-12 border-t-4 border-blue-600 ${contentClasses}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Businfo.click?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <Award size={40} className="mx-auto text-blue-600 mb-3" />
              <h3 className="font-bold mb-2">Most Comprehensive</h3>
              <p className="text-sm text-gray-600">All Sri Lankan bus routes in one place</p>
            </div>
            <div>
              <Zap size={40} className="mx-auto text-blue-600 mb-3" />
              <h3 className="font-bold mb-2">Real-Time Data</h3>
              <p className="text-sm text-gray-600">Updated information 24/7</p>
            </div>
            <div>
              <Users size={40} className="mx-auto text-blue-600 mb-3" />
              <h3 className="font-bold mb-2">User Friendly</h3>
              <p className="text-sm text-gray-600">Simple search in 3 languages</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default NormalTimetables;