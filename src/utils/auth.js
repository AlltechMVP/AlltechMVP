
// src/utils/auth.js

const VALID_ROLES = [
  'ceo',
  'cfo', 
  'director',
  'sales-manager',
  'sales-rep',
  'recruiter',
  'client',
  'branch-manager'
];

// Mock user validation
function validateCredentials(email, password) {
  // Test accounts
  const testUsers = {
    'test.ceo@alltech.com': { password: 'test123', role: 'ceo', name: 'CEO Test' },
    'test.recruiter@alltech.com': { password: 'test123', role: 'recruiter', name: 'Recruiter Test' },
    'test.client@alltech.com': { password: 'test123', role: 'client', name: 'Client Test' }
  };

  if (testUsers[email]?.password === password) {
    return { 
      valid: true, 
      user: {
        id: `U${Math.random().toString(36).substr(2, 9)}`,
        email,
        name: testUsers[email].name,
        role: testUsers[email].role
      }
    };
  }
  return { valid: false };
}

// Login with role validation
export async function login(email, password) {
  const { valid, user } = validateCredentials(email, password);
  
  if (valid) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    return { data: user, error: null };
  }
  
  return { data: null, error: 'Invalid credentials' };
}

// Signup with role assignment
export async function signup(email, password, role = 'client') {
  if (!VALID_ROLES.includes(role)) {
    return { data: null, error: 'Invalid role' };
  }

  const user = {
    id: `U${Math.random().toString(36).substr(2, 9)}`,
    email,
    name: email.split('@')[0],
    role
  };

  localStorage.setItem('currentUser', JSON.stringify(user));
  return { data: user, error: null };
}

// Logout
export async function logout() {
  localStorage.removeItem('currentUser');
  return { error: null };
}

// Get current session
export function getSession() {
  try {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    return { session: user, error: null };
  } catch (err) {
    return { session: null, error: 'Invalid session data' };
  }
}
