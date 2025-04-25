
import React from "react";
import { Link } from "react-router-dom";

export default function TopNav() {
  const user = JSON.parse(localStorage.getItem("currentUser"));

  return (
    <div className="flex items-center justify-between bg-gray-800 text-white p-4 shadow">
      <div className="font-bold text-lg">AllTech Platform</div>
      <div className="flex items-center space-x-4">
        <Link to="/global-search" className="hover:underline">Search</Link>
        <Link to="/notification-center" className="hover:underline">Alerts</Link>
        <span className="text-sm">{user?.name} ({user?.role})</span>
      </div>
    </div>
  );
}
