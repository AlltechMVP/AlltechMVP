// src/lib/capabilities.js
//
// App-layer capability helper (Slice 7 of the ATS/CRM milestone).
// GENERATED DEFAULTS — DEFAULT_CAPABILITIES below is emitted verbatim
// from the DB seed in ~/workspace/supabase-restore/flexperm-ddl.py
// (197 rows, 57 named capabilities, 55 granted to at least one role;
// sensitive.view + payments.reverse are reserved with nobody by default).
// Do NOT hand-edit the map: re-run ~/workspace/gen-capabilities.py after
// any re-seed and diff the output. The DB (role_has_capability(), Slice 4)
// enforces capabilities at the RLS level; this module is the UI layer —
// it gates routes, nav links and buttons on the same grants, and falls
// back to these defaults whenever the live grants table is unreachable
// (notably the DEMO DB, which has no role_capabilities table).
//
// Deny-by-default: a capability not in the resolved set is denied.
// Admin floor (break-glass, Dalton 2026-11-12): the admin role always
// keeps permissions.manage + roles.assign, in the DB function and here,
// regardless of the table.

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext.jsx';
import { ROLE_ROUTES } from '@/utils/roleUtils';

/* global setTimeout, clearTimeout */

export const ALL_ROLES = ["admin", "ceo", "cfo", "director", "branch-manager", "sales-rep", "sales-manager", "recruiter", "candidate", "client", "backoffice"];

export const ADMIN_FLOOR_CAPABILITIES = ['permissions.manage', 'roles.assign'];

// Full catalog of named capabilities, grouped for the Permissions page.
export const CAPABILITY_CATALOG = [
  { area: "Dashboards", capability: "dashboard.admin.view", description: "Admin dashboard" },
  { area: "Dashboards", capability: "dashboard.ceo.view", description: "CEO dashboard" },
  { area: "Dashboards", capability: "dashboard.cfo.view", description: "CFO dashboard" },
  { area: "Dashboards", capability: "dashboard.director.view", description: "Director dashboard" },
  { area: "Dashboards", capability: "dashboard.branch_manager.view", description: "Branch-manager dashboard" },
  { area: "Dashboards", capability: "dashboard.sales_rep.view", description: "Sales pipeline" },
  { area: "Dashboards", capability: "dashboard.sales_manager.view", description: "Sales-manager dashboard" },
  { area: "Dashboards", capability: "dashboard.backoffice.view", description: "Finance reports" },
  { area: "Dashboards", capability: "dashboard.recruiter.view", description: "Recruiter dashboard + pipeline board" },
  { area: "Dashboards", capability: "dashboard.candidate.view", description: "Candidate dashboard" },
  { area: "Dashboards", capability: "dashboard.client.view", description: "Client dashboard" },
  { area: "Client portal", capability: "client.portal.view", description: "Client portal pages (jobs, timecards, metrics, portal)" },
  { area: "Pipeline", capability: "pipeline.view", description: "View candidate pipeline / job candidates" },
  { area: "Pipeline", capability: "pipeline.manage", description: "Change application status, submit candidates, move pipeline" },
  { area: "Pipeline", capability: "pipeline.decide_client", description: "Client approves / rejects a submission (own company, approver only)" },
  { area: "Pipeline", capability: "pipeline.delete", description: "Delete applications (admin)" },
  { area: "Jobs", capability: "jobs.view", description: "Browse jobs" },
  { area: "Jobs", capability: "jobs.manage", description: "Create / edit jobs (orders)" },
  { area: "Jobs", capability: "jobs.delete", description: "Delete jobs" },
  { area: "Assignments", capability: "assignments.view", description: "View assignments + tracker" },
  { area: "Assignments", capability: "assignments.manage", description: "Create / edit assignments (place candidates)" },
  { area: "Assignments", capability: "assignments.delete", description: "Delete assignments" },
  { area: "Candidates", capability: "candidates.search", description: "Search the talent pool" },
  { area: "Candidates", capability: "candidates.quickadd", description: "Quick Add Candidate (create a person record)" },
  { area: "Candidates", capability: "candidates.delete", description: "Delete candidate person rows" },
  { area: "Timesheets", capability: "timesheets.view", description: "View timesheets list" },
  { area: "Timesheets", capability: "timesheets.submit", description: "Create / submit timesheets (candidate: own assignments only)" },
  { area: "Timesheets", capability: "timesheets.approve_internal", description: "Internal approval / correction of submitted time" },
  { area: "Timesheets", capability: "timesheets.approve_client", description: "Client approver approves / rejects submitted time (own company)" },
  { area: "Timesheets", capability: "timesheets.delete", description: "Delete timesheets" },
  { area: "Payroll", capability: "payroll.view", description: "Payroll summary + queue" },
  { area: "Payroll", capability: "payroll.prepare", description: "Routine payroll prep: mark Ready / In Payroll, edit unapproved time" },
  { area: "Payroll", capability: "payroll.finalize", description: "Finalize payroll (backoffice)" },
  { area: "Invoices & payments", capability: "invoices.view", description: "View invoices + payments" },
  { area: "Invoices & payments", capability: "invoices.manage", description: "Create / edit invoices (incl. create-from-payroll)" },
  { area: "Invoices & payments", capability: "invoices.send", description: "Send invoice (Draft \u2192 Sent)" },
  { area: "Invoices & payments", capability: "invoices.delete", description: "Delete invoices" },
  { area: "Invoices & payments", capability: "payments.post", description: "Post a payment against an invoice" },
  { area: "Invoices & payments", capability: "payments.reverse", description: "Reverse a payment (reserved \u2014 nobody by default)" },
  { area: "Invoices & payments", capability: "ar.view", description: "AR aging report" },
  { area: "Clients & CRM", capability: "clients.view", description: "View client records" },
  { area: "Clients & CRM", capability: "clients.manage", description: "Create / edit / delete clients" },
  { area: "Clients & CRM", capability: "crm.manage", description: "Companies, contacts, activities, follow-ups, convert prospects" },
  { area: "Candidate self-service", capability: "candidate.profile.view", description: "Candidate views own person row" },
  { area: "Candidate self-service", capability: "candidate.profile.edit", description: "Candidate updates allowed fields on own profile" },
  { area: "Candidate self-service", capability: "candidate.apply", description: "Apply to open jobs" },
  { area: "Roles & admin", capability: "roles.assign", description: "Assign roles to users" },
  { area: "Roles & admin", capability: "roles.audit.view", description: "View role-change audit log" },
  { area: "Roles & admin", capability: "permissions.manage", description: "Manage role \u2194 capability grants (Permissions page)" },
  { area: "Roles & admin", capability: "users.invite", description: "Invite new users (not built yet)" },
  { area: "Roles & admin", capability: "users.deactivate", description: "Deactivate users (not built yet)" },
  { area: "Roles & admin", capability: "demo.reset", description: "Reset demo data (clear + reseed)" },
  { area: "Settings & reports", capability: "settings.manage", description: "Billing settings, compliance settings, import/export" },
  { area: "Settings & reports", capability: "reports.view", description: "Admin reports" },
  { area: "Knowledge base", capability: "kb.view", description: "Read KB articles" },
  { area: "Knowledge base", capability: "kb.manage", description: "Create / edit / delete KB articles" },
  { area: "Sensitive data", capability: "sensitive.view", description: "View sensitive fields \u2014 SSNs, bank details (reserved \u2014 nobody by default)" },
];

// Default template (the ATS/CRM milestone matrix) — generated from the seed.
export const DEFAULT_CAPABILITIES = {
  "admin": [
    "ar.view", "assignments.delete", "assignments.manage", "assignments.view",
    "candidate.apply", "candidates.delete", "candidates.quickadd", "candidates.search",
    "clients.manage", "clients.view", "crm.manage", "dashboard.admin.view",
    "dashboard.backoffice.view", "dashboard.branch_manager.view", "dashboard.ceo.view", "dashboard.cfo.view",
    "dashboard.director.view", "dashboard.sales_manager.view", "dashboard.sales_rep.view", "demo.reset",
    "invoices.delete", "invoices.manage", "invoices.view", "jobs.delete",
    "jobs.manage", "jobs.view", "kb.manage", "kb.view",
    "permissions.manage", "pipeline.delete", "pipeline.manage", "pipeline.view",
    "reports.view", "roles.assign", "roles.audit.view", "settings.manage",
    "timesheets.approve_internal", "timesheets.delete", "timesheets.submit", "timesheets.view",
    "users.deactivate", "users.invite",
  ],
  "ceo": [
    "ar.view", "assignments.manage", "assignments.view", "candidates.quickadd",
    "candidates.search", "clients.manage", "clients.view", "crm.manage",
    "dashboard.ceo.view", "invoices.view", "jobs.manage", "jobs.view",
    "kb.view", "payroll.view", "pipeline.manage", "pipeline.view",
    "reports.view", "timesheets.view",
  ],
  "cfo": [
    "ar.view", "assignments.manage", "assignments.view", "candidates.quickadd",
    "candidates.search", "clients.manage", "clients.view", "crm.manage",
    "dashboard.cfo.view", "invoices.view", "jobs.manage", "jobs.view",
    "kb.view", "payroll.view", "pipeline.manage", "pipeline.view",
    "reports.view", "timesheets.view",
  ],
  "director": [
    "assignments.manage", "assignments.view", "candidates.quickadd", "candidates.search",
    "clients.manage", "clients.view", "crm.manage", "dashboard.director.view",
    "jobs.manage", "jobs.view", "kb.view", "pipeline.manage",
    "pipeline.view", "timesheets.view",
  ],
  "branch-manager": [
    "assignments.manage", "assignments.view", "candidates.quickadd", "candidates.search",
    "clients.manage", "clients.view", "crm.manage", "dashboard.branch_manager.view",
    "jobs.manage", "jobs.view", "kb.view", "pipeline.manage",
    "pipeline.view", "timesheets.view",
  ],
  "sales-rep": [
    "assignments.manage", "assignments.view", "candidates.quickadd", "candidates.search",
    "clients.manage", "clients.view", "crm.manage", "dashboard.sales_rep.view",
    "jobs.manage", "jobs.view", "kb.view", "pipeline.manage",
    "pipeline.view", "timesheets.view",
  ],
  "sales-manager": [
    "assignments.manage", "assignments.view", "candidates.quickadd", "candidates.search",
    "clients.manage", "clients.view", "crm.manage", "dashboard.sales_manager.view",
    "jobs.manage", "jobs.view", "kb.view", "pipeline.manage",
    "pipeline.view", "timesheets.view",
  ],
  "recruiter": [
    "assignments.manage", "assignments.view", "candidate.apply", "candidates.quickadd",
    "candidates.search", "clients.manage", "clients.view", "crm.manage",
    "dashboard.recruiter.view", "jobs.manage", "jobs.view", "kb.view",
    "pipeline.manage", "pipeline.view", "timesheets.approve_internal", "timesheets.submit",
    "timesheets.view",
  ],
  "candidate": [
    "assignments.view", "candidate.apply", "candidate.profile.edit", "candidate.profile.view",
    "clients.view", "dashboard.candidate.view", "jobs.view", "kb.view",
    "pipeline.view", "timesheets.submit", "timesheets.view",
  ],
  "client": [
    "ar.view", "assignments.view", "client.portal.view", "clients.view",
    "dashboard.client.view", "invoices.view", "jobs.view", "kb.view",
    "pipeline.decide_client", "pipeline.view", "timesheets.approve_client", "timesheets.view",
  ],
  "backoffice": [
    "ar.view", "assignments.manage", "assignments.view", "candidates.quickadd",
    "candidates.search", "clients.manage", "clients.view", "crm.manage",
    "dashboard.backoffice.view", "invoices.manage", "invoices.send", "invoices.view",
    "jobs.manage", "jobs.view", "kb.view", "payments.post",
    "payroll.finalize", "payroll.prepare", "payroll.view", "pipeline.manage",
    "pipeline.view", "timesheets.approve_internal", "timesheets.view",
  ],
};


export function getCapabilitiesForRole(role) {
  return new Set(DEFAULT_CAPABILITIES[role] || []);
}

// Pure check against the defaults (no network): the admin floor always holds.
export function hasCapabilityForRole(role, capability) {
  if (role === 'admin' && ADMIN_FLOOR_CAPABILITIES.includes(capability)) return true;
  return (DEFAULT_CAPABILITIES[role] || []).includes(capability);
}

// Resolve a role's capabilities from a live role_capabilities result set
// (rows: [{ capability }]); returns null when there is nothing usable.
export function resolveLiveCapabilities(rows) {
  if (!Array.isArray(rows)) return null;
  return new Set(rows.map((r) => r.capability).filter(Boolean));
}

// --- Live grants (never-throw) -------------------------------------------
// Reads the signed-in role's own rows. The role_capabilities RLS lets any
// authenticated user SELECT their own role's rows; admin sees all. On the
// DEMO DB the table does not exist at all, so the query errors and the
// caller falls back to DEFAULT_CAPABILITIES. A 3s timeout keeps a hung
// request from stalling the UI — the defaults are the safe fallback.
const liveCache = new Map(); // role -> Promise<Set | null>
const resolvedCache = new Map(); // role -> Set (live grants, per session)

export function invalidateCapabilityCache() {
  liveCache.clear();
  resolvedCache.clear();
}

function withTimeout(promise, ms) {
  let timer;
  return Promise.race([
    promise,
    new Promise((resolve) => { timer = setTimeout(() => resolve(null), ms); }),
  ]).finally(() => clearTimeout(timer));
}

export async function fetchRoleCapabilities(role) {
  if (!role) return null;
  if (resolvedCache.has(role)) return resolvedCache.get(role);
  if (!liveCache.has(role)) {
    const p = withTimeout(
      supabase
        .from('role_capabilities')
        .select('capability')
        .eq('tenant_id', 'demo')
        .eq('role', role)
        .then(({ data, error }) => {
          if (error) return null;
          return resolveLiveCapabilities(data);
        })
        .catch(() => null),
      3000,
    ).then((caps) => {
      if (caps) {
        if (role === 'admin') {
          ADMIN_FLOOR_CAPABILITIES.forEach((c) => caps.add(c));
        }
        resolvedCache.set(role, caps);
      } else {
        // No usable live result (table missing, denial, timeout): drop the
        // cached promise so a later call retries instead of reusing null.
        liveCache.delete(role);
      }
      return caps;
    });
    liveCache.set(role, p);
  }
  return liveCache.get(role);
}

// --- Hook ------------------------------------------------------------------
// Resolves the EFFECTIVE role's capabilities (useAuth's role: roleOverride
// in dev/Demo Mode, else the signed-in account's profile role). Starts from
// the defaults so the first render is never an empty set, then refines with
// the live grants when the table is reachable. Re-resolves on every role
// change, so a Demo Mode persona switch never shows stale capabilities.
export function useCapabilities() {
  const { role } = useAuth();
  const [caps, setCaps] = useState(() => getCapabilitiesForRole(role));
  const [usingDefaults, setUsingDefaults] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fallback = getCapabilitiesForRole(role);
    if (role === 'admin') {
      ADMIN_FLOOR_CAPABILITIES.forEach((c) => fallback.add(c));
    }
    setCaps(fallback);
    setUsingDefaults(true);
    setLoading(true);
    fetchRoleCapabilities(role).then((live) => {
      if (cancelled) return;
      if (live) {
        setCaps(live);
        setUsingDefaults(false);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const hasCapability = (capability) => {
    if (role === 'admin' && ADMIN_FLOOR_CAPABILITIES.includes(capability)) return true;
    return caps.has(capability);
  };

  return { role, capabilities: caps, hasCapability, loading, usingDefaults };
}

// --- Denial redirect -------------------------------------------------------
// When a capability-gated route denies a user, send them to the first
// dashboard they CAN view (their own role's dashboard first, then any
// dashboard capability they hold), else /jobs (auth-only, always open).
// This avoids a redirect loop when a dashboard capability itself is revoked.
const DASHBOARD_CAPS_IN_ORDER = [
  'dashboard.admin.view', 'dashboard.ceo.view', 'dashboard.cfo.view',
  'dashboard.director.view', 'dashboard.branch_manager.view',
  'dashboard.sales_rep.view', 'dashboard.sales_manager.view',
  'dashboard.backoffice.view', 'dashboard.recruiter.view',
  'dashboard.candidate.view', 'dashboard.client.view',
];
const CAP_TO_ROUTE = {};
Object.entries(ROLE_ROUTES).forEach(([r, route]) => {
  CAP_TO_ROUTE[`dashboard.${r.replace('-', '_')}.view`] = route;
});
CAP_TO_ROUTE['dashboard.client.view'] = '/client/approvals';

export function getFallbackRoute(role, hasCapability) {
  const own = ROLE_ROUTES[role];
  const ownCap = own && Object.keys(CAP_TO_ROUTE).find((c) => CAP_TO_ROUTE[c] === own);
  if (ownCap && hasCapability(ownCap)) return own;
  for (const cap of DASHBOARD_CAPS_IN_ORDER) {
    if (hasCapability(cap)) return CAP_TO_ROUTE[cap] || '/jobs';
  }
  return '/jobs';
}
