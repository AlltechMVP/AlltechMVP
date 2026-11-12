-- Replace dev-open policies with tenant-aware rules once you're ready for multi-tenant prod.
-- Assumption: profiles.tenant_id set on signup/provisioning.

-- Example for clients
drop policy if exists dev_all_clients on public.clients;
create policy tenant_select_clients on public.clients for select using (
  tenant_id = (select tenant_id from public.profiles p where p.id = auth.uid())
);
create policy tenant_write_clients on public.clients for insert with check (
  tenant_id = (select tenant_id from public.profiles p where p.id = auth.uid())
);
create policy tenant_update_clients on public.clients for update using (
  tenant_id = (select tenant_id from public.profiles p where p.id = auth.uid())
) with check (
  tenant_id = (select tenant_id from public.profiles p where p.id = auth.uid())
);

-- Repeat the pattern for jobs, candidates, job_candidates, assignments, timecards, time_entries.
