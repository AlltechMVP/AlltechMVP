import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { appRoutes } from "../../src/routes";

function NavBar() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  // Login stores the Supabase user under "user" in localStorage.
  // Re-read on every navigation so the nav updates right after login/logout.
  useEffect(() => {
    const storedUser = JSON.parse(
      localStorage.getItem("user") ||
        localStorage.getItem("currentUser") ||
        "null",
    );
    setUser(storedUser);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("currentUser");
    window.location.href = "/"; // Just force reload to Landing Page
  };

  if (!user) {
    return (
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-xl font-bold">
            <Link to="/">Alltech MVP</Link>
          </div>
          <div className="hidden md:flex space-x-4">
            <Link to="/login" className="hover:text-blue-500">
              Log In
            </Link>
            <Link to="/signup" className="hover:text-blue-500">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-xl font-bold shrink-0">
          <Link to="/">Alltech MVP</Link>
        </div>
        <div className="hidden md:flex items-center space-x-4 overflow-x-auto text-sm">
          {appRoutes.map(({ path, label }) => (
            <Link key={path} to={path} className="hover:text-blue-500 whitespace-nowrap">
              {label}
            </Link>
          ))}
          <button onClick={handleLogout} className="hover:text-red-500 whitespace-nowrap">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
