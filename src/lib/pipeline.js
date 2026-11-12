import { supabase } from '@/lib/supabase';
import {
  getCandidates, setCandidates, normalizeStatus,
  getAssignments, setAssignments, getJobs, setJobs, getClients,
  getTimesheets, setTimesheets, getInvoices, setInvoices,
  getPayments, setPayments,
} from '@/utils/storage';

// ---------------------------------------------------------------------------
// Supabase read layer + demo <-> Supabase sync (migration slices 1-2, thin).
//
// Design (see goals/alltech-mvp-rebuild/files/supabase-migration-slice*-plan.md):
// - The demo store (localStorage) stays the canonical WRITE path.
// - Supabase is the SHARED READ store: pipeline + assignment pages read here
//   so two sessions see the same records. Reads fall back to the demo store
//   when Supabase is unreachable, so a sales presentation never breaks on wifi.
// - Every demo write to the pipeline/assignments syncs to Supabase
//   write-through, best-effort, fire-and-forget (the demo write never fails
//   because of it).
// - reconcilePipeline()/reconcileAssignments() run on page load: both-ways
//   sync with timestamp last-write-wins.
// - TEMPORARY: the sync and the demo fallback go away when the write paths
//   move to Supabase in later slices.
// ---------------------------------------------------------------------------

const APP_SELECT =
  'id,status,history,client_decision,client_decision_note,client_decided_at,' +
  'rejected_reason,submitted_at,created_at,updated_at,candidate_id,job_id,' +
  'candidates(id,name,email,phone,status,legacy_id),' +
  'jobs(id,title,legacy_id,clients(name))';

const JOB_SELECT =
  'id,title,location,rate,openings,status,legacy_id,client_id,clients(name)';

// Supabase reads from the browser are occasionally flaky (a response can
// drop mid-read even though the server answered). One retry before giving
// up and falling back to the demo store.
async function withRetry(fn, attempts = 2, delayMs = 800) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      // Slice 7: a denial is not transient — do not retry it.
      if (isRlsDenied(err)) throw err;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastError;
}

// Slice 7: an RLS denial (403 / 42501 insufficient_privilege) is a
// permission denial, NOT an outage. Pages must NOT fall back to the demo
// store on a denial — the demo store is unscoped and would leak other
// companies' rows. Network failures still fall back with the amber note.
// A denial is tagged with `denied: true` so callers can tell it apart
// from a network failure without parsing the message themselves.
export function isRlsDenied(error) {
  if (!error) return false;
  if (error.code === '42501') return true;
  const msg = String(error.message || error);
  return /permission denied|row-level security|insufficient_privilege/i.test(msg);
}

function asDeniedError(error) {
  const err = error instanceof Error ? error : new Error(String(error?.message || error));
  err.denied = true;
  if (error && error.code) err.code = error.code;
  return err;
}

// Throw on any PostgREST error; denials carry `denied: true`.
function throwChecked(error) {
  if (!error) return;
  if (isRlsDenied(error)) throw asDeniedError(error);
  throw error;
}

function mapJob(j) {
  if (!j) return null;
  return {
    id: j.id,
    title: j.title,
    client_name: j.clients?.name || '—',
    clientId: j.client_id,
    location: j.location || '—',
    rate: j.rate,
    openings: j.openings,
    status: j.status,
    legacyId: j.legacy_id || null,
  };
}

function mapApplication(a) {
  const person = a.candidates || {};
  const job = a.jobs || {};
  const history = Array.isArray(a.history) ? a.history : [];
  const last = history.length ? history[history.length - 1] : null;
  return {
    id: a.id,
    candidateId: a.candidate_id,
    name: person.name || '—',
    email: person.email || '',
    phone: person.phone || '',
    jobId: a.job_id,
    jobTitle: job.title || '—',
    clientName: job.clients?.name || '—',
    legacyCandidateId: person.legacy_id || null,
    legacyJobId: job.legacy_id || null,
    status: normalizeStatus(a.status),
    history,
    clientDecision: a.client_decision || null,
    clientDecisionNote: a.client_decision_note || '',
    clientDecidedAt: a.client_decided_at || null,
    rejectedReason: a.rejected_reason || null,
    submittedAt: a.submitted_at || null,
    lastActionAt: last?.at || a.updated_at || a.created_at || null,
    createdAt: a.created_at || null,
    updatedAt: a.updated_at || null,
  };
}

// --- Reads (Supabase first, demo fallback on error) ------------------------

export async function fetchJobs() {
  const { data, error } = await withRetry(() => supabase
    .from('jobs')
    .select(JOB_SELECT)
    .order('id'));
  throwChecked(error);
  return (data || []).map(mapJob);
}

export async function fetchPersons() {
  const { data, error } = await supabase
    .from('candidates')
    .select('id,name,email,phone,status,legacy_id')
    .order('name');
  throwChecked(error);
  return data || [];
}

export async function fetchApplications({ jobId } = {}) {
  const { data, error } = await withRetry(async () => {
    let query = supabase.from('applications').select(APP_SELECT).order('updated_at', { ascending: false });
    if (jobId !== undefined && jobId !== null) query = query.eq('job_id', jobId);
    return query;
  });
  throwChecked(error);
  return (data || []).map(mapApplication);
}

export async function fetchApplication(id) {
  const { data, error } = await withRetry(() => supabase
    .from('applications')
    .select(APP_SELECT)
    .eq('id', id)
    .single());
  throwChecked(error);
  return mapApplication(data);
}

export async function fetchAppliedJobIds(email) {
  const normalized = (email || '').trim().toLowerCase();
  if (!normalized) return [];
  const { data: persons, error } = await withRetry(() => supabase
    .from('candidates')
    .select('id')
    .eq('email', normalized));
  throwChecked(error);
  if (!persons || persons.length === 0) return [];
  const { data: apps, error: appError } = await withRetry(() => supabase
    .from('applications')
    .select('job_id')
    .in('candidate_id', persons.map((p) => p.id)));
  throwChecked(appError);
  return (apps || []).map((a) => a.job_id);
}

export async function fetchRecentClientDecisions(days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const { data, error } = await withRetry(() => supabase
    .from('applications')
    .select(APP_SELECT)
    .not('client_decision', 'is', null)
    .gte('client_decided_at', cutoff.toISOString())
    .order('client_decided_at', { ascending: false }));
  throwChecked(error);
  return (data || []).map((a) => {
    const m = mapApplication(a);
    return {
      applicationId: m.id,
      candidateId: m.candidateId,
      candidateName: m.name,
      jobId: m.jobId,
      jobTitle: m.jobTitle,
      decision: m.clientDecision,
      note: m.clientDecisionNote,
      decidedAt: m.clientDecidedAt,
    };
  });
}

// --- Sync: demo store -> Supabase (best-effort, never throws) ---------------

async function resolveJobId(demoJobId) {
  if (demoJobId === undefined || demoJobId === null) return null;
  // Supabase job ids are bigints; a numeric-looking id may already be one.
  if (/^\d+$/.test(String(demoJobId))) return Number(demoJobId);
  const { data, error } = await supabase
    .from('jobs')
    .select('id')
    .eq('legacy_id', String(demoJobId))
    .single();
  if (error || !data) return null;
  return data.id;
}

async function findOrCreatePerson(demo) {
  const email = (demo.email || '').trim().toLowerCase();
  const { data } = await supabase
    .from('candidates')
    .select('id,status,legacy_id')
    .eq('email', email)
    .limit(1);
  if (data && data.length > 0) return data[0];
  const id = crypto.randomUUID();
  const { data: created, error } = await supabase
    .from('candidates')
    .insert([{
      id,
      name: demo.name,
      email,
      phone: demo.phone || '',
      status: normalizeStatus(demo.status),
      legacy_id: demo.id || null,
    }])
    .select('id,status,legacy_id')
    .single();
  if (error || !created) return null;
  return created;
}

function demoTimestamp(demo) {
  return Date.parse(demo.lastActionAt || demo.createdAt || 0) || 0;
}

function stampDemoRow(demo, { personId, applicationId }) {
  const rows = getCandidates();
  const idx = rows.findIndex((c) => c.id === demo.id);
  if (idx === -1) return;
  rows[idx] = {
    ...rows[idx],
    supabasePersonId: personId || rows[idx].supabasePersonId || null,
    supabaseApplicationId: applicationId || rows[idx].supabaseApplicationId || null,
  };
  setCandidates(rows);
}

function applySupabaseToDemo(app, demo) {
  // Supabase is newer: adopt its state into the demo row.
  const rows = getCandidates();
  const idx = rows.findIndex((c) => c.id === demo.id);
  if (idx === -1) return;
  const m = mapApplication(app);
  rows[idx] = {
    ...rows[idx],
    status: m.status,
    statusHistory: m.history,
    clientDecision: m.clientDecision || undefined,
    clientDecisionNote: m.clientDecisionNote || undefined,
    clientDecidedAt: m.clientDecidedAt || undefined,
    rejectedReason: m.rejectedReason || undefined,
    submittedAt: m.submittedAt || undefined,
    lastActionAt: m.updatedAt || rows[idx].lastActionAt,
    supabasePersonId: app.candidate_id,
    supabaseApplicationId: app.id,
  };
  setCandidates(rows);
}

function applicationPayload(demo, personId, jobId) {
  return {
    candidate_id: personId,
    job_id: jobId,
    status: normalizeStatus(demo.status),
    history: demo.statusHistory || [],
    client_decision: demo.clientDecision || null,
    client_decision_note: demo.clientDecisionNote || null,
    client_decided_at: demo.clientDecidedAt || null,
    rejected_reason: demo.rejectedReason || null,
    submitted_at: demo.submittedAt || null,
    updated_at: demo.lastActionAt || new Date().toISOString(),
  };
}

/**
 * Sync one demo candidate row to Supabase. Never throws: failures are
 * swallowed (dev console only) so the demo write path is unaffected.
 * Returns 'demo' | 'supabase' | 'created' | 'skipped' | 'failed'.
 */
export async function syncCandidateToSupabase(demo) {
  try {
    if (!demo || !demo.email) return 'skipped';
    const jobId = await resolveJobId(demo.submittedJobId || demo.currentJobId);
    if (!jobId) return 'skipped';
    const person = await findOrCreatePerson(demo);
    if (!person) return 'failed';

    const { data: existing } = await supabase
      .from('applications')
      .select(APP_SELECT)
      .eq('candidate_id', person.id)
      .eq('job_id', jobId)
      .limit(1);
    const app = existing && existing.length > 0 ? existing[0] : null;

    if (!app) {
      const { data: created, error } = await supabase
        .from('applications')
        .insert([applicationPayload(demo, person.id, jobId)])
        .select('id')
        .single();
      if (error || !created) return 'failed';
      await supabase.from('candidates').update({ status: normalizeStatus(demo.status) }).eq('id', person.id);
      stampDemoRow(demo, { personId: person.id, applicationId: created.id });
      return 'created';
    }

    stampDemoRow(demo, { personId: person.id, applicationId: app.id });
    const demoTime = demoTimestamp(demo);
    const appTime = Date.parse(app.updated_at || 0) || 0;
    if (demoTime >= appTime) {
      const { error } = await supabase
        .from('applications')
        .update(applicationPayload(demo, person.id, jobId))
        .eq('id', app.id);
      if (error) return 'failed';
      await supabase.from('candidates').update({ status: normalizeStatus(demo.status) }).eq('id', person.id);
      return 'demo';
    }
    // Supabase is newer: adopt it into the demo row.
    applySupabaseToDemo(app, demo);
    return 'supabase';
  } catch (err) {
    if (import.meta.env.MODE !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[pipeline sync] failed', err);
    }
    return 'failed';
  }
}

/**
 * Load-time reconcile: push this browser's demo pipeline up to Supabase,
 * and create demo twins for Supabase applications this browser has never
 * seen. Returns the fresh Supabase application list (mapped).
 */
export async function reconcilePipeline() {
  const demoRows = getCandidates().filter((c) => c.submittedJobId || c.currentJobId);
  // Rows are independent (unique per person+job), so sync in parallel.
  await Promise.all(demoRows.map((demo) => syncCandidateToSupabase(demo)));

  const apps = await fetchApplications();
  const demoByKey = new Map();
  for (const d of getCandidates()) {
    if (d.supabaseApplicationId) demoByKey.set(String(d.supabaseApplicationId), d);
    const key = `${(d.email || '').trim().toLowerCase()}|${d.submittedJobId || d.currentJobId || ''}`;
    if (!demoByKey.has(key)) demoByKey.set(key, d);
  }

  const missing = apps.filter((a) => {
    if (demoByKey.has(String(a.id))) return false;
    const key = `${(a.email || '').trim().toLowerCase()}|${a.legacyJobId || ''}`;
    return !demoByKey.has(key);
  });

  if (missing.length > 0) {
    const rows = getCandidates();
    for (const a of missing) {
      rows.push({
        id: crypto.randomUUID(),
        name: a.name,
        email: a.email,
        phone: a.phone,
        status: a.status,
        submittedJobId: a.legacyJobId || null,
        statusHistory: a.history,
        clientDecision: a.clientDecision || undefined,
        clientDecisionNote: a.clientDecisionNote || undefined,
        clientDecidedAt: a.clientDecidedAt || undefined,
        rejectedReason: a.rejectedReason || undefined,
        submittedAt: a.submittedAt || undefined,
        lastActionAt: a.updatedAt || a.createdAt || null,
        supabasePersonId: a.candidateId,
        supabaseApplicationId: a.id,
      });
    }
    setCandidates(rows);
  }

  return apps;
}

/** Demo reset support: clear Supabase pipeline rows (seeded rows are re-synced after). */
export async function clearSupabasePipeline() {
  const { error: appError } = await supabase.from('applications').delete().neq('id', 0);
  throwChecked(appError);
  // Remove sync-created persons (legacy_id is a crypto uuid, not a seed cand-xxx id).
  // Seeded persons (legacy_id cand-001..008) and the legacy Dd row (legacy_id null) stay.
  const { data: persons, error: personError } = await supabase
    .from('candidates')
    .select('id,legacy_id')
    .not('legacy_id', 'is', null);
  if (personError) throw personError;
  const extra = (persons || []).filter((p) => !/^cand-\d+$/.test(p.legacy_id || ''));
  if (extra.length > 0) {
    const { error } = await supabase.from('candidates').delete().in('id', extra.map((p) => p.id));
    throwChecked(error);
  }
  return { applicationsCleared: true, personsRemoved: extra.length };
}

// --- Assignments (migration slice 2) ---------------------------------------

const ASSIGNMENT_SELECT =
  'id,status,start_date,end_date,pay_rate,bill_rate,notes,legacy_id,' +
  'created_at,updated_at,candidate_id,job_id,' +
  'candidates(id,name,email,phone,status,legacy_id),' +
  'jobs(id,title,legacy_id,clients(name))';

function mapAssignment(a) {
  const person = a.candidates || {};
  const job = a.jobs || {};
  return {
    id: a.id,
    candidateId: a.candidate_id,
    candidateName: person.name || '—',
    candidateEmail: person.email || '',
    candidateStatus: person.status ? normalizeStatus(person.status) : '—',
    legacyCandidateId: person.legacy_id || null,
    jobId: a.job_id,
    jobTitle: job.title || '—',
    clientName: job.clients?.name || '—',
    legacyJobId: job.legacy_id || null,
    status: a.status,
    startDate: a.start_date,
    endDate: a.end_date || null,
    payRate: a.pay_rate,
    billRate: a.bill_rate,
    notes: a.notes || '',
    legacyId: a.legacy_id || null,
    createdAt: a.created_at || null,
    updatedAt: a.updated_at || null,
  };
}

export async function fetchAssignments() {
  const { data, error } = await withRetry(() => supabase
    .from('assignments')
    .select(ASSIGNMENT_SELECT)
    .order('updated_at', { ascending: false }));
  throwChecked(error);
  return (data || []).map(mapAssignment);
}

export async function fetchAssignment(id) {
  const { data, error } = await withRetry(() => supabase
    .from('assignments')
    .select(ASSIGNMENT_SELECT)
    .eq('id', id)
    .single());
  throwChecked(error);
  return mapAssignment(data);
}

async function resolvePersonId(demoCandidateId) {
  const demo = getCandidates().find((c) => c.id === demoCandidateId);
  if (!demo) return null;
  if (demo.supabasePersonId) return demo.supabasePersonId;
  const person = await findOrCreatePerson(demo);
  return person ? person.id : null;
}

function assignmentPayload(demo, candidateUuid, jobId) {
  return {
    candidate_id: candidateUuid,
    job_id: jobId,
    status: demo.status || 'Active',
    start_date: demo.startDate,
    end_date: demo.endDate || null,
    pay_rate: demo.payRate ?? null,
    bill_rate: demo.billRate ?? null,
    notes: demo.notes || null,
    legacy_id: String(demo.id),
    updated_at: demo.updatedAt || new Date().toISOString(),
  };
}

function stampDemoAssignment(demo, supabaseId) {
  const rows = getAssignments();
  const idx = rows.findIndex((a) => a.id === demo.id);
  if (idx === -1) return;
  rows[idx] = { ...rows[idx], supabaseAssignmentId: supabaseId };
  setAssignments(rows);
}

function applySupabaseAssignmentToDemo(row, demo) {
  const rows = getAssignments();
  const idx = rows.findIndex((a) => a.id === demo.id);
  if (idx === -1) return;
  const m = mapAssignment(row);
  rows[idx] = {
    ...rows[idx],
    status: m.status,
    startDate: m.startDate,
    endDate: m.endDate,
    payRate: m.payRate,
    billRate: m.billRate,
    notes: m.notes,
    updatedAt: m.updatedAt || rows[idx].updatedAt,
    supabaseAssignmentId: row.id,
  };
  setAssignments(rows);
}

/**
 * Sync one demo assignment row to Supabase. Never throws. The demo id is
 * the stable key (legacy_id), so a row syncs 1:1. Returns
 * 'demo' | 'supabase' | 'created' | 'skipped' | 'failed'.
 */
export async function syncAssignmentToSupabase(demo) {
  try {
    if (!demo || !demo.candidateId || !demo.jobId) return 'skipped';
    const candidateUuid = await resolvePersonId(demo.candidateId);
    if (!candidateUuid) return 'skipped';
    const jobId = await resolveJobId(demo.jobId);
    if (!jobId) return 'skipped';

    const { data: existing } = await supabase
      .from('assignments')
      .select(ASSIGNMENT_SELECT)
      .eq('legacy_id', String(demo.id))
      .limit(1);
    const row = existing && existing.length > 0 ? existing[0] : null;

    if (!row) {
      const { data: created, error } = await supabase
        .from('assignments')
        .insert([assignmentPayload(demo, candidateUuid, jobId)])
        .select('id')
        .single();
      if (error || !created) return 'failed';
      stampDemoAssignment(demo, created.id);
      return 'created';
    }

    stampDemoAssignment(demo, row.id);
    const demoTime = Date.parse(demo.updatedAt || 0) || 0;
    const rowTime = Date.parse(row.updated_at || 0) || 0;
    if (demoTime >= rowTime) {
      const { error } = await supabase
        .from('assignments')
        .update(assignmentPayload(demo, candidateUuid, jobId))
        .eq('id', row.id);
      if (error) return 'failed';
      return 'demo';
    }
    applySupabaseAssignmentToDemo(row, demo);
    return 'supabase';
  } catch (err) {
    if (import.meta.env.MODE !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[assignment sync] failed', err);
    }
    return 'failed';
  }
}

function ensureDemoCandidate(a) {
  const rows = getCandidates();
  const byPerson = rows.find((c) => c.supabasePersonId === a.candidateId);
  if (byPerson) return byPerson.id;
  const byEmail = rows.find(
    (c) => (c.email || '').trim().toLowerCase() === (a.candidateEmail || '').trim().toLowerCase()
  );
  if (byEmail) return byEmail.id;
  // Minimal reference row: no submittedJobId, so the pipeline reconcile
  // ignores it (it is not a pipeline application, just the assignment's person).
  const id = a.legacyCandidateId || crypto.randomUUID();
  rows.push({
    id,
    name: a.candidateName,
    email: a.candidateEmail,
    phone: '',
    status: a.candidateStatus || 'Applied',
    submittedJobId: null,
    statusHistory: [],
    supabasePersonId: a.candidateId,
  });
  setCandidates(rows);
  return id;
}

function ensureDemoJob(a) {
  const jobs = getJobs();
  const byLegacy = jobs.find((j) => String(j.id) === String(a.legacyJobId));
  if (byLegacy) return byLegacy.id;
  const byNumeric = jobs.find((j) => String(j.id) === String(a.jobId));
  if (byNumeric) return byNumeric.id;
  const clients = getClients();
  const client = clients.find((c) => c.name === a.clientName);
  const id = a.legacyJobId || String(a.jobId);
  jobs.push({
    id,
    title: a.jobTitle,
    clientId: client ? client.id : 'client-001',
    client_name: a.clientName,
    location: '',
    rate: null,
    openings: 1,
    status: 'Open',
  });
  setJobs(jobs);
  return id;
}

/**
 * Load-time reconcile for assignments: push this browser's demo assignments
 * up to Supabase, and create demo twins for Supabase assignments this
 * browser has never seen. Returns the fresh Supabase assignment list (mapped).
 */
export async function reconcileAssignments() {
  const demoRows = getAssignments();
  await Promise.all(demoRows.map((d) => syncAssignmentToSupabase(d)));

  const rows = await fetchAssignments();
  const demoByKey = new Map();
  for (const d of getAssignments()) {
    if (d.supabaseAssignmentId) demoByKey.set(String(d.supabaseAssignmentId), d);
    if (d.id) demoByKey.set(String(d.id), d);
  }
  const missing = rows.filter(
    (a) => !demoByKey.has(String(a.id)) && !demoByKey.has(String(a.legacyId))
  );

  if (missing.length > 0) {
    const demoAssignments = getAssignments();
    for (const a of missing) {
      const demoCandidateId = ensureDemoCandidate(a);
      const demoJobId = ensureDemoJob(a);
      if (!demoCandidateId || !demoJobId) continue;
      demoAssignments.push({
        id: a.legacyId || crypto.randomUUID(),
        candidateId: demoCandidateId,
        jobId: demoJobId,
        status: a.status,
        startDate: a.startDate,
        endDate: a.endDate || null,
        payRate: a.payRate,
        billRate: a.billRate,
        notes: a.notes || '',
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        supabaseAssignmentId: a.id,
      });
    }
    setAssignments(demoAssignments);
  }

  return rows;
}

/** Demo reset support: clear Supabase assignments (seeded rows are re-synced after). */
export async function clearSupabaseAssignments() {
  const { error } = await supabase.from('assignments').delete().neq('id', 0);
  throwChecked(error);
  return { assignmentsCleared: true };
}

// --- Timesheets (migration slice 3) ----------------------------------------

const TIMESHEET_SELECT =
  'id,status,client_approval_status,payroll_status,approver_note,week_ending,' +
  'hours_mon,hours_tue,hours_wed,hours_thu,hours_fri,hours_sat,hours_sun,' +
  'submitted_at,approved_at,payroll_ready_at,client_decided_at,' +
  'exceptions,compliance,legacy_id,created_at,updated_at,candidate_id,assignment_id,invoice_id,' +
  'candidates(id,name,email,legacy_id),' +
  'invoices(id,legacy_id),' +
  `assignments(${ASSIGNMENT_SELECT})`;

function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function mapTimesheet(t) {
  const person = t.candidates || {};
  const asg = t.assignments || {};
  const job = asg.jobs || {};
  const hours = [t.hours_mon, t.hours_tue, t.hours_wed, t.hours_thu, t.hours_fri, t.hours_sat, t.hours_sun]
    .map((h) => Number(h) || 0);
  const entries = hours.map((h, i) => ({
    date: t.week_ending ? addDays(t.week_ending, i - 6) : null,
    hours: h,
  }));
  return {
    id: t.id,
    assignmentId: asg.legacy_id || null,
    assignmentSupabaseId: t.assignment_id || null,
    candidateId: person.legacy_id || null,
    candidateName: person.name || '—',
    candidateEmail: person.email || '',
    jobId: job.legacy_id || null,
    jobTitle: job.title || '—',
    clientName: job.clients?.name || '—',
    weekEnding: t.week_ending || null,
    entries,
    totalHours: hours.reduce((s, h) => s + h, 0),
    status: t.status,
    clientApprovalStatus: t.client_approval_status || 'Not Submitted',
    payrollStatus: t.payroll_status || 'Not Ready',
    approverNote: t.approver_note || '',
    exceptions: Array.isArray(t.exceptions) ? t.exceptions : [],
    compliance: t.compliance || {},
    submittedAt: t.submitted_at || null,
    approvedAt: t.approved_at || null,
    payrollReadyAt: t.payroll_ready_at || null,
    clientDecidedAt: t.client_decided_at || null,
    invoiceId: t.invoices?.legacy_id || null,
    legacyId: t.legacy_id || null,
    createdAt: t.created_at || null,
    updatedAt: t.updated_at || null,
  };
}

export async function fetchTimesheets() {
  const { data, error } = await withRetry(() => supabase
    .from('timesheets')
    .select(TIMESHEET_SELECT)
    .order('updated_at', { ascending: false }));
  throwChecked(error);
  return (data || []).map(mapTimesheet);
}

export async function fetchTimesheet(id) {
  const { data, error } = await withRetry(() => supabase
    .from('timesheets')
    .select(TIMESHEET_SELECT)
    .eq('id', id)
    .single());
  throwChecked(error);
  return mapTimesheet(data);
}

async function resolveAssignmentSupabaseId(demoAssignmentId) {
  const demo = getAssignments().find((a) => a.id === demoAssignmentId);
  if (demo && demo.supabaseAssignmentId) return demo.supabaseAssignmentId;
  const { data } = await supabase
    .from('assignments')
    .select('id')
    .eq('legacy_id', String(demoAssignmentId))
    .limit(1);
  return data && data.length > 0 ? data[0].id : null;
}

function timesheetPayload(demo, candidateUuid, assignmentSupabaseId, invoiceSupabaseId) {
  const hours = [0, 0, 0, 0, 0, 0, 0];
  (demo.entries || []).forEach((e, i) => {
    if (i < 7) hours[i] = Number(e.hours) || 0;
  });
  return {
    candidate_id: candidateUuid,
    assignment_id: assignmentSupabaseId,
    invoice_id: invoiceSupabaseId || null,
    week_ending: demo.weekEnding || null,
    hours_mon: hours[0],
    hours_tue: hours[1],
    hours_wed: hours[2],
    hours_thu: hours[3],
    hours_fri: hours[4],
    hours_sat: hours[5],
    hours_sun: hours[6],
    status: demo.status || 'Draft',
    payroll_status: demo.payrollStatus || 'Not Ready',
    client_approval_status: demo.clientApprovalStatus || 'Not Submitted',
    approver_note: demo.approverNote || null,
    submitted_at: demo.submittedAt || null,
    approved_at: demo.approvedAt || null,
    payroll_ready_at: demo.payrollReadyAt || null,
    client_decided_at: demo.clientDecidedAt || null,
    exceptions: demo.exceptions || [],
    compliance: demo.compliance || {},
    legacy_id: String(demo.id),
    updated_at: demo.updatedAt || new Date().toISOString(),
  };
}

function stampDemoTimesheet(demo, supabaseId) {
  const rows = getTimesheets();
  const idx = rows.findIndex((t) => t.id === demo.id);
  if (idx === -1) return;
  rows[idx] = { ...rows[idx], supabaseTimesheetId: supabaseId };
  setTimesheets(rows);
}

function applySupabaseTimesheetToDemo(row, demo) {
  const rows = getTimesheets();
  const idx = rows.findIndex((t) => t.id === demo.id);
  if (idx === -1) return;
  const m = mapTimesheet(row);
  rows[idx] = {
    ...rows[idx],
    status: m.status,
    clientApprovalStatus: m.clientApprovalStatus,
    payrollStatus: m.payrollStatus,
    approverNote: m.approverNote,
    entries: m.entries,
    totalHours: m.totalHours,
    weekEnding: m.weekEnding,
    exceptions: m.exceptions,
    compliance: m.compliance,
    submittedAt: m.submittedAt,
    approvedAt: m.approvedAt,
    payrollReadyAt: m.payrollReadyAt,
    clientDecidedAt: m.clientDecidedAt,
    invoiceId: m.invoiceId || rows[idx].invoiceId || null,
    updatedAt: m.updatedAt || rows[idx].updatedAt,
    supabaseTimesheetId: row.id,
  };
  setTimesheets(rows);
}

// Derived mirror: the CEO/CFO Weekly Hours chart reads timecards, so each
// synced timesheet keeps a matching timecard row (keyed by assignment+week).
async function syncTimecardMirror(demo, assignmentSupabaseId) {
  try {
    if (!assignmentSupabaseId || !demo.weekEnding) return;
    const weekStart = addDays(demo.weekEnding, -6);
    const totalHours = (demo.entries || []).reduce((s, e) => s + (Number(e.hours) || 0), 0);
    const payload = {
      assignment_id: assignmentSupabaseId,
      week_start: weekStart,
      total_hours: totalHours,
      status: demo.status || 'Draft',
    };
    const { data: existing } = await supabase
      .from('timecards')
      .select('id')
      .eq('assignment_id', assignmentSupabaseId)
      .eq('week_start', weekStart)
      .limit(1);
    const row = existing && existing.length > 0 ? existing[0] : null;
    if (row) {
      await supabase.from('timecards').update(payload).eq('id', row.id);
    } else {
      await supabase.from('timecards').insert([payload]);
    }
  } catch {
    // Mirror failure must not fail the timesheet sync.
  }
}

/**
 * Sync one demo timesheet row to Supabase. Never throws. The demo id is the
 * stable key (legacy_id). Returns 'demo' | 'supabase' | 'created' |
 * 'skipped' | 'failed'.
 */
export async function syncTimesheetToSupabase(demo) {
  try {
    if (!demo || !demo.assignmentId || !demo.weekEnding) return 'skipped';
    const assignment = getAssignments().find((a) => a.id === demo.assignmentId);
    if (!assignment) return 'skipped';
    const candidateUuid = await resolvePersonId(assignment.candidateId);
    if (!candidateUuid) return 'skipped';
    const assignmentSupabaseId = await resolveAssignmentSupabaseId(demo.assignmentId);
    if (!assignmentSupabaseId) return 'skipped';
    // Slice 5: carry the invoice stamp (null when uninvoiced).
    const invoiceSupabaseId = demo.invoiceId
      ? await resolveInvoiceSupabaseId(demo.invoiceId)
      : null;

    const { data: existing } = await supabase
      .from('timesheets')
      .select(TIMESHEET_SELECT)
      .eq('legacy_id', String(demo.id))
      .limit(1);
    const row = existing && existing.length > 0 ? existing[0] : null;

    if (!row) {
      const { data: created, error } = await supabase
        .from('timesheets')
        .insert([timesheetPayload(demo, candidateUuid, assignmentSupabaseId, invoiceSupabaseId)])
        .select('id')
        .single();
      if (error || !created) return 'failed';
      stampDemoTimesheet(demo, created.id);
      await syncTimecardMirror(demo, assignmentSupabaseId);
      return 'created';
    }

    stampDemoTimesheet(demo, row.id);
    const demoTime = Date.parse(demo.updatedAt || 0) || 0;
    const rowTime = Date.parse(row.updated_at || 0) || 0;
    if (demoTime >= rowTime) {
      const { error } = await supabase
        .from('timesheets')
        .update(timesheetPayload(demo, candidateUuid, assignmentSupabaseId, invoiceSupabaseId))
        .eq('id', row.id);
      if (error) return 'failed';
      await syncTimecardMirror(demo, assignmentSupabaseId);
      return 'demo';
    }
    applySupabaseTimesheetToDemo(row, demo);
    return 'supabase';
  } catch (err) {
    if (import.meta.env.MODE !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[timesheet sync] failed', err);
    }
    return 'failed';
  }
}

function ensureDemoAssignment(mapped) {
  const rows = getAssignments();
  const bySupabase = rows.find((a) => String(a.supabaseAssignmentId) === String(mapped.id));
  if (bySupabase) return bySupabase.id;
  const byLegacy = rows.find((a) => String(a.id) === String(mapped.legacyId));
  if (byLegacy) return byLegacy.id;
  const demoCandidateId = ensureDemoCandidate(mapped);
  const demoJobId = ensureDemoJob(mapped);
  if (!demoCandidateId || !demoJobId) return null;
  const id = mapped.legacyId || crypto.randomUUID();
  rows.push({
    id,
    candidateId: demoCandidateId,
    jobId: demoJobId,
    status: mapped.status || 'Active',
    startDate: mapped.startDate,
    endDate: mapped.endDate || null,
    payRate: mapped.payRate,
    billRate: mapped.billRate,
    notes: mapped.notes || '',
    createdAt: mapped.createdAt,
    updatedAt: mapped.updatedAt,
    supabaseAssignmentId: mapped.id,
  });
  setAssignments(rows);
  return id;
}

/**
 * Load-time reconcile for timesheets: push this browser's demo timesheets
 * up to Supabase, and create demo twins for Supabase timesheets this
 * browser has never seen. Returns the fresh Supabase timesheet list (mapped).
 */
export async function reconcileTimesheets() {
  const demoRows = getTimesheets();
  await Promise.all(demoRows.map((d) => syncTimesheetToSupabase(d)));

  const rows = await fetchTimesheets();
  const demoByKey = new Map();
  for (const d of getTimesheets()) {
    if (d.supabaseTimesheetId) demoByKey.set(String(d.supabaseTimesheetId), d);
    if (d.id) demoByKey.set(String(d.id), d);
  }
  const missing = rows.filter(
    (t) => !demoByKey.has(String(t.id)) && !demoByKey.has(String(t.legacyId))
  );

  if (missing.length > 0) {
    const demoTimesheets = getTimesheets();
    for (const t of missing) {
      // fetchAssignment already returns the mapped assignment shape.
      const mappedAsg = t.assignmentSupabaseId
        ? await fetchAssignment(t.assignmentSupabaseId)
        : null;
      if (!mappedAsg) continue;
      const demoAssignmentId = ensureDemoAssignment(mappedAsg);
      if (!demoAssignmentId) continue;
      demoTimesheets.push({
        id: t.legacyId || crypto.randomUUID(),
        assignmentId: demoAssignmentId,
        weekEnding: t.weekEnding,
        entries: t.entries,
        totalHours: t.totalHours,
        status: t.status,
        clientApprovalStatus: t.clientApprovalStatus,
        payrollStatus: t.payrollStatus,
        approverNote: t.approverNote || null,
        exceptions: t.exceptions,
        compliance: t.compliance,
        submittedAt: t.submittedAt,
        approvedAt: t.approvedAt,
        payrollReadyAt: t.payrollReadyAt,
        clientDecidedAt: t.clientDecidedAt,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        supabaseTimesheetId: t.id,
      });
    }
    setTimesheets(demoTimesheets);
  }

  return rows;
}

/** Demo reset support: clear Supabase timesheets + timecards (re-synced after). */
export async function clearSupabaseTimesheets() {
  const { error: tsError } = await supabase.from('timesheets').delete().neq('id', 0);
  if (tsError) throw tsError;
  const { error: tcError } = await supabase.from('timecards').delete().neq('id', 0);
  if (tcError) throw tcError;
  return { timesheetsCleared: true, timecardsCleared: true };
}

// --- Invoices + payments (migration slice 5) --------------------------------

const INVOICE_SELECT =
  'id,invoice_number,issued_at,due_date,total,amount_paid,balance_due,status,' +
  'paid_at,line_items,legacy_id,created_at,updated_at,client_id,' +
  'clients(id,name,legacy_id)';

const PAYMENT_SELECT =
  'id,amount,method,received_date,memo,legacy_id,created_at,updated_at,' +
  'client_id,invoice_id,' +
  'clients(id,name,legacy_id),' +
  'invoices(id,invoice_number,legacy_id)';

function mapInvoice(inv) {
  const client = inv.clients || {};
  return {
    id: inv.id,
    clientId: client.legacy_id || null,
    clientName: client.name || '—',
    invoiceNumber: inv.invoice_number || '—',
    issuedAt: inv.issued_at || null,
    dueDate: inv.due_date || null,
    total: Number(inv.total) || 0,
    amountPaid: Number(inv.amount_paid) || 0,
    balanceDue: inv.balance_due == null ? (Number(inv.total) || 0) - (Number(inv.amount_paid) || 0) : Number(inv.balance_due),
    status: inv.status,
    paidAt: inv.paid_at || null,
    lineItems: Array.isArray(inv.line_items) ? inv.line_items : [],
    legacyId: inv.legacy_id || null,
    createdAt: inv.created_at || null,
    updatedAt: inv.updated_at || null,
  };
}

function mapPayment(p) {
  const client = p.clients || {};
  const inv = p.invoices || {};
  return {
    id: p.id,
    clientId: client.legacy_id || null,
    clientName: client.name || '—',
    invoiceId: inv.legacy_id || null,
    invoiceNumber: inv.invoice_number || '—',
    amount: Number(p.amount) || 0,
    method: p.method || '',
    receivedDate: p.received_date || null,
    memo: p.memo || '',
    legacyId: p.legacy_id || null,
    createdAt: p.created_at || null,
    updatedAt: p.updated_at || null,
  };
}

export async function fetchInvoices() {
  const { data, error } = await withRetry(() => supabase
    .from('invoices')
    .select(INVOICE_SELECT)
    .order('issued_at', { ascending: false }));
  throwChecked(error);
  return (data || []).map(mapInvoice);
}

export async function fetchInvoice(id) {
  // Route ids are demo ids (inv-001) most of the time; fall back to the
  // numeric Supabase id when the param is numeric.
  let query = supabase.from('invoices').select(INVOICE_SELECT).eq('legacy_id', String(id));
  let { data, error } = await withRetry(() => query.single());
  if ((error || !data) && /^\d+$/.test(String(id))) {
    ({ data, error } = await withRetry(() => supabase
      .from('invoices')
      .select(INVOICE_SELECT)
      .eq('id', Number(id))
      .single()));
  }
  throwChecked(error);
  return mapInvoice(data);
}

export async function fetchPaymentsForInvoice(invoiceSupabaseId) {
  const { data, error } = await withRetry(() => supabase
    .from('payments')
    .select(PAYMENT_SELECT)
    .eq('invoice_id', invoiceSupabaseId)
    .order('received_date', { ascending: true }));
  throwChecked(error);
  return (data || []).map(mapPayment);
}

async function resolveClientSupabaseId(demoClientId) {
  const { data } = await supabase
    .from('clients')
    .select('id')
    .eq('legacy_id', String(demoClientId))
    .limit(1);
  return data && data.length > 0 ? data[0].id : null;
}

async function resolveInvoiceSupabaseId(demoInvoiceId) {
  const demo = getInvoices().find((i) => i.id === demoInvoiceId);
  if (demo && demo.supabaseInvoiceId) return demo.supabaseInvoiceId;
  const { data } = await supabase
    .from('invoices')
    .select('id')
    .eq('legacy_id', String(demoInvoiceId))
    .limit(1);
  return data && data.length > 0 ? data[0].id : null;
}

function invoicePayload(demo, clientSupabaseId) {
  return {
    client_id: clientSupabaseId,
    invoice_number: demo.invoiceNumber,
    issued_at: demo.issuedAt || null,
    due_date: demo.dueDate || null,
    total: demo.total || 0,
    amount_paid: demo.amountPaid || 0,
    balance_due: demo.balanceDue ?? ((demo.total || 0) - (demo.amountPaid || 0)),
    status: demo.status || 'Draft',
    paid_at: demo.paidAt || null,
    line_items: demo.lineItems || [],
    legacy_id: String(demo.id),
    updated_at: demo.updatedAt || new Date().toISOString(),
  };
}

function stampDemoInvoice(demo, supabaseId) {
  const rows = getInvoices();
  const idx = rows.findIndex((i) => i.id === demo.id);
  if (idx === -1) return;
  rows[idx] = { ...rows[idx], supabaseInvoiceId: supabaseId };
  setInvoices(rows);
}

function applySupabaseInvoiceToDemo(row, demo) {
  const rows = getInvoices();
  const idx = rows.findIndex((i) => i.id === demo.id);
  if (idx === -1) return;
  const m = mapInvoice(row);
  rows[idx] = {
    ...rows[idx],
    clientId: m.clientId || rows[idx].clientId,
    clientName: m.clientName,
    invoiceNumber: m.invoiceNumber,
    issuedAt: m.issuedAt,
    dueDate: m.dueDate,
    total: m.total,
    amountPaid: m.amountPaid,
    balanceDue: m.balanceDue,
    status: m.status,
    paidAt: m.paidAt,
    lineItems: m.lineItems,
    updatedAt: m.updatedAt || rows[idx].updatedAt,
    supabaseInvoiceId: row.id,
  };
  setInvoices(rows);
}

/**
 * Sync one demo invoice row to Supabase. Never throws. Returns
 * 'demo' | 'supabase' | 'created' | 'skipped' | 'failed'.
 */
export async function syncInvoiceToSupabase(demo) {
  try {
    if (!demo || !demo.clientId || !demo.invoiceNumber) return 'skipped';
    const clientSupabaseId = await resolveClientSupabaseId(demo.clientId);
    if (!clientSupabaseId) return 'skipped';

    const { data: existing } = await supabase
      .from('invoices')
      .select(INVOICE_SELECT)
      .eq('legacy_id', String(demo.id))
      .limit(1);
    const row = existing && existing.length > 0 ? existing[0] : null;

    if (!row) {
      const { data: created, error } = await supabase
        .from('invoices')
        .insert([invoicePayload(demo, clientSupabaseId)])
        .select('id')
        .single();
      if (error || !created) return 'failed';
      stampDemoInvoice(demo, created.id);
      return 'created';
    }

    stampDemoInvoice(demo, row.id);
    const demoTime = Date.parse(demo.updatedAt || 0) || 0;
    const rowTime = Date.parse(row.updated_at || 0) || 0;
    if (demoTime >= rowTime) {
      const { error } = await supabase
        .from('invoices')
        .update(invoicePayload(demo, clientSupabaseId))
        .eq('id', row.id);
      if (error) return 'failed';
      return 'demo';
    }
    applySupabaseInvoiceToDemo(row, demo);
    return 'supabase';
  } catch (err) {
    if (import.meta.env.MODE !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[invoice sync] failed', err);
    }
    return 'failed';
  }
}

function paymentPayload(demo, clientSupabaseId, invoiceSupabaseId) {
  return {
    client_id: clientSupabaseId,
    invoice_id: invoiceSupabaseId,
    amount: demo.amount || 0,
    method: demo.method || null,
    received_date: demo.receivedDate || null,
    memo: demo.memo || null,
    legacy_id: String(demo.id),
    updated_at: demo.updatedAt || new Date().toISOString(),
  };
}

function stampDemoPayment(demo, supabaseId) {
  const rows = getPayments();
  const idx = rows.findIndex((p) => p.id === demo.id);
  if (idx === -1) return;
  rows[idx] = { ...rows[idx], supabasePaymentId: supabaseId };
  setPayments(rows);
}

/**
 * Sync one demo payment row to Supabase, then re-sync its parent invoice
 * (amountPaid/balanceDue/status are derived from payments). Never throws.
 */
export async function syncPaymentToSupabase(demo) {
  try {
    if (!demo || !demo.invoiceId || demo.amount == null) return 'skipped';
    const clientSupabaseId = await resolveClientSupabaseId(demo.clientId);
    const invoiceSupabaseId = await resolveInvoiceSupabaseId(demo.invoiceId);
    if (!clientSupabaseId || !invoiceSupabaseId) return 'skipped';

    const { data: existing } = await supabase
      .from('payments')
      .select(PAYMENT_SELECT)
      .eq('legacy_id', String(demo.id))
      .limit(1);
    const row = existing && existing.length > 0 ? existing[0] : null;

    let result;
    if (!row) {
      const { data: created, error } = await supabase
        .from('payments')
        .insert([paymentPayload(demo, clientSupabaseId, invoiceSupabaseId)])
        .select('id')
        .single();
      if (error || !created) return 'failed';
      stampDemoPayment(demo, created.id);
      result = 'created';
    } else {
      stampDemoPayment(demo, row.id);
      const demoTime = Date.parse(demo.updatedAt || 0) || 0;
      const rowTime = Date.parse(row.updated_at || 0) || 0;
      if (demoTime >= rowTime) {
        const { error } = await supabase
          .from('payments')
          .update(paymentPayload(demo, clientSupabaseId, invoiceSupabaseId))
          .eq('id', row.id);
        if (error) return 'failed';
        result = 'demo';
      } else {
        result = 'supabase';
      }
    }

    // The parent invoice's totals derive from its payments — sync it too.
    const parent = getInvoices().find((i) => i.id === demo.invoiceId);
    if (parent) await syncInvoiceToSupabase(parent);
    return result;
  } catch (err) {
    if (import.meta.env.MODE !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[payment sync] failed', err);
    }
    return 'failed';
  }
}

/**
 * Load-time reconcile for invoices + payments: push this browser's demo
 * rows up, and create demo twins for Supabase rows this browser has never
 * seen. Returns the fresh Supabase invoice list (mapped).
 */
export async function reconcileInvoices() {
  const demoInvoices = getInvoices();
  await Promise.all(demoInvoices.map((d) => syncInvoiceToSupabase(d)));
  const demoPayments = getPayments();
  await Promise.all(demoPayments.map((d) => syncPaymentToSupabase(d)));

  const rows = await fetchInvoices();
  const demoByKey = new Map();
  for (const d of getInvoices()) {
    if (d.supabaseInvoiceId) demoByKey.set(String(d.supabaseInvoiceId), d);
    if (d.id) demoByKey.set(String(d.id), d);
  }
  const missing = rows.filter(
    (inv) => !demoByKey.has(String(inv.id)) && !demoByKey.has(String(inv.legacyId))
  );

  if (missing.length > 0) {
    const demoRows = getInvoices();
    for (const inv of missing) {
      demoRows.push({
        id: inv.legacyId || `inv-${inv.id}`,
        clientId: inv.clientId,
        clientName: inv.clientName,
        invoiceNumber: inv.invoiceNumber,
        issuedAt: inv.issuedAt,
        dueDate: inv.dueDate,
        total: inv.total,
        amountPaid: inv.amountPaid,
        balanceDue: inv.balanceDue,
        status: inv.status,
        paidAt: inv.paidAt,
        lineItems: inv.lineItems,
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt,
        supabaseInvoiceId: inv.id,
      });
    }
    setInvoices(demoRows);

    // Twin the payments belonging to those invoices.
    const demoPayRows = getPayments();
    for (const inv of missing) {
      const payments = await fetchPaymentsForInvoice(inv.id);
      for (const p of payments) {
        if (demoPayRows.some((d) => String(d.id) === String(p.legacyId) || String(d.supabasePaymentId) === String(p.id))) continue;
        demoPayRows.push({
          id: p.legacyId || `pmt-${p.id}`,
          clientId: p.clientId,
          invoiceId: inv.legacyId || `inv-${inv.id}`,
          amount: p.amount,
          method: p.method,
          receivedDate: p.receivedDate,
          memo: p.memo,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          supabasePaymentId: p.id,
        });
      }
    }
    setPayments(demoPayRows);
  }

  return rows;
}

/** Demo reset support: clear Supabase payments + invoices (re-synced after). */
export async function clearSupabaseInvoices() {
  const { error: pmtError } = await supabase.from('payments').delete().neq('id', 0);
  if (pmtError) throw pmtError;
  const { error: invError } = await supabase.from('invoices').delete().neq('id', 0);
  if (invError) throw invError;
  return { paymentsCleared: true, invoicesCleared: true };
}
