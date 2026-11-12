# Alltech Staffing Platform MVP

## Overview

The Alltech Staffing Platform is a React-based staffing and workforce management system designed to streamline operations for recruiters, candidates, clients, sales, and executives. It manages the entire staffing lifecycle, from application and onboarding to timesheet and payroll processing, aiming to enhance efficiency and provide a scalable solution for workforce management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

The platform is built with React 19.1.0 and Vite 5.4.8, using Tailwind CSS 3.4.14 for styling. React Router 6.30.0 handles navigation with lazy-loaded components and role-based access control. State management primarily uses localStorage for persistence, complemented by React hooks. The UI/UX emphasizes responsive design, accessibility, and a consistent layout with `TopNav`, `Sidebar`, and `LayoutWrapper`.

### Data Management

Data persistence currently relies on localStorage for demo and offline capabilities, with future integration planned for Supabase PostgreSQL. The Supabase schema includes tables for `profiles`, `clients`, `jobs`, `candidates`, `job_candidates`, `assignments`, `timecards`, `time_entries`, and `v_kpis`. Custom React hooks facilitate data access.

### Authentication & Authorization

A role-based access control (RBAC) system supports roles such as Executive, Operations, Revenue, Delivery, and External. Authentication is in demo mode with test credentials, anticipating full Supabase Auth integration. `ProtectedRoute` components enforce access rules.

### Core Workflows & Features

The platform includes comprehensive workflows for Candidates (job search, onboarding, timesheets), Recruiters (pipeline management, client submission), and Clients (job orders, candidate review/approval). Sales workflow covers lead tracking. Executive & Analytics dashboards utilize Recharts for KPIs. Assignment and Timekeeping modules manage placements and timesheet processing. A Knowledge Base & AI Assistant provides contextual help. Features include a global toast notification system and staging banners.

Key features include:
- **Candidate Pipeline**: Manages candidate statuses (Applied, Reviewed, Submitted, Interview, Hired, Rejected) with strict transition rules and status history tracking. Includes automatic synchronization of candidate status based on assignment lifecycle.
- **Timecard to Payroll Pipeline**: Incorporates payroll-ready statuses, compliance checks for exceptions (e.g., missing meal breaks, overtime), and reconciliation logic to ensure data integrity. A dedicated Payroll Queue page facilitates management of payroll-ready timesheets.
- **Client Portal**: Provides clients with dashboards for active jobs, candidate reviews, and timecard approvals. Clients can approve or reject candidates and timesheets, with decisions influencing internal workflows.
- **Invoicing & Payments**: Manages the full invoicing lifecycle, from creation and sending to payment processing. Includes an AR Aging dashboard for tracking outstanding receivables.
- **Demo Management & System Validation**: A `/tools` page offers a one-click demo data reset and a system validator to check data integrity, with options for auto-fixing safe issues.
- **Centralized Reconciliation**: `reconcileAll()` consolidates 5 reconciliation functions (candidate statuses, pipeline state, approvals, payroll, invoice payments) and runs once on app mount in `App.jsx` alongside `seedIfMissing()`. Individual pages no longer call these functions directly, eliminating redundant processing and ensuring consistent state across the app.

## External Dependencies

### Third-Party Services

-   **Supabase**: Planned for backend services (Auth, PostgreSQL, Realtime, Storage).
-   **Vercel**: Deployment platform.

### NPM Packages

-   **Core**: `react`, `react-dom`, `react-router-dom`, `@vitejs/plugin-react`.
-   **UI/Styling**: `tailwindcss`, `postcss`, `autoprefixer`, `@heroicons/react`, `react-icons`.
-   **Utilities**: `date-fns`, `html2canvas`, `jspdf`, `recharts`.

### Integration Points (Prepared)

-   **VMS Systems**: Module for integration with platforms like Bullhorn, JobDiva, Workday.
-   **Email Services**: For notifications and reminders.
-   **Document Storage**: Via Supabase.
-   **Analytics & Reporting**: CSV export, PDF generation, dashboard screenshot capabilities.