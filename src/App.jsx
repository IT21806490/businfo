import React, { useState, useEffect } from "react";
import Home from "./components/Home";
import FindRoutes from "./components/FindRoutes";
import Contact from "./components/Contact";
import Fares from "./components/Fares";
import HighwayFareCalculator from "./components/HighwayFareCalculator";

// Map paths to components
const routes = {
  "/": <Home />,
  "/routes": <FindRoutes />,
  "/fares": <Fares />,
  "/highway-fares": <HighwayFareCalculator />,
  "/contact": <Contact />,
};

const App = () => {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (to) => {
    window.history.pushState({}, "", to);
    setPath(to);
  };

  return (
    <div>
      {/* Navigation */}
      <nav>
        <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }}></a>
        <a href="/routes" onClick={(e) => { e.preventDefault(); navigate("/routes"); }}></a>
        <a href="/fares" onClick={(e) => { e.preventDefault(); navigate("/fares"); }}></a>
        <a href="/highway-fares" onClick={(e) => { e.preventDefault(); navigate("/highway-fares"); }}></a>
        <a href="/contact" onClick={(e) => { e.preventDefault(); navigate("/contact"); }}></a>
      </nav>

      {/* Render page */}
      <main>{routes[path] || <Home />}</main>
    </div>
  );
};

export default App;
