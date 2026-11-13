import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCapabilities } from "@/lib/capabilities";
import QuickAdd from "@/components/QuickAdd.jsx";
import QuickAddCandidate from "@/components/QuickAddCandidate.jsx";

const linkCls = (active) =>
  `block px-3 py-1.5 rounded-md text-sm ${active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-200'}`;

// Slice 7 (ATS/CRM milestone): every nav entry is gated on the SAME
// capability its route requires, so the sidebar never shows a link the
// user cannot open. Auth-only routes (no capability) are shown to all
// signed-in users. Capabilities resolve per EFFECTIVE role (useAuth's
// role: roleOverride in dev/Demo Mode, else the signed-in account's
// profile role), so the Demo Mode persona switcher re-gates the nav.
export default function Sidebar() {
  const { hasCapability } = useCapabilities();
  const { pathname } = useLocation();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddCandidateOpen, setQuickAddCandidateOpen] = useState(false);

  const can = (...caps) => caps.every((c) => hasCapability(c));

  const showClientSection = can('dashboard.client.view') || can('pipeline.decide_client')
    || can('client.portal.view') || can('timesheets.approve_client');
  const showCrmSection = can('crm.manage') || can('candidates.quickadd')
    || can('candidates.search') || can('jobs.manage');

  return (
    <aside className="w-64 bg-gray-100 p-4 h-full">
      <h2 className="font-semibold mb-4">Navigation</h2>
      <ul className="space-y-1">
        {can('dashboard.recruiter.view') && (
          <>
            <li><Link to="/recruiter" className={linkCls(pathname === '/recruiter')}>Recruiter Dashboard</Link></li>
            <li><Link to="/recruiter/board" className={linkCls(pathname === '/recruiter/board')}>Pipeline Board</Link></li>
          </>
        )}
        {can('dashboard.candidate.view') && (
          <>
            <li><Link to="/candidate" className={linkCls(pathname === '/candidate')}>My Dashboard</Link></li>
            {can('candidate.apply', 'dashboard.candidate.view') && (
              <li><Link to="/candidate/jobs" className={linkCls(pathname === '/candidate/jobs')}>Job Board</Link></li>
            )}
          </>
        )}
        {showClientSection && (
          <>
            <li className="pt-1 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client Portal</li>
            {can('dashboard.client.view') && (
              <li><Link to="/client" className={linkCls(pathname === '/client')}>Dashboard</Link></li>
            )}
            {can('pipeline.decide_client') && (
              <li><Link to="/client/approvals" className={linkCls(pathname === '/client/approvals')}>Approvals</Link></li>
            )}
            {can('client.portal.view') && (
              <>
                <li><Link to="/client/jobs" className={linkCls(pathname.startsWith('/client/jobs'))}>Jobs</Link></li>
                <li><Link to="/client/metrics" className={linkCls(pathname === '/client/metrics')}>Metrics</Link></li>
                <li><Link to="/client/portal" className={linkCls(pathname === '/client/portal')}>Portal</Link></li>
              </>
            )}
            {can('timesheets.approve_client') && (
              <li><Link to="/client/timecards" className={linkCls(pathname === '/client/timecards')}>Timecards</Link></li>
            )}
          </>
        )}
        {can('dashboard.director.view') && (
          <li><Link to="/director" className={linkCls(pathname === '/director')}>Director Dashboard</Link></li>
        )}
        {can('dashboard.branch_manager.view') && (
          <li><Link to="/branch-manager" className={linkCls(pathname === '/branch-manager')}>Branch Dashboard</Link></li>
        )}
        {can('dashboard.sales_rep.view') && (
          <li><Link to="/sales" className={linkCls(pathname === '/sales')}>Sales Pipeline</Link></li>
        )}
        {can('dashboard.sales_manager.view') && (
          <li><Link to="/sales-manager" className={linkCls(pathname === '/sales-manager')}>Sales Dashboard</Link></li>
        )}
        {can('dashboard.backoffice.view') && (
          <li><Link to="/finance/reports" className={linkCls(pathname === '/finance/reports')}>Finance Reports</Link></li>
        )}

        <li className="pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recruiting</li>
        {can('pipeline.view') && (
          <li><Link to="/candidates" className={linkCls(pathname.startsWith('/candidates'))}>Candidate Pipeline</Link></li>
        )}
        {can('jobs.view') && (
          <li><Link to="/jobs" className={linkCls(pathname === '/jobs')}>Jobs</Link></li>
        )}

        {showCrmSection && (
          <>
            <li className="pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">CRM</li>
            {can('crm.manage') && (
              <>
                <li><Link to="/companies" className={linkCls(pathname.startsWith('/companies'))}>Companies</Link></li>
                <li><button onClick={() => setQuickAddOpen(true)} className={linkCls(false) + ' w-full text-left'}>Quick Add Prospect</button></li>
              </>
            )}
            {can('candidates.quickadd') && (
              <li><button onClick={() => setQuickAddCandidateOpen(true)} className={linkCls(false) + ' w-full text-left'}>Quick Add Candidate</button></li>
            )}
            {can('candidates.search') && (
              <li><Link to="/candidates/search" className={linkCls(pathname === '/candidates/search')}>Talent Search</Link></li>
            )}
            {can('jobs.manage') && (
              <li><Link to="/jobs/new" className={linkCls(pathname === '/jobs/new')}>New Order</Link></li>
            )}
          </>
        )}

        <li className="pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Operations</li>
        {can('assignments.view') && (
          <>
            <li><Link to="/assignments" className={linkCls(pathname.startsWith('/assignments'))}>Assignments</Link></li>
            <li><Link to="/assignments/tracker" className={linkCls(pathname === '/assignments/tracker')}>Assignment Tracker</Link></li>
          </>
        )}
        {can('timesheets.approve_internal') && (
          <li><Link to="/timekeeping" className={linkCls(pathname.startsWith('/timekeeping'))}>Timekeeping</Link></li>
        )}
        {can('timesheets.submit') && (
          <li><Link to="/timekeeping/entry" className={linkCls(pathname === '/timekeeping/entry')}>Timecard Entry</Link></li>
        )}
        {can('payroll.view', 'payroll.prepare') && (
          <>
            <li><Link to="/payroll-queue" className={linkCls(pathname.startsWith('/payroll-queue'))}>Payroll Queue</Link></li>
            <li><Link to="/payroll" className={linkCls(pathname === '/payroll')}>Payroll Summary</Link></li>
          </>
        )}
        {can('invoices.view') && (
          <li><Link to="/invoices" className={linkCls(pathname.startsWith('/invoices'))}>Invoices</Link></li>
        )}
        {can('ar.view') && (
          <li><Link to="/ar-aging" className={linkCls(pathname === '/ar-aging')}>AR Aging</Link></li>
        )}
        <li><Link to="/scheduler" className={linkCls(pathname === '/scheduler')}>Scheduler</Link></li>

        <li className="pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Resources</li>
        {can('kb.view') && (
          <li><Link to="/kb" className={linkCls(pathname === '/kb')}>Knowledge Base</Link></li>
        )}
        <li><Link to="/notifications" className={linkCls(pathname === '/notifications')}>Notifications</Link></li>

        <li className="pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Settings</li>
        <li><Link to="/settings/account" className={linkCls(pathname === '/settings/account')}>Account Settings</Link></li>
        {can('settings.manage') && (
          <>
            <li><Link to="/settings/billing" className={linkCls(pathname === '/settings/billing')}>Billing Settings</Link></li>
            <li><Link to="/settings/compliance" className={linkCls(pathname === '/settings/compliance')}>Compliance Settings</Link></li>
          </>
        )}

        <li className="pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</li>
        <li><Link to="/tools" className={linkCls(pathname === '/tools')}>Tools</Link></li>
        {can('reports.view', 'dashboard.admin.view') && (
          <li><Link to="/admin/reports" className={linkCls(pathname === '/admin/reports')}>Admin Reports</Link></li>
        )}
        {can('roles.assign') && (
          <li><Link to="/admin/roles" className={linkCls(pathname === '/admin/roles')}>Role Manager</Link></li>
        )}
        {can('permissions.manage') && (
          <li><Link to="/admin/permissions" className={linkCls(pathname === '/admin/permissions')}>Permissions</Link></li>
        )}
        {can('settings.manage') && (
          <li><Link to="/tools/import-export" className={linkCls(pathname === '/tools/import-export')}>Import / Export</Link></li>
        )}
      </ul>
      <QuickAdd open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
      <QuickAddCandidate open={quickAddCandidateOpen} onClose={() => setQuickAddCandidateOpen(false)} />
    </aside>
  );
}
