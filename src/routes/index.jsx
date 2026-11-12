import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout.jsx';
import NotFound from '@/pages/misc/NotFound.jsx';
import Login from '@/pages/Login.jsx';
import Signup from '@/pages/Signup.jsx';
import Logout from '@/pages/Logout.jsx';
import ProtectedRoute from '@/components/protected/ProtectedRoute.jsx';
import Loader from '@/components/ui/Loader.jsx';
import { flagEnabled } from '@/config/flags.js';

const RecruiterBoard = lazy(() => import('@/pages/recruiter/Board.jsx'));
const ClientJobs = lazy(() => import('@/pages/client/Jobs.jsx'));
const ClientCandidates = lazy(() => import('@/pages/client/Candidates.jsx'));
const ClientTimecards = lazy(() => import('@/pages/client/Timecards.jsx'));
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

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="p-4"><Loader label="Loading page…" /></div>}>
      <Routes>
        {/* Public routes without layout */}
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
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

          {/* Timekeeping (accessible to all authenticated users) */}
          <Route
            path="timekeeping"
            element={
              <ProtectedRoute allowedRoles={[]}>
                <TimesheetsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="timekeeping/new"
            element={
              <ProtectedRoute allowedRoles={[]}>
                <TimesheetForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="timekeeping/:id"
            element={
              <ProtectedRoute allowedRoles={[]}>
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

          {/* Payroll Queue (accessible to all authenticated users) */}
          <Route
            path="payroll-queue"
            element={
              <ProtectedRoute allowedRoles={[]}>
                <PayrollQueue />
              </ProtectedRoute>
            }
          />

          {/* Invoices */}
          <Route
            path="invoices"
            element={
              <ProtectedRoute allowedRoles={[]}>
                <InvoicesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="invoices/:id"
            element={
              <ProtectedRoute allowedRoles={[]}>
                <InvoiceView />
              </ProtectedRoute>
            }
          />

          {/* AR Aging */}
          <Route
            path="ar-aging"
            element={
              <ProtectedRoute allowedRoles={[]}>
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
