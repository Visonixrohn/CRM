import React from "react";
import "./ComCard.css";

const ComCard = ({ title, value, icon, className = "" }) => (
  <div className={`com-card ${className}`}>
    <div className="com-card-title">
      {icon && <span className="com-card-icon">{icon}</span>} {title}
    </div>
    <div className="com-card-value">{value}</div>
  </div>
);

export default ComCard;
