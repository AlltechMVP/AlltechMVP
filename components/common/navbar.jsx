import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

function NavBar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "null",
    );
    setUser(currentUser);
    // REMOVE navigate('/login') to prevent crash
  }, []);

  const handleLogout = () => {
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
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-xl font-bold">
          <Link to="/">Alltech MVP</Link>
        </div>
        <div className="hidden md:flex space-x-4">
          {user.role === "sales_rep" && (
            <Link to="/sales-rep-dashboard" className="hover:text-blue-500">
              Sales Rep Dashboard
            </Link>
          )}
          {user.role === "sales_manager" && (
            <Link to="/sales-manager-dashboard" className="hover:text-blue-500">
              Sales Manager Dashboard
            </Link>
          )}
          {user.role === "branch_manager" && (
            <Link
              to="/branch-manager-dashboard"
              className="hover:text-blue-500"
            >
              Branch Manager Dashboard
            </Link>
          )}
          {user.role === "director" && (
            <Link to="/director-dashboard" className="hover:text-blue-500">
              Director Dashboard
            </Link>
          )}
          {user.role === "cfo" && (
            <Link to="/cfo-dashboard" className="hover:text-blue-500">
              CFO Dashboard
            </Link>
          )}
          {user.role === "ceo" && (
            <Link to="/ceo-dashboard" className="hover:text-blue-500">
              CEO Dashboard
            </Link>
          )}
          {user.role === "client" && (
            <Link to="/client-dashboard" className="hover:text-blue-500">
              Client Dashboard
            </Link>
          )}
          <Link to="/job-search" className="hover:text-blue-500">
            Job Search
          </Link>
          <button onClick={handleLogout} className="hover:text-red-500">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
