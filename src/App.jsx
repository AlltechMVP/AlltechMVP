
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import NotificationCenter from '../components/notifications/notification-center';
import JobSearch from '../components/candidate/job-search';
import './App.css';

import NavBar from '../components/common/navbar';

function App() {
  return (
    <Router>
      <NavBar />
      <div className="pt-16"> {/* Add padding to account for fixed navbar */}
        <Routes>
        <Route path="/sales-rep-dashboard" element={<SalesRepDashboard />} />
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
      </Routes>
      </div>
    </Router>
  );
}

export default App;
