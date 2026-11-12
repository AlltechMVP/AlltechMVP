-- ============================
-- Alltech MVP – Schema v1
-- ============================
-- Run this in the Supabase SQL editor.

-- 1) Profiles (extends auth.users) – already exists from earlier batches, but add tenant_id
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text check (role in (
    'admin','ceo','cfo','director','branch-manager','sales-rep','sales-manager','recruiter','candidate','client','backoffice'
  )) not null default 'recruiter',
  tenant_id text not null default 'demo'
);

-- 2) Clients
create table if not exists public.clients (
  id bigserial primary key,
  name text not null,
  status text not null default 'Active',
  billing_email text,
  phone text,
  tenant_id text not null default 'demo'
);

-- 3) Jobs (reqs from clients)
create table if not exists public.jobs (
  id bigserial primary key,
  client_id bigint not null references public.clients(id) on delete cascade,
  title text not null,
  location text,
  rate numeric(12,2),
  openings int not null default 1,
  status text not null default 'Open',
  created_at timestamptz not null default now(),
  tenant_id text not null default 'demo'
);
create index if not exists jobs_client_id_idx on public.jobs(client_id);

-- 4) Candidates (global person records)
create table if not exists public.candidates (
  id bigserial primary key,
  name text not null,
  email text,
  phone text,
  status text not null default 'Applied', -- global lifecycle status
  job_applied text, -- free text for quick demo display
  tenant_id text not null default 'demo'
);

-- 5) Job ↔ Candidate relation (per-job workflow status)
create table if not exists public.job_candidates (
  id bigserial primary key,
  job_id bigint not null references public.jobs(id) on delete cascade,
  candidate_id bigint not null references public.candidates(id) on delete cascade,
  status text not null default 'Submitted to Client',
  created_at timestamptz not null default now(),
  tenant_id text not null default 'demo',
  unique(job_id, candidate_id)
);
create index if not exists job_candidates_job_idx on public.job_candidates(job_id);
create index if not exists job_candidates_cand_idx on public.job_candidates(candidate_id);

-- 6) Assignments (when a candidate is placed on a job)
create table if not exists public.assignments (
  id bigserial primary key,
  job_id bigint not null references public.jobs(id) on delete cascade,
  candidate_id bigint not null references public.candidates(id) on delete cascade,
  start_date date not null,
  end_date date,
  pay_rate numeric(12,2),
  bill_rate numeric(12,2),
  status text not null default 'Active',
  tenant_id text not null default 'demo'
);
create index if not exists assignments_job_idx on public.assignments(job_id);
create index if not exists assignments_cand_idx on public.assignments(candidate_id);

-- 7) Timecards (weekly header)
create table if not exists public.timecards (
  id bigserial primary key,
  assignment_id bigint not null references public.assignments(id) on delete cascade,
  week_start date not null,
  total_hours numeric(7,2) not null default 0,
  status text not null default 'Open',
  tenant_id text not null default 'demo',
  unique(assignment_id, week_start)
);
create index if not exists timecards_assign_idx on public.timecards(assignment_id);

-- 8) Time entries (daily detail)
create table if not exists public.time_entries (
  id bigserial primary key,
  timecard_id bigint not null references public.timecards(id) on delete cascade,
  work_date date not null,
  hours numeric(5,2) not null default 0,
  memo text,
  tenant_id text not null default 'demo'
);
create index if not exists time_entries_card_idx on public.time_entries(timecard_id);

-- ============================
-- RLS (Row-Level Security)
-- ============================
-- Enable RLS
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.jobs enable row level security;
alter table public.candidates enable row level security;
alter table public.job_candidates enable row level security;
alter table public.assignments enable row level security;
alter table public.timecards enable row level security;
alter table public.time_entries enable row level security;

-- DEV-ONLY policies (open to any authenticated user within the demo tenant)
-- In production, replace with tenant-aware policies bound to profiles.tenant_id.
create policy if not exists dev_all_profiles on public.profiles for select using (auth.role() = 'authenticated');
create policy if not exists dev_upd_profiles on public.profiles for update using (auth.role() = 'authenticated');
create policy if not exists dev_ins_profiles on public.profiles for insert with check (auth.role() = 'authenticated');

create policy if not exists dev_all_clients on public.clients for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy if not exists dev_all_jobs on public.jobs for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy if not exists dev_all_candidates on public.candidates for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy if not exists dev_all_job_candidates on public.job_candidates for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy if not exists dev_all_assignments on public.assignments for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy if not exists dev_all_timecards on public.timecards for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy if not exists dev_all_time_entries on public.time_entries for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- PRODUCTION-TEMPLATE (commented): example tenant isolation tied to profiles.tenant_id
-- create policy tenant_read_clients on public.clients for select
--   using (tenant_id = coalesce((select tenant_id from public.profiles p where p.id = auth.uid()), ''));
-- create policy tenant_write_clients on public.clients for insert with check
--   (tenant_id = coalesce((select tenant_id from public.profiles p where p.id = auth.uid()), ''));
-- ...repeat for the other tables

-- ============================
-- Views for dashboards (optional)
-- ============================
create or replace view public.v_kpis as
select
  (select count(*) from public.assignments where status = 'Active') as active_assignments,
  (select count(*) from public.jobs where status = 'Open') as open_jobs,
  (select count(*) from public.candidates) as total_candidates,
  (select coalesce(sum(total_hours),0) from public.timecards where status in ('Submitted','Approved','Paid')) as hours_pending
;
