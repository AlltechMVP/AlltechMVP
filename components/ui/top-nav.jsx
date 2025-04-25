
import React from "react";
import { Link } from "react-router-dom";

export default function TopNav() {
  const user = JSON.parse(localStorage.getItem("currentUser"));

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    window.location.href = "/";
  };

  return (
    <div className="flex items-center justify-between bg-gray-800 text-white p-4 shadow">
      <div className="font-bold text-lg">AllTech Platform</div>
      <div className="flex items-center space-x-4">
        <Link to="/global-search" className="hover:underline">Search</Link>
        <Link to="/notification-center" className="hover:underline">Alerts</Link>
        <span className="text-sm">{user?.name} ({user?.role})</span>
        <button onClick={handleLogout} className="text-white hover:underline ml-4">Logout</button>
      </div>
    </div>
  );
}
