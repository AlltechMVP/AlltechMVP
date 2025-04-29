
import { mockCurrentUser } from "../data/mockCurrentUser";

// Get current user (simulated now, later real session)
export function getCurrentUser() {
  return mockCurrentUser;
}

// Check if user has one of the allowed roles
export function hasAccess(allowedRoles = []) {
  const user = getCurrentUser();
  if (!user) return false;
  return allowedRoles.includes(user.role);
}
