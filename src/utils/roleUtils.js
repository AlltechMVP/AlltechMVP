
// src/utils/roleUtils.js

import { mockCurrentUser } from "../data/mockCurrentUser";

// Return the current simulated user
export function getCurrentUser() {
  return mockCurrentUser;
}

// Check if current user has one of the allowed roles
export function hasAccess(allowedRoles = []) {
  const user = getCurrentUser();
  if (!user) return false;
  return allowedRoles.includes(user.role);
}
