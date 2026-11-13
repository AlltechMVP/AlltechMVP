
import { Link, useLocation } from "react-router-dom";
import { canUseRoleSwitcher } from "@/config/dev";

const linkCls = (active) =>
  `block px-3 py-1.5 rounded-md text-sm ${active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-200'}`;

export default function Sidebar() {
  let user = {};
  try { user = JSON.parse(localStorage.getItem('user') || '{}') || {}; } catch { user = {}; }
  // The role override (when set) wins, so the sidebar follows the
  // role being tested/presented instead of the signed-in account's real
  // role. Slice 7: the override is read ONLY in dev + Demo Mode — in
  // production the sidebar always follows the signed-in account's real
  // role.
  let role = user.role;
  try { if (canUseRoleSwitcher) role = localStorage.getItem('alltech_role_override') || role; } catch { /* ignore */ }
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
            <li><Link to="/candidate/jobs" className={linkCls(pathname === '/candidate/jobs')}>Job Board</Link></li>
          </>
        )}
        {role === 'client' && (
          <>
            <li className="pt-1 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client Portal</li>
            <li><Link to="/client" className={linkCls(pathname === '/client')}>Dashboard</Link></li>
            <li><Link to="/client/approvals" className={linkCls(pathname === '/client/approvals')}>Approvals</Link></li>
            <li><Link to="/client/jobs" className={linkCls(pathname.startsWith('/client/jobs'))}>Jobs</Link></li>
            <li><Link to="/client/timecards" className={linkCls(pathname === '/client/timecards')}>Timecards</Link></li>
            <li><Link to="/client/metrics" className={linkCls(pathname === '/client/metrics')}>Metrics</Link></li>
            <li><Link to="/client/portal" className={linkCls(pathname === '/client/portal')}>Portal</Link></li>
          </>
        )}
        {role === 'director' && (
          <>
            <li><Link to="/director" className={linkCls(pathname === '/director')}>Director Dashboard</Link></li>
          </>
        )}
        {role === 'branch-manager' && (
          <>
            <li><Link to="/branch-manager" className={linkCls(pathname === '/branch-manager')}>Branch Dashboard</Link></li>
          </>
        )}
        {role === 'sales-rep' && (
          <>
            <li><Link to="/sales" className={linkCls(pathname === '/sales')}>Sales Pipeline</Link></li>
          </>
        )}
        {role === 'sales-manager' && (
          <>
            <li><Link to="/sales-manager" className={linkCls(pathname === '/sales-manager')}>Sales Dashboard</Link></li>
          </>
        )}
        {role === 'backoffice' && (
          <>
            <li><Link to="/finance/reports" className={linkCls(pathname === '/finance/reports')}>Finance Reports</Link></li>
          </>
        )}

        <li className="pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recruiting</li>
        <li><Link to="/candidates" className={linkCls(pathname.startsWith('/candidates'))}>Candidate Pipeline</Link></li>
        <li><Link to="/jobs" className={linkCls(pathname === '/jobs')}>Jobs</Link></li>

        <li className="pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Operations</li>
        <li><Link to="/assignments" className={linkCls(pathname.startsWith('/assignments'))}>Assignments</Link></li>
        <li><Link to="/assignments/tracker" className={linkCls(pathname === '/assignments/tracker')}>Assignment Tracker</Link></li>
        <li><Link to="/timekeeping" className={linkCls(pathname.startsWith('/timekeeping'))}>Timekeeping</Link></li>
        <li><Link to="/timekeeping/entry" className={linkCls(pathname === '/timekeeping/entry')}>Timecard Entry</Link></li>
        <li><Link to="/payroll-queue" className={linkCls(pathname.startsWith('/payroll-queue'))}>Payroll Queue</Link></li>
        <li><Link to="/payroll" className={linkCls(pathname === '/payroll')}>Payroll Summary</Link></li>
        <li><Link to="/invoices" className={linkCls(pathname.startsWith('/invoices'))}>Invoices</Link></li>
        <li><Link to="/ar-aging" className={linkCls(pathname === '/ar-aging')}>AR Aging</Link></li>
        <li><Link to="/scheduler" className={linkCls(pathname === '/scheduler')}>Scheduler</Link></li>

        <li className="pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Resources</li>
        <li><Link to="/kb" className={linkCls(pathname === '/kb')}>Knowledge Base</Link></li>
        <li><Link to="/notifications" className={linkCls(pathname === '/notifications')}>Notifications</Link></li>

        <li className="pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Settings</li>
        <li><Link to="/settings/account" className={linkCls(pathname === '/settings/account')}>Account Settings</Link></li>
        <li><Link to="/settings/billing" className={linkCls(pathname === '/settings/billing')}>Billing Settings</Link></li>
        <li><Link to="/settings/compliance" className={linkCls(pathname === '/settings/compliance')}>Compliance Settings</Link></li>

        <li className="pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</li>
        <li><Link to="/tools" className={linkCls(pathname === '/tools')}>Tools</Link></li>
        <li><Link to="/admin/reports" className={linkCls(pathname === '/admin/reports')}>Admin Reports</Link></li>
        <li><Link to="/admin/roles" className={linkCls(pathname === '/admin/roles')}>Role Manager</Link></li>
        <li><Link to="/tools/import-export" className={linkCls(pathname === '/tools/import-export')}>Import / Export</Link></li>
      </ul>
    </aside>
  );
}
