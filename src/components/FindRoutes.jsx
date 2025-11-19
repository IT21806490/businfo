import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import allSectionsData from "../data/all_section.json";
import allRoutesData from "../data/allroutes.json";
import normalData from "../data/normal.json";
import semiData from "../data/semi.json";
import acData from "../data/ac.json";
import { Bus, RefreshCw, Trash2, MapPin, Clock, TrendingUp, ArrowRight, ChevronRight, Star, Award, Users, Zap, AlertCircle, Filter, X } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import useBlockInspect from "../hooks/useBlockInspect";

const FindRoutes = () => {
  useBlockInspect();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [rawMatchingRoutes, setRawMatchingRoutes] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sectionMap, setSectionMap] = useState({});
  const [routeMap, setRouteMap] = useState({});
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [debouncedOriginQuery, setDebouncedOriginQuery] = useState("");
  const [debouncedDestinationQuery, setDebouncedDestinationQuery] = useState("");
  const [mainTownSuggestions, setMainTownSuggestions] = useState([]);
  const [normalMap, setNormalMap] = useState({});
  const [semiMap, setSemiMap] = useState({});
  const [acMap, setAcMap] = useState({});
  const [language, setLanguage] = useState("en");

  // ENGAGEMENT INCREMENTS STATE
  const [filterType, setFilterType] = useState("All"); // All, Normal, Semi, AC
  const [sortBy, setSortBy] = useState("route_no"); // route_no, time, distance
  const searchCardRef = useRef(null);

  const originRef = useRef(null);
  const destinationRef = useRef(null);
  const debounceTimer = useRef(null);

  const tips = {
    en: "This page shows all possible routes for your travel needs, and please note that the distance and travel time shown here are for the entire route.",
    si: "මෙහිදී ඔබගේ ගමන් අවශ්‍යතාව සදහා භාවිතා කළ හැකි සෑම ගමන් මාර්ගයක්ම පෙන්වන අතර මෙහිදී පෙන්වන දුර සහ ගමන් කාලය පෙන්නනුයේ අදාළ සම්පූර්ණ Route එක සදහා බව කරුණාවෙන් සළකන්න.",
    ta: "இந்தப் பக்கம் உங்கள் பயணத் தேவைகளுக்கான அனைத்து சாத்தியமான வழிகளையும் காட்டுகிறது, மேலும் இங்கே காட்டப்பட்டுள்ள தூரம் மற்றும் பயண நேரம் முழு வழிக்கும் என்பதை நினைவில் கொள்ளவும்.",
  };

  const languages = [
    { code: "en", label: "English" },
    { code: "si", label: "සිංහල" },
    { code: "ta", label: "தமிழ்" },
  ];

  const normalizeRouteNo = (routeNo) => {
    if (!routeNo) return "";
    const strRouteNo = String(routeNo).trim();
    const parts = strRouteNo.split(/([-/])/);
    return parts
      .map((part) => {
        if (part === "-" || part === "/") return part;
        const match = part.match(/^0*(\d+)(.*)$/);
        if (match) return match[1] + (match[2] || "");
        return part;
      })
      .join("");
  };

  // Travel Time Logic
  const formatTravelTime = (time) => {
    if (!time) return "";
    const num = parseFloat(time);
    const hours = Math.floor(num);
    const minutes = Math.round((num - hours) * 100); 
    return `${hours}:${minutes.toString().padStart(2, "0")} hrs`;
  };

  const debounce = useCallback((func, delay) => {
    return (...args) => {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (originRef.current && !originRef.current.contains(event.target)) {
        setShowOriginSuggestions(false);
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target)) {
        setShowDestinationSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const debouncedUpdate = debounce(() => {
      setDebouncedOriginQuery(origin);
    }, 150);
    debouncedUpdate();
  }, [origin, debounce]);

  useEffect(() => {
    const debouncedUpdate = debounce(() => {
      setDebouncedDestinationQuery(destination);
    }, 150);
    debouncedUpdate();
  }, [destination, debounce]);

  useEffect(() => {
    const sMap = {};
    const uniqueSections = new Set();
    const mainTownNames = [
      "COLOMBO", "KANDY", "GALLE", "JAFFNA", "ANURADHAPURA",
      "KURUNEGALA", "BADULLA", "TRINCOMALEE", "MATARA", "BATTICALOA",
    ];
    const foundMainTowns = new Set();

    allSectionsData.forEach((sec) => {
      const normalizedRouteNo = normalizeRouteNo(sec.route_no);
      if (!sMap[normalizedRouteNo]) sMap[normalizedRouteNo] = {};
      sMap[normalizedRouteNo][sec.section_name] = sec;
      uniqueSections.add(sec.section_name);

      if (mainTownNames.includes(sec.section_name.toUpperCase())) {
        foundMainTowns.add(sec.section_name);
      }
    });

    const rMap = {};
    allRoutesData.forEach((r) => {
      const normalizedRouteNo = normalizeRouteNo(r.Route_No);
      rMap[normalizedRouteNo] = r;
    });

    const makeMap = (data) => {
      const map = {};
      data.forEach((r) => {
        const normalized = normalizeRouteNo(r.route_no);
        map[normalized] = r;
      });
      return map;
    };

    setSectionMap(sMap);
    setRouteMap(rMap);
    setAllSections(Array.from(uniqueSections).sort());
    setNormalMap(makeMap(normalData));
    setSemiMap(makeMap(semiData));
    setAcMap(makeMap(acData));
    setMainTownSuggestions(Array.from(foundMainTowns).sort());
  }, []);

  const filteredOriginSections = useMemo(() => {
    if (!debouncedOriginQuery) return mainTownSuggestions;
    return allSections.filter((s) =>
      s.toLowerCase().includes(debouncedOriginQuery.toLowerCase())
    );
  }, [debouncedOriginQuery, allSections, mainTownSuggestions]);

  const filteredDestinationSections = useMemo(() => {
    if (!debouncedDestinationQuery) return mainTownSuggestions;
    return allSections.filter((s) =>
      s.toLowerCase().includes(debouncedDestinationQuery.toLowerCase())
    );
  }, [debouncedDestinationQuery, allSections, mainTownSuggestions]);

  const selectOrigin = (sec) => {
    setOrigin(sec);
    setShowOriginSuggestions(false);
  };

  const selectDestination = (sec) => {
    setDestination(sec);
    setShowDestinationSuggestions(false);
  };

  const swapOriginDestination = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const clearSelections = () => {
    setOrigin("");
    setDestination("");
    setRawMatchingRoutes([]);
    setFilterType("All");
    setSortBy("route_no");
  };

  const findRoutes = () => {
    if (!origin || !destination || origin === destination) return;
    setLoading(true);
    setTimeout(() => {
      const foundRoutes = [];

      Object.keys(sectionMap).forEach((routeNo) => {
        const sections = sectionMap[routeNo];
        if (sections[origin] && sections[destination]) {
          const routeInfo = routeMap[routeNo] || {};
          const services = [];

          if (normalMap[routeNo]) {
            services.push({
              type: "Normal",
              distance: normalMap[routeNo].distance || "N/A",
              travel_time: normalMap[routeNo].travel_time || "N/A",
            });
          }
          if (semiMap[routeNo]) {
            services.push({
              type: "Semi",
              distance: semiMap[routeNo].distance || "N/A",
              travel_time: semiMap[routeNo].travel_time || "N/A",
            });
          }
          if (acMap[routeNo]) {
            services.push({
              type: "AC",
              distance: acMap[routeNo].distance || "N/A",
              travel_time: acMap[routeNo].travel_time || "N/A",
            });
          }

          if (services.length > 0) {
              // Calculate aggregated metrics for sorting
              // Use flatMap (or map/filter/flat) to ensure correct parsing and filtering of N/A data
              const allDistances = services.map(s => parseFloat(s.distance)).filter(d => !isNaN(d));
              const allTimes = services.map(s => parseFloat(s.travel_time)).filter(t => !isNaN(t));

              foundRoutes.push({
                route_no: routeNo,
                route_name: routeInfo.Origin
                  ? `${routeInfo.Origin} ➜ ${routeInfo.Destination}`
                  : `Route ${routeNo}`,
                services,
                // Assign Infinity if no valid data is found for reliable sorting
                min_distance: allDistances.length ? Math.min(...allDistances) : Infinity, 
                min_time: allTimes.length ? Math.min(...allTimes) : Infinity,
              });
          }
        }
      });

      setRawMatchingRoutes(foundRoutes);
      setLoading(false);
      // Scroll to results or search card
      setTimeout(() => {
        if (foundRoutes.length > 0) {
          window.scrollTo({ top: searchCardRef.current.offsetTop, behavior: 'smooth' });
        }
      }, 100);
    }, 500);
  };

  const matchingRoutes = useMemo(() => {
    let sortedRoutes = [...rawMatchingRoutes];

    // 1. Filtering by Service Type
    if (filterType !== "All") {
      sortedRoutes = sortedRoutes.filter(route =>
        route.services.some(service => service.type === filterType)
      );
    }

    // 2. Sorting
    sortedRoutes.sort((a, b) => {
      if (sortBy === "time") {
        // Robust sorting: map Infinity to a huge number so it is pushed to the end
        const timeA = a.min_time === Infinity ? 999999 : a.min_time;
        const timeB = b.min_time === Infinity ? 999999 : b.min_time;
        return timeA - timeB; // Fastest (shortest time) first
      }
      if (sortBy === "distance") {
        // Robust sorting: map Infinity to a huge number
        const distA = a.min_distance === Infinity ? 999999 : a.min_distance;
        const distB = b.min_distance === Infinity ? 999999 : b.min_distance;
        return distA - distB; // Shortest distance first
      }
      // Default: Sort by Route Number
      return a.route_no.localeCompare(b.route_no);
    });

    return sortedRoutes;
  }, [rawMatchingRoutes, filterType, sortBy]); // Dependencies are correct!

  const scrollToSearch = () => {
    if (searchCardRef.current) {
      window.scrollTo({ top: searchCardRef.current.offsetTop, behavior: 'smooth' });
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      <Navbar />

      <section className="pt-24 pb-12 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white relative overflow-hidden">
        {/* ... Hero Content ... */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-6">
            <div className="inline-block px-4 py-2 bg-blue-500/30 backdrop-blur-sm rounded-full text-sm font-medium mb-4 animate-fade-in">
              🚍 Sri Lanka's #1 Bus Route Finder
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 animate-slide-down">
              Find Bus Routes & Plan Your Journey
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto animate-fade-in">
              Get instant access to {allRoutesData.length}+ routes, real-time schedules, accurate fares, and expert travel tips
            </p>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white py-8 shadow-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 text-center">
          <div className="p-4 rounded-xl bg-blue-50 shadow-md hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer">
            <Users size={32} className="mx-auto text-blue-600 mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-blue-700">{allRoutesData.length}+</p>
            <p className="text-gray-600 text-sm sm:text-base font-semibold">Routes Available</p>
          </div>
          <div className="p-4 rounded-xl bg-green-50 shadow-md hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer">
            <Star size={32} className="mx-auto text-green-600 mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-green-700">{allSections.length}+</p>
            <p className="text-gray-600 text-sm sm:text-base font-semibold">Cities & Towns</p>
          </div>
          <div className="p-4 rounded-xl bg-yellow-50 shadow-md hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer">
            <Award size={32} className="mx-auto text-yellow-600 mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-yellow-700">100k+</p>
            <p className="text-gray-600 text-sm sm:text-base font-semibold">Happy Users</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Language Switcher */}
          <div className="flex flex-wrap justify-center gap-3 mb-8 animate-fade-in">
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
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 mb-10 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up">
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
            className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 mb-10 border-2 border-gray-100 hover:shadow-2xl transition-all duration-300 animate-slide-up"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-700 mb-8 text-center">
              🔍 Search Your Perfect Route
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
                {showOriginSuggestions && filteredOriginSections.length > 0 && (
                  <ul className="absolute z-20 w-full max-h-48 overflow-y-auto bg-white border-2 border-gray-300 rounded-xl mt-2 shadow-xl animate-slide-down">
                    {filteredOriginSections.map((sec, idx) => (
                      <li
                        key={idx}
                        onClick={() => selectOrigin(sec)}
                        className="cursor-pointer px-4 py-3 hover:bg-blue-500 hover:text-white transition-all font-medium border-b border-gray-100 last:border-b-0 transform hover:scale-105 hover:pl-6"
                      >
                        <MapPin className="inline mr-2" size={16} />
                        {sec}
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
                {showDestinationSuggestions && filteredDestinationSections.length > 0 && (
                  <ul className="absolute z-20 w-full max-h-48 overflow-y-auto bg-white border-2 border-gray-300 rounded-xl mt-2 shadow-xl animate-slide-down">
                    {filteredDestinationSections.map((sec, idx) => (
                      <li
                        key={idx}
                        onClick={() => selectDestination(sec)}
                        className="cursor-pointer px-4 py-3 hover:bg-blue-500 hover:text-white transition-all font-medium border-b border-gray-100 last:border-b-0 transform hover:scale-105 hover:pl-6"
                      >
                        <MapPin className="inline mr-2" size={16} />
                        {sec}
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

              <button
                onClick={findRoutes}
                disabled={loading || !origin || !destination || origin === destination}
                className="flex-1 sm:flex-none flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold transform active:scale-95 hover:scale-105 hover:from-blue-700 hover:to-blue-800"
              >
                {loading ? (
                  <>
                    <Bus className="animate-spin mr-2" size={20} /> Searching...
                  </>
                ) : (
                  <>
                    <Zap size={20} className="mr-2" /> Search Routes <ChevronRight size={20} className="ml-2" />
                  </>
                )}
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
          {/* End AdSense Placement */}


          {/* Results Section */}
          <div className="min-h-96">
            {loading && (
              <div className="bg-white rounded-3xl shadow-xl p-12 text-center border-2 border-blue-200 animate-fade-in">
                <Bus className="animate-bounce mx-auto text-blue-600 mb-4" size={48} />
                <p className="text-gray-600 text-lg font-semibold">Finding best routes for you...</p>
              </div>
            )}

            {!loading && rawMatchingRoutes.length === 0 && (
              <div className="bg-white rounded-3xl shadow-lg p-12 text-center border-2 border-gray-200 animate-fade-in">
                <Bus className="text-gray-400 mx-auto mb-4" size={48} />
                <p className="text-gray-600 text-lg font-semibold">
                  {origin && destination
                    ? "No routes found for this journey. Try different locations."
                    : "Enter your starting point and destination to find available routes."}
                </p>
              </div>
            )}

            {rawMatchingRoutes.length > 0 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    ✓ Found <span className="text-blue-600 text-3xl sm:text-4xl">{rawMatchingRoutes.length}</span> route{rawMatchingRoutes.length > 1 ? "s" : ""}
                  </p>
                  <p className="text-gray-600 mt-3 text-sm sm:text-base font-semibold">
                    {origin} <ArrowRight className="inline mx-2" size={20} /> {destination}
                  </p>
                </div>

                {/* Engagement: Filter and Sort Controls */}
                <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-200 mb-6 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex flex-wrap gap-2 items-center">
                        <Filter size={18} className="text-blue-600 flex-shrink-0" />
                        <span className="font-semibold text-gray-700 text-sm mr-2">Filter by Service:</span>
                        {["All", "Normal", "Semi", "AC"].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 transform hover:scale-105 ${
                                    filterType === type
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700 text-sm">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
                        >
                            <option value="route_no">Route Number</option>
                            <option value="time">Travel Time (Fastest)</option>
                            <option value="distance">Distance (Shortest)</option>
                        </select>
                    </div>
                </div>


                {/* Displaying Filtered and Sorted Results */}
                {matchingRoutes.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {matchingRoutes.map((route, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 transform hover:scale-105 animate-slide-up"
                        >
                          <div className="mb-6 pb-4 border-b-2 border-gray-200 flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-bold text-blue-700">{route.route_name}</h3>
                              <p className="text-sm text-gray-500 font-semibold mt-1">
                                Route #{normalizeRouteNo(route.route_no)}
                              </p>
                            </div>
                            <div className="bg-blue-100 px-3 py-1 rounded-full text-xs font-bold text-blue-600">
                              {route.services.length} Options
                            </div>
                          </div>

                          <div className="space-y-3">
                            {route.services
                                .filter(s => filterType === "All" || s.type === filterType)
                                .map((s, i) => (
                              <div
                                key={i}
                                className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer border-2 hover:shadow-md 
                                  ${
                                    s.type === "Normal"
                                      ? "bg-gray-100 border-gray-300"
                                      : s.type === "Semi"
                                      ? "bg-blue-50 border-blue-300"
                                      : "bg-green-50 border-green-300"
                                  }
                                `}
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <span className="font-bold text-lg">{s.type}</span>
                                    <p className="text-xs text-gray-600 mt-1">
                                      {s.type === "Normal" ? "Budget Friendly" : s.type === "Semi" ? "Comfortable" : "Premium"}
                                    </p>
                                  </div>
                                  <Bus size={20} className="opacity-60" />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                  {/* Distance */}
                                  <div className="flex items-center">
                                    <MapPin size={14} className="mr-1 text-gray-500" />
                                    <span className="text-gray-600 font-medium">Distance:</span>
                                  </div>
                                  <span className={`font-bold text-right ${s.distance === "N/A" ? "text-red-500" : "text-gray-900"}`}>
                                      {s.distance !== "N/A" ? `${s.distance} km` : <span className="text-red-500 flex items-center justify-end"><AlertCircle size={14} className="mr-1"/> Data Missing</span>}
                                  </span>

                                  {/* Travel Time */}
                                  <div className="flex items-center">
                                    <Clock size={14} className="mr-1 text-gray-500" />
                                    <span className="text-gray-600 font-medium">Travel Time:</span>
                                  </div>
                                  <span className={`font-bold text-right ${s.travel_time === "N/A" ? "text-red-500" : "text-gray-900"}`}>
                                      {s.travel_time !== "N/A" ? formatTravelTime(s.travel_time) : <span className="text-red-500 flex items-center justify-end"><AlertCircle size={14} className="mr-1"/> Data Missing</span>}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-lg p-12 text-center border-2 border-yellow-200 animate-fade-in">
                        <X className="text-yellow-500 mx-auto mb-4" size={48} />
                        <p className="text-gray-600 text-lg font-semibold">
                            No **{filterType}** routes found matching your criteria. Try changing the filter or sort options.
                        </p>
                    </div>
                )}
                
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Engagement: Floating Sticky "New Search" Button */}
      {rawMatchingRoutes.length > 0 && (
          <button
              onClick={scrollToSearch}
              className="fixed bottom-6 right-6 z-50 flex items-center px-5 py-3 bg-red-600 text-white rounded-full shadow-2xl hover:bg-red-700 transition-all duration-300 font-bold transform active:scale-95 hover:scale-105"
          >
              <RefreshCw size={18} className="mr-2" /> New Search
          </button>
      )}


      {/* FAQ Section for SEO */}
      <section className="bg-gray-100 py-12">
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
      <section className="bg-blue-50 py-12 border-t-4 border-blue-600">
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

      <Footer />

      {/* Custom Animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-in-out;
        }

        .animate-slide-down {
          animation: slide-down 0.5s ease-in-out;
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-in-out;
        }
      `}</style>

      {/* Google AdSense Script */}
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxxxxxxxxxxxxxxx"
        crossOrigin="anonymous"
      ></script>
    </div>
  );
};

export default FindRoutes;