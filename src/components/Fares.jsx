import React, { useEffect, useState, useRef } from "react";
import allSectionsData from "../data/all_section.json";
import fareStagesData from "../data/fare_stages.json";
import allRoutesData from "../data/allroutes.json";
import { Bus, RefreshCw, Trash2 } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const FareCalculator = () => {
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

  const originRef = useRef(null);
  const destinationRef = useRef(null);

  // ------------------- Normalization Function -------------------
  const normalizeRouteNo = (routeNo) => {
    if (!routeNo) return "";
    const strRouteNo = String(routeNo).trim();
    const parts = strRouteNo.split(/([-/])/); // keep separators
    return parts
      .map((part) => {
        if (part === "-" || part === "/") return part;
        const match = part.match(/^0*(\d+)(.*)$/);
        if (match) return match[1] + (match[2] || "");
        return part;
      })
      .join("");
  };

  // ------------------- Initialization -------------------
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

  // ------------------- Click Outside -------------------
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

  const filteredOriginSections = allSections.filter((sec) =>
    sec.toLowerCase().includes(origin.toLowerCase())
  );
  const filteredDestinationSections = allSections.filter((sec) =>
    sec.toLowerCase().includes(destination.toLowerCase())
  );

  const swapOriginDestination = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const clearSelections = () => {
    setOrigin("");
    setDestination("");
    setFareResults([]);
  };

  const selectOrigin = (val) => {
    setOrigin(val);
    setShowOriginSuggestions(false);
  };
  const selectDestination = (val) => {
    setDestination(val);
    setShowDestinationSuggestions(false);
  };

  // ------------------- Fare Calculation -------------------
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
          const sectionDiff = Math.abs(destSec.section_id - originSec.section_id);
          const fareData = fareStageMap[sectionDiff];
          if (!fareData) return;
          const routeInfo = routeMap[routeNo];
          results.push({
            route_no: routeNo, // already normalized
            route_name: routeInfo
              ? `${routeInfo.Origin} - ${routeInfo.Destination}`
              : "Unknown",
            normal: fareData.normal,
            semi: fareData.semi,
            ac: fareData.ac,
          });
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

      {/* Highlights */}
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

      {/* Fare Calculator */}
      <main className="flex-1 p-4 sm:p-6 flex justify-center">
        <div className="w-full max-w-xl sm:max-w-4xl bg-white rounded-2xl shadow-lg p-6 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-700 mb-6 sm:mb-8 text-center">
            Calculate Normal way Fares
          </h2>

          {/* Input Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
            {/* Origin */}
            <div className="relative" ref={originRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
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
                <ul className="absolute z-10 w-full max-h-48 overflow-auto bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
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

            {/* Destination */}
            <div className="relative" ref={destinationRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
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
              {showDestinationSuggestions && filteredDestinationSections.length > 0 && (
                <ul className="absolute z-10 w-full max-h-48 overflow-auto bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
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

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3 sm:gap-4">
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
              onClick={calculateFare}
              disabled={loading || !origin || !destination || origin === destination}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Calculating..." : "Calculate Fare"}
            </button>
          </div>

          {/* Results */}
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
                        <div className="rounded-lg p-2 sm:p-4 text-center bg-yellow-50 text-yellow-700 shadow-sm">
                          <p className="text-xs sm:text-sm font-semibold">Normal</p>
                          <p className="text-sm sm:text-lg font-bold">Rs. {fare.normal}</p>
                        </div>
                        <div className="rounded-lg p-2 sm:p-4 text-center bg-blue-50 text-blue-700 shadow-sm">
                          <p className="text-xs sm:text-sm font-semibold">Semi</p>
                          <p className="text-sm sm:text-lg font-bold">Rs. {fare.semi}</p>
                        </div>
                        <div className="rounded-lg p-2 sm:p-4 text-center bg-green-50 text-green-700 shadow-sm">
                          <p className="text-xs sm:text-sm font-semibold">AC</p>
                          <p className="text-sm sm:text-lg font-bold">Rs. {fare.ac}</p>
                        </div>
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
