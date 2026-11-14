const KEYS = {
  candidates: 'alltech_candidates',
  jobs: 'alltech_jobs',
  assignments: 'alltech_assignments',
  timesheets: 'alltech_timesheets',
  payrollQueue: 'alltech_payroll_queue',
  payrollRuns: 'alltech_payroll_runs',
  clients: 'alltech_clients',
  contacts: 'alltech_contacts',
  activities: 'alltech_activities',
  followUps: 'alltech_follow_ups',
  invoices: 'alltech_invoices',
  payments: 'alltech_payments',
};

const DEMO_CLIENT_ID = 'client-001';

export function safeGet(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') || [];
  } catch {
    return [];
  }
}

export function safeSet(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function now() {
  return new Date().toISOString();
}

export function getCandidates() { return safeGet(KEYS.candidates); }
export function getJobs() { return safeGet(KEYS.jobs); }
export function getAssignments() { return safeGet(KEYS.assignments); }
export function getTimesheets() { return safeGet(KEYS.timesheets); }
export function getClients() { return safeGet(KEYS.clients); }

export function setCandidates(data) { safeSet(KEYS.candidates, data); }
export function setAssignments(data) { safeSet(KEYS.assignments, data); }
export function setTimesheets(data) { safeSet(KEYS.timesheets, data); }
export function setJobs(data) { safeSet(KEYS.jobs, data); }
export function setClients(data) { safeSet(KEYS.clients, data); }
export function getContacts() { return safeGet(KEYS.contacts); }
export function setContacts(data) { safeSet(KEYS.contacts, data); }
export function getActivities() { return safeGet(KEYS.activities); }
export function setActivities(data) { safeSet(KEYS.activities, data); }
export function getFollowUps() { return safeGet(KEYS.followUps); }
export function setFollowUps(data) { safeSet(KEYS.followUps, data); }

export function getInvoices() { return safeGet(KEYS.invoices); }
export function setInvoices(data) { safeSet(KEYS.invoices, data); }
export function getPayments() { return safeGet(KEYS.payments); }
export function setPayments(data) { safeSet(KEYS.payments, data); }

export function getInvoiceById(id) { return getInvoices().find(i => i.id === id); }

export function postPayment(payment) {
  const payments = getPayments();
  payments.push(payment);
  setPayments(payments);

  const invoices = getInvoices();
  const idx = invoices.findIndex(i => i.id === payment.invoiceId);
  if (idx !== -1) {
    const inv = invoices[idx];
    inv.amountPaid = (inv.amountPaid || 0) + payment.amount;
    inv.balanceDue = Math.max(0, (inv.total || 0) - inv.amountPaid);
    inv.updatedAt = now();
    if (inv.balanceDue === 0 && inv.status !== 'Void' && inv.status !== 'Draft') {
      inv.status = 'Paid';
      inv.paidAt = now();
    }
    invoices[idx] = inv;
    setInvoices(invoices);
  }
  return payment;
}

// Paid, uninvoiced timesheets that cannot be billed because no bill rate
// resolves for them (missing assignment/job/client, or no rate on the
// assignment or its job). Invoice generation skips these instead of
// silently creating $0 lines; the payroll queue surfaces them so the
// missing rate can be fixed.
export function getUnbillablePaidTimesheets() {
  const billable = getTimesheets().filter(
    (t) => t.payrollStatus === 'Paid' && !t.invoiceId && (t.totalHours || 0) > 0
  );
  const missing = [];
  billable.forEach((t) => {
    const assignment = getAssignmentById(t.assignmentId);
    const job = assignment ? getJobById(assignment.jobId) : null;
    const candidate = assignment ? getCandidateById(assignment.candidateId) : null;
    const label = `${candidate ? candidate.name : 'Candidate'} - ${job ? job.title : 'Unknown job'}`;
    if (!assignment || !job || !job.clientId) {
      missing.push({ timesheetId: t.id, label, reason: 'missing assignment, job, or client' });
      return;
    }
    const rate = assignment.billRate || job.rate || 0;
    if (!rate) {
      missing.push({ timesheetId: t.id, label, reason: 'no bill rate on the assignment or job' });
    }
  });
  return missing;
}

export function createInvoicesFromPaidTimesheets() {
  const today = new Date();
  const issuedAt = today.toISOString().slice(0, 10);
  const due = new Date(today.getTime() + 30 * 86400000);
  const dueDate = due.toISOString().slice(0, 10);
  const year = today.getFullYear();

  // Slice 1 (ATS/CRM milestone): unbillable timesheets are reported, not billed.
  const missingRates = getUnbillablePaidTimesheets();
  const missingIds = new Set(missingRates.map((m) => m.timesheetId));

  const billable = getTimesheets().filter(
    (t) => t.payrollStatus === 'Paid' && !t.invoiceId && (t.totalHours || 0) > 0 && !missingIds.has(t.id)
  );

  const byClient = {};
  billable.forEach((t) => {
    const assignment = getAssignmentById(t.assignmentId);
    const job = assignment ? getJobById(assignment.jobId) : null;
    if (!assignment || !job || !job.clientId) return;
    const candidate = getCandidateById(assignment.candidateId);
    const rate = assignment.billRate || job.rate || 0;
    const hours = t.totalHours || 0;
    const key = job.clientId;
    if (!byClient[key]) {
      byClient[key] = { clientId: job.clientId, clientName: job.client_name || job.clientName || '', items: [] };
    }
    byClient[key].items.push({
      timesheetId: t.id,
      description: `${candidate ? candidate.name : 'Candidate'} - ${job.title} (${hours}hrs @ $${rate})`,
      hours,
      rate,
      amount: hours * rate,
    });
  });

  const groups = Object.values(byClient).filter((g) => g.items.length > 0);
  if (groups.length === 0) {
    const none = [];
    none.missingRates = missingRates;
    return none;
  }

  const invoices = getInvoices();
  let maxNum = 0;
  invoices.forEach((inv) => {
    const m = String(inv.invoiceNumber || '').match(/(\d+)$/);
    if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
  });

  const created = [];
  const allTimesheets = getTimesheets();
  groups.forEach((g) => {
    maxNum += 1;
    const num = String(maxNum).padStart(3, '0');
    const total = g.items.reduce((sum, li) => sum + li.amount, 0);
    const invoice = {
      id: `inv-${num}`,
      clientId: g.clientId,
      clientName: g.clientName,
      invoiceNumber: `INV-${year}-${num}`,
      issuedAt,
      dueDate,
      total,
      amountPaid: 0,
      balanceDue: total,
      status: 'Draft',
      // Slice 1 (ATS/CRM milestone): keep timesheetId on each stored line
      // item so a draft line links back to its source timesheet.
      lineItems: g.items.map(({ timesheetId, description, hours, rate, amount }) => ({ timesheetId, description, hours, rate, amount })),
      createdAt: now(),
      updatedAt: now(),
    };
    invoices.push(invoice);
    created.push(invoice);
    g.items.forEach((li) => {
      const idx = allTimesheets.findIndex((t) => t.id === li.timesheetId);
      if (idx !== -1) allTimesheets[idx].invoiceId = invoice.id;
    });
  });

  setInvoices(invoices);
  setTimesheets(allTimesheets);
  created.missingRates = missingRates;
  return created;
}

export function getPaymentsForInvoice(invoiceId) {
  return getPayments().filter(p => p.invoiceId === invoiceId);
}

export function reconcileInvoicePayments() {
  const invoices = getInvoices();
  const payments = getPayments();
  let changed = false;

  invoices.forEach(inv => {
    if (inv.status === 'Void') return;
    const invPayments = payments.filter(p => p.invoiceId === inv.id);
    const totalPaid = invPayments.reduce((s, p) => s + (p.amount || 0), 0);
    const total = inv.total || 0;
    const balanceDue = Math.max(0, total - totalPaid);

    if (inv.amountPaid !== totalPaid || inv.balanceDue !== balanceDue) {
      inv.amountPaid = totalPaid;
      inv.balanceDue = balanceDue;
      changed = true;
    }

    if (balanceDue === 0 && totalPaid > 0 && inv.status === 'Sent') {
      inv.status = 'Paid';
      inv.paidAt = inv.paidAt || now();
      changed = true;
    }
    if (balanceDue > 0 && inv.status === 'Paid') {
      inv.status = 'Sent';
      inv.paidAt = null;
      changed = true;
    }
  });

  if (changed) setInvoices(invoices);
}

export function getDemoClientId() { return DEMO_CLIENT_ID; }
export function getClientById(id) { return getClients().find(c => c.id === id); }
export function getContactById(id) { return getContacts().find(c => c.id === id); }
export function getContactsForClient(clientId) { return getContacts().filter(c => c.clientId === clientId); }
export function getActivitiesForClient(clientId) { return getActivities().filter(a => a.clientId === clientId); }
export function getFollowUpsForClient(clientId) { return getFollowUps().filter(f => f.clientId === clientId); }

export function getJobsForClient(clientId) {
  return getJobs().filter(j => j.clientId === clientId);
}

export function getSubmittedCandidatesForJob(jobId) {
  const candidates = getCandidates();
  return candidates.filter(c => {
    if (c.submittedJobId !== jobId) return false;
    const status = normalizeStatus(c.status);
    if (['Submitted', 'Interview'].includes(status)) return true;
    if (c.clientDecision) return true;
    return false;
  });
}

export function hasAppliedToJob(jobId, email) {
  if (!jobId || !email) return false;
  const normalized = email.trim().toLowerCase();
  return getCandidates().some(
    (c) => String(c.submittedJobId) === String(jobId) && (c.email || '').trim().toLowerCase() === normalized
  );
}

// ATS/CRM milestone (slice 6): one candidate profile, one recruiting
// record per order.
//
// The demo store's `candidates` rows are per-(person, job) APPLICATION
// mirrors: each row carries the recruiting stage for one order
// (`submittedJobId` + `status`). That is deliberate — every stage write
// (changeCandidateStatus) keys off the row's job, so collapsing the demo
// store to one row per email would make a stage change on one order
// overwrite the stage on another order. The PERSON registry is the
// shared store: `findOrCreatePerson` in pipeline.js finds-or-creates the
// Supabase `candidates` row by email, so one email stays one person with
// one `applications` row per order. The helpers below keep the demo side
// consistent with that: identity is found-or-created by email, and each
// submission creates only the per-order application mirror.

// First demo row for an email (the person anchor for that email).
export function findCandidateByEmail(email) {
  const normalized = (email || '').trim().toLowerCase();
  if (!normalized) return null;
  return getCandidates().find((c) => (c.email || '').trim().toLowerCase() === normalized) || null;
}

// Quick Add Candidate: create a candidate RECORD only — no application,
// no login access (login access is provisioned separately, never by
// Quick Add). Find-or-create by email: if a person with this email
// already exists, return the existing row instead of creating a duplicate.
export function createCandidate({ name, email, phone } = {}) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail || !(name || '').trim()) return null;
  const existing = findCandidateByEmail(normalizedEmail);
  if (existing) return { candidate: existing, alreadyExists: true };
  const timestamp = now();
  const candidate = {
    id: uid(),
    name: name.trim(),
    email: normalizedEmail,
    phone: (phone || '').trim(),
    status: 'Applied',
    submittedJobId: null,
    statusHistory: [{ at: timestamp, from: 'New', to: 'Applied', by: normalizedEmail, note: 'Candidate record created' }],
    lastActionAt: timestamp,
  };
  setCandidates([...getCandidates(), candidate]);
  queuePersonSync(candidate);
  return { candidate, alreadyExists: false };
}

// Submit an EXISTING candidate (demo person row) to an order. Creates the
// per-order application mirror for (person, job) with its own stage;
// returns the existing mirror when the candidate is already on this order.
export function submitCandidateToJob(candidateId, jobId, by) {
  if (!candidateId || !jobId) return null;
  const rows = getCandidates();
  const person = rows.find((c) => c.id === candidateId);
  if (!person) return null;
  const normalizedEmail = (person.email || '').trim().toLowerCase();
  const existing = rows.find(
    (c) => String(c.submittedJobId) === String(jobId) && (c.email || '').trim().toLowerCase() === normalizedEmail
  );
  if (existing) return { candidate: existing, alreadySubmitted: true };
  const timestamp = now();
  const candidate = {
    id: uid(),
    name: person.name,
    email: normalizedEmail,
    phone: person.phone || '',
    status: 'Applied',
    submittedJobId: jobId,
    statusHistory: [{ at: timestamp, from: 'New', to: 'Applied', by: by || 'recruiter', note: 'Submitted by recruiter' }],
    lastActionAt: timestamp,
  };
  setCandidates([...rows, candidate]);
  queueSync(candidate);
  return { candidate, alreadySubmitted: false };
}

// ATS/CRM milestone: a candidate may hold more than one Active assignment
// — unrelated assignments are preserved, never auto-ended. Callers use
// this to WARN (not block) when placing a candidate who already has an
// Active assignment. Matched by email, since one person can have several
// demo rows (one per order).
export function getActiveAssignmentsForPerson(email, excludeAssignmentId) {
  const normalized = (email || '').trim().toLowerCase();
  if (!normalized) return [];
  const ids = new Set(
    getCandidates()
      .filter((c) => (c.email || '').trim().toLowerCase() === normalized)
      .map((c) => c.id)
  );
  return getAssignments().filter(
    (a) => ids.has(a.candidateId) && a.status === 'Active' && a.id !== excludeAssignmentId
  );
}

// TEMPORARY (migration slice 1): mirror demo pipeline writes to Supabase so
// the shared pipeline stays current. Fire-and-forget; the demo write never
// waits on it and never fails because of it. Dynamic import avoids a
// dependency cycle (pipeline.js imports helpers from this file). Delete when
// the write paths move to Supabase.
function queueSync(demoCandidate) {
  if (!demoCandidate) return;
  import('@/lib/pipeline.js')
    .then((m) => m.syncCandidateToSupabase(demoCandidate))
    .catch(() => {});
}

// ATS/CRM milestone (slice 6): same pattern for a candidate RECORD with no
// application yet (Quick Add). Ensures the person exists in the shared
// store so other sessions can find them before they are submitted to an
// order. Never throws; the demo write never waits on it.
function queuePersonSync(demoCandidate) {
  if (!demoCandidate) return;
  import('@/lib/pipeline.js')
    .then((m) => m.syncPersonToSupabase(demoCandidate))
    .catch(() => {});
}

// Slice 7: same pattern for client timesheet decisions — mirror the
// decided demo timesheet row to Supabase (fire-and-forget, never throws).
function queueTimesheetSync(demoTimesheet) {
  if (!demoTimesheet) return;
  import('@/lib/pipeline.js')
    .then((m) => m.syncTimesheetToSupabase(demoTimesheet))
    .catch(() => {});
}

// ATS/CRM milestone (slice 5): same fire-and-forget write-through pattern
// for the CRM collections. Dynamic import avoids a dependency cycle.
function queueClientSync(demoClient) {
  if (!demoClient) return;
  import('@/lib/pipeline.js')
    .then((m) => m.syncClientToSupabase(demoClient))
    .catch(() => {});
}

function queueContactSync(demoContact) {
  if (!demoContact) return;
  import('@/lib/pipeline.js')
    .then((m) => m.syncContactToSupabase(demoContact))
    .catch(() => {});
}

function queueActivitySync(demoActivity) {
  if (!demoActivity) return;
  import('@/lib/pipeline.js')
    .then((m) => m.syncActivityToSupabase(demoActivity))
    .catch(() => {});
}

function queueFollowUpSync(demoFollowUp) {
  if (!demoFollowUp) return;
  import('@/lib/pipeline.js')
    .then((m) => m.syncFollowUpToSupabase(demoFollowUp))
    .catch(() => {});
}

function queueJobSync(demoJob) {
  if (!demoJob) return;
  import('@/lib/pipeline.js')
    .then((m) => m.syncJobToSupabase(demoJob))
    .catch(() => {});
}

// --- CRM writes (ATS/CRM milestone, slice 5) ------------------------------
// Demo store is the canonical write path; each write queues a Supabase
// sync (fire-and-forget) so the record is shared with other sessions.

export function createCompany({ name, industry, location, contactName, contactEmail, contactPhone, status } = {}) {
  const timestamp = now();
  const client = {
    id: uid(),
    name: (name || '').trim(),
    industry: (industry || '').trim(),
    location: (location || '').trim(),
    contactPerson: (contactName || '').trim(),
    contactEmail: (contactEmail || '').trim().toLowerCase(),
    status: status || 'Prospect',
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  setClients([...getClients(), client]);
  queueClientSync(client);
  let contact = null;
  if ((contactName || '').trim() || (contactEmail || '').trim()) {
    contact = {
      id: uid(),
      clientId: client.id,
      name: (contactName || '').trim() || (contactEmail || '').trim(),
      email: (contactEmail || '').trim().toLowerCase(),
      phone: (contactPhone || '').trim(),
      title: '',
      isPrimary: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setContacts([...getContacts(), contact]);
    queueContactSync(contact);
  }
  return { client, contact };
}

export function addCompanyContact({ clientId, name, email, phone, title, isPrimary } = {}) {
  const timestamp = now();
  const contact = {
    id: uid(),
    clientId,
    name: (name || '').trim(),
    email: (email || '').trim().toLowerCase(),
    phone: (phone || '').trim(),
    title: (title || '').trim(),
    isPrimary: Boolean(isPrimary),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  setContacts([...getContacts(), contact]);
  queueContactSync(contact);
  return contact;
}

export function logCompanyActivity({ clientId, contactId, type, subject, body, by } = {}) {
  const timestamp = now();
  const activity = {
    id: uid(),
    clientId,
    contactId: contactId || null,
    type: type || 'note',
    subject: (subject || '').trim(),
    body: (body || '').trim(),
    createdBy: by || '',
    createdAt: timestamp,
  };
  setActivities([...getActivities(), activity]);
  queueActivitySync(activity);
  return activity;
}

export function scheduleFollowUp({ clientId, contactId, activityId, title, dueDate, ownerEmail } = {}) {
  const timestamp = now();
  const followUp = {
    id: uid(),
    clientId,
    contactId: contactId || null,
    activityId: activityId || null,
    title: (title || '').trim(),
    dueDate: dueDate || null,
    ownerEmail: (ownerEmail || '').trim().toLowerCase(),
    done: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  setFollowUps([...getFollowUps(), followUp]);
  queueFollowUpSync(followUp);
  return followUp;
}

export function setFollowUpDone(id, done) {
  const rows = getFollowUps();
  const idx = rows.findIndex((f) => f.id === id);
  if (idx === -1) return null;
  rows[idx] = { ...rows[idx], done: Boolean(done), updatedAt: now() };
  setFollowUps(rows);
  queueFollowUpSync(rows[idx]);
  return rows[idx];
}

// Convert a prospect to a client: same company record, same contacts and
// history — only the status flips, and the conversion is logged as an
// activity on that same record.
export function convertCompanyToClient(clientId, by) {
  const clients = getClients();
  const idx = clients.findIndex((c) => c.id === clientId);
  if (idx === -1) return null;
  const timestamp = now();
  clients[idx] = { ...clients[idx], status: 'Active', updatedAt: timestamp };
  setClients(clients);
  queueClientSync(clients[idx]);
  const activity = logCompanyActivity({
    clientId,
    type: 'note',
    subject: 'Converted to client',
    body: `Prospect converted to Active client${by ? ` by ${by}` : ''}.`,
    by,
  });
  return { client: clients[idx], activity };
}

export function applyToJob(jobId, { name, email, phone } = {}, by) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!jobId || !normalizedEmail || !(name || '').trim()) return null;
  // Duplicate for THIS job?
  const existing = getCandidates().find(
    (c) => String(c.submittedJobId) === String(jobId) && (c.email || '').trim().toLowerCase() === normalizedEmail
  );
  if (existing) return { candidate: existing, alreadyApplied: true };
  // Find-or-create the PERSON by email: reuse the existing person's
  // identity (phone) instead of creating a second person. The new demo
  // row is the per-order application mirror for (person, job); the shared
  // store keeps one person row per email (findOrCreatePerson in
  // pipeline.js) with one application row per order.
  const person = findCandidateByEmail(normalizedEmail);
  const timestamp = now();
  const candidate = {
    id: uid(),
    name: name.trim(),
    email: normalizedEmail,
    phone: (phone || '').trim() || (person?.phone || ''),
    status: 'Applied',
    submittedJobId: jobId,
    statusHistory: [{ at: timestamp, from: 'New', to: 'Applied', by: by || normalizedEmail, note: 'Applied' }],
    lastActionAt: timestamp,
  };
  setCandidates([...getCandidates(), candidate]);
  queueSync(candidate);
  return { candidate, alreadyApplied: false };
}

export function clientDecideCandidate(candidateId, decision, { note } = {}) {
  const candidates = getCandidates();
  const idx = candidates.findIndex(c => c.id === candidateId);
  if (idx === -1) return null;
  const c = candidates[idx];
  const timestamp = now();

  c.clientDecision = decision;
  c.clientDecisionNote = note || '';
  c.clientDecidedAt = timestamp;

  if (decision === 'Approved') {
    const fromStatus = normalizeStatus(c.status);
    c.status = 'Hired';
    c.lastActionAt = timestamp;
    c.statusHistory = c.statusHistory || [];
    c.statusHistory.push({ at: timestamp, from: fromStatus, to: 'Hired', by: 'client', note: 'Client approved' });
  } else if (decision === 'Rejected') {
    const fromStatus = normalizeStatus(c.status);
    c.status = 'Rejected';
    c.rejectedReason = note || 'Rejected by client';
    c.lastActionAt = timestamp;
    c.statusHistory = c.statusHistory || [];
    c.statusHistory.push({ at: timestamp, from: fromStatus, to: 'Rejected', by: 'client', note: note || 'Rejected by client' });
  }

  setCandidates(candidates);
  queueSync(candidates[idx]);
  return decision;
}

export function clientDecideTimesheet(timesheetId, decision, { note } = {}) {
  const timesheets = getTimesheets();
  const idx = timesheets.findIndex(t => t.id === timesheetId);
  if (idx === -1) return null;
  const t = timesheets[idx];
  const timestamp = now();

  t.clientApprovalStatus = decision;
  t.clientDecisionNote = note || '';
  // Slice 7: also mirror the note into approverNote — timesheetPayload
  // syncs approver_note from approverNote, so the reason reaches Supabase.
  t.approverNote = note || '';
  t.clientDecidedAt = timestamp;

  if (decision === 'Approved') {
    t.status = 'Approved';
    t.approvedAt = timestamp;
    applyTimesheetCompliance(t);
  } else if (decision === 'Rejected') {
    t.status = 'Rejected';
    t.rejectionNote = note || 'Rejected by client';
    if (t.payrollStatus !== 'In Payroll' && t.payrollStatus !== 'Paid') {
      t.payrollStatus = 'Not Ready';
    }
  }

  setTimesheets(timesheets);
  queueTimesheetSync(timesheets[idx]);
  return decision;
}

export function getTimesheetsForClient(clientId) {
  const timesheets = getTimesheets();
  const assignments = getAssignments();
  const jobs = getJobs();
  const clientJobIds = jobs.filter(j => j.clientId === clientId).map(j => j.id);
  return timesheets.filter(t => {
    const assignment = assignments.find(a => a.id === t.assignmentId);
    return assignment && clientJobIds.includes(assignment.jobId);
  });
}

export function getCandidateById(id) { return getCandidates().find(c => c.id === id); }
export function getJobById(id) { return getJobs().find(j => j.id === id); }
export function getAssignmentById(id) { return getAssignments().find(a => a.id === id); }
export function getTimesheetById(id) { return getTimesheets().find(t => t.id === id); }

const SEED_CANDIDATES = [
  { id: 'cand-001', name: 'Sarah Chen', email: 'sarah.chen@email.com', phone: '555-0101', status: 'Applied', submittedJobId: 'job-001' },
  { id: 'cand-002', name: 'Marcus Johnson', email: 'mjohnson@email.com', phone: '555-0102', status: 'Applied', submittedJobId: 'job-001' },
  { id: 'cand-003', name: 'Emily Rodriguez', email: 'erodriguez@email.com', phone: '555-0103', status: 'Applied', submittedJobId: 'job-002' },
  { id: 'cand-004', name: 'David Kim', email: 'dkim@email.com', phone: '555-0104', status: 'Applied', submittedJobId: 'job-003' },
  { id: 'cand-005', name: 'Ashley Thompson', email: 'athompson@email.com', phone: '555-0105', status: 'Applied', submittedJobId: 'job-004' },
];

const SEED_JOBS = [
  { id: 'job-001', title: 'Senior React Developer', client_name: 'Acme Corp', location: 'Remote', rate: 85, openings: 2, status: 'Open' },
  { id: 'job-002', title: 'DevOps Engineer', client_name: 'TechStart Inc', location: 'Austin, TX', rate: 95, openings: 1, status: 'Open' },
  { id: 'job-003', title: 'QA Analyst', client_name: 'DataFlow LLC', location: 'Chicago, IL', rate: 55, openings: 3, status: 'Open' },
  { id: 'job-004', title: 'Project Manager', client_name: 'Acme Corp', location: 'New York, NY', rate: 75, openings: 1, status: 'Open' },
];

export function seedIfMissing() {
  const hasCandidates = getCandidates().length > 0;
  const hasJobs = getJobs().length > 0;
  if (!hasCandidates && !hasJobs) {
    seedDemoData();
    return;
  }
  if (!hasCandidates) {
    safeSet(KEYS.candidates, SEED_CANDIDATES);
  }
  if (!hasJobs) {
    safeSet(KEYS.jobs, SEED_JOBS);
  }
  if (!localStorage.getItem(KEYS.assignments)) {
    safeSet(KEYS.assignments, []);
  }
  if (!localStorage.getItem(KEYS.timesheets)) {
    safeSet(KEYS.timesheets, []);
  }
  if (!localStorage.getItem(KEYS.invoices)) {
    safeSet(KEYS.invoices, []);
  }
  if (!localStorage.getItem(KEYS.payments)) {
    safeSet(KEYS.payments, []);
  }
}

export const CANONICAL_STATUSES = [
  'Applied', 'Reviewed', 'Submitted', 'Interview', 'Hired', 'Rejected',
  'Assigned', 'Active Assignment', 'Assignment Ended'
];

const STATUS_ALIASES = {
  'Active': 'Applied',
  'New': 'Applied',
  'Screening': 'Reviewed',
  'Offer': 'Hired',
  'Placed': 'Hired',
};

export function normalizeStatus(status) {
  if (!status) return 'Applied';
  if (CANONICAL_STATUSES.includes(status)) return status;
  return STATUS_ALIASES[status] || status;
}

const PIPELINE_TRANSITIONS = {
  'Applied':    ['Reviewed', 'Rejected'],
  'Reviewed':   ['Submitted', 'Rejected'],
  'Submitted':  ['Interview', 'Hired', 'Rejected'],
  'Interview':  ['Hired', 'Rejected'],
  'Hired':      ['Rejected'],
  'Rejected':   ['Reviewed'],
};

const TERMINAL_STATUSES = ['Active Assignment', 'Assignment Ended'];

export function getAllowedTransitions(status) {
  const norm = normalizeStatus(status);
  if (TERMINAL_STATUSES.includes(norm)) return [];
  return PIPELINE_TRANSITIONS[norm] || [];
}

// The recruiting stage a candidate reached on an order before an assignment
// took over the displayed status. The stage field does double duty: it is
// the pipeline stage until placement, then the assignment state — and the
// placement flip writes no history entry, so the last history entry is
// still the recruiting stage the candidate reached (usually Hired).
// Returns the row's own stage when it is already a recruiting stage, the
// last recorded recruiting stage when the row shows an assignment state,
// or null when no recruiting stage is on record. Accepts both the demo
// store's `statusHistory` and the shared store's `history`.
const RECRUITING_STAGES = ['Applied', 'Reviewed', 'Submitted', 'Interview', 'Hired', 'Rejected'];
const ASSIGNMENT_STATUSES = ['Assigned', 'Active Assignment', 'Assignment Ended'];

export function getRecruitingStage(row) {
  if (!row) return null;
  const status = normalizeStatus(row.status);
  if (RECRUITING_STAGES.includes(status)) return status;
  if (!ASSIGNMENT_STATUSES.includes(status)) return null;
  const history = row.statusHistory || row.history || [];
  for (let i = history.length - 1; i >= 0; i--) {
    const to = normalizeStatus(history[i] && history[i].to);
    if (RECRUITING_STAGES.includes(to)) return to;
  }
  return null;
}

// Employee flag (top-10 #6, approved 2026-11-14): a DERIVED flag, not a
// new stage value. A person counts as an employee when they hold an Active
// assignment whose start date has been reached — the same "started"
// predicate the weekly timecard auto-creation uses. Computed from the
// demo store (the canonical write path); no migration, no sync change,
// nothing in the stage machine changes. `candidateId` is the demo person
// id (what the list pages carry as demoCandidateId).
export function isEmployee(candidateId, assignments = getAssignments()) {
  if (!candidateId) return false;
  const today = new Date().toISOString().slice(0, 10);
  return (assignments || []).some(
    (a) => String(a.candidateId) === String(candidateId)
      && a.status === 'Active'
      && a.startDate && a.startDate <= today
  );
}

// Portal phase (onboarding milestone Slice 1): Applicant → Onboarding
// (holds an Active assignment that hasn't started yet) → Active Employee
// (the #6 derived flag). No person record resolves to Applicant.
export function getPortalPhase(candidateId, assignments = getAssignments()) {
  if (!candidateId) return 'Applicant';
  if (isEmployee(candidateId, assignments)) return 'Active Employee';
  const mine = (assignments || []).some(
    (a) => String(a.candidateId) === String(candidateId) && a.status === 'Active'
  );
  return mine ? 'Onboarding' : 'Applicant';
}

export function changeCandidateStatus(candidateId, newStatus, { note, by } = {}) {
  const candidates = getCandidates();
  const idx = candidates.findIndex(c => c.id === candidateId);
  if (idx === -1) return null;
  const c = candidates[idx];
  const fromStatus = normalizeStatus(c.status);

  if (TERMINAL_STATUSES.includes(fromStatus)) return null;

  const allowed = getAllowedTransitions(fromStatus);
  if (!allowed.includes(newStatus)) return null;

  const timestamp = now();
  const historyEntry = { at: timestamp, from: fromStatus, to: newStatus, by: by || 'recruiter' };
  if (note) historyEntry.note = note;

  c.status = newStatus;
  c.lastActionAt = timestamp;
  c.statusHistory = c.statusHistory || [];
  c.statusHistory.push(historyEntry);

  if (newStatus === 'Rejected') {
    c.rejectedReason = note || '';
  }
  if (newStatus === 'Submitted') {
    c.submittedAt = timestamp;
  }
  if (newStatus === 'Reviewed' && fromStatus === 'Rejected') {
    c.rejectedReason = null;
  }

  setCandidates(candidates);
  queueSync(candidates[idx]);
  return newStatus;
}

export function reconcileCandidatePipelineState() {
  const candidates = getCandidates();
  const assignments = getAssignments();
  let changed = false;

  candidates.forEach(c => {
    const hasActive = assignments.some(a => a.candidateId === c.id && a.status === 'Active');
    if (hasActive && c.status !== 'Active Assignment') {
      c.status = 'Active Assignment';
      changed = true;
    }

    const norm = normalizeStatus(c.status);
    if (norm !== c.status) {
      c.status = norm;
      changed = true;
    }
  });

  if (changed) setCandidates(candidates);
}

export function getPayrollQueue() { return safeGet(KEYS.payrollQueue); }
export function setPayrollQueue(data) { safeSet(KEYS.payrollQueue, data); }

export function runTimesheetCompliance(ts) {
  const exceptions = [];
  const compliance = { mealBreakMissing: false, overtimeFlag: false, missingDays: false };
  const entries = ts.entries || [];

  if (!ts.weekEnding) {
    exceptions.push({ msg: 'Week ending date is missing or invalid', blocking: true });
  }

  if (!ts.assignmentId) {
    exceptions.push({ msg: 'No assignment linked', blocking: true });
  }

  const allZero = entries.length > 0 && entries.every(e => (Number(e.hours) || 0) === 0);
  if (allZero) {
    compliance.missingDays = true;
    exceptions.push({ msg: 'No hours entered for any day', blocking: true });
  }

  const hasInvalid = entries.some(e => {
    const h = Number(e.hours);
    return isNaN(h) || h < 0 || h > 24;
  });
  if (hasInvalid) {
    exceptions.push({ msg: 'One or more days have invalid hours (must be 0-24)', blocking: true });
  }

  const total = entries.reduce((s, e) => s + (Number(e.hours) || 0), 0);
  if (total > 40) {
    compliance.overtimeFlag = true;
    exceptions.push({ msg: `Overtime: ${total} hours exceeds 40-hour threshold`, blocking: false });
  }

  const longDays = entries.filter(e => (Number(e.hours) || 0) >= 6);
  if (longDays.length > 0) {
    compliance.mealBreakMissing = true;
    exceptions.push({ msg: `Possible meal break exception on ${longDays.length} day(s) with 6+ hours (demo)`, blocking: false });
  }

  return { exceptions, compliance };
}

export function computePayrollStatus(ts) {
  if (ts.status !== 'Approved') return 'Not Ready';
  const total = (ts.entries || []).reduce((s, e) => s + (Number(e.hours) || 0), 0);
  if (total <= 0) return 'Not Ready';
  const { exceptions } = runTimesheetCompliance(ts);
  const hasBlocking = exceptions.some(e => e.blocking);
  if (hasBlocking) return 'Not Ready';
  return 'Ready';
}

export function applyTimesheetCompliance(ts) {
  const { exceptions, compliance } = runTimesheetCompliance(ts);
  ts.exceptions = exceptions;
  ts.compliance = compliance;
  // A timesheet that has been submitted (or internally approved) goes to
  // the client for approval. The client's Pending queue filters on
  // clientApprovalStatus === 'Submitted', so a row left at
  // 'Not Submitted' can never be approved — previously nothing in the app
  // ever made this transition (only the hand-written seed had 'Submitted'
  // rows), which made the client time-approval step unreachable for any
  // freshly-created timesheet. Never overwrites a real client decision
  // (Approved/Rejected).
  if ((ts.status === 'Submitted' || ts.status === 'Approved')
      && (!ts.clientApprovalStatus || ts.clientApprovalStatus === 'Not Submitted')) {
    ts.clientApprovalStatus = 'Submitted';
    if (!ts.submittedAt) ts.submittedAt = now();
  }
  if (ts.status === 'Approved') {
    const newPayrollStatus = computePayrollStatus(ts);
    if (ts.payrollStatus !== 'In Payroll' && ts.payrollStatus !== 'Paid') {
      ts.payrollStatus = newPayrollStatus;
      if (newPayrollStatus === 'Ready' && !ts.payrollReadyAt) {
        ts.payrollReadyAt = now();
      }
    }
  } else if (ts.status === 'Rejected' || ts.status === 'Draft') {
    if (ts.payrollStatus !== 'In Payroll' && ts.payrollStatus !== 'Paid') {
      ts.payrollStatus = 'Not Ready';
    }
  }
  if (!ts.payrollStatus) ts.payrollStatus = 'Not Ready';
  return ts;
}

export function reconcileTimesheetsPayrollState() {
  const timesheets = getTimesheets();
  let changed = false;
  timesheets.forEach(ts => {
    const prevPayroll = ts.payrollStatus;
    const prevExLen = (ts.exceptions || []).length;
    applyTimesheetCompliance(ts);
    if (ts.payrollStatus !== prevPayroll || (ts.exceptions || []).length !== prevExLen) {
      changed = true;
    }
  });
  if (changed) {
    setTimesheets(timesheets);
  }
}

export function syncCandidateFromAssignment(assignment) {
  if (!assignment) return null;
  const candidates = getCandidates();
  const assignments = getAssignments();
  const timestamp = now();
  const idx = candidates.findIndex(c => c.id === assignment.candidateId);
  if (idx === -1) return null;
  const fromStatus = normalizeStatus(candidates[idx].status);

  let statusMsg = null;

  if (assignment.status === 'Active') {
    // ATS/CRM milestone: preserve unrelated Active assignments. Creating
    // a new Active assignment NO LONGER ends the candidate's other Active
    // assignments (the old blanket auto-end is removed). Callers warn
    // when the candidate already has an Active assignment instead —
    // see getActiveAssignmentsForPerson() — but never block or end.
    candidates[idx].status = 'Active Assignment';
    candidates[idx].activeAssignmentId = assignment.id;
    candidates[idx].currentJobId = assignment.jobId;
    statusMsg = 'Active Assignment';
  } else if (assignment.status === 'On Hold') {
    const otherActive = assignments.find(
      a => a.id !== assignment.id && a.candidateId === assignment.candidateId && a.status === 'Active'
    );
    if (!otherActive) {
      candidates[idx].status = 'Assigned';
      candidates[idx].activeAssignmentId = assignment.id;
      candidates[idx].currentJobId = assignment.jobId;
      statusMsg = 'Assigned';
    }
  } else if (assignment.status === 'Ended') {
    const otherActive = assignments.find(
      a => a.id !== assignment.id && a.candidateId === assignment.candidateId && a.status === 'Active'
    );
    if (otherActive) {
      candidates[idx].status = 'Active Assignment';
      candidates[idx].activeAssignmentId = otherActive.id;
      candidates[idx].currentJobId = otherActive.jobId;
      statusMsg = 'Active Assignment';
    } else {
      const otherOnHold = assignments.find(
        a => a.id !== assignment.id && a.candidateId === assignment.candidateId && a.status === 'On Hold'
      );
      if (otherOnHold) {
        candidates[idx].status = 'Assigned';
        candidates[idx].activeAssignmentId = otherOnHold.id;
        candidates[idx].currentJobId = otherOnHold.jobId;
        statusMsg = 'Assigned';
      } else {
        candidates[idx].status = 'Assignment Ended';
        candidates[idx].activeAssignmentId = null;
        candidates[idx].currentJobId = null;
        statusMsg = 'Assignment Ended';
      }
    }
  }

  if (statusMsg) {
    const c = candidates[idx];
    // Stamp the change so the Supabase sync treats this assignment flip as
    // the newest write (timestamp last-write-wins). Without a timestamp the
    // older Supabase status would win on sync and undo the flip.
    c.lastActionAt = timestamp;
    if (normalizeStatus(c.status) !== fromStatus) {
      c.statusHistory = c.statusHistory || [];
      c.statusHistory.push({
        at: timestamp, from: fromStatus, to: normalizeStatus(c.status),
        by: 'system', note: 'Assignment ' + assignment.status,
      });
    }
    setCandidates(candidates);
    queueSync(c);
  }

  return statusMsg;
}

const SEED_VERSION = 'internal-mvp-v4';
const SEED_VERSION_KEY = 'alltech_seed_version';

export function getSeedVersion() {
  return localStorage.getItem(SEED_VERSION_KEY);
}

export function getExpectedSeedVersion() {
  return SEED_VERSION;
}

export function clearAlltechKeys() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('alltech_')) keysToRemove.push(k);
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}

function daysAgo(n) {
  // UTC throughout: the old version mixed local getDate() with a UTC
  // output (toISOString), so a seed run in the evening landed a day later
  // than a daytime run, and the two stores could disagree by a day.
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

function weeksAgoFriday(n) {
  // Friday of the week n weeks ago, computed in UTC so the result is the
  // same no matter the browser's timezone or the time of day. (The old
  // version mixed local getDay()/getDate() with a UTC output, so an evening
  // seed could land the "Friday" week ending on a Saturday.)
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - (n * 7) - ((d.getUTCDay() + 2) % 7));
  return d.toISOString().slice(0, 10);
}

// Friday ending the Mon–Sun week containing today — the week-ending
// date the auto-created timecards and the candidate time-entry form both
// default to. (The candidate form used to compute this from local getters
// + a UTC output, which returned tomorrow's date after 18:00 CST — the
// same class of bug the seed helpers above had.)
export function fridayOfCurrentWeek(date = new Date()) {
  // Local getters + local formatting (never toISOString): the candidate
  // form used to mix local getters with a UTC output, which returned
  // tomorrow's date after 18:00 CST. Offset is Friday's position (4) in
  // the Mon-first week minus today's position — so Mon–Thu move forward
  // to this Friday and Sat/Sun move back to the Friday just passed.
  // (The seed helpers stay UTC: a seed must reproduce identically in any
  // timezone. A live default is about the user's own week, so local is
  // correct here.)
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + (4 - ((d.getDay() + 6) % 7)));
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function seedDemoData() {
  const ts = now();

  const demoCandidates = [
    { id: 'cand-001', name: 'Sarah Chen', email: 'sarah.chen@email.com', phone: '555-0101', status: 'Active Assignment', submittedJobId: 'job-001', activeAssignmentId: 'asgn-001', currentJobId: 'job-001', statusHistory: [{ at: daysAgo(30) + 'T09:00:00Z', from: 'Applied', to: 'Reviewed', by: 'recruiter' }, { at: daysAgo(25) + 'T09:00:00Z', from: 'Reviewed', to: 'Submitted', by: 'recruiter' }, { at: daysAgo(20) + 'T09:00:00Z', from: 'Submitted', to: 'Interview', by: 'recruiter' }, { at: daysAgo(15) + 'T09:00:00Z', from: 'Interview', to: 'Hired', by: 'recruiter' }] },
    { id: 'cand-002', name: 'Marcus Johnson', email: 'mjohnson@email.com', phone: '555-0102', status: 'Active Assignment', submittedJobId: 'job-001', activeAssignmentId: 'asgn-002', currentJobId: 'job-002', statusHistory: [{ at: daysAgo(28) + 'T09:00:00Z', from: 'Applied', to: 'Reviewed', by: 'recruiter' }, { at: daysAgo(22) + 'T09:00:00Z', from: 'Reviewed', to: 'Submitted', by: 'recruiter' }, { at: daysAgo(18) + 'T09:00:00Z', from: 'Submitted', to: 'Hired', by: 'recruiter' }] },
    { id: 'cand-003', name: 'Emily Rodriguez', email: 'erodriguez@email.com', phone: '555-0103', status: 'Hired', submittedJobId: 'job-002', clientDecision: 'Approved', clientDecisionNote: 'Great technical skills', clientDecidedAt: daysAgo(2) + 'T14:00:00Z', statusHistory: [{ at: daysAgo(10) + 'T09:00:00Z', from: 'Applied', to: 'Reviewed', by: 'recruiter' }, { at: daysAgo(7) + 'T09:00:00Z', from: 'Reviewed', to: 'Submitted', by: 'recruiter' }, { at: daysAgo(2) + 'T14:00:00Z', from: 'Submitted', to: 'Hired', by: 'client', note: 'Client approved' }] },
    { id: 'cand-004', name: 'David Kim', email: 'dkim@email.com', phone: '555-0104', status: 'Rejected', submittedJobId: 'job-003', clientDecision: 'Rejected', clientDecisionNote: 'Looking for more senior profile', clientDecidedAt: daysAgo(1) + 'T10:00:00Z', rejectedReason: 'Looking for more senior profile', statusHistory: [{ at: daysAgo(14) + 'T09:00:00Z', from: 'Applied', to: 'Reviewed', by: 'recruiter' }, { at: daysAgo(12) + 'T09:00:00Z', from: 'Reviewed', to: 'Submitted', by: 'recruiter' }, { at: daysAgo(8) + 'T09:00:00Z', from: 'Submitted', to: 'Interview', by: 'recruiter' }, { at: daysAgo(1) + 'T10:00:00Z', from: 'Interview', to: 'Rejected', by: 'client', note: 'Looking for more senior profile' }] },
    { id: 'cand-005', name: 'Ashley Thompson', email: 'athompson@email.com', phone: '555-0105', status: 'Submitted', submittedJobId: 'job-004', submittedAt: daysAgo(3) + 'T09:00:00Z', statusHistory: [{ at: daysAgo(6) + 'T09:00:00Z', from: 'Applied', to: 'Reviewed', by: 'recruiter' }, { at: daysAgo(3) + 'T09:00:00Z', from: 'Reviewed', to: 'Submitted', by: 'recruiter' }] },
    { id: 'cand-006', name: 'James Wilson', email: 'jwilson@email.com', phone: '555-0106', status: 'Reviewed', submittedJobId: 'job-003', statusHistory: [{ at: daysAgo(5) + 'T09:00:00Z', from: 'Applied', to: 'Reviewed', by: 'recruiter' }] },
    { id: 'cand-007', name: 'Maria Garcia', email: 'mgarcia@email.com', phone: '555-0107', status: 'Rejected', submittedJobId: 'job-001', rejectedReason: 'Not enough experience', statusHistory: [{ at: daysAgo(20) + 'T09:00:00Z', from: 'Applied', to: 'Reviewed', by: 'recruiter' }, { at: daysAgo(18) + 'T09:00:00Z', from: 'Reviewed', to: 'Submitted', by: 'recruiter' }, { at: daysAgo(14) + 'T09:00:00Z', from: 'Submitted', to: 'Rejected', by: 'recruiter', note: 'Not enough experience' }] },
    { id: 'cand-008', name: 'Robert Lee', email: 'rlee@email.com', phone: '555-0108', status: 'Assignment Ended', submittedJobId: 'job-002', statusHistory: [{ at: daysAgo(60) + 'T09:00:00Z', from: 'Applied', to: 'Hired', by: 'recruiter' }] },
  ];

  const demoClients = [
    { id: 'client-001', name: 'Acme Corp', industry: 'Technology', location: 'New York, NY', contactPerson: 'Jane Miller', contactEmail: 'jane.miller@acmecorp.com', status: 'Active' },
    { id: 'client-002', name: 'TechStart Inc', industry: 'Software', location: 'Austin, TX', contactPerson: 'Tom Harris', contactEmail: 'tom@techstart.com', status: 'Active' },
    { id: 'client-003', name: 'DataFlow LLC', industry: 'Analytics', location: 'Chicago, IL', contactPerson: 'Lisa Park', contactEmail: 'lisa@dataflow.com', status: 'Active' },
    { id: 'client-004', name: 'Insight Analytics', industry: 'Data Science', location: 'San Francisco, CA', contactPerson: 'Mark Stone', contactEmail: 'mark@insight.com', status: 'Active' },
  ];

  const demoJobs = [
    { id: 'job-001', title: 'Senior React Developer', client_name: 'Acme Corp', clientId: 'client-001', location: 'Remote', rate: 85, openings: 2, status: 'Open' },
    { id: 'job-002', title: 'DevOps Engineer', client_name: 'TechStart Inc', clientId: 'client-002', location: 'Austin, TX', rate: 95, openings: 1, status: 'Open' },
    { id: 'job-003', title: 'QA Analyst', client_name: 'DataFlow LLC', clientId: 'client-003', location: 'Chicago, IL', rate: 55, openings: 3, status: 'Open' },
    { id: 'job-004', title: 'Project Manager', client_name: 'Acme Corp', clientId: 'client-001', location: 'New York, NY', rate: 75, openings: 1, status: 'Open' },
    { id: 'job-005', title: 'Data Scientist', client_name: 'Insight Analytics', clientId: 'client-004', location: 'San Francisco, CA', rate: 110, openings: 2, status: 'Open' },
    { id: 'job-006', title: 'UX Designer', client_name: 'TechStart Inc', clientId: 'client-002', location: 'Remote', rate: 70, openings: 1, status: 'Closed' },
  ];

  const we1 = weeksAgoFriday(1);
  const we2 = weeksAgoFriday(2);
  const we3 = weeksAgoFriday(3);

  const demoAssignments = [
    { id: 'asgn-001', candidateId: 'cand-001', jobId: 'job-001', status: 'Active', startDate: daysAgo(14), payRate: 75, billRate: 85, notes: '', createdAt: daysAgo(14) + 'T09:00:00Z', updatedAt: ts },
    { id: 'asgn-002', candidateId: 'cand-002', jobId: 'job-002', status: 'Active', startDate: daysAgo(10), payRate: 80, billRate: 95, notes: '', createdAt: daysAgo(10) + 'T09:00:00Z', updatedAt: ts },
    { id: 'asgn-003', candidateId: 'cand-008', jobId: 'job-002', status: 'Ended', startDate: daysAgo(60), endDate: daysAgo(30), payRate: 80, billRate: 95, notes: 'Contract completed', createdAt: daysAgo(60) + 'T09:00:00Z', updatedAt: daysAgo(30) + 'T09:00:00Z' },
    { id: 'asgn-004', candidateId: 'cand-008', jobId: 'job-003', status: 'Ended', startDate: daysAgo(90), endDate: daysAgo(61), payRate: 50, billRate: 55, notes: 'Project concluded', createdAt: daysAgo(90) + 'T09:00:00Z', updatedAt: daysAgo(61) + 'T09:00:00Z' },
  ];

  const mkEntries = (hrs) => ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => ({ day: d, hours: hrs[i] || 0 }));

  const demoTimesheets = [
    { id: 'ts-001', assignmentId: 'asgn-001', weekEnding: we1, status: 'Draft', clientApprovalStatus: 'Not Submitted', entries: mkEntries([8,8,8,8,8,0,0]), totalHours: 40, payrollStatus: 'Not Ready', exceptions: [], compliance: {}, createdAt: ts, updatedAt: ts },
    { id: 'ts-002', assignmentId: 'asgn-001', weekEnding: we2, status: 'Submitted', clientApprovalStatus: 'Submitted', entries: mkEntries([8,8,8,8,4,0,0]), totalHours: 36, payrollStatus: 'Not Ready', exceptions: [], compliance: {}, createdAt: ts, updatedAt: ts, submittedAt: daysAgo(5) + 'T17:00:00Z' },
    { id: 'ts-003', assignmentId: 'asgn-002', weekEnding: we2, status: 'Approved', clientApprovalStatus: 'Approved', entries: mkEntries([8,8,8,8,8,0,0]), totalHours: 40, payrollStatus: 'Ready', payrollReadyAt: daysAgo(3) + 'T09:00:00Z', exceptions: [], compliance: {}, createdAt: ts, updatedAt: ts, submittedAt: daysAgo(6) + 'T17:00:00Z', approvedAt: daysAgo(3) + 'T09:00:00Z', clientDecidedAt: daysAgo(4) + 'T09:00:00Z' },
    { id: 'ts-004', assignmentId: 'asgn-002', weekEnding: we3, status: 'Submitted', clientApprovalStatus: 'Submitted', entries: mkEntries([8,8,0,8,8,0,0]), totalHours: 32, payrollStatus: 'Not Ready', exceptions: [], compliance: {}, createdAt: ts, updatedAt: ts, submittedAt: daysAgo(4) + 'T17:00:00Z' },
    { id: 'ts-005', assignmentId: 'asgn-003', weekEnding: weeksAgoFriday(5), status: 'Approved', clientApprovalStatus: 'Approved', entries: mkEntries([8,8,8,8,8,0,0]), totalHours: 40, payrollStatus: 'Paid', payrollReadyAt: daysAgo(40) + 'T09:00:00Z', exceptions: [], compliance: {}, createdAt: daysAgo(45) + 'T09:00:00Z', updatedAt: daysAgo(35) + 'T09:00:00Z', approvedAt: daysAgo(40) + 'T09:00:00Z', clientDecidedAt: daysAgo(41) + 'T09:00:00Z' },
  ];

  const demoInvoices = [
    { id: 'inv-001', clientId: 'client-001', clientName: 'Acme Corp', invoiceNumber: 'INV-2026-001', issuedAt: daysAgo(45), dueDate: daysAgo(15), total: 3400, amountPaid: 3400, balanceDue: 0, status: 'Paid', paidAt: daysAgo(10) + 'T09:00:00Z', lineItems: [{ description: 'Sarah Chen - Senior React Developer (40hrs @ $85)', hours: 40, rate: 85, amount: 3400 }], createdAt: daysAgo(45) + 'T09:00:00Z', updatedAt: daysAgo(10) + 'T09:00:00Z' },
    { id: 'inv-002', clientId: 'client-001', clientName: 'Acme Corp', invoiceNumber: 'INV-2026-002', issuedAt: daysAgo(30), dueDate: daysAgo(0), total: 3060, amountPaid: 1000, balanceDue: 2060, status: 'Sent', lineItems: [{ description: 'Sarah Chen - Senior React Developer (36hrs @ $85)', hours: 36, rate: 85, amount: 3060 }], createdAt: daysAgo(30) + 'T09:00:00Z', updatedAt: daysAgo(5) + 'T09:00:00Z' },
    { id: 'inv-003', clientId: 'client-002', clientName: 'TechStart Inc', invoiceNumber: 'INV-2026-003', issuedAt: daysAgo(60), dueDate: daysAgo(30), total: 3800, amountPaid: 0, balanceDue: 3800, status: 'Sent', lineItems: [{ description: 'Marcus Johnson - DevOps Engineer (40hrs @ $95)', hours: 40, rate: 95, amount: 3800 }], createdAt: daysAgo(60) + 'T09:00:00Z', updatedAt: daysAgo(60) + 'T09:00:00Z' },
    { id: 'inv-004', clientId: 'client-002', clientName: 'TechStart Inc', invoiceNumber: 'INV-2026-004', issuedAt: daysAgo(40), dueDate: daysAgo(10), total: 3040, amountPaid: 0, balanceDue: 3040, status: 'Sent', lineItems: [{ description: 'Marcus Johnson - DevOps Engineer (32hrs @ $95)', hours: 32, rate: 95, amount: 3040 }], createdAt: daysAgo(40) + 'T09:00:00Z', updatedAt: daysAgo(40) + 'T09:00:00Z' },
    { id: 'inv-005', clientId: 'client-003', clientName: 'DataFlow LLC', invoiceNumber: 'INV-2026-005', issuedAt: daysAgo(100), dueDate: daysAgo(70), total: 2200, amountPaid: 0, balanceDue: 2200, status: 'Sent', lineItems: [{ description: 'Robert Lee - DevOps Engineer (40hrs @ $55)', hours: 40, rate: 55, amount: 2200 }], createdAt: daysAgo(100) + 'T09:00:00Z', updatedAt: daysAgo(100) + 'T09:00:00Z' },
    { id: 'inv-006', clientId: 'client-001', clientName: 'Acme Corp', invoiceNumber: 'INV-2026-006', issuedAt: daysAgo(10), dueDate: daysAgo(-20), total: 3400, amountPaid: 0, balanceDue: 3400, status: 'Sent', lineItems: [{ description: 'Sarah Chen - Senior React Developer (40hrs @ $85)', hours: 40, rate: 85, amount: 3400 }], createdAt: daysAgo(10) + 'T09:00:00Z', updatedAt: daysAgo(10) + 'T09:00:00Z' },
    { id: 'inv-007', clientId: 'client-004', clientName: 'Insight Analytics', invoiceNumber: 'INV-2026-007', issuedAt: daysAgo(50), dueDate: daysAgo(20), total: 4400, amountPaid: 4400, balanceDue: 0, status: 'Paid', paidAt: daysAgo(18) + 'T09:00:00Z', lineItems: [{ description: 'Consulting Services (40hrs @ $110)', hours: 40, rate: 110, amount: 4400 }], createdAt: daysAgo(50) + 'T09:00:00Z', updatedAt: daysAgo(18) + 'T09:00:00Z' },
    { id: 'inv-008', clientId: 'client-003', clientName: 'DataFlow LLC', invoiceNumber: 'INV-2026-008', issuedAt: daysAgo(75), dueDate: daysAgo(45), total: 1650, amountPaid: 0, balanceDue: 1650, status: 'Sent', lineItems: [{ description: 'Robert Lee - QA Analyst (30hrs @ $55)', hours: 30, rate: 55, amount: 1650 }], createdAt: daysAgo(75) + 'T09:00:00Z', updatedAt: daysAgo(75) + 'T09:00:00Z' },
  ];

  const demoPayments = [
    { id: 'pmt-001', clientId: 'client-001', invoiceId: 'inv-001', amount: 3400, method: 'ACH', receivedDate: daysAgo(10), memo: 'Payment for INV-2026-001', createdAt: daysAgo(10) + 'T09:00:00Z', updatedAt: daysAgo(10) + 'T09:00:00Z' },
    { id: 'pmt-002', clientId: 'client-001', invoiceId: 'inv-002', amount: 1000, method: 'Check', receivedDate: daysAgo(5), memo: 'Partial payment', createdAt: daysAgo(5) + 'T09:00:00Z', updatedAt: daysAgo(5) + 'T09:00:00Z' },
    { id: 'pmt-003', clientId: 'client-004', invoiceId: 'inv-007', amount: 4400, method: 'Wire', receivedDate: daysAgo(18), memo: 'Full payment', createdAt: daysAgo(18) + 'T09:00:00Z', updatedAt: daysAgo(18) + 'T09:00:00Z' },
  ];

  safeSet(KEYS.clients, demoClients);
  safeSet(KEYS.candidates, demoCandidates);
  safeSet(KEYS.jobs, demoJobs);
  safeSet(KEYS.assignments, demoAssignments);
  safeSet(KEYS.timesheets, demoTimesheets);
  safeSet(KEYS.invoices, demoInvoices);
  safeSet(KEYS.payments, demoPayments);
  // CRM collections have no seed rows: explicitly empty, so a reset never
  // leaves a stale contact, activity, or follow-up behind locally.
  safeSet(KEYS.contacts, []);
  safeSet(KEYS.activities, []);
  safeSet(KEYS.followUps, []);
  safeSet(KEYS.payrollQueue, []);
  safeSet(KEYS.payrollRuns, []);
  localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
}

export function validateSystem() {
  const candidates = getCandidates();
  const assignments = getAssignments();
  const timesheets = getTimesheets();
  const errors = [];
  const warnings = [];
  const stats = { candidates: candidates.length, assignments: assignments.length, timesheets: timesheets.length, jobs: getJobs().length };

  candidates.forEach(c => {
    if (c.activeAssignmentId) {
      const found = assignments.find(a => a.id === c.activeAssignmentId);
      if (!found) {
        errors.push({ type: 'orphan_assignment_ref', severity: 'error', msg: `Candidate "${c.name}" references missing assignment ${c.activeAssignmentId}`, candidateId: c.id, field: 'activeAssignmentId' });
      }
    }
  });

  const activeByCand = {};
  assignments.forEach(a => {
    if (a.status === 'Active') {
      activeByCand[a.candidateId] = (activeByCand[a.candidateId] || 0) + 1;
    }
  });
  Object.entries(activeByCand).forEach(([candId, count]) => {
    if (count > 1) {
      const cand = candidates.find(c => c.id === candId);
      errors.push({ type: 'multi_active_assignment', severity: 'error', msg: `Candidate "${cand?.name || candId}" has ${count} active assignments (should be 1)`, candidateId: candId });
    }
  });

  timesheets.forEach(t => {
    if (t.assignmentId) {
      const found = assignments.find(a => a.id === t.assignmentId);
      if (!found) {
        errors.push({ type: 'orphan_ts_assignment', severity: 'error', msg: `Timesheet ${t.id} references missing assignment ${t.assignmentId}`, timesheetId: t.id, field: 'assignmentId' });
      } else if (found.status === 'Ended' && (t.status === 'Submitted' || t.status === 'Approved')) {
        warnings.push({ type: 'ts_inactive_assignment', severity: 'warning', msg: `Timesheet ${t.id} (${t.status}) linked to ended assignment ${t.assignmentId}`, timesheetId: t.id });
      }
    }

    const entries = t.entries || [];
    const sum = entries.reduce((s, e) => s + (Number(e.hours) || 0), 0);
    if (t.totalHours != null && Math.abs(t.totalHours - sum) > 0.01) {
      warnings.push({ type: 'hours_mismatch', severity: 'warning', msg: `Timesheet ${t.id}: totalHours (${t.totalHours}) != sum of entries (${sum})`, timesheetId: t.id, expected: sum, actual: t.totalHours });
    }

    if (t.weekEnding && isNaN(Date.parse(t.weekEnding))) {
      errors.push({ type: 'invalid_date', severity: 'error', msg: `Timesheet ${t.id} has invalid weekEnding: "${t.weekEnding}"`, timesheetId: t.id });
    }
  });

  assignments.forEach(a => {
    if (a.startDate && isNaN(Date.parse(a.startDate))) {
      errors.push({ type: 'invalid_date', severity: 'error', msg: `Assignment ${a.id} has invalid startDate: "${a.startDate}"`, assignmentId: a.id });
    }
    if (a.endDate && isNaN(Date.parse(a.endDate))) {
      errors.push({ type: 'invalid_date', severity: 'error', msg: `Assignment ${a.id} has invalid endDate: "${a.endDate}"`, assignmentId: a.id });
    }
    if (a.status === 'Active' && a.endDate && new Date(a.endDate) < new Date()) {
      warnings.push({ type: 'past_end_active', severity: 'warning', msg: `Assignment ${a.id} is Active but endDate (${a.endDate}) is in the past`, assignmentId: a.id });
    }
  });

  return { errors, warnings, stats };
}

export function applySafeFixes(issues) {
  let fixCount = 0;
  const candidates = getCandidates();
  const assignments = getAssignments();
  const timesheets = getTimesheets();

  issues.forEach(issue => {
    if (issue.type === 'orphan_assignment_ref' && issue.candidateId) {
      const c = candidates.find(x => x.id === issue.candidateId);
      if (c) {
        c.activeAssignmentId = null;
        c.currentJobId = null;
        if (c.status === 'Active Assignment' || c.status === 'Assigned') {
          c.status = 'Assignment Ended';
        }
        fixCount++;
      }
    }

    if (issue.type === 'hours_mismatch' && issue.timesheetId) {
      const t = timesheets.find(x => x.id === issue.timesheetId);
      if (t) {
        t.totalHours = (t.entries || []).reduce((s, e) => s + (Number(e.hours) || 0), 0);
        fixCount++;
      }
    }

    if (issue.type === 'past_end_active' && issue.assignmentId) {
      const a = assignments.find(x => x.id === issue.assignmentId);
      if (a) {
        a.status = 'Ended';
        a.updatedAt = now();
        fixCount++;
      }
    }
  });

  if (fixCount > 0) {
    setCandidates(candidates);
    setAssignments(assignments);
    setTimesheets(timesheets);
  }

  return fixCount;
}

export function reconcileCandidateStatuses() {
  const candidates = getCandidates();
  const assignments = getAssignments();
  let changed = false;

  candidates.forEach(c => {
    const candidateAssignments = assignments.filter(a => a.candidateId === c.id);
    if (candidateAssignments.length === 0) {
      if (c.status === 'Active Assignment' || c.status === 'Assigned') {
        c.status = 'Assignment Ended';
        c.activeAssignmentId = null;
        c.currentJobId = null;
        changed = true;
      }
      return;
    }

    const activeAssignment = candidateAssignments.find(a => a.status === 'Active');
    const onHoldAssignment = candidateAssignments.find(a => a.status === 'On Hold');

    if (activeAssignment) {
      if (c.status !== 'Active Assignment' || c.activeAssignmentId !== activeAssignment.id || c.currentJobId !== activeAssignment.jobId) {
        c.status = 'Active Assignment';
        c.activeAssignmentId = activeAssignment.id;
        c.currentJobId = activeAssignment.jobId;
        changed = true;
      }
    } else if (onHoldAssignment) {
      if (c.status !== 'Assigned' || c.activeAssignmentId !== onHoldAssignment.id || c.currentJobId !== onHoldAssignment.jobId) {
        c.status = 'Assigned';
        c.activeAssignmentId = onHoldAssignment.id;
        c.currentJobId = onHoldAssignment.jobId;
        changed = true;
      }
    } else if (c.status === 'Active Assignment' || c.status === 'Assigned') {
      c.status = 'Assignment Ended';
      c.activeAssignmentId = null;
      c.currentJobId = null;
      changed = true;
    }
  });

  if (changed) {
    setCandidates(candidates);
  }
}

const PREFILL_KEY = 'alltech_assignment_prefill';

export function getRecentClientDecisions(days = 30) {
  const candidates = getCandidates();
  const jobs = getJobs();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return candidates
    .filter(c => c.clientDecision && c.clientDecidedAt && new Date(c.clientDecidedAt) >= cutoff)
    .map(c => {
      const job = c.submittedJobId ? jobs.find(j => j.id === c.submittedJobId) : null;
      return {
        candidateId: c.id,
        candidateName: c.name,
        jobId: c.submittedJobId,
        jobTitle: job?.title || 'Unknown',
        decision: c.clientDecision,
        note: c.clientDecisionNote || '',
        decidedAt: c.clientDecidedAt,
      };
    })
    .sort((a, b) => (b.decidedAt || '').localeCompare(a.decidedAt || ''));
}

export function setAssignmentPrefill(candidateId, jobId) {
  localStorage.setItem(PREFILL_KEY, JSON.stringify({ candidateId, jobId }));
}

export function getAssignmentPrefill() {
  try {
    const raw = localStorage.getItem(PREFILL_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAssignmentPrefill() {
  localStorage.removeItem(PREFILL_KEY);
}

export function reconcileApprovalsState() {
  const timesheets = getTimesheets();
  const assignments = getAssignments();
  let changed = false;

  timesheets.forEach(ts => {
    if (ts.status === 'Approved' && !ts.assignmentId) {
      ts.status = 'Rejected';
      ts.rejectionNote = 'Auto-rejected: missing assignment reference';
      ts.payrollStatus = 'Not Ready';
      changed = true;
    }

    if (ts.status === 'Approved' && ts.assignmentId) {
      const asgn = assignments.find(a => a.id === ts.assignmentId);
      if (!asgn) {
        ts.payrollStatus = 'Not Ready';
        ts.exceptions = ts.exceptions || [];
        if (!ts.exceptions.some(e => e.msg.includes('missing assignment'))) {
          ts.exceptions.push({ msg: 'Linked assignment not found', blocking: true });
        }
        changed = true;
      }
    }

    if (ts.clientApprovalStatus === 'Rejected') {
      if (ts.status === 'Submitted') {
        ts.status = 'Rejected';
        ts.rejectionNote = ts.clientDecisionNote || 'Rejected by client';
        if (ts.payrollStatus !== 'In Payroll' && ts.payrollStatus !== 'Paid') {
          ts.payrollStatus = 'Not Ready';
        }
        changed = true;
      }
    }

    if (ts.status === 'Approved') {
      if (ts.payrollStatus !== 'In Payroll' && ts.payrollStatus !== 'Paid') {
        const computed = computePayrollStatus(ts);
        if (ts.payrollStatus !== computed) {
          ts.payrollStatus = computed;
          if (computed === 'Ready' && !ts.payrollReadyAt) {
            ts.payrollReadyAt = now();
          }
          changed = true;
        }
      }
    }
  });

  if (changed) {
    setTimesheets(timesheets);
  }
}

export function reconcileAll() {
  try {
    reconcileCandidateStatuses();
    reconcileCandidatePipelineState();
    reconcileApprovalsState();
    reconcileTimesheetsPayrollState();
    reconcileInvoicePayments();
    ensureCurrentWeekTimesheets();
  } catch (e) {
    console.warn('[reconcileAll] error during reconciliation:', e);
  }
}

// Weekly timecard auto-creation (top-10 #5, approved 2026-11-13: current
// week only, started Active assignments, Draft with 0 hours). Runs on
// every app load via reconcileAll; idempotent by assignment + weekEnding,
// so a second load creates nothing. Past weeks are NOT backfilled —
// backfilling stale Drafts is the backoffice's deliberate call.
//
// The Draft is local-only until the candidate submits it: the submit path
// (timekeeping Form / candidate TimesheetEntry) syncs it up. Syncing at
// creation would let two browsers create two shared rows for the same
// assignment + week, since the guard can only see this browser's store.
// A 0-hour Draft needs no staff action before submit, so nothing is lost.
export function ensureCurrentWeekTimesheets() {
  const friday = fridayOfCurrentWeek();
  const today = new Date().toISOString().slice(0, 10);
  const sheets = getTimesheets();
  let created = 0;
  for (const a of getAssignments()) {
    if (a.status !== 'Active') continue;
    if (!a.startDate || a.startDate > today) continue; // not started yet
    if (sheets.some((t) => String(t.assignmentId) === String(a.id) && t.weekEnding === friday)) continue;
    const timestamp = now();
    const row = {
      id: uid(),
      assignmentId: a.id,
      weekEnding: friday,
      entries: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => ({ day: d, hours: 0 })),
      totalHours: 0,
      status: 'Draft',
      clientApprovalStatus: 'Not Submitted',
      payrollStatus: 'Not Ready',
      exceptions: [],
      compliance: {},
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    applyTimesheetCompliance(row);
    sheets.push(row);
    created += 1;
  }
  if (created > 0) setTimesheets(sheets);
  return created;
}

export { KEYS };
