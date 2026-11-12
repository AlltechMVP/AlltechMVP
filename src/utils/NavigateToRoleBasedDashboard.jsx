
import React from 'react';
import { Navigate } from 'react-router-dom';
import { getDashboardRouteForRole } from './roleUtils';

export default function NavigateToRoleBasedDashboard({ role }) {
  const to = getDashboardRouteForRole(role);
  return <Navigate to={to} replace />;
}
