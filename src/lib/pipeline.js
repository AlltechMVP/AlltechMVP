import { supabase } from '@/lib/supabase';
import {
  getCandidates, setCandidates, normalizeStatus,
  getAssignments, setAssignments, getJobs, setJobs, getClients,
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
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastError;
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
  if (error) throw error;
  return (data || []).map(mapJob);
}

export async function fetchPersons() {
  const { data, error } = await supabase
    .from('candidates')
    .select('id,name,email,phone,status,legacy_id')
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function fetchApplications({ jobId } = {}) {
  const { data, error } = await withRetry(async () => {
    let query = supabase.from('applications').select(APP_SELECT).order('updated_at', { ascending: false });
    if (jobId !== undefined && jobId !== null) query = query.eq('job_id', jobId);
    return query;
  });
  if (error) throw error;
  return (data || []).map(mapApplication);
}

export async function fetchApplication(id) {
  const { data, error } = await withRetry(() => supabase
    .from('applications')
    .select(APP_SELECT)
    .eq('id', id)
    .single());
  if (error) throw error;
  return mapApplication(data);
}

export async function fetchAppliedJobIds(email) {
  const normalized = (email || '').trim().toLowerCase();
  if (!normalized) return [];
  const { data: persons, error } = await withRetry(() => supabase
    .from('candidates')
    .select('id')
    .eq('email', normalized));
  if (error) throw error;
  if (!persons || persons.length === 0) return [];
  const { data: apps, error: appError } = await withRetry(() => supabase
    .from('applications')
    .select('job_id')
    .in('candidate_id', persons.map((p) => p.id)));
  if (appError) throw appError;
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
  if (error) throw error;
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
  if (appError) throw appError;
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
    if (error) throw error;
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
  if (error) throw error;
  return (data || []).map(mapAssignment);
}

export async function fetchAssignment(id) {
  const { data, error } = await withRetry(() => supabase
    .from('assignments')
    .select(ASSIGNMENT_SELECT)
    .eq('id', id)
    .single());
  if (error) throw error;
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
  if (error) throw error;
  return { assignmentsCleared: true };
}
