import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getSession } from "./utils/auth";
import Login from './pages/Login';
import Signup from './pages/Signup';
import TimecardEntry from "./pages/TimecardEntry";
import ClientPortal from "./pages/ClientPortal";
import PayrollView from "./pages/PayrollView";
import ClientDashboard from './pages/ClientDashboard';
import NotificationCenter from "./pages/NotificationCenter";
import LandingPage from './components/common/LandingPage';
import Footer from './components/common/footer';
import SalesRepDashboard from '../components/dashboards/sales-rep-dashboard';
import SalesManagerDashboard from '../components/dashboards/sales-manager-dashboard';
import BranchManagerDashboard from '../components/dashboards/branch-manager-dashboard';
import DirectorDashboard from '../components/dashboards/director-dashboard';
import CFODashboard from '../components/dashboards/cfo-dashboard';
import CEODashboard from '../components/dashboards/ceo-dashboard';
import TimesheetEntry from '../components/candidate/timesheet-entry';
import NotificationsPanel from '../components/candidate/notifications-panel';
import ForgotPassword from '../components/auth/forgot-password';
import ImportExportCenter from '../components/admin/import-export-center';
import VMSAggregator from '../components/admin/vms-aggregator';
import AssignmentOverview from '../components/admin/assignment-overview';
import RevenueOverview from '../components/admin/revenue-overview';
import CandidateApprovals from '../components/client/candidate-approvals';
import JobSearch from '../components/candidate/job-search';
import SettingsCenter from '../components/admin/settings-center';
import BillingDashboard from '../components/admin/billing-dashboard';
import NavBar from '../components/common/navbar';
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
          <Route path="/assignments" element={<AssignmentTracker />} />
        </Routes>
        <Footer />
      </div>
    </div>
  );
}

export default App;