import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getSession } from "./utils/auth";
import AdminTools from "./pages/AdminTools";
import AccountSettings from "./pages/AccountSettings";
import BillingSettings from "./pages/BillingSettings";
import ComplianceSettings from "./pages/ComplianceSettings";
import Login from './pages/Login';
import Signup from './pages/Signup';
import TimecardEntry from "./pages/TimecardEntry";
import ClientPortal from "./pages/ClientPortal";
import PayrollView from "./pages/PayrollView";
import ClientDashboard from './pages/ClientDashboard';
import NotificationCenter from "./pages/NotificationCenter";
import LandingPage from './components/common/LandingPage';
import Footer from './components/common/footer';
import NavBar from '../components/common/navbar';
import VMSAggregator from './components/admin/vms-aggregator';
import ImportExportCenter from './components/admin/import-export-center';
import AssignmentOverview from './components/admin/assignment-overview';
import RevenueOverview from './components/admin/revenue-overview';
import SettingsCenter from './components/admin/settings-center';
import BillingDashboard from './components/admin/billing-dashboard';
import SalesRepDashboard from './components/dashboards/sales-rep-dashboard';
import SalesManagerDashboard from './components/dashboards/sales-manager-dashboard'; 
import BranchManagerDashboard from './components/dashboards/branch-manager-dashboard';
import DirectorDashboard from './components/dashboards/director-dashboard';
import CFODashboard from './components/dashboards/cfo-dashboard';
import CEODashboard from './components/dashboards/ceo-dashboard';
import TimesheetEntry from './components/candidate/timesheet-entry';
import NotificationsPanel from './components/candidate/notifications-panel';
import JobSearch from './components/candidate/job-search';
import CandidateApprovals from './components/client/candidate-approvals';
import './App.css';

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
    <div>
      <NavBar />
      <div className="pt-16 min-h-screen flex flex-col">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/client-portal" element={<ClientPortal />} />
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
          {/* Removed duplicate route and potential conflict */}
          <Route path="/admin-tools" element={<AdminTools />} />
          {/* Simplified route for Import/Export */}
          <Route path="/import-export" element={<ImportExportCenter />} />
          <Route path="/settings/account" element={<AccountSettings />} />
          <Route path="/settings/billing" element={<BillingSettings />} />
          <Route path="/settings/compliance" element={<ComplianceSettings />} />
        </Routes>
        <Footer />
      </div>
    </div>
  );
}

export default App;