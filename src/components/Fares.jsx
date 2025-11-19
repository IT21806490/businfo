import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import allSectionsData from "../data/all_section.json";
import fareStagesData from "../data/fare_stages.json";
import allRoutesData from "../data/allroutes.json";
// Importing matching icons for a unified look
import { Bus, RefreshCw, Trash2, Zap, Award, Users, AlertCircle, TrendingUp, MapPin, ChevronRight, X } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import useBlockInspect from "../hooks/useBlockInspect";

const FareCalculator = () => {
  useBlockInspect();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [fareResults, setFareResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allSections, setAllSections] = useState([]);
  const [mainTownSuggestions, setMainTownSuggestions] = useState([]);
  const [sectionMap, setSectionMap] = useState({});
  const [fareStageMap, setFareStageMap] = useState({});
  const [routeMap, setRouteMap] = useState({});
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [debouncedOriginQuery, setDebouncedOriginQuery] = useState("");
  const [debouncedDestinationQuery, setDebouncedDestinationQuery] = useState("");
  const searchCardRef = useRef(null); // Add ref for scrolling

  // 🌍 Language state
  const [language, setLanguage] = useState("en");

  const originRef = useRef(null);
  const destinationRef = useRef(null);
  const debounceTimer = useRef(null);

  // Translations - updated tips text to match style
  const tips = {
    en: "Type your starting point and ending point here and press the Calculate button. This will show you all the routes you can travel and their fares for regular, semi-luxury, and air-conditioned buses.",
    si: "ඔබගේ ගමන් ආරම්භක ස්ථානය හා ගමන් අවසාන ස්ථානය මෙහි ටයිප් කර Calculate බොත්තම ඔබන්න. එවිට ඔබට ගමන්ගත හැකි සියලුම මාර්ග සහ ඒවායේ සාමාන්‍ය, අර්ධ සුඛෝපභෝගී හා වායුසමීකරණ බස් රථවල ගාස්තු සටහන් මෙයින් පෙන්වයි.",
    ta: "உங்கள் தொடக்கப் புள்ளி மற்றும் முடிவுப் புள்ளியை இங்கே தட்டச்சு செய்து கணக்கிடு பொத்தானை அழுத்தவும். இது நீங்கள் பயணிக்கக்கூடிய அனைத்து வழித்தடங்களையும், வழக்கமான, அரை சொகுசு மற்றும் குளிரூட்டப்பட்ட பேருந்துகளுக்கான கட்டணங்களையும் காண்பிக்கும்.",
  };

  // Language options
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

  const debounce = useCallback((func, delay) => {
    return (...args) => {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  useEffect(() => {
    const debouncedUpdate = debounce(() => {
      setDebouncedOriginQuery(originQuery);
    }, 150);
    debouncedUpdate();
  }, [originQuery, debounce]);

  useEffect(() => {
    const debouncedUpdate = debounce(() => {
      setDebouncedDestinationQuery(destinationQuery);
    }, 150);
    debouncedUpdate();
  }, [destinationQuery, debounce]);

  const getFilteredSuggestions = useCallback(
    (query, allOptions) => {
      if (!query.trim()) {
        return mainTownSuggestions;
      }

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

      const results = [...exactMatches, ...startsWithMatches, ...containsMatches];
      return results.slice(0, 50);
    },
    [mainTownSuggestions]
  );

  const filteredOriginSections = useMemo(
    () => getFilteredSuggestions(debouncedOriginQuery, allSections),
    [debouncedOriginQuery, allSections, getFilteredSuggestions]
  );

  const filteredDestinationSections = useMemo(
    () => getFilteredSuggestions(debouncedDestinationQuery, allSections),
    [debouncedDestinationQuery, allSections, getFilteredSuggestions]
  );

  const hasServiceType = (serviceTypeStr, typeToCheck) => {
    if (!serviceTypeStr) return false;
    const types = serviceTypeStr.split(",");
    return types.some((t) => t.trim() === typeToCheck);
  };

  const getAvailableServiceTypes = (routeNo) => {
    const sections = sectionMap[routeNo];
    if (!sections) return [];

    const types = new Set();
    Object.values(sections).forEach((section) => {
      if (section.service_type) {
        section.service_type.split(",").forEach((type) => {
          types.add(type.trim());
        });
      }
    });
    return Array.from(types);
  };

  const findNearestSection = (routeNo, currentSectionId, direction, relativeTo, serviceType) => {
    const sections = sectionMap[routeNo];
    if (!sections) return null;

    const isOrigin = relativeTo === "origin";
    const isUp = direction === "up";
    const shouldGoBackward = (isOrigin && isUp) || (!isOrigin && !isUp);

    let nearestSection = null;
    let bestDistance = Infinity;

    Object.values(sections).forEach((section) => {
      if (!hasServiceType(section.service_type, serviceType)) return;

      const sectionId = section.section_id;

      if (shouldGoBackward) {
        if (sectionId < currentSectionId) {
          const distance = currentSectionId - sectionId;
          if (distance < bestDistance) {
            bestDistance = distance;
            nearestSection = section;
          }
        }
      } else {
        if (sectionId > currentSectionId) {
          const distance = sectionId - currentSectionId;
          if (distance < bestDistance) {
            bestDistance = distance;
            nearestSection = section;
          }
        }
      }
    });

    return nearestSection;
  };

  const resolveRouteName = (routeNo, originName, destinationName) => {
    const routeInfo = routeMap[routeNo];
    if (routeInfo) {
      return `${routeInfo.Origin} ➜ ${routeInfo.Destination}`; // Updated arrow for style
    }

    const fallbackRoute = Object.values(routeMap).find(
      (route) => route.Origin === originName && route.Destination === destinationName
    );

    if (fallbackRoute) {
      return `${fallbackRoute.Origin} ➜ ${fallbackRoute.Destination}`; // Updated arrow for style
    }

    return "Unknown";
  };

  useEffect(() => {
    const sMap = {};
    const uniqueSections = new Set();
    allSectionsData.forEach((sec) => {
      const normalizedRouteNo = normalizeRouteNo(sec.route_no);
      if (!sMap[normalizedRouteNo]) sMap[normalizedRouteNo] = {};
      sMap[normalizedRouteNo][sec.section_name] = sec;
      uniqueSections.add(sec.section_name);
    });

    const fMap = {};
    fareStagesData.forEach((f) => {
      fMap[f.fare_stage] = f;
    });

    const rMap = {};
    allRoutesData.forEach((r) => {
      const normalizedRouteNo = normalizeRouteNo(r.Route_No);
      rMap[normalizedRouteNo] = r;
    });

    const mainTowns = ["COLOMBO", "KANDY", "GALLE", "JAFFNA", "ANURADHAPURA", "KURUNEGALA", "BADULLA", "TRINCOMALEE", "MATARA", "BATTICALOA"];
    
    // Filter the unique sections to find only the main towns
    const filteredMainTowns = Array.from(uniqueSections).filter(section => 
        mainTowns.includes(section.toUpperCase())
    ).sort();

    setSectionMap(sMap);
    setFareStageMap(fMap);
    setRouteMap(rMap);
    setAllSections(Array.from(uniqueSections).sort());
    setMainTownSuggestions(filteredMainTowns); // Set the new state
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

  const swapOriginDestination = () => {
    const tempOrigin = origin;
    const tempOriginQuery = originQuery;
    setOrigin(destination);
    setOriginQuery(destinationQuery);
    setDestination(tempOrigin);
    setDestinationQuery(tempOriginQuery);
  };

  const clearSelections = () => {
    setOrigin("");
    setDestination("");
    setOriginQuery("");
    setDestinationQuery("");
    setFareResults([]);
    setShowOriginSuggestions(false);
    setShowDestinationSuggestions(false);
  };

  const selectOrigin = useCallback((val) => {
    setOrigin(val);
    setOriginQuery(val);
    setShowOriginSuggestions(false);
  }, []);

  const selectDestination = useCallback((val) => {
    setDestination(val);
    setDestinationQuery(val);
    setShowDestinationSuggestions(false);
  }, []);

  const handleOriginChange = useCallback(
    (e) => {
      const value = e.target.value;
      setOriginQuery(value);
      const exactMatch = allSections.find((section) => section.toLowerCase() === value.toLowerCase());
      if (exactMatch) {
        setOrigin(exactMatch);
      } else {
        setOrigin(value);
      }
      setShowOriginSuggestions(true);
    },
    [allSections]
  );

  const handleDestinationChange = useCallback(
    (e) => {
      const value = e.target.value;
      setDestinationQuery(value);
      const exactMatch = allSections.find((section) => section.toLowerCase() === value.toLowerCase());
      if (exactMatch) {
        setDestination(exactMatch);
      } else {
        setDestination(value);
      }
      setShowDestinationSuggestions(true);
    },
    [allSections]
  );

  const handleKeyDown = useCallback((e, type) => {
    if (e.key === "Escape") {
      if (type === "origin") {
        setShowOriginSuggestions(false);
      } else {
        setShowDestinationSuggestions(false);
      }
    }
  }, []);

  const calculateFare = () => {
    if (!origin || !destination) {
      alert("Please select both origin and destination");
      return;
    }
    if (origin === destination) {
      alert("Origin and destination cannot be the same");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const results = [];

      Object.keys(sectionMap).forEach((routeNo) => {
        const originSec = sectionMap[routeNo][origin];
        const destSec = sectionMap[routeNo][destination];

        if (originSec && destSec) {
          const direction = originSec.section_id < destSec.section_id ? "up" : "down";

          const sectionDiffNormal = Math.abs(destSec.section_id - originSec.section_id);
          const normalFareData = fareStageMap[sectionDiffNormal];
          const normalFare = normalFareData?.normal;

          const availableServices = getAvailableServiceTypes(routeNo);

          let semi = null;
          let ac = null;
          let superLuxury = null;

          // Logic for Semi-Luxury (SL)
          if (availableServices.includes("SL")) {
            let nearOrigin = hasServiceType(originSec.service_type, "SL")
              ? originSec
              : findNearestSection(routeNo, originSec.section_id, direction, "origin", "SL");

            let nearDestination = hasServiceType(destSec.service_type, "SL")
              ? destSec
              : findNearestSection(routeNo, destSec.section_id, direction, "destination", "SL");

            if (nearOrigin && nearDestination) {
              const sectionDiff = Math.abs(nearDestination.section_id - nearOrigin.section_id);
              const semiFareData = fareStageMap[sectionDiff];
              semi = semiFareData?.semi;
            }
          }

          // Logic for AC (LX)
          if (availableServices.includes("LX")) {
            let nearOrigin = hasServiceType(originSec.service_type, "LX")
              ? originSec
              : findNearestSection(routeNo, originSec.section_id, direction, "origin", "LX");

            let nearDestination = hasServiceType(destSec.service_type, "LX")
              ? destSec
              : findNearestSection(routeNo, destSec.section_id, direction, "destination", "LX");

            if (nearOrigin && nearDestination) {
              const sectionDiff = Math.abs(nearDestination.section_id - nearOrigin.section_id);
              const acFareData = fareStageMap[sectionDiff];
              ac = acFareData?.ac;
            }
          }

          // Logic for Super Luxury (SU)
          if (availableServices.includes("SU")) {
            let nearOrigin = hasServiceType(originSec.service_type, "SU")
              ? originSec
              : findNearestSection(routeNo, originSec.section_id, direction, "origin", "SU");

            let nearDestination = hasServiceType(destSec.service_type, "SU")
              ? destSec
              : findNearestSection(routeNo, destSec.section_id, direction, "destination", "SU");

            if (nearOrigin && nearDestination) {
              const sectionDiff = Math.abs(nearDestination.section_id - nearOrigin.section_id);
              const suFareData = fareStageMap[sectionDiff];
              superLuxury = suFareData?.super;
            }
          }

          const routeName = resolveRouteName(routeNo, origin, destination);

          const fareEntry = {
            route_no: routeNo,
            route_name: routeName,
          };

          if (normalFare !== undefined && normalFare !== null) {
            fareEntry.normal = normalFare;
          }
          if (semi !== undefined && semi !== null) {
            fareEntry.semi = semi;
          }
          if (ac !== undefined && ac !== null) {
            fareEntry.ac = ac;
          }
          if (superLuxury !== undefined && superLuxury !== null) {
            fareEntry.su = superLuxury;
          }

          if (fareEntry.normal || fareEntry.semi || fareEntry.ac || fareEntry.su) {
            results.push(fareEntry);
          }
        }
      });

      results.sort((a, b) => a.route_no.localeCompare(b.route_no));
      setFareResults(results);
      setLoading(false);
      // Scroll to results/search card after calculation
      setTimeout(() => {
        if (results.length > 0) {
          window.scrollTo({ top: searchCardRef.current.offsetTop, behavior: 'smooth' });
        }
      }, 100);
    }, 500); // Reduced delay to 500ms for snappier feel
  };

  const scrollToSearch = () => {
    if (searchCardRef.current) {
      window.scrollTo({ top: searchCardRef.current.offsetTop, behavior: 'smooth' });
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      <Navbar />

      {/* Hero Section - Matched Style */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-6">
            <div className="inline-block px-4 py-2 bg-blue-500/30 backdrop-blur-sm rounded-full text-sm font-medium mb-4 animate-fade-in">
              💰 Sri Lanka's Official Bus Fare Calculator
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 animate-slide-down">
              Bus Fares by Route & Service Type
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto animate-fade-in">
              Get accurate fares for {allRoutesData.length}+ routes based on latest government revisions.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Badges - Matched Style */}
      <section className="bg-white py-8 shadow-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 text-center">
          <div className="p-4 rounded-xl bg-blue-50 shadow-md hover:shadow-lg transition-all transform hover:scale-105 cursor-default">
            <Users size={32} className="mx-auto text-blue-600 mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-blue-700">{allRoutesData.length}+</p>
            <p className="text-gray-600 text-sm sm:text-base font-semibold">Routes Tracked</p>
          </div>
          <div className="p-4 rounded-xl bg-green-50 shadow-md hover:shadow-lg transition-all transform hover:scale-105 cursor-default">
            <Award size={32} className="mx-auto text-green-600 mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-green-700">Official</p>
            <p className="text-gray-600 text-sm sm:text-base font-semibold">Fare Stages Used</p>
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

          {/* Info Box - Matched Style */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 mb-10 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up">
            <div className="flex items-start gap-4">
              <TrendingUp className="text-blue-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 Quick Guide</h3>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{tips[language] || tips['en']}</p>
                <div className="bg-white rounded-lg p-3 mt-4 border border-blue-200">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    Example: Colombo ➜ Matara | කොළඹ ➜ මාතර | கொழும்பு ➜ மாத்தறை
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Card - Matched Style */}
          <div 
            ref={searchCardRef}
            className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 mb-10 border-2 border-gray-100 hover:shadow-2xl transition-all duration-300 animate-slide-up"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-700 mb-8 text-center">
              🧮 Calculate Your Bus Fare
            </h2>

            {/* Input Fields - Matched Style */}
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
                  className="w-full border-2 border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-md transition-all text-base hover:border-blue-400"
                  autoComplete="off"
                />
                {showOriginSuggestions && (
                  <ul className="absolute z-20 w-full max-h-48 overflow-y-auto bg-white border-2 border-gray-300 rounded-xl mt-2 shadow-xl animate-slide-down">
                    {filteredOriginSections.length > 0 ? (
                      filteredOriginSections.map((sec, index) => (
                        <li
                          key={`${sec}-${index}`}
                          onClick={() => selectOrigin(sec)}
                          className="cursor-pointer px-4 py-3 hover:bg-blue-500 hover:text-white transition-all font-medium border-b border-gray-100 last:border-b-0 transform hover:scale-105 hover:pl-6"
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
                  className="w-full border-2 border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-md transition-all text-base hover:border-blue-400"
                  autoComplete="off"
                />
                {showDestinationSuggestions && (
                  <ul className="absolute z-20 w-full max-h-48 overflow-y-auto bg-white border-2 border-gray-300 rounded-xl mt-2 shadow-xl animate-slide-down">
                    {filteredDestinationSections.length > 0 ? (
                      filteredDestinationSections.map((sec, index) => (
                        <li
                          key={`${sec}-${index}`}
                          onClick={() => selectDestination(sec)}
                          className="cursor-pointer px-4 py-3 hover:bg-blue-500 hover:text-white transition-all font-medium border-b border-gray-100 last:border-b-0 transform hover:scale-105 hover:pl-6"
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

            {/* Action Buttons - Matched Style */}
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
                onClick={calculateFare}
                disabled={loading || !origin || !destination || origin === destination}
                className="flex-1 sm:flex-none flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold transform active:scale-95 hover:scale-105 hover:from-blue-700 hover:to-blue-800"
              >
                {loading ? (
                  <>
                    <Bus className="animate-spin mr-2" size={20} /> Calculating...
                  </>
                ) : (
                  <>
                    <Zap size={20} className="mr-2" /> Calculate Fare <ChevronRight size={20} className="ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Results Section - Matched Style */}
          <div className="min-h-72">
            {loading && (
              <div className="bg-white rounded-3xl shadow-xl p-12 text-center border-2 border-blue-200 animate-fade-in">
                <Bus className="animate-bounce mx-auto text-blue-600 mb-4" size={48} />
                <p className="text-gray-600 text-lg font-semibold">Calculating official fares for your routes...</p>
              </div>
            )}

            {!loading && fareResults.length === 0 && (
              <div className="bg-white rounded-3xl shadow-lg p-12 text-center border-2 border-gray-200 animate-fade-in">
                <Bus className="text-gray-400 mx-auto mb-4" size={48} />
                <p className="text-gray-600 text-lg font-semibold">
                  {origin && destination
                    ? "No common routes found between selected origin and destination."
                    : "Enter your starting point and destination to find available bus fares."}
                </p>
              </div>
            )}

            {fareResults.length > 0 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    ✓ Found <span className="text-blue-600 text-3xl sm:text-4xl">{fareResults.length}</span> route{fareResults.length > 1 ? "s" : ""}
                  </p>
                  <p className="text-gray-600 mt-3 text-sm sm:text-base font-semibold">
                    {origin} ➜ {destination}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {fareResults.map((fare, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 transform hover:scale-105 animate-slide-up"
                    >
                      <div className="mb-6 pb-4 border-b-2 border-gray-200 flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-blue-700">{fare.route_name}</h3>
                          <p className="text-sm text-gray-500 font-semibold mt-1">
                            Route #{normalizeRouteNo(fare.route_no)}
                          </p>
                        </div>
                        <div className="bg-blue-100 px-3 py-1 rounded-full text-xs font-bold text-blue-600">
                          {Object.keys(fare).filter(k => k !== 'route_no' && k !== 'route_name').length} Options
                        </div>
                      </div>
                      <div className="space-y-3 mt-4">
                        {fare.normal !== undefined && (
                          <div className="flex justify-between items-center rounded-xl p-3 bg-yellow-50 text-yellow-800 border border-yellow-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <p className="text-sm font-medium">Normal</p>
                            <p className="text-lg font-semibold">Rs. {fare.normal}</p>
                          </div>
                        )}
                        {fare.semi !== undefined && (
                          <div className="flex justify-between items-center rounded-xl p-3 bg-blue-50 text-blue-800 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <p className="text-sm font-medium">Semi Luxury</p>
                            <p className="text-lg font-semibold">Rs. {fare.semi}</p>
                          </div>
                        )}
                        {fare.ac !== undefined && (
                          <div className="flex justify-between items-center rounded-xl p-3 bg-green-50 text-green-800 border border-green-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <p className="text-sm font-medium">AC</p>
                            <p className="text-lg font-semibold">Rs. {fare.ac}</p>
                          </div>
                        )}
                        {fare.su !== undefined && (
                          <div className="flex justify-between items-center rounded-xl p-3 bg-purple-50 text-purple-800 border border-purple-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <p className="text-sm font-medium">Super Luxury</p>
                            <p className="text-lg font-semibold">Rs. {fare.su}</p>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Sticky "New Search" Button */}
      {fareResults.length > 0 && (
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

      {/* Footer and Styles */}
      <Footer />
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
    </div>
  );
};

export default FareCalculator;