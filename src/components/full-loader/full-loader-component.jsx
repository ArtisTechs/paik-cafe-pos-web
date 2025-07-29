import React, { useState, useEffect } from "react";
import "./full-loader-component.css";

const FullLoaderComponent = ({ isLoading }) => {
  const [visibleSpinners, setVisibleSpinners] = useState([]);

  useEffect(() => {
    if (isLoading) {
      // Reset spinners and then show them one by one
      setVisibleSpinners([]);
      const delays = [50, 100, 150, 200, 250, 300, 350, 400]; // Delay times for each spinner

      // Set timeout for each spinner
      delays.forEach((delay, index) => {
        setTimeout(() => {
          setVisibleSpinners((prev) => [...prev, index]);
        }, delay);
      });
    } else {
      // Hide all spinners if not loading
      setVisibleSpinners([]);
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      {visibleSpinners.includes(0) && (
        <div
          className="spinner-grow primary-color me-2"
          role="status"
        ></div>
      )}
      {visibleSpinners.includes(1) && (
        <div
          className="spinner-grow primary-color me-2"
          role="status"
        ></div>
      )}
      {visibleSpinners.includes(2) && (
        <div
          className="spinner-grow primary-color me-2"
          role="status"
        ></div>
      )}
      {visibleSpinners.includes(3) && (
        <div
          className="spinner-grow primary-color me-2"
          role="status"
        ></div>
      )}
      {visibleSpinners.includes(4) && (
        <div
          className="spinner-grow primary-color me-2"
          role="status"
        ></div>
      )}
      {visibleSpinners.includes(5) && (
        <div
          className="spinner-grow primary-color me-2"
          role="status"
        ></div>
      )}
      {visibleSpinners.includes(6) && (
        <div
          className="spinner-grow primary-color me-2"
          role="status"
        ></div>
      )}
    </div>
  );
};

export default FullLoaderComponent;
