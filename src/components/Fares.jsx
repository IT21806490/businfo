import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import allSectionsData from "../data/all_section.json";
import fareStagesData from "../data/fare_stages.json";
import allRoutesData from "../data/allroutes.json";
import { Bus, RefreshCw, Trash2 } from "lucide-react";
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
  const [sectionMap, setSectionMap] = useState({});
  const [fareStageMap, setFareStageMap] = useState({});
  const [routeMap, setRouteMap] = useState({});
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [debouncedOriginQuery, setDebouncedOriginQuery] = useState("");
  const [debouncedDestinationQuery, setDebouncedDestinationQuery] = useState("");

  const mainTowns = [
    "Colombo",
    "Kandy",
    "Galle",
    "Jaffna",
    "Anuradhapura",
    "Kurunegala",
    "Badulla",
    "Trincomalee",
    "Matara",
    "Batticaloa",
  ];

  const originRef = useRef(null);
  const destinationRef = useRef(null);
  const debounceTimer = useRef(null);

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

  const getFilteredSuggestions = useCallback((query, allOptions) => {
    if (!query.trim()) {
      return mainTowns;
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
    return results.slice(0, 50); // Show up to 50 results
  }, [mainTowns]);

  const filteredOriginSections = useMemo(() => 
    getFilteredSuggestions(debouncedOriginQuery, allSections),
    [debouncedOriginQuery, allSections, getFilteredSuggestions]
  );

  const filteredDestinationSections = useMemo(() => 
    getFilteredSuggestions(debouncedDestinationQuery, allSections),
    [debouncedDestinationQuery, allSections, getFilteredSuggestions]
  );

  const hasServiceType = (serviceTypeStr, typeToCheck) => {
    if (!serviceTypeStr) return false;
    const types = serviceTypeStr.split(',');
    return types.some(t => t.trim() === typeToCheck);
  };

  const getAvailableServiceTypes = (routeNo) => {
    const sections = sectionMap[routeNo];
    if (!sections) return [];
    
    const types = new Set();
    Object.values(sections).forEach(section => {
      if (section.service_type) {
        section.service_type.split(',').forEach(type => {
          types.add(type.trim());
        });
      }
    });
    return Array.from(types);
  };

  const findNearestSection = (routeNo, currentSectionId, direction, relativeTo, serviceType) => {
    const sections = sectionMap[routeNo];
    if (!sections) return null;

    const isOrigin = relativeTo === 'origin';
    const isUp = direction === 'up';
    
    const shouldGoBackward = (isOrigin && isUp) || (!isOrigin && !isUp);
    
    let nearestSection = null;
    let bestDistance = Infinity;

    Object.values(sections).forEach(section => {
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
      return `${routeInfo.Origin} - ${routeInfo.Destination}`;
    }

    const fallbackRoute = Object.values(routeMap).find(route => 
      route.Origin === originName && route.Destination === destinationName
    );
    
    if (fallbackRoute) {
      return `${fallbackRoute.Origin} - ${fallbackRoute.Destination}`;
    }

    return 'Unknown';
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

    setSectionMap(sMap);
    setFareStageMap(fMap);
    setRouteMap(rMap);
    setAllSections(Array.from(uniqueSections).sort());
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

  const handleOriginChange = useCallback((e) => {
    const value = e.target.value;
    setOriginQuery(value);
    
    const exactMatch = allSections.find(section => 
      section.toLowerCase() === value.toLowerCase()
    );
    
    if (exactMatch) {
      setOrigin(exactMatch);
    } else {
      setOrigin(value);
    }
    
    setShowOriginSuggestions(true);
  }, [allSections]);

  const handleDestinationChange = useCallback((e) => {
    const value = e.target.value;
    setDestinationQuery(value);
    
    const exactMatch = allSections.find(section => 
      section.toLowerCase() === value.toLowerCase()
    );
    
    if (exactMatch) {
      setDestination(exactMatch);
    } else {
      setDestination(value);
    }
    
    setShowDestinationSuggestions(true);
  }, [allSections]);

  const handleKeyDown = useCallback((e, type) => {
    if (e.key === 'Escape') {
      if (type === 'origin') {
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
          const direction = originSec.section_id < destSec.section_id ? 'up' : 'down';
          
          const sectionDiffNormal = Math.abs(destSec.section_id - originSec.section_id);
          const normalFareData = fareStageMap[sectionDiffNormal];
          const normalFare = normalFareData?.normal;

          const availableServices = getAvailableServiceTypes(routeNo);

          let semi = null;
          let ac = null;

          if (availableServices.includes('SL')) {
            let nearOrigin = hasServiceType(originSec.service_type, 'SL') 
              ? originSec 
              : findNearestSection(routeNo, originSec.section_id, direction, 'origin', 'SL');

            let nearDestination = hasServiceType(destSec.service_type, 'SL') 
              ? destSec 
              : findNearestSection(routeNo, destSec.section_id, direction, 'destination', 'SL');

            if (nearOrigin && nearDestination) {
              const sectionDiff = Math.abs(nearDestination.section_id - nearOrigin.section_id);
              const semiFareData = fareStageMap[sectionDiff];
              semi = semiFareData?.semi;
            }
          }

          if (availableServices.includes('LX')) {
            let nearOrigin = hasServiceType(originSec.service_type, 'LX') 
              ? originSec 
              : findNearestSection(routeNo, originSec.section_id, direction, 'origin', 'LX');

            let nearDestination = hasServiceType(destSec.service_type, 'LX') 
              ? destSec 
              : findNearestSection(routeNo, destSec.section_id, direction, 'destination', 'LX');

            if (nearOrigin && nearDestination) {
              const sectionDiff = Math.abs(nearDestination.section_id - nearOrigin.section_id);
              const acFareData = fareStageMap[sectionDiff];
              ac = acFareData?.ac;
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

          if (fareEntry.normal || fareEntry.semi || fareEntry.ac) {
            results.push(fareEntry);
          }
        }
      });

      results.sort((a, b) => a.route_no.localeCompare(b.route_no));
      setFareResults(results);
      setLoading(false);
    }, 1000);
  };
  

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <section className="bg-white py-6 shadow-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 text-center">
          <div className="p-4 rounded-xl bg-blue-50 shadow-md hover:shadow-lg transition">
            <p className="text-xl sm:text-2xl font-bold text-blue-700">{allRoutesData.length}</p>
            <p className="text-gray-600 text-sm sm:text-base">Routes Available</p>
          </div>
          <div className="p-4 rounded-xl bg-green-50 shadow-md hover:shadow-lg transition">
            <p className="text-xl sm:text-2xl font-bold text-green-700">{allSections.length}</p>
            <p className="text-gray-600 text-sm sm:text-base">Sections Covered</p>
          </div>
          <div className="p-4 rounded-xl bg-yellow-50 shadow-md hover:shadow-lg transition">
            <p className="text-xl sm:text-2xl font-bold text-yellow-700">100k+</p>
            <p className="text-gray-600 text-sm sm:text-base">Passengers Served</p>
          </div>
        </div>
      </section>

      <main className="flex-1 p-4 sm:p-6 flex justify-center">
        <div className="w-full max-w-xl sm:max-w-4xl bg-white rounded-2xl shadow-lg p-6 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-700 mb-6 sm:mb-8 text-center">
            Calculate Normal way Fares
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <div className="relative" ref={originRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter origin..."
                  value={originQuery}
                  onChange={handleOriginChange}
                  onFocus={() => setShowOriginSuggestions(true)}
                  onKeyDown={(e) => handleKeyDown(e, 'origin')}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200"
                  autoComplete="off"
                />
              </div>
              {showOriginSuggestions && (
                <div className="absolute z-10 w-full max-h-48 overflow-auto bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
                  {filteredOriginSections.length > 0 ? (
                    filteredOriginSections.map((sec, index) => (
                      <div
                        key={`${sec}-${index}`}
                        onClick={() => selectOrigin(sec)}
                        className="cursor-pointer px-3 py-2 hover:bg-blue-50 transition-colors duration-150 last:border-b-0 flex items-center"
                      >
                        <div className="flex-1">
                          <div className="text-sm text-gray-900">{sec}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center text-sm text-gray-500">
                      No sections found for "{debouncedOriginQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="relative" ref={destinationRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter destination..."
                  value={destinationQuery}
                  onChange={handleDestinationChange}
                  onFocus={() => setShowDestinationSuggestions(true)}
                  onKeyDown={(e) => handleKeyDown(e, 'destination')}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200"
                  autoComplete="off"
                />
              </div>
              {showDestinationSuggestions && (
                <div className="absolute z-10 w-full max-h-48 overflow-auto bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
                  {filteredDestinationSections.length > 0 ? (
                    filteredDestinationSections.map((sec, index) => (
                      <div
                        key={`${sec}-${index}`}
                        onClick={() => selectDestination(sec)}
                        className="cursor-pointer px-3 py-2 hover:bg-blue-50 transition-colors duration-150 last:border-b-0 flex items-center"
                      >
                        <div className="flex-1">
                          <div className="text-sm text-gray-900">{sec}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center text-sm text-gray-500">
                      No sections found for "{debouncedDestinationQuery}"
                    </div>
                  )}
                </div>
              )}
          </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3 sm:gap-4">
            <button
              onClick={swapOriginDestination}
              disabled={!origin || !destination}
              className="flex items-center justify-center w-full sm:w-auto px-4 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className="mr-2" /> Swap
            </button>
            <button
              onClick={clearSelections}
              className="flex items-center justify-center w-full sm:w-auto px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              <Trash2 size={16} className="mr-2" /> Clear
            </button>
            <button
              onClick={calculateFare}
              disabled={loading || !origin || !destination || origin === destination}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Calculate Fare
            </button>
          </div>

          <div>
            {loading && (
              <div className="text-center py-4">
                <Bus className="animate-bounce mx-auto text-blue-600" size={36} />
                <p className="text-gray-600 mt-2 text-sm sm:text-base">Finding best routes...</p>
              </div>
            )}

            {!loading && fareResults.length === 0 && (
              <p className="text-center text-gray-500 text-sm sm:text-base mt-4">
                {origin && destination
                  ? "No routes found between selected origin and destination."
                  : "Please select origin and destination to calculate fare."}
              </p>
            )}

            {fareResults.length > 0 && (
              <>
                <p className="mb-4 sm:mb-6 text-blue-700 font-semibold text-center text-sm sm:text-base">
                  Found {fareResults.length} route{fareResults.length > 1 ? "s" : ""}
                </p>
                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                  {fareResults.map((fare, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition bg-white"
                    >
                      <div className="mb-2">
                        <h2 className="text-base sm:text-lg font-bold text-blue-800">{fare.route_name}</h2>
                        <p className="text-xs sm:text-sm text-gray-600">
                          <span className="font-semibold">Route No:</span> {fare.route_no}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-2 sm:mt-4">
                        {fare.normal && (
                          <div className="rounded-lg p-2 sm:p-4 text-center bg-yellow-50 text-yellow-700 shadow-sm">
                            <p className="text-xs sm:text-sm font-semibold">Normal</p>
                            <p className="text-sm sm:text-lg font-bold">Rs. {fare.normal}</p>
                          </div>
                        )}
                        {fare.semi && (
                          <div className="rounded-lg p-2 sm:p-4 text-center bg-blue-50 text-blue-700 shadow-sm">
                            <p className="text-xs sm:text-sm font-semibold">Semi</p>
                            <p className="text-sm sm:text-lg font-bold">Rs. {fare.semi}</p>
                          </div>
                        )}
                        {fare.ac && (
                          <div className="rounded-lg p-2 sm:p-4 text-center bg-green-50 text-green-700 shadow-sm">
                            <p className="text-xs sm:text-sm font-semibold">AC</p>
                            <p className="text-sm sm:text-lg font-bold">Rs. {fare.ac}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FareCalculator;