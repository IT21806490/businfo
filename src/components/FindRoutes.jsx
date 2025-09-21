import React, { useState, useEffect, useRef } from "react";
import allSectionsData from "../data/all_section.json";
import allRoutesData from "../data/allroutes.json";
import { Bus, RefreshCw, Trash2 } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const FindRoutes = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [matchingRoutes, setMatchingRoutes] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sectionMap, setSectionMap] = useState({});
  const [routeMap, setRouteMap] = useState({});

  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] =
    useState(false);

  const originRef = useRef(null);
  const destinationRef = useRef(null);

  // normalization
const normalizeRouteNo = (routeNo) => {
  if (!routeNo) return "";

  // Convert to string and trim spaces
  const strRouteNo = String(routeNo).trim();

  // Split by "-" or "/" while keeping separators
  const parts = strRouteNo.split(/([-/])/);

  return parts
    .map((part) => {
      if (part === "-" || part === "/") return part;

      // Remove leading zeros from numeric prefix
      const match = part.match(/^0*(\d+)(.*)$/);
      if (match) return match[1] + (match[2] || "");

      return part;
    })
    .join("");
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

    const rMap = {};
    allRoutesData.forEach((r) => {
      const normalizedRouteNo = normalizeRouteNo(r.Route_No);
      rMap[normalizedRouteNo] = r;
    });

    setSectionMap(sMap);
    setRouteMap(rMap);
    setAllSections(Array.from(uniqueSections).sort());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (originRef.current && !originRef.current.contains(event.target)) {
        setShowOriginSuggestions(false);
      }
      if (
        destinationRef.current &&
        !destinationRef.current.contains(event.target)
      ) {
        setShowDestinationSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const findRoutes = () => {
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
          const routeInfo = routeMap[routeNo];
          results.push({
            route_no: routeNo, // already normalized
            route_name: routeInfo
              ? `${routeInfo.Origin} - ${routeInfo.Destination}`
              : "Unknown",
          });
        }
      });
      results.sort((a, b) => a.route_no.localeCompare(b.route_no));
      setMatchingRoutes(results);
      setLoading(false);
    }, 1000);
  };

  const clearSelections = () => {
    setOrigin("");
    setDestination("");
    setMatchingRoutes([]);
  };

  const swapOriginDestination = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const selectOrigin = (val) => {
    setOrigin(val);
    setShowOriginSuggestions(false);
  };
  const selectDestination = (val) => {
    setDestination(val);
    setShowDestinationSuggestions(false);
  };

  const filteredOriginSections = allSections.filter((sec) =>
    sec.toLowerCase().includes(origin.toLowerCase())
  );
  const filteredDestinationSections = allSections.filter((sec) =>
    sec.toLowerCase().includes(destination.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Highlights Section */}
      <section className="bg-white py-6 sm:py-8 shadow-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 px-4 text-center">
          <div className="p-4 sm:p-5 rounded-xl bg-blue-50 shadow-md hover:shadow-lg transition">
            <p className="text-xl sm:text-2xl font-bold text-blue-700">
              {allRoutesData.length}
            </p>
            <p className="text-gray-600 text-sm sm:text-base">
              Routes Available
            </p>
          </div>
          <div className="p-4 sm:p-5 rounded-xl bg-green-50 shadow-md hover:shadow-lg transition">
            <p className="text-xl sm:text-2xl font-bold text-green-700">
              {allSections.length}
            </p>
            <p className="text-gray-600 text-sm sm:text-base">
              Sections Covered
            </p>
          </div>
          <div className="p-4 sm:p-5 rounded-xl bg-yellow-50 shadow-md hover:shadow-lg transition">
            <p className="text-xl sm:text-2xl font-bold text-yellow-700">
              100k+
            </p>
            <p className="text-gray-600 text-sm sm:text-base">
              Passengers Served
            </p>
          </div>
        </div>
      </section>

      {/* Search Area */}
      <main className="flex-1 p-4 sm:p-6 flex justify-center">
        <div className="w-full max-w-xl sm:max-w-4xl bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-700 mb-6 sm:mb-8 text-center">
            Find Your Route
          </h2>

          {/* Input Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
            {/* Origin Input */}
            <div className="relative" ref={originRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Origin
              </label>
              <input
                type="text"
                placeholder="Enter origin..."
                value={origin}
                onChange={(e) => {
                  setOrigin(e.target.value);
                  setShowOriginSuggestions(true);
                }}
                onFocus={() => setShowOriginSuggestions(true)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                autoComplete="off"
              />
              {showOriginSuggestions && filteredOriginSections.length > 0 && (
                <ul className="absolute z-10 w-full max-h-40 sm:max-h-48 overflow-auto bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
                  {filteredOriginSections.map((sec) => (
                    <li
                      key={sec}
                      onClick={() => selectOrigin(sec)}
                      className="cursor-pointer px-3 py-2 hover:bg-blue-100 transition"
                    >
                      {sec}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Destination Input */}
            <div className="relative" ref={destinationRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                autoComplete="off"
              />
              {showDestinationSuggestions &&
                filteredDestinationSections.length > 0 && (
                  <ul className="absolute z-10 w-full max-h-40 sm:max-h-48 overflow-auto bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
                    {filteredDestinationSections.map((sec) => (
                      <li
                        key={sec}
                        onClick={() => selectDestination(sec)}
                        className="cursor-pointer px-3 py-2 hover:bg-blue-100 transition"
                      >
                        {sec}
                      </li>
                    ))}
                  </ul>
                )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6">
            <button
              onClick={swapOriginDestination}
              disabled={!origin || !destination}
              className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition disabled:opacity-50"
            >
              <RefreshCw size={16} className="mr-2" /> Swap
            </button>

            <button
              onClick={clearSelections}
              className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              <Trash2 size={16} className="mr-2" /> Clear
            </button>

            <button
              onClick={findRoutes}
              disabled={
                loading || !origin || !destination || origin === destination
              }
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Searching..." : "Find Routes"}
            </button>
          </div>

          {/* Results */}
          <div>
            {loading && (
              <div className="text-center py-4">
                <Bus
                  className="animate-bounce mx-auto text-blue-600"
                  size={36}
                />
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  Searching for routes...
                </p>
              </div>
            )}

            {!loading && matchingRoutes.length === 0 && (
              <p className="text-center text-gray-500 text-sm sm:text-base mt-4">
                {origin && destination
                  ? "No routes found between selected origin and destination."
                  : "Please select origin and destination to find routes."}
              </p>
            )}

            {matchingRoutes.length > 0 && (
              <>
                <p className="mb-4 sm:mb-6 text-blue-700 font-semibold text-center text-sm sm:text-base">
                  Found {matchingRoutes.length} route
                  {matchingRoutes.length > 1 ? "s" : ""}
                </p>
                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                  {matchingRoutes.map((route, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition bg-white"
                    >
                      <h2 className="text-base sm:text-lg font-bold text-blue-800">
                        {route.route_name}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-600">
                        <span className="font-semibold">Route No:</span>{" "}
                        {route.route_no}
                      </p>
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

export default FindRoutes;
