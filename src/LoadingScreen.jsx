import React from "react";
import "./LoadingScreen.css";

const LoadingScreen = () => {
  return (
    <div className="loading-screen-bg">
      <div className="loading-screen-center">
        <img src="/icon-192.png" alt="Logo CRM" className="loading-screen-logo" />
      </div>
    </div>
  );
};

export default LoadingScreen;
