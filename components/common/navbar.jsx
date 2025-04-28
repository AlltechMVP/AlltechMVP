
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function NavBar() {
  const location = useLocation();
  
  const links = [
    { to: '/sales-rep-dashboard', label: 'Sales Rep' },
    { to: '/sales-manager-dashboard', label: 'Sales Manager' },
    { to: '/branch-manager-dashboard', label: 'Branch Manager' },
    { to: '/director-dashboard', label: 'Director' },
    { to: '/cfo-dashboard', label: 'CFO' },
    { to: '/ceo-dashboard', label: 'CEO' },
    { to: '/candidate/timesheet-entry', label: 'Timesheet' },
    { to: '/candidate/payroll', label: 'Payroll' },
    { to: '/assignment-overview', label: 'Assignments' },
    { to: '/revenue-overview', label: 'Revenue' },
    { to: '/client-dashboard', label: 'Client Portal' },
    { to: '/client/candidate-approvals', label: 'Approvals' },
    { to: '/notification-center', label: 'Notifications' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-800 shadow-lg z-50">
      <div className="overflow-x-auto">
        <div className="flex space-x-4 p-4 min-w-max">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === to
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
