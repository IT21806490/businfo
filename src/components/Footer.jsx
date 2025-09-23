import React from "react";
import useBlockInspect from "../hooks/useBlockInspect";

const Footer = () => {
  useBlockInspect();
  return (
    <footer className="bg-gray-900 text-white py-6 text-center text-sm">
      &copy; {new Date().getFullYear()} Businfo.click — All rights reserved.
    </footer>
  );
};

export default Footer;
