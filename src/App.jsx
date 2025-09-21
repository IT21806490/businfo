import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import FindRoutes from './components/FindRoutes';
import Contact from './components/Contact';
import Fares from './components/Fares';
import HighwayFareCalculator from './components/HighwayFareCalculator';
import '../src/main';

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/routes" element={<FindRoutes />} />
        <Route path="/fares" element={<Fares />} />
        <Route path="/highway-fares" element={<HighwayFareCalculator />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
