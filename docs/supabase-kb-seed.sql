insert into public.kb_articles (slug, title, body, tags, roles)
values
  ('login-access', 'How do I log in and access my dashboard?',
    'Use the email and password provided by your admin. After sign-in, you will be redirected to a role-based dashboard. If you see a blank page, refresh or contact support.',
    '{onboarding,auth,login}', '{admin,ceo,cfo,director,branch-manager,sales-rep,sales-manager,recruiter,candidate,client,backoffice}'),

  ('client-approvals', 'Client approvals workflow',
    'From Client → Approvals, review submitted candidates. Approve, request interview, or reject. These updates write to job_candidates.status and are reflected on the recruiter board.',
    '{client,approvals,workflow}', '{client,admin,recruiter,ceo,cfo}'),

  ('recruiter-status', 'Recruiter board statuses',
    'Recruiters can change candidate status inline: Applied → Screening → Interview → Offer → Placed / Rejected. This updates the candidates table (global lifecycle).',
    '{recruiter,candidates,status}', '{recruiter,admin,ceo,cfo}'),

  ('kpis', 'What KPIs do executives see?',
    'The CEO/CFO dashboards show Active Assignments, Open Jobs, Total Candidates, and Hours Pending. Weekly hours charts pull from timecards with Submitted/Approved/Paid.',
    '{kpi,executive,dashboard}', '{admin,ceo,cfo}')
ON CONFLICT (slug) DO NOTHING;
