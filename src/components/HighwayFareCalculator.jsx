import React, { useEffect, useState, useRef } from "react";
import allRoutesData from "../data/allroutes.json";
import highwaySectionsData from "../data/highway_sections.json";
import { Bus, RefreshCw, Trash2 } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const HighwayFareCalculator = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [highwayResults, setHighwayResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allHighwaySections, setAllHighwaySections] = useState([]);
  const [highwayMap, setHighwayMap] = useState({});
  const [highwaySectionNameMap, setHighwaySectionNameMap] = useState({});
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  const originRef = useRef(null);
  const destinationRef = useRef(null);

const normalizeRouteNo = (routeNo) => {
  if (!routeNo) return "";
  let str = String(routeNo).trim();

  // Split prefix (letters + space) from the rest
  const prefixMatch = str.match(/^([A-Za-z\s]+)?(.*)$/);
  let prefix = prefixMatch[1] ? prefixMatch[1].trim() : "";
  let mainPart = prefixMatch[2] || "";

  // If mainPart starts with a separator like "-" or "/", remove it
  if (mainPart.startsWith("-") || mainPart.startsWith("/")) {
    mainPart = mainPart.slice(1);
  }

  // Normalize numeric parts while keeping separators
  const parts = mainPart.split(/([-/])/);
  const normalizedParts = parts.map((part) => {
    if (part === "-" || part === "/") return part;
    const match = part.match(/^0*(\d+)(.*)$/);
    if (match) return match[1] + (match[2] || "");
    return part;
  });

  return (prefix ? prefix + " " : "") + normalizedParts.join("");
};


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

  const filteredOriginSections = allHighwaySections.filter((sec) =>
    sec.toLowerCase().includes(origin.toLowerCase())
  );
  const filteredDestinationSections = allHighwaySections.filter((sec) =>
    sec.toLowerCase().includes(destination.toLowerCase())
  );

  const selectOrigin = (val) => { setOrigin(val); setShowOriginSuggestions(false); };
  const selectDestination = (val) => { setDestination(val); setShowDestinationSuggestions(false); };
  const swapOriginDestination = () => { setOrigin(destination); setDestination(origin); };
  const clearSelections = () => { setOrigin(""); setDestination(""); setHighwayResults([]); };

  const calculateHighwayFare = () => {
    if (!origin || !destination || origin === destination) return;
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
            route_name: routeInfo ? `${routeInfo.Origin} → ${routeInfo.Destination}` : "Unknown",
            highway: Math.abs(fares[upDestination] - fares[upOrigin]).toFixed(2),
            service_type: service_type === "SUPER" ? "SUPER LUXURY" : service_type === "TEMP" ? "NORMAL TEMP HIGHWAY" : service_type,
          });
        }
      });

      setHighwayResults(results);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Highlights Section */}
      <section className="bg-white py-6 sm:py-8 shadow-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 px-4 text-center">
          <div className="p-4 sm:p-5 rounded-xl bg-orange-50 shadow-md hover:shadow-lg transition">
            <p className="text-xl sm:text-2xl font-bold text-orange-700">{allRoutesData.length}</p>
            <p className="text-gray-600 text-sm sm:text-base">Routes Available</p>
          </div>
          <div className="p-4 sm:p-5 rounded-xl bg-orange-100 shadow-md hover:shadow-lg transition">
            <p className="text-xl sm:text-2xl font-bold text-orange-800">{allHighwaySections.length}</p>
            <p className="text-gray-600 text-sm sm:text-base">Sections Covered</p>
          </div>
          <div className="p-4 sm:p-5 rounded-xl bg-orange-200 shadow-md hover:shadow-lg transition">
            <p className="text-xl sm:text-2xl font-bold text-orange-900">100k+</p>
            <p className="text-gray-600 text-sm sm:text-base">Passengers Served</p>
          </div>
        </div>
      </section>

      {/* Main Calculator */}
      <main className="flex-1 p-4 sm:p-6 flex justify-center">
        <div className="w-full max-w-xl sm:max-w-4xl bg-white rounded-2xl shadow-lg p-6 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-orange-700 mb-6 sm:mb-8 text-center">
            Calculate Expressway Fares
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
                onChange={(e) => setOrigin(e.target.value)}
                onFocus={() => setShowOriginSuggestions(true)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm"
                autoComplete="off"
              />
              {showOriginSuggestions && filteredOriginSections.length > 0 && (
                <ul className="absolute z-10 w-full max-h-48 overflow-auto bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
                  {filteredOriginSections.map((sec) => (
                    <li key={sec} onClick={() => selectOrigin(sec)} className="cursor-pointer px-3 py-2 hover:bg-orange-100 transition">{sec}</li>
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
                onChange={(e) => setDestination(e.target.value)}
                onFocus={() => setShowDestinationSuggestions(true)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm"
                autoComplete="off"
              />
              {showDestinationSuggestions && filteredDestinationSections.length > 0 && (
                <ul className="absolute z-10 w-full max-h-48 overflow-auto bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
                  {filteredDestinationSections.map((sec) => (
                    <li key={sec} onClick={() => selectDestination(sec)} className="cursor-pointer px-3 py-2 hover:bg-orange-100 transition">{sec}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3 sm:gap-4">
            <button onClick={swapOriginDestination} disabled={!origin || !destination} className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition disabled:opacity-50">
              <RefreshCw size={16} className="mr-2" /> Swap
            </button>
            <button onClick={clearSelections} className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
              <Trash2 size={16} className="mr-2" /> Clear
            </button>
            <button onClick={calculateHighwayFare} disabled={!origin || !destination || origin === destination} className="w-full sm:w-auto px-6 py-2 bg-orange-600 text-white rounded-lg shadow hover:bg-orange-700 transition disabled:opacity-50">
              {loading ? "Calculating..." : "Calculate Fares"}
            </button>
          </div>

          {/* Results / Loading */}
          <div>
            {loading && (
              <div className="text-center py-4">
                <Bus className="animate-bounce mx-auto text-orange-600" size={36} />
                <p className="text-gray-600 mt-2 text-sm sm:text-base">Finding highway fares...</p>
              </div>
            )}
            {!loading && !origin && !destination && (
              <p className="text-center text-gray-500 text-sm sm:text-base mt-4">Please select origin and destination to calculate fare.</p>
            )}
            {!loading && origin && destination && highwayResults.length === 0 && (
              <p className="text-center text-gray-500 text-sm sm:text-base mt-4">No highway fares found for selected origin/destination.</p>
            )}
            {!loading && highwayResults.length > 0 && (
              <>
                <p className="mb-4 sm:mb-6 text-orange-700 font-semibold text-center text-sm sm:text-base">
                  Found {highwayResults.length} route{highwayResults.length > 1 ? "s" : ""}
                </p>
                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                  {highwayResults.map((fare, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition bg-orange-50">
                      <h2 className="text-base sm:text-lg font-bold text-orange-700">{fare.route_name}</h2>
                      <p className="text-xs sm:text-sm text-gray-600"><span className="font-semibold">Route No:</span> {fare.route_no}</p>
                      <div className="mt-2 sm:mt-4 text-center">
                        <p className="text-sm sm:text-lg font-bold text-orange-700">{fare.service_type}</p>
                        <p className="text-sm sm:text-base font-semibold">Rs. {fare.highway}</p>
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

export default HighwayFareCalculator;
