// Import auth functions from auth.js
import { signUp, login, logout } from './js/auth.js';

// Make functions available globally
window.signUp = signUp;
window.login = login;
window.logout = logout;