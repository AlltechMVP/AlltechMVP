import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout.jsx';
import NotFound from '@/pages/misc/NotFound.jsx';
import Login from '@/pages/Login.jsx';
import Signup from '@/pages/Signup.jsx';
import ForgotPassword from '@/pages/ForgotPassword.jsx';
import ResetPassword from '@/pages/ResetPassword.jsx';
import Logout from '@/pages/Logout.jsx';
import ProtectedRoute from '@/components/protected/ProtectedRoute.jsx';
import Loader from '@/components/ui/Loader.jsx';
import { flagEnabled } from '@/config/flags.js';
import { INTERNAL_ROLES } from '@/utils/roleUtils';

const RecruiterBoard = lazy(() => import('@/pages/recruiter/Board.jsx'));
const ClientJobs = lazy(() => import('@/pages/client/Jobs.jsx'));
const ClientCandidates = lazy(() => import('@/pages/client/Candidates.jsx'));
const ClientTimecards = lazy(() => import('@/pages/client/Timecards.jsx'));
const ClientApprovals = lazy(() => import('@/pages/client/Approvals.jsx'));
const RecruiterDashboard = lazy(() => import('@/pages/RecruiterDashboard.jsx'));
const ClientDashboard = lazy(() => import('@/pages/ClientDashboard.jsx'));
const CandidateDashboard = lazy(() => import('@/pages/CandidateDashboard.jsx'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard.jsx'));
const JobsList = lazy(() => import('@/pages/jobs/List.jsx'));
const JobForm = lazy(() => import('@/pages/jobs/Form.jsx'));
const CompaniesList = lazy(() => import('@/pages/companies/List.jsx'));
const CompanyDetail = lazy(() => import('@/pages/companies/Detail.jsx'));
const CompaniesNew = lazy(() => import('@/pages/companies/New.jsx'));
const CEODashboard = lazy(() => import('@/pages/exec/CEODashboard.jsx'));
const CFODashboard = lazy(() => import('@/pages/exec/CFODashboard.jsx'));
const BrowseKb = lazy(() => import('@/pages/kb/Browse.jsx'));
const AssignmentsList = lazy(() => import('@/pages/assignments/List.jsx'));
const AssignmentForm = lazy(() => import('@/pages/assignments/Form.jsx'));
const TimesheetsList = lazy(() => import('@/pages/timekeeping/List.jsx'));
const TimesheetForm = lazy(() => import('@/pages/timekeeping/Form.jsx'));
const PayrollQueue = lazy(() => import('@/pages/payroll/Queue.jsx'));
const AdminTools = lazy(() => import('@/pages/AdminTools.jsx'));
const CandidatesList = lazy(() => import('@/pages/candidates/List.jsx'));
const CandidateSearch = lazy(() => import('@/pages/candidates/Search.jsx'));
const CandidateDetail = lazy(() => import('@/pages/candidates/Detail.jsx'));
const JobCandidates = lazy(() => import('@/pages/jobs/Candidates.jsx'));
const InvoicesList = lazy(() => import('@/pages/invoices/List.jsx'));
const InvoiceView = lazy(() => import('@/pages/invoices/View.jsx'));
const ArAging = lazy(() => import('@/pages/ar/Aging.jsx'));
const DirectorDashboard = lazy(() => import('@/manager/DirectorDashboard.jsx'));
const BranchManagerDashboard = lazy(() => import('@/manager/BranchManagerDashboard.jsx'));
const SalesManagerDashboard = lazy(() => import('@/manager/SalesManagerDashboard.jsx'));
const BackOfficeDashboard = lazy(() => import('@/backoffice/BackOfficeDashboard.jsx'));
const SalesPipeline = lazy(() => import('@/components/sales/SalesPipeline.jsx'));
const Scheduler = lazy(() => import('@/pages/Scheduler.jsx'));
const AccountSettings = lazy(() => import('@/pages/AccountSettings.jsx'));
const AdminReports = lazy(() => import('@/pages/AdminReports.jsx'));
const AssignmentTracker = lazy(() => import('@/pages/AssignmentTracker.jsx'));
const BillingSettings = lazy(() => import('@/pages/BillingSettings.jsx'));
const CandidateJobBoard = lazy(() => import('@/pages/CandidateJobBoard.jsx'));
const ClientMetrics = lazy(() => import('@/pages/ClientMetrics.jsx'));
const ComplianceSettings = lazy(() => import('@/pages/ComplianceSettings.jsx'));
const PayrollView = lazy(() => import('@/pages/PayrollView.jsx'));
const TimecardEntry = lazy(() => import('@/pages/TimecardEntry.jsx'));
const ImportExportCenter = lazy(() => import('@/pages/ImportExportCenter.jsx'));
const NotificationCenter = lazy(() => import('@/pages/NotificationCenter.jsx'));
const RoleManager = lazy(() => import('@/admin/RoleManager.jsx'));
const Permissions = lazy(() => import('@/pages/admin/Permissions.jsx'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="p-4"><Loader label="Loading page…" /></div>}>
      <Routes>
        {/* Public routes without layout */}
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="logout" element={<Logout />} />

        {/* All app routes with layout */}
        <Route element={<Layout />}>
          {/* Index redirects to dashboard */}
          <Route index element={<div className="p-4">Welcome to Alltech</div>} />

          {/* Recruiter routes */}
          <Route
            path="recruiter"
            element={
              <ProtectedRoute allowedCapabilities={["dashboard.recruiter.view"]}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="recruiter/board"
            element={
              <ProtectedRoute allowedCapabilities={["dashboard.recruiter.view"]}>
                <RecruiterBoard />
              </ProtectedRoute>
            }
          />

          {/* Client routes */}
          <Route
            path="client"
            element={
              <ProtectedRoute allowedCapabilities={["dashboard.client.view"]}>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="client/approvals"
            element={
              <ProtectedRoute allowedCapabilities={["pipeline.decide_client"]}>
                <ClientApprovals />
              </ProtectedRoute>
            }
          />
          <Route
            path="client/jobs"
            element={
              <ProtectedRoute allowedCapabilities={["client.portal.view"]}>
                <ClientJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="client/jobs/:jobId/candidates"
            element={
              <ProtectedRoute allowedCapabilities={["client.portal.view"]}>
                <ClientCandidates />
              </ProtectedRoute>
            }
          />
          <Route
            path="client/timecards"
            element={
              <ProtectedRoute allowedCapabilities={["timesheets.approve_client"]}>
                <ClientTimecards />
              </ProtectedRoute>
            }
          />

          {/* Candidate routes */}
          <Route
            path="candidate"
            element={
              <ProtectedRoute allowedCapabilities={["dashboard.candidate.view"]}>
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="admin"
            element={
              <ProtectedRoute allowedCapabilities={["dashboard.admin.view"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Jobs list (accessible to all authenticated users) */}
          <Route
            path="jobs"
            element={
              <ProtectedRoute allowedCapabilities={[]}>
                <JobsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="jobs/new"
            element={
              <ProtectedRoute allowedCapabilities={["jobs.manage"]}>
                <JobForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="jobs/:id/edit"
            element={
              <ProtectedRoute allowedCapabilities={["jobs.manage"]}>
                <JobForm />
              </ProtectedRoute>
            }
          />

          {/* Companies / CRM (internal staff only) */}
          <Route
            path="companies"
            element={
              <ProtectedRoute allowedCapabilities={["crm.manage"]}>
                <CompaniesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="companies/new"
            element={
              <ProtectedRoute allowedCapabilities={["crm.manage"]}>
                <CompaniesNew />
              </ProtectedRoute>
            }
          />
          <Route
            path="companies/:id"
            element={
              <ProtectedRoute allowedCapabilities={["crm.manage"]}>
                <CompanyDetail />
              </ProtectedRoute>
            }
          />

          {/* Executive routes */}
          <Route
            path="ceo"
            element={
              <ProtectedRoute allowedCapabilities={["dashboard.ceo.view"]}>
                <CEODashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="cfo"
            element={
              <ProtectedRoute allowedCapabilities={["dashboard.cfo.view"]}>
                <CFODashboard />
              </ProtectedRoute>
            }
          />

          {/* Management, sales & backoffice routes */}
          <Route
            path="director"
            element={
              <ProtectedRoute allowedCapabilities={["dashboard.director.view"]}>
                <DirectorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="branch-manager"
            element={
              <ProtectedRoute allowedCapabilities={["dashboard.branch_manager.view"]}>
                <BranchManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="sales"
            element={
              <ProtectedRoute allowedCapabilities={["dashboard.sales_rep.view"]}>
                <SalesPipeline />
              </ProtectedRoute>
            }
          />
          <Route
            path="sales-manager"
            element={
              <ProtectedRoute allowedCapabilities={["dashboard.sales_manager.view"]}>
                <SalesManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="finance/reports"
            element={
              <ProtectedRoute allowedCapabilities={["dashboard.backoffice.view"]}>
                <BackOfficeDashboard />
              </ProtectedRoute>
            }
          />

          {/* Scheduler (2026-11-20 nav-leak fix: internal-only; the
              sidebar link is gated on isInternalRole, and this gate closes
              the typed URL for client/candidate too) */}
          <Route
            path="scheduler"
            element={
              <ProtectedRoute allowedRoles={INTERNAL_ROLES}>
                <Scheduler />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings/account"
            element={
              <ProtectedRoute allowedCapabilities={[]}>
                <AccountSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/reports"
            element={
              <ProtectedRoute allowedCapabilities={["reports.view", "dashboard.admin.view"]}>
                <AdminReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/roles"
            element={
              <ProtectedRoute allowedCapabilities={["roles.assign"]}>
                <RoleManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/permissions"
            element={
              <ProtectedRoute allowedCapabilities={["permissions.manage"]}>
                <Permissions />
              </ProtectedRoute>
            }
          />
          <Route
            path="assignments/tracker"
            element={
              <ProtectedRoute allowedCapabilities={["assignments.view"]}>
                <AssignmentTracker />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings/billing"
            element={
              <ProtectedRoute allowedCapabilities={["settings.manage"]}>
                <BillingSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="candidate/jobs"
            element={
              <ProtectedRoute allowedCapabilities={["candidate.apply", "dashboard.candidate.view"]}>
                <CandidateJobBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path="client/metrics"
            element={
              <ProtectedRoute allowedCapabilities={["client.portal.view"]}>
                <ClientMetrics />
              </ProtectedRoute>
            }
          />
          {/* /client/portal retired 2026-11-13: the page showed a static
              multi-client directory with fake companies. Old bookmarks and
              links land on the real client dashboard instead. */}
          <Route
            path="client/portal"
            element={<Navigate to="/client" replace />}
          />
          <Route
            path="settings/compliance"
            element={
              <ProtectedRoute allowedCapabilities={["settings.manage"]}>
                <ComplianceSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="payroll"
            element={
              <ProtectedRoute allowedCapabilities={["payroll.view"]}>
                <PayrollView />
              </ProtectedRoute>
            }
          />
          <Route
            path="timekeeping/entry"
            element={
              <ProtectedRoute allowedRoles={["candidate","recruiter"]}>
                <TimecardEntry />
              </ProtectedRoute>
            }
          />
          <Route
            path="tools/import-export"
            element={
              <ProtectedRoute allowedCapabilities={["settings.manage"]}>
                <ImportExportCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="notifications"
            element={
              <ProtectedRoute allowedCapabilities={[]}>
                <NotificationCenter />
              </ProtectedRoute>
            }
          />

          {/* Assignments (2026-11-20 nav-leak fix: gated on assignments.view,
              the same capability the sidebar link uses, so typed URLs deny
              non-internal roles too) */}
          <Route
            path="assignments"
            element={
              <ProtectedRoute allowedCapabilities={["assignments.view"]}>
                <AssignmentsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="assignments/new"
            element={
              <ProtectedRoute allowedCapabilities={["assignments.view"]}>
                <AssignmentForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="assignments/:id"
            element={
              <ProtectedRoute allowedCapabilities={["assignments.view"]}>
                <AssignmentForm />
              </ProtectedRoute>
            }
          />

          {/* Timekeeping (slice 7: recruiter + backoffice + admin) */}
          <Route
            path="timekeeping"
            element={
              <ProtectedRoute allowedCapabilities={["timesheets.approve_internal"]}>
                <TimesheetsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="timekeeping/new"
            element={
              <ProtectedRoute allowedCapabilities={["timesheets.approve_internal"]}>
                <TimesheetForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="timekeeping/:id"
            element={
              <ProtectedRoute allowedCapabilities={["timesheets.approve_internal"]}>
                <TimesheetForm />
              </ProtectedRoute>
            }
          />

          {/* Candidates Pipeline (2026-11-20 nav-leak fix: gated on
              pipeline.view, the same capability the sidebar link uses, so
              typed URLs deny non-internal roles too) */}
          <Route
            path="candidates"
            element={
              <ProtectedRoute allowedCapabilities={["pipeline.view"]}>
                <CandidatesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="candidates/search"
            element={
              <ProtectedRoute allowedCapabilities={["candidates.search"]}>
                <CandidateSearch />
              </ProtectedRoute>
            }
          />
          <Route
            path="candidates/:id"
            element={
              <ProtectedRoute allowedCapabilities={["pipeline.view"]}>
                <CandidateDetail />
              </ProtectedRoute>
            }
          />

          {/* Job Candidates View (2026-11-20 nav-leak fix: gated on
              pipeline.view — "View candidate pipeline / job candidates" —
              so typed URLs deny non-internal roles too. The client portal
              equivalent /client/jobs/:jobId/candidates keeps its own
              client.portal.view gate.) */}
          <Route
            path="jobs/:jobId/candidates"
            element={
              <ProtectedRoute allowedCapabilities={["pipeline.view"]}>
                <JobCandidates />
              </ProtectedRoute>
            }
          />

          {/* Payroll Queue (finalize split: view opens it, prepare/finalize gate the flips) */}
          <Route
            path="payroll-queue"
            element={
              <ProtectedRoute allowedCapabilities={["payroll.view"]}>
                <PayrollQueue />
              </ProtectedRoute>
            }
          />

          {/* Invoices (slice 7: backoffice + read-only exec/admin/client) */}
          <Route
            path="invoices"
            element={
              <ProtectedRoute allowedCapabilities={["invoices.view"]}>
                <InvoicesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="invoices/:id"
            element={
              <ProtectedRoute allowedCapabilities={["invoices.view"]}>
                <InvoiceView />
              </ProtectedRoute>
            }
          />

          {/* AR Aging (slice 7: backoffice + read-only exec/admin/client) */}
          <Route
            path="ar-aging"
            element={
              <ProtectedRoute allowedCapabilities={["ar.view"]}>
                <ArAging />
              </ProtectedRoute>
            }
          />

          {/* Tools (2026-11-20 nav-leak fix: internal-only; the sidebar
              link is gated on isInternalRole, and this gate closes the typed
              URL for client/candidate too) */}
          <Route
            path="tools"
            element={
              <ProtectedRoute allowedRoles={INTERNAL_ROLES}>
                <AdminTools />
              </ProtectedRoute>
            }
          />

          {/* Knowledge Base (accessible to all authenticated users) */}
          <Route
            path="kb"
            element={
              <ProtectedRoute allowedCapabilities={[]}>
                <BrowseKb />
              </ProtectedRoute>
            }
          />

          {/* Catch-all MUST be last */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
