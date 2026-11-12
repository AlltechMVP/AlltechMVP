import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
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
const ClientPortal = lazy(() => import('@/pages/ClientPortal.jsx'));
const ComplianceSettings = lazy(() => import('@/pages/ComplianceSettings.jsx'));
const PayrollView = lazy(() => import('@/pages/PayrollView.jsx'));
const TimecardEntry = lazy(() => import('@/pages/TimecardEntry.jsx'));
const ImportExportCenter = lazy(() => import('@/pages/ImportExportCenter.jsx'));
const NotificationCenter = lazy(() => import('@/pages/NotificationCenter.jsx'));
const RoleManager = lazy(() => import('@/admin/RoleManager.jsx'));

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
              <ProtectedRoute allowedRoles={["recruiter"]}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="recruiter/board"
            element={
              <ProtectedRoute allowedRoles={["recruiter"]}>
                <RecruiterBoard />
              </ProtectedRoute>
            }
          />

          {/* Client routes */}
          <Route
            path="client"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="client/approvals"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ClientApprovals />
              </ProtectedRoute>
            }
          />
          <Route
            path="client/jobs"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ClientJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="client/jobs/:jobId/candidates"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ClientCandidates />
              </ProtectedRoute>
            }
          />
          <Route
            path="client/timecards"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ClientTimecards />
              </ProtectedRoute>
            }
          />

          {/* Candidate routes */}
          <Route
            path="candidate"
            element={
              <ProtectedRoute allowedRoles={["candidate"]}>
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Jobs list (accessible to all authenticated users) */}
          <Route
            path="jobs"
            element={
              <ProtectedRoute allowedRoles={[]}>
                <JobsList />
              </ProtectedRoute>
            }
          />

          {/* Executive routes */}
          <Route
            path="ceo"
            element={
              <ProtectedRoute allowedRoles={["ceo","admin"]}>
                <CEODashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="cfo"
            element={
              <ProtectedRoute allowedRoles={["cfo","admin"]}>
                <CFODashboard />
              </ProtectedRoute>
            }
          />

          {/* Management, sales & backoffice routes */}
          <Route
            path="director"
            element={
              <ProtectedRoute allowedRoles={["director","admin"]}>
                <DirectorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="branch-manager"
            element={
              <ProtectedRoute allowedRoles={["branch-manager","admin"]}>
                <BranchManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="sales"
            element={
              <ProtectedRoute allowedRoles={["sales-rep","admin"]}>
                <SalesPipeline />
              </ProtectedRoute>
            }
          />
          <Route
            path="sales-manager"
            element={
              <ProtectedRoute allowedRoles={["sales-manager","admin"]}>
                <SalesManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="finance/reports"
            element={
              <ProtectedRoute allowedRoles={["backoffice","admin"]}>
                <BackOfficeDashboard />
              </ProtectedRoute>
            }
          />

          {/* Previously unrouted pages */}
          <Route
            path="scheduler"
            element={
              <ProtectedRoute allowedRoles={[]}>
                <Scheduler />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings/account"
            element={
              <ProtectedRoute allowedRoles={[]}>
                <AccountSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/reports"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/roles"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <RoleManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="assignments/tracker"
            element={
              <ProtectedRoute allowedRoles={[]}>
                <AssignmentTracker />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings/billing"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <BillingSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="candidate/jobs"
            element={
              <ProtectedRoute allowedRoles={["candidate"]}>
                <CandidateJobBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path="client/metrics"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ClientMetrics />
              </ProtectedRoute>
            }
          />
          <Route
            path="client/portal"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ClientPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings/compliance"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ComplianceSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="payroll"
            element={
              <ProtectedRoute allowedRoles={["backoffice"]}>
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
              <ProtectedRoute allowedRoles={["admin"]}>
                <ImportExportCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="notifications"
            element={
              <ProtectedRoute allowedRoles={[]}>
                <NotificationCenter />
              </ProtectedRoute>
            }
          />

          {/* Assignments (accessible to all authenticated users) */}
          <Route
            path="assignments"
            element={
              <ProtectedRoute allowedRoles={[]}>
                <AssignmentsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="assignments/new"
            element={
              <ProtectedRoute allowedRoles={[]}>
                <AssignmentForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="assignments/:id"
            element={
              <ProtectedRoute allowedRoles={[]}>
                <AssignmentForm />
              </ProtectedRoute>
            }
          />

          {/* Timekeeping (slice 7: recruiter + backoffice + admin) */}
          <Route
            path="timekeeping"
            element={
              <ProtectedRoute allowedRoles={["recruiter","backoffice","admin"]}>
                <TimesheetsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="timekeeping/new"
            element={
              <ProtectedRoute allowedRoles={["recruiter","backoffice","admin"]}>
                <TimesheetForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="timekeeping/:id"
            element={
              <ProtectedRoute allowedRoles={["recruiter","backoffice","admin"]}>
                <TimesheetForm />
              </ProtectedRoute>
            }
          />

          {/* Candidates Pipeline (accessible to all authenticated users) */}
          <Route
            path="candidates"
            element={
              <ProtectedRoute allowedRoles={[]}>
                <CandidatesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="candidates/:id"
            element={
              <ProtectedRoute allowedRoles={[]}>
                <CandidateDetail />
              </ProtectedRoute>
            }
          />

          {/* Job Candidates View */}
          <Route
            path="jobs/:jobId/candidates"
            element={
              <ProtectedRoute allowedRoles={[]}>
                <JobCandidates />
              </ProtectedRoute>
            }
          />

          {/* Payroll Queue (slice 7: backoffice only) */}
          <Route
            path="payroll-queue"
            element={
              <ProtectedRoute allowedRoles={["backoffice"]}>
                <PayrollQueue />
              </ProtectedRoute>
            }
          />

          {/* Invoices (slice 7: backoffice + read-only exec/admin/client) */}
          <Route
            path="invoices"
            element={
              <ProtectedRoute allowedRoles={["backoffice","ceo","cfo","admin","client"]}>
                <InvoicesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="invoices/:id"
            element={
              <ProtectedRoute allowedRoles={["backoffice","ceo","cfo","admin","client"]}>
                <InvoiceView />
              </ProtectedRoute>
            }
          />

          {/* AR Aging (slice 7: backoffice + read-only exec/admin/client) */}
          <Route
            path="ar-aging"
            element={
              <ProtectedRoute allowedRoles={["backoffice","ceo","cfo","admin","client"]}>
                <ArAging />
              </ProtectedRoute>
            }
          />

          {/* Tools (accessible to all authenticated users) */}
          <Route
            path="tools"
            element={
              <ProtectedRoute allowedRoles={[]}>
                <AdminTools />
              </ProtectedRoute>
            }
          />

          {/* Knowledge Base (accessible to all authenticated users) */}
          <Route
            path="kb"
            element={
              <ProtectedRoute allowedRoles={[]}>
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
