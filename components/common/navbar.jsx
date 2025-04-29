import { Link } from 'react-router-dom';

function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-xl font-bold">
          <Link to="/">Alltech MVP</Link>
        </div>
        <div className="space-x-4">
          <Link to="/sales-rep-dashboard" className="hover:text-blue-500">Sales Rep Dashboard</Link>
          <Link to="/sales-manager-dashboard" className="hover:text-blue-500">Sales Manager Dashboard</Link>
          <Link to="/branch-manager-dashboard" className="hover:text-blue-500">Branch Manager Dashboard</Link>
          <Link to="/director-dashboard" className="hover:text-blue-500">Director Dashboard</Link>
          <Link to="/cfo-dashboard" className="hover:text-blue-500">CFO Dashboard</Link>
          <Link to="/ceo-dashboard" className="hover:text-blue-500">CEO Dashboard</Link>
          <Link to="/client-dashboard" className="hover:text-blue-500">Client Dashboard</Link>
          <Link to="/job-search" className="hover:text-blue-500">Job Search</Link>
          <Link to="/candidate/payroll" className="hover:text-blue-500">Payroll View</Link>
          <Link to="/candidate/notifications" className="hover:text-blue-500">Notifications</Link>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
