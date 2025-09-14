// src/NotificationToast.jsx
import React, { useEffect } from "react";
import "./NotificationToast.css";

export default function NotificationToast({ open, title, body, onClose }) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="notification-toast">
      <div className="notification-toast-content">
        <div className="notification-toast-title">{title}</div>
        <div className="notification-toast-body">{body}</div>
        <button className="notification-toast-close" onClick={onClose}>&times;</button>
      </div>
    </div>
  );
}
