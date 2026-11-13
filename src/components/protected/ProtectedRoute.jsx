import React from 'react';
import { Navigate } from 'react-router-dom';
import { isDev } from '@/config/dev';
import { useAuth } from '@/context/AuthContext.jsx';
import { getDashboardRouteForRole } from '@/utils/roleUtils';
import { useCapabilities, getFallbackRoute } from '@/lib/capabilities';
import Loader from '@/components/ui/Loader.jsx';

// Slice 7 (ATS/CRM milestone): routes are gated on CAPABILITIES, not roles.
// allowedCapabilities is an AND list — the user must hold every listed
// capability (most routes need exactly one). Deny-by-default: a capability
// not in the resolved set denies access. While capabilities are resolving
// (live fetch with a defaults fallback) the route shows a loader instead of
// rendering gated UI on a stale set. A denied user is sent to the first
// dashboard they CAN view (capability-aware fallback), never to a dashboard
// they are denied from — that avoids a redirect loop when a dashboard
// capability itself is revoked.
// allowedRoles is kept as a legacy fallback but no route uses it anymore.
export default function ProtectedRoute({ allowedRoles = [], allowedCapabilities = [], requireAuth = true, children }) {
  const { loading, profile, role } = useAuth();
  const { hasCapability, loading: capsLoading } = useCapabilities();

  if (loading) return <div className="p-4"><Loader label="Checking session…" /></div>;

  const isLoggedIn = Boolean(profile?.id || profile?.email || role);
  if (requireAuth && !isLoggedIn && !isDev) {
    return <Navigate to="/login" replace />;
  }

  // Wait for capabilities to resolve before judging a capability gate.
  if (allowedCapabilities.length > 0 && capsLoading) {
    return <div className="p-4"><Loader label="Checking permissions…" /></div>;
  }

  if (allowedCapabilities.length > 0 && !allowedCapabilities.every((c) => hasCapability(c))) {
    return <Navigate to={getFallbackRoute(role, hasCapability)} replace />;
  }

  if (allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
    return <Navigate to={getDashboardRouteForRole(role)} replace />;
  }

  return children;
}
