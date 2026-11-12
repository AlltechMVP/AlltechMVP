-- ============================
-- Alltech MVP – Knowledge Base schema (v1)
-- ============================
-- Run this in Supabase SQL editor.

create table if not exists public.kb_articles (
  id bigserial primary key,
  slug text unique not null,
  title text not null,
  body text not null,
  tags text[] not null default '{}',
  roles text[] not null default '{"admin","ceo","cfo","director","branch-manager","sales-rep","sales-manager","recruiter","candidate","client","backoffice"}',
  updated_at timestamptz not null default now(),
  tenant_id text not null default 'demo'
);

-- Simple search index on title/body
create index if not exists kb_articles_title_idx on public.kb_articles using gin (to_tsvector('english', title));
create index if not exists kb_articles_body_idx on public.kb_articles using gin (to_tsvector('english', body));
create index if not exists kb_articles_tags_idx on public.kb_articles using gin (tags);

alter table public.kb_articles enable row level security;
create policy if not exists dev_all_kb on public.kb_articles for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Optional future: embeddings
-- create extension if not exists vector;
-- alter table public.kb_articles add column if not exists embedding vector(768);
