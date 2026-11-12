import { lazy } from "react";

// Single source of truth for every protected page in the app.
// App.jsx builds its routes from this list, and the NavBar builds its
// links from it, so adding a page means adding one line here.
// Pages are lazy-loaded so each one is fetched only when visited.
export const appRoutes = [
  // Recruiter
  { path: "/recruiter", label: "Recruiter Dashboard", group: "Recruiter", Component: lazy(() => import("./pages/RecruiterDashboard")) },
  { path: "/jobs", label: "Job Board", group: "Recruiter", Component: lazy(() => import("./pages/CandidateJobBoard")) },
  { path: "/assignments", label: "Assignment Tracker", group: "Recruiter", Component: lazy(() => import("./pages/AssignmentTracker")) },
  { path: "/timecards", label: "Timecard Entry", group: "Recruiter", Component: lazy(() => import("./pages/TimecardEntry")) },
  { path: "/payroll", label: "Payroll", group: "Recruiter", Component: lazy(() => import("./pages/PayrollView")) },
  // Admin
  { path: "/admin", label: "Admin Dashboard", group: "Admin", Component: lazy(() => import("./pages/AdminDashboard")) },
  { path: "/admin/reports", label: "Admin Reports", group: "Admin", Component: lazy(() => import("./pages/AdminReports")) },
  { path: "/admin/tools", label: "Admin Tools", group: "Admin", Component: lazy(() => import("./pages/AdminTools")) },
  // Client
  { path: "/client", label: "Client Dashboard", group: "Client", Component: lazy(() => import("./pages/ClientDashboard")) },
  { path: "/client/portal", label: "Client Portal", group: "Client", Component: lazy(() => import("./pages/ClientPortal")) },
  { path: "/client/metrics", label: "Client Metrics", group: "Client", Component: lazy(() => import("./pages/ClientMetrics")) },
  // Account / shared
  { path: "/notifications", label: "Notifications", group: "Account", Component: lazy(() => import("./pages/NotificationCenter")) },
  { path: "/account", label: "Account Settings", group: "Account", Component: lazy(() => import("./pages/AccountSettings")) },
  { path: "/settings/billing", label: "Billing Settings", group: "Account", Component: lazy(() => import("./pages/BillingSettings")) },
  { path: "/settings/compliance", label: "Compliance Settings", group: "Account", Component: lazy(() => import("./pages/ComplianceSettings")) },
  { path: "/import-export", label: "Import / Export", group: "Account", Component: lazy(() => import("./pages/ImportExportCenter")) },
];
