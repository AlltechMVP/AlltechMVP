-- profiles table: minimal fields used by the app
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text check (role in (
    'admin','ceo','cfo','director','branch-manager','sales-rep','sales-manager','recruiter','candidate','client','backoffice'
  )) not null default 'recruiter'
);

-- job_candidates junction: candidate per job status
create table if not exists public.job_candidates (
  id bigserial primary key,
  job_id bigint not null,
  candidate_id bigint not null,
  status text not null default 'Submitted to Client'
);

-- helpful RLS (optional; adjust for your org policies)
-- alter table public.profiles enable row level security;
-- alter table public.job_candidates enable row level security;
