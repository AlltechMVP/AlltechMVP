// DEV ONLY. Requires SUPABASE_SERVICE_ROLE and SUPABASE_URL in env.
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE;
if (!url || !service) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE. Abort.');
  process.exit(1);
}
const admin = createClient(url, service);

async function main() {
  const clients = [
    { name: 'Acme Manufacturing', status: 'Active', billing_email: 'ap@acme.example', phone: '555-0101' },
    { name: 'Bright Logistics', status: 'Active', billing_email: 'ap@bright.example', phone: '555-0102' },
  ];
  await admin.from('clients').upsert(clients, { onConflict: 'name' });

  const { data: c } = await admin.from('clients').select('id,name');
  const id = (n) => c.find(x => x.name === n)?.id;

  const jobs = [
    { client_id: id('Acme Manufacturing'), title: 'Assembler I', location: 'Dallas, TX', rate: 18.5, openings: 5, status: 'Open' },
    { client_id: id('Acme Manufacturing'), title: 'Forklift Operator', location: 'Dallas, TX', rate: 20, openings: 3, status: 'Open' },
    { client_id: id('Bright Logistics'), title: 'Warehouse Clerk', location: 'Fort Worth, TX', rate: 17.25, openings: 4, status: 'Open' },
  ];
  await admin.from('jobs').upsert(jobs, { onConflict: 'id' });

  const candidates = [
    { name: 'Jordan Reed', email: 'jordan@example.com', phone: '555-1111', status: 'Applied', job_applied: 'Assembler I' },
    { name: 'Avery Park', email: 'avery@example.com', phone: '555-1112', status: 'Screening', job_applied: 'Forklift Operator' },
    { name: 'Riley Chen', email: 'riley@example.com', phone: '555-1113', status: 'Applied', job_applied: 'Warehouse Clerk' },
  ];
  await admin.from('candidates').upsert(candidates, { onConflict: 'email' });

  const { data: j } = await admin.from('jobs').select('id,title');
  const jid = (t) => j.find(x => x.title === t)?.id;
  const { data: cand } = await admin.from('candidates').select('id,name');
  const cid = (n) => cand.find(x => x.name === n)?.id;

  const relations = [
    { job_id: jid('Assembler I'), candidate_id: cid('Jordan Reed'), status: 'Submitted to Client' },
    { job_id: jid('Forklift Operator'), candidate_id: cid('Avery Park'), status: 'Interview Pending' },
    { job_id: jid('Warehouse Clerk'), candidate_id: cid('Riley Chen'), status: 'Submitted to Client' },
  ];
  await admin.from('job_candidates').upsert(relations, { onConflict: 'job_id,candidate_id' });

  // One assignment + timecard
  const { data: a } = await admin
    .from('assignments')
    .insert({ job_id: jid('Assembler I'), candidate_id: cid('Jordan Reed'), start_date: new Date().toISOString().slice(0,10), pay_rate: 18.0, bill_rate: 28.0, status: 'Active' })
    .select('id')
    .single();

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7)); // Monday
  const ws = weekStart.toISOString().slice(0,10);

  const { data: t } = await admin
    .from('timecards')
    .insert({ assignment_id: a.id, week_start: ws, total_hours: 40, status: 'Submitted' })
    .select('id')
    .single();

  const entries = [0,1,2,3,4].map(d => ({ timecard_id: t.id, work_date: new Date(weekStart.getTime() + d*86400000).toISOString().slice(0,10), hours: 8, memo: 'Regular' }));
  await admin.from('time_entries').insert(entries);

  console.log('Seed complete');
}

main().catch((e) => { console.error(e); process.exit(1); });
