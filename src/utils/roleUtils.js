
// src/utils/roleUtils.js

export const ROLE_ROUTES = {
  admin: '/admin',
  ceo: '/ceo',
  cfo: '/cfo',
  director: '/director',
  'branch-manager': '/branch-manager',
  'sales-rep': '/sales',
  'sales-manager': '/sales-manager',
  recruiter: '/recruiter',
  candidate: '/candidate',
  client: '/client/approvals',
  backoffice: '/finance/reports',
};

export function getDashboardRouteForRole(role) {
  if (!role) return '/';
  return ROLE_ROUTES[role] || '/recruiter';
}

export function hasAccess(userRole, allowedRoles) {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(userRole);
}
