import React from 'react';
import { Navigate } from 'react-router-dom';
import { isDev } from '@/config/dev';
import { useAuth } from '@/context/AuthContext.jsx';
import { getDashboardRouteForRole } from '@/utils/roleUtils';
import Loader from '@/components/ui/Loader.jsx';

export default function ProtectedRoute({ allowedRoles = [], requireAuth = true, children }) {
  const { loading, profile, role } = useAuth();

  if (loading) return <div className="p-4"><Loader label="Checking session…" /></div>;

  const isLoggedIn = Boolean(profile?.id || profile?.email || role);
  if (requireAuth && !isLoggedIn && !isDev) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
    return <Navigate to={getDashboardRouteForRole(role)} replace />;
  }

  return children;
}