-- Minimal seed for demoing flows

-- Clients
insert into public.clients (name, status, billing_email, phone)
values
  ('Acme Manufacturing', 'Active', 'ap@acme.example', '555-0101'),
  ('Bright Logistics', 'Active', 'ap@bright.example', '555-0102')
on conflict do nothing;

-- Jobs
insert into public.jobs (client_id, title, location, rate, openings, status)
select c.id, j.title, j.location, j.rate, j.openings, j.status
from (
  values
    ('Acme Manufacturing','Assembler I','Dallas, TX', 18.50, 5, 'Open'),
    ('Acme Manufacturing','Forklift Operator','Dallas, TX', 20.00, 3, 'Open'),
    ('Bright Logistics','Warehouse Clerk','Fort Worth, TX', 17.25, 4, 'Open')
) as j(client_name,title,location,rate,openings,status)
join public.clients c on c.name = j.client_name
on conflict do nothing;

-- Candidates
insert into public.candidates (name, email, phone, status, job_applied)
values
  ('Jordan Reed','jordan@example.com','555-1111','Applied','Assembler I'),
  ('Avery Park','avery@example.com','555-1112','Screening','Forklift Operator'),
  ('Riley Chen','riley@example.com','555-1113','Applied','Warehouse Clerk')
on conflict do nothing;

-- Job ↔ Candidate relationships
insert into public.job_candidates (job_id, candidate_id, status)
select j.id, c.id, s.status
from (
  values
    ('Assembler I','Jordan Reed','Submitted to Client'),
    ('Forklift Operator','Avery Park','Interview Pending'),
    ('Warehouse Clerk','Riley Chen','Submitted to Client')
) s(job_title, cand_name, status)
join public.jobs j on j.title = s.job_title
join public.candidates c on c.name = s.cand_name
on conflict do nothing;

-- Assign one placement
insert into public.assignments (job_id, candidate_id, start_date, pay_rate, bill_rate, status)
select j.id, c.id, current_date - interval '7 days', 18.00, 28.00, 'Active'
from public.jobs j
join public.candidates c on c.name = 'Jordan Reed'
where j.title = 'Assembler I'
on conflict do nothing;

-- Create a timecard with a few entries
insert into public.timecards (assignment_id, week_start, total_hours, status)
select a.id, date_trunc('week', current_date)::date, 40, 'Submitted'
from public.assignments a
join public.candidates c on c.id = a.candidate_id and c.name = 'Jordan Reed'
on conflict do nothing;

insert into public.time_entries (timecard_id, work_date, hours, memo)
select t.id, (date_trunc('week', current_date)::date + offs.day)::date, 8, 'Regular'
from public.timecards t
cross join (values (0),(1),(2),(3),(4)) as offs(day)
join public.assignments a on a.id = t.assignment_id
on conflict do nothing;
