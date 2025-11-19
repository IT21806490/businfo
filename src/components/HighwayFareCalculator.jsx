import React, { useEffect, useState, useRef } from "react";
import allRoutesData from "../data/allroutes.json";
import highwaySectionsData from "../data/highway_sections.json";
import { Bus, RefreshCw, Trash2, Zap, Award, Users, AlertCircle, TrendingUp, MapPin, ChevronRight, X } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import useBlockInspect from "../hooks/useBlockInspect";

const HighwayFareCalculator = () => {
  useBlockInspect();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [highwayResults, setHighwayResults] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [allHighwaySections, setAllHighwaySections] = useState([]);
  const [highwayMap, setHighwayMap] = useState({});
  const [highwaySectionNameMap, setHighwaySectionNameMap] = useState({});
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [debouncedOriginQuery, setDebouncedOriginQuery] = useState("");
  const [debouncedDestinationQuery, setDebouncedDestinationQuery] = useState("");
  const searchCardRef = useRef(null);

  const originRef = useRef(null);
  const destinationRef = useRef(null);
  const debounceTimer = useRef(null);

  const expressRoutesCount = allRoutesData.filter((route) =>
    String(route.Route_No || "").startsWith("EX")
  ).length;

  const sectionsCoveredCount = highwaySectionsData.length;

  const normalizeRouteNo = (routeNo) => {
    if (!routeNo) return "";
    let str = String(routeNo).trim();

    const prefixMatch = str.match(/^([A-Za-z\s]+)?(.*)$/);
    let prefix = prefixMatch[1] ? prefixMatch[1].trim() : "";
    let mainPart = prefixMatch[2] || "";

    if (mainPart.startsWith("-") || mainPart.startsWith("/")) {
      mainPart = mainPart.slice(1);
    }

    const parts = mainPart.split(/([-/])/);
    const normalizedParts = parts.map((part) => {
      if (part === "-" || part === "/") return part;
      const match = part.match(/^0*(\d+)(.*)$/);
      if (match) return match[1] + (match[2] || "");
      return part;
    });

    return (prefix ? prefix + " " : "") + normalizedParts.join("");
  };

  const debounce = (func, delay) => {
    return (...args) => {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => func.apply(null, args), delay);
    };
  };

  useEffect(() => {
    const debouncedUpdate = debounce(() => {
      setDebouncedOriginQuery(originQuery);
    }, 150);
    debouncedUpdate();
  }, [originQuery]);

  useEffect(() => {
    const debouncedUpdate = debounce(() => {
      setDebouncedDestinationQuery(destinationQuery);
    }, 150);
    debouncedUpdate();
  }, [destinationQuery]);

  const getFilteredSuggestions = (query, allOptions) => {
    if (!query.trim()) return allOptions;

    const lowerCaseQuery = query.toLowerCase();
    const exactMatches = [];
    const startsWithMatches = [];
    const containsMatches = [];

    for (const section of allOptions) {
      const sectionLower = section.toLowerCase();

      if (sectionLower === lowerCaseQuery) {
        exactMatches.push(section);
      } else if (sectionLower.startsWith(lowerCaseQuery)) {
        startsWithMatches.push(section);
      } else if (sectionLower.includes(lowerCaseQuery)) {
        containsMatches.push(section);
      }
    }

    return [...exactMatches, ...startsWithMatches, ...containsMatches].slice(0, 50);
  };

  const filteredOriginSections = getFilteredSuggestions(debouncedOriginQuery, allHighwaySections);
  const filteredDestinationSections = getFilteredSuggestions(debouncedDestinationQuery, allHighwaySections);

  useEffect(() => {
    const hMap = {};
    const hNameMap = {};
    const uniqueHighwaySections = new Set();

    highwaySectionsData.forEach((h) => {
      const routeNo = normalizeRouteNo(h.route_no);
      const service = h.service_type || "Unknown";
      if (!hMap[routeNo]) hMap[routeNo] = {};
      if (!hMap[routeNo][service]) hMap[routeNo][service] = {};
      hMap[routeNo][service][h.section_name.toUpperCase()] = h.fare;
      uniqueHighwaySections.add(h.section_name);

      const secKey = h.section_name.toUpperCase();
      if (!hNameMap[secKey]) hNameMap[secKey] = [];
      hNameMap[secKey].push({ route_no: routeNo, service_type: service, fare: h.fare });
    });

    setHighwayMap(hMap);
    setHighwaySectionNameMap(hNameMap);
    setAllHighwaySections(Array.from(uniqueHighwaySections).sort());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (originRef.current && !originRef.current.contains(event.target)) setShowOriginSuggestions(false);
      if (destinationRef.current && !destinationRef.current.contains(event.target)) setShowDestinationSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectOrigin = (val) => { setOrigin(val); setOriginQuery(val); setShowOriginSuggestions(false); };
  const selectDestination = (val) => { setDestination(val); setDestinationQuery(val); setShowDestinationSuggestions(false); };
  const swapOriginDestination = () => { const temp = origin; setOrigin(destination); setOriginQuery(destinationQuery); setDestination(temp); setDestinationQuery(originQuery); };
  const clearSelections = () => { setOrigin(""); setDestination(""); setOriginQuery(""); setDestinationQuery(""); setHighwayResults([]); setShowOriginSuggestions(false); setShowDestinationSuggestions(false); };

  const handleOriginChange = (e) => {
    const value = e.target.value;
    setOriginQuery(value);
    setOrigin(value);
    setShowOriginSuggestions(true);
  };

  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setDestinationQuery(value);
    setDestination(value);
    setShowDestinationSuggestions(true);
  };

  const handleKeyDown = (e, type) => {
    if (e.key === "Escape") {
      if (type === "origin") setShowOriginSuggestions(false);
      else setShowDestinationSuggestions(false);
    }
  };

  const calculateHighwayFare = () => {
    if (!origin || !destination) { alert("Please select both origin and destination"); return; }
    if (origin === destination) { alert("Origin and destination cannot be the same"); return; }

    setLoading(true);
    setTimeout(() => {
      const upOrigin = origin.toUpperCase();
      const upDestination = destination.toUpperCase();
      const originRoutes = highwaySectionNameMap[upOrigin] || [];
      const destinationRoutes = highwaySectionNameMap[upDestination] || [];

      const possibleRoutes = {};
      originRoutes.forEach((o) => {
        const match = destinationRoutes.find((d) => d.route_no === o.route_no && d.service_type === o.service_type);
        if (match) {
          const key = `${o.route_no}-${o.service_type}`;
          possibleRoutes[key] = { route_no: o.route_no, service_type: o.service_type };
        }
      });

      const results = [];
      Object.values(possibleRoutes).forEach(({ route_no, service_type }) => {
        const fares = highwayMap[route_no]?.[service_type] || {};
        if (fares[upOrigin] !== undefined && fares[upDestination] !== undefined) {
          const routeInfo = allRoutesData.find(r => normalizeRouteNo(r.Route_No) === route_no);
          results.push({
            route_no,
            route_name: routeInfo ? `${routeInfo.Origin} ➜ ${routeInfo.Destination}` : "Unknown",
            highway: Math.abs(fares[upDestination] - fares[upOrigin]).toFixed(2),
            service_type: service_type === "SUPER" ? "SUPER LUXURY" : service_type === "TEMP" ? "TEMPORARY SERVICE" : service_type,
          });
        }
      });

      results.sort((a, b) => a.route_no.localeCompare(b.route_no));
      setHighwayResults(results);
      setLoading(false);
      setTimeout(() => {
        if (results.length > 0) {
          window.scrollTo({ top: searchCardRef.current.offsetTop, behavior: 'smooth' });
        }
      }, 100);
    }, 500);
  };

  const scrollToSearch = () => {
    if (searchCardRef.current) {
      window.scrollTo({ top: searchCardRef.current.offsetTop, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-orange-600 via-orange-700 to-orange-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-6">
            <div className="inline-block px-4 py-2 bg-orange-500/30 backdrop-blur-sm rounded-full text-sm font-medium mb-4 animate-fade-in">
              🚀 Sri Lanka's Expressway Fare Calculator
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 animate-slide-down">
              Expressway Bus Fares
            </h1>
            <p className="text-lg text-orange-100 max-w-2xl mx-auto animate-fade-in">
              Calculate fares for expressway routes with ease. Get accurate pricing for your highway journeys.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white py-8 shadow-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 text-center">
          <div className="p-4 rounded-xl bg-orange-50 shadow-md hover:shadow-lg transition-all transform hover:scale-105 cursor-default">
            <Bus size={32} className="mx-auto text-orange-600 mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-orange-700">{expressRoutesCount}</p>
            <p className="text-gray-600 text-sm sm:text-base font-semibold">Express Routes</p>
          </div>
          <div className="p-4 rounded-xl bg-green-50 shadow-md hover:shadow-lg transition-all transform hover:scale-105 cursor-default">
            <Award size={32} className="mx-auto text-green-600 mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-green-700">{sectionsCoveredCount}</p>
            <p className="text-gray-600 text-sm sm:text-base font-semibold">Sections Covered</p>
          </div>
          <div className="p-4 rounded-xl bg-yellow-50 shadow-md hover:shadow-lg transition-all transform hover:scale-105 cursor-default">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-yellow-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl sm:text-2xl font-bold text-yellow-700">July 04, 2025</p>
            <p className="text-gray-600 text-sm sm:text-base font-semibold">Last Fare Update</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-12">
        
        <div className="max-w-5xl mx-auto">
          
          {/* Info Box */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 sm:p-8 mb-10 border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up">
            <div className="flex items-start gap-4">
              <TrendingUp className="text-orange-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-lg font-semibold text-orange-800 mb-3">💡 Quick Guide</h3>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  Select your expressway origin and destination to calculate fares instantly. Compare options for different service types.
                </p>
                <div className="bg-white rounded-lg p-3 mt-4 border border-orange-200">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    Example: KADAWATHA ➜ MATARA
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Card */}
          <div 
            ref={searchCardRef}
            className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 mb-10 border-2 border-gray-100 hover:shadow-2xl transition-all duration-300 animate-slide-up"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-orange-700 mb-8 text-center">
              🧮 Calculate Expressway Fare
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
                  value={originQuery}
                  onChange={handleOriginChange}
                  onFocus={() => setShowOriginSuggestions(true)}
                  onKeyDown={(e) => handleKeyDown(e, 'origin')}
                  className="w-full border-2 border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-md transition-all text-base hover:border-orange-400"
                  autoComplete="off"
                />
                {showOriginSuggestions && (
                  <ul className="absolute z-20 w-full max-h-48 overflow-y-auto bg-white border-2 border-gray-300 rounded-xl mt-2 shadow-xl animate-slide-down">
                    {filteredOriginSections.length > 0 ? (
                      filteredOriginSections.map((sec, index) => (
                        <li
                          key={`${sec}-${index}`}
                          onClick={() => selectOrigin(sec)}
                          className="cursor-pointer px-4 py-3 hover:bg-orange-500 hover:text-white transition-all font-medium border-b border-gray-100 last:border-b-0 transform hover:scale-105 hover:pl-6"
                        >
                          <MapPin className="inline mr-2" size={16} />
                          {sec}
                        </li>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-center text-sm text-gray-500 flex items-center justify-center gap-1">
                        <AlertCircle size={14} /> No sections found for "{debouncedOriginQuery}"
                      </div>
                    )}
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
                  value={destinationQuery}
                  onChange={handleDestinationChange}
                  onFocus={() => setShowDestinationSuggestions(true)}
                  onKeyDown={(e) => handleKeyDown(e, 'destination')}
                  className="w-full border-2 border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-md transition-all text-base hover:border-orange-400"
                  autoComplete="off"
                />
                {showDestinationSuggestions && (
                  <ul className="absolute z-20 w-full max-h-48 overflow-y-auto bg-white border-2 border-gray-300 rounded-xl mt-2 shadow-xl animate-slide-down">
                    {filteredDestinationSections.length > 0 ? (
                      filteredDestinationSections.map((sec, index) => (
                        <li
                          key={`${sec}-${index}`}
                          onClick={() => selectDestination(sec)}
                          className="cursor-pointer px-4 py-3 hover:bg-orange-500 hover:text-white transition-all font-medium border-b border-gray-100 last:border-b-0 transform hover:scale-105 hover:pl-6"
                        >
                          <MapPin className="inline mr-2" size={16} />
                          {sec}
                        </li>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-center text-sm text-gray-500 flex items-center justify-center gap-1">
                        <AlertCircle size={14} /> No sections found for "{debouncedDestinationQuery}"
                      </div>
                    )}
                  </ul>
                )}
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8">
              <button
                onClick={swapOriginDestination}
                disabled={!origin || !destination}
                className="flex items-center justify-center px-6 py-3 border border-orange-500 text-orange-600 rounded-xl font-semibold transition-colors duration-300 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                <RefreshCw size={20} className="mr-2" />
                Swap
              </button>
               <button
                onClick={clearSelections}
                disabled={!origin && !destination}
                className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold transition-colors duration-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                <Trash2 size={20} className="mr-2" />
                Clear
              </button>
              <button
                onClick={calculateHighwayFare}
                disabled={!origin || !destination || loading}
                className="flex items-center justify-center px-8 py-3 bg-orange-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden"
              >
                {loading ? (
                  <>
                    <Zap size={20} className="animate-spin mr-2" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Zap size={20} className="mr-2" />
                    Calculate Fare
                  </>
                )}
                {!loading && <span className="absolute right-0 top-0 h-full w-1/4 bg-white/20 blur-sm animate-pulse-short"></span>}
              </button>
            </div>

            {/* Results Section */}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-pulse text-orange-600 font-medium">Fetching the best routes...</div>
                <div className="mt-4 flex justify-center items-center">
                  <div className="w-6 h-6 border-4 border-t-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                </div>
              </div>
            )}

            {!loading && highwayResults.length > 0 && (
              <div className="mt-10 pt-6 border-t-2 border-orange-100">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center">
                  <TrendingUp size={24} className="text-green-600 mr-2" />
                  Found {highwayResults.length} options
                </h3>

                <div className="space-y-4">
                  {highwayResults.map((result, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Bus size={20} className="text-blue-500 mr-2 flex-shrink-0" />
                          <p className="text-lg font-bold text-gray-900 truncate">
                            Route: {result.route_no}
                          </p>
                          <ChevronRight size={16} className="text-gray-400 mx-2 flex-shrink-0" />
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            result.service_type.includes("SUPER") ? "bg-red-100 text-red-800" :
                            result.service_type.includes("TEMP") ? "bg-yellow-100 text-yellow-800" :
                            "bg-green-100 text-green-800"
                          } flex-shrink-0`}>
                            {result.service_type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium ml-7 truncate">
                          <MapPin size={16} className="inline mr-1 text-gray-400" />
                          {result.route_name}
                        </p>
                      </div>

                      <div className="text-right flex flex-col items-start md:items-end">
{/*                         <p className="text-sm font-medium text-gray-500">Estimated Fare</p> */}
                        <p className="text-3xl font-extrabold text-green-600">
                          Rs. {result.highway}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
{/*                 <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 font-medium flex items-start gap-2">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <p>
                    **Disclaimer:** Fares are calculated based on the difference between the expressway sections' fare values, as per the latest update on July 04, 2025. Actual fare might vary slightly due to rounding or specific operator policies.
                  </p>
                </div> */}
              </div>
            )}

            {!loading && highwayResults.length === 0 && (origin && destination) && (
              <div className="text-center py-10 bg-red-50 border-2 border-red-200 rounded-xl mt-10">
                <X size={48} className="text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-800 mb-2">No Direct Route Found</h3>
                <p className="text-gray-600 max-w-lg mx-auto">
                  We could not find a direct expressway bus route connecting **{origin}** and **{destination}** in our current data. Please check the spelling or try alternative stops.
                </p>
              </div>
            )}

            {!loading && highwayResults.length === 0 && (!origin || !destination) && (
              <div className="text-center py-10 bg-gray-50 border-2 border-gray-200 rounded-xl mt-10">
                <Users size={48} className="text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to Calculate?</h3>
                <p className="text-gray-600 max-w-lg mx-auto">
                  Enter your **Starting Point** and **Destination** above to instantly find the estimated expressway bus fare.
                </p>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Wrap floating button + FAQ + Trust section in a Fragment */}
      <>
        {/* Floating Sticky "New Search" Button */}
        {highwayResults.length > 0 && ( 
          <button
            onClick={scrollToSearch}
            className="fixed bottom-6 right-6 z-50 flex items-center px-5 py-3 bg-red-600 text-white rounded-full shadow-2xl hover:bg-red-700 transition-all duration-300 font-bold transform active:scale-95 hover:scale-105"
          >
            <RefreshCw size={18} className="mr-2" /> New Search
          </button>
        )}

        {/* FAQ Section */}
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
      </>

      {/* Footer and Styles */}
      <Footer />
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-in-out; }
        .animate-slide-down { animation: slide-down 0.5s ease-in-out; }
        .animate-slide-up { animation: slide-up 0.5s ease-in-out; }
      `}</style>
    </div>
  );
};

export default HighwayFareCalculator;
