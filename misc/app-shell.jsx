
import React from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';

export default function AppShell() {
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  if (!currentUser?.id) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { path: '/admin-dashboard', label: 'Admin', roles: ['admin'] },
    { path: '/recruiter-dashboard', label: 'Recruiter', roles: ['recruiter'] },
    { path: '/sales-dashboard', label: 'Sales', roles: ['sales_rep'] },
    { path: '/client-approvals', label: 'Client', roles: ['client'] },
    { path: '/job-orders', label: 'Jobs', roles: ['admin', 'recruiter', 'sales_rep'] },
    { path: '/import-export', label: 'Import/Export', roles: ['admin'] },
    { path: '/vms', label: 'VMS', roles: ['admin', 'recruiter'] },
    { path: '/executive-dashboard', label: 'Executive', roles: ['admin', 'executive'] }
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(currentUser.role)
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg hidden md:block">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Alltech Staffing</h2>
          <p className="text-sm text-gray-600 mt-1">
            {currentUser.name} ({currentUser.role})
          </p>
        </div>
        <nav className="p-4">
          {filteredNavItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-2 rounded-lg mb-1 ${
                location.pathname === item.path
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t">
        <nav className="flex justify-around p-2">
          {filteredNavItems.slice(0, 4).map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`p-2 text-center ${
                location.pathname === item.path
                  ? 'text-blue-500'
                  : 'text-gray-600'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-4 md:p-8 pb-16 md:pb-8">
        <Outlet />
      </div>
    </div>
  );
}
