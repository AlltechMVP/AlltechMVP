
/** 
 * @desc Main layout component with side navigation
 * @author Replit Assistant
 * @since 2025-05-12
 */
import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

const links = [
  { label: "Dashboard", path: "/recruiter" },
  { label: "Candidates", path: "/recruiter/candidates" },
  { label: "Documents", path: "/onboarding/documents" },
  { label: "Calendar", path: "/calendar" },
  { label: "Timesheet", path: "/candidate/timesheet" },
  { label: "Paystubs", path: "/candidate/paystubs" },
  { label: "Approvals", path: "/client/approvals" },
  { label: "Reports", path: "/finance/reports" },
  { label: "AI Assistant", path: "/tools/ai" },
  { label: "Audit Export", path: "/tools/export-audit" },
];

export default function SideNavLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="flex">
      <button className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded" onClick={() => setOpen(!open)}>
        ☰
      </button>
      <aside className={`w-64 bg-gray-800 text-white p-4 min-h-screen fixed md:static z-40 transition-transform ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <h2 className="text-2xl font-bold mb-6">Alltech</h2>
        <nav className="space-y-3">
          {links.map((l, i) => (
            <Link
              key={i}
              to={l.path}
              className={`block px-2 py-1 rounded ${
                location.pathname === l.path
                  ? "bg-white text-gray-900 font-bold"
                  : "text-white hover:underline"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="text-sm text-gray-300 mt-6">
          Logged in as: <br />
          {user?.email || "guest"} 
          <div className="italic mt-1">Role: {user?.role || "unknown"}</div>
        </div>
        <button 
          onClick={() => document.body.classList.toggle("dark")} 
          className="text-sm text-white mt-4 underline"
        >
          Toggle Theme
        </button>
      </aside>
      <main className="flex-grow p-6">
        <Outlet />
      </main>
    </div>
  );
}
