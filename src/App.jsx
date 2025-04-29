import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from '../components/common/navbar';
import Footer from '../components/common/footer';
import LandingPage from './components/common/LandingPage';
import Login from './pages/Login';
import RecruiterDashboard from './pages/RecruiterDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminTools from "./pages/AdminTools";
import AccountSettings from "./pages/AccountSettings";
import BillingSettings from "./pages/BillingSettings";
import ComplianceSettings from "./pages/ComplianceSettings";
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import TimecardEntry from "./pages/TimecardEntry";
import ClientPortal from "./pages/ClientPortal";
import PayrollView from "./pages/PayrollView";
import ClientDashboard from './pages/ClientDashboard';
import NotificationCenter from "./pages/NotificationCenter";
import VMSAggregator from '../components/tools/vms-aggregator';
import ImportExportCenter from '../components/tools/import-export';
import AssignmentOverview from '../components/admin/assignment-overview';
import RevenueOverview from '../components/admin/revenue-overview';
import SettingsCenter from '../components/admin/settings-center';
import BillingDashboard from '../components/admin/billing-dashboard';
import SalesRepDashboard from '../components/dashboards/sales-rep-dashboard';
import SalesManagerDashboard from '../components/dashboards/sales-manager-dashboard'; 
import BranchManagerDashboard from '../components/dashboards/branch-manager-dashboard';
import DirectorDashboard from '../components/dashboards/director-dashboard';
import CFODashboard from '../components/dashboards/cfo-dashboard';
import CEODashboard from '../components/dashboards/ceo-dashboard';
import TimesheetEntry from '../components/candidate/timesheet-entry';
import NotificationsPanel from '../components/candidate/notifications-panel';
import JobSearch from '../components/candidate/job-search';
import CandidateApprovals from '../components/client/candidate-approvals.jsx';
import ForgotPassword from '../components/auth/forgot-password.jsx';
import './App.css';
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getSession } from "./utils/auth";


function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function checkAuth() {
      const { session } = await getSession();
      if (!session) {
        if (location.pathname !== "/login" && location.pathname !== "/signup") {
          navigate("/login");
        }
      }
    }
    checkAuth();
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/recruiter"
            element={
              <ProtectedRoute allowedRoles={["Recruiter"]}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/signup" element={<Signup />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route
            path="/client-portal"
            element={
              <ProtectedRoute allowedRoles={["Client"]}>
                <ClientPortal />
              </ProtectedRoute>
            }
          />
          <Route path="/sales-rep-dashboard" element={<SalesRepDashboard />} />
          <Route path="/timecard" element={<TimecardEntry />} />
          <Route path="/payroll" element={<PayrollView />} />
          <Route path="/sales-manager-dashboard" element={<SalesManagerDashboard />} />
          <Route path="/candidate/timesheet-entry" element={<TimesheetEntry />} />
          <Route path="/candidate/notifications" element={<NotificationsPanel />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/branch-manager-dashboard" element={<BranchManagerDashboard />} />
          <Route path="/director-dashboard" element={<DirectorDashboard />} />
          <Route path="/cfo-dashboard" element={<CFODashboard />} />
          <Route path="/ceo-dashboard" element={<CEODashboard />} />
          <Route path="/import-export-center" element={<ImportExportCenter />} />
          <Route path="/vms-aggregator" element={<VMSAggregator />} />
          <Route path="/notification-center" element={<NotificationCenter />} />
          <Route path="/job-search" element={<JobSearch />} />
          <Route path="/assignment-overview" element={<AssignmentOverview />} />
          <Route path="/revenue-overview" element={<RevenueOverview />} />
          <Route path="/client/candidate-approvals" element={<CandidateApprovals />} />
          <Route path="/settings-center" element={<SettingsCenter />} />
          <Route path="/billing-dashboard" element={<BillingDashboard />} />
          <Route path="/notifications" element={<NotificationCenter />} />
          <Route
            path="/admin-tools"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminTools />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/import-export"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <ImportExportCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter"
            element={
              <ProtectedRoute allowedRoles={["Recruiter"]}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/settings/account" element={<AccountSettings />} />
          <Route path="/settings/billing" element={<BillingSettings />} />
          <Route path="/settings/compliance" element={<ComplianceSettings />} />
          <Route 
            path="/admin-revenue" 
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <RevenueOverview />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;