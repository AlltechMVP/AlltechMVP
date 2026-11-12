
import { Link, useLocation } from "react-router-dom";

const linkCls = (active) =>
  `block px-3 py-1.5 rounded-md text-sm ${active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-200'}`;

export default function Sidebar() {
  let user = {};
  try { user = JSON.parse(localStorage.getItem('user') || '{}') || {}; } catch { user = {}; }
  const role = user.role;
  const { pathname } = useLocation();

  return (
    <aside className="w-64 bg-gray-100 p-4 h-full">
      <h2 className="font-semibold mb-4">Navigation</h2>
      <ul className="space-y-1">
        {role === 'recruiter' && (
          <>
            <li><Link to="/recruiter" className={linkCls(pathname === '/recruiter')}>Recruiter Dashboard</Link></li>
            <li><Link to="/recruiter/board" className={linkCls(pathname === '/recruiter/board')}>Pipeline Board</Link></li>
          </>
        )}
        {role === 'candidate' && (
          <>
            <li><Link to="/candidate" className={linkCls(pathname === '/candidate')}>My Dashboard</Link></li>
          </>
        )}
        {role === 'client' && (
          <>
            <li className="pt-1 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client Portal</li>
            <li><Link to="/client" className={linkCls(pathname === '/client')}>Dashboard</Link></li>
            <li><Link to="/client/jobs" className={linkCls(pathname.startsWith('/client/jobs'))}>Jobs</Link></li>
            <li><Link to="/client/timecards" className={linkCls(pathname === '/client/timecards')}>Timecards</Link></li>
          </>
        )}

        <li className="pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recruiting</li>
        <li><Link to="/candidates" className={linkCls(pathname.startsWith('/candidates'))}>Candidate Pipeline</Link></li>
        <li><Link to="/jobs" className={linkCls(pathname === '/jobs')}>Jobs</Link></li>

        <li className="pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Operations</li>
        <li><Link to="/assignments" className={linkCls(pathname.startsWith('/assignments'))}>Assignments</Link></li>
        <li><Link to="/timekeeping" className={linkCls(pathname.startsWith('/timekeeping'))}>Timekeeping</Link></li>
        <li><Link to="/payroll-queue" className={linkCls(pathname.startsWith('/payroll-queue'))}>Payroll Queue</Link></li>
        <li><Link to="/invoices" className={linkCls(pathname.startsWith('/invoices'))}>Invoices</Link></li>
        <li><Link to="/ar-aging" className={linkCls(pathname === '/ar-aging')}>AR Aging</Link></li>

        <li className="pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Resources</li>
        <li><Link to="/kb" className={linkCls(pathname === '/kb')}>Knowledge Base</Link></li>

        <li className="pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</li>
        <li><Link to="/tools" className={linkCls(pathname === '/tools')}>Tools</Link></li>
      </ul>
    </aside>
  );
}
