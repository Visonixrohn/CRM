import React, { useEffect } from "react";
import "./LoadingScreen.css";

const LoadingScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3500); // 3.5 segundos

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="loading-screen">
      <img
        src="https://i.imgur.com/4Ak6h3y.png"
        alt="Cargando..."
        className="loading-image"
      />
    </div>
  );
};

export default LoadingScreen;
