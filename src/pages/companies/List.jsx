import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClients, getJobs, getJobsForClient } from '@/utils/storage';
import {
  fetchClients, fetchJobs, reconcileClients, reconcileJobs, isRlsDenied,
} from '@/lib/pipeline';
import QuickAdd from '@/components/QuickAdd.jsx';
import DataTable from '@/components/table/DataTable.jsx';
import { Empty, AccessDenied } from '@/components/ui';

// Companies list: Supabase is the shared read store (so a company added
// in another session shows up here), demo store is the fallback when the
// shared store is unreachable. RLS denials show the denied state and
// never fall back to the unscoped demo store.
export default function CompaniesList() {
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [denied, setDenied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await reconcileClients();
        await reconcileJobs();
        const [clients, supJobs] = await Promise.all([fetchClients(), fetchJobs()]);
        if (!mounted) return;
        setCompanies(clients);
        setJobs(supJobs);
      } catch (err) {
        if (isRlsDenied(err)) {
          if (mounted) setDenied(true);
        } else if (mounted) {
          setCompanies(getClients());
          setJobs(getJobs());
          setUsingFallback(true);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const openOrdersFor = (company) => {
    if (usingFallback) {
      return getJobsForClient(company.id).filter((j) => j.status === 'Open').length;
    }
    return jobs.filter(
      (j) => String(j.clientId) === String(company.supabaseClientId) && j.status === 'Open'
    ).length;
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return companies.filter((c) => {
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      if (!q) return true;
      return [c.name, c.industry, c.location, c.contactPerson, c.contactEmail]
        .some((v) => (v || '').toLowerCase().includes(q));
    });
  }, [companies, search, statusFilter]);

  const columns = [
    { key: 'name', header: 'Company', render: (v, row) => (
      <Link to={`/companies/${row.id}`} className="text-blue-600 hover:underline font-medium">{v}</Link>
    )},
    { key: 'status', header: 'Status', render: (v) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v === 'Active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{v}</span>
    )},
    { key: 'industry', header: 'Industry' },
    { key: 'location', header: 'Location' },
    { key: 'contact', header: 'Primary contact' },
    { key: 'openOrders', header: 'Open orders', render: (v) => (
      <span className="font-medium">{v}</span>
    )},
    { key: 'id', header: '', render: (_, row) => (
      <Link to={`/companies/${row.id}`} className="text-blue-600 hover:underline text-xs font-medium">View</Link>
    )},
  ];

  const rows = filtered.map((c) => ({
    id: c.id,
    name: c.name,
    status: c.status,
    industry: c.industry || '—',
    location: c.location || '—',
    contact: c.contactPerson ? `${c.contactPerson}${c.contactEmail ? ` (${c.contactEmail})` : ''}` : '—',
    openOrders: openOrdersFor(c),
  }));

  if (denied) return <AccessDenied />;
  if (loading) return <div className="p-4">Loading companies…</div>;
  if (companies.length === 0 && !usingFallback) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <Empty title="No companies yet" />
        <button onClick={() => setQuickAddOpen(true)} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          Quick Add Prospect
        </button>
        <QuickAdd open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Companies</h1>
        <div className="flex gap-2">
          <Link to="/companies/new" className="border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            Add Company
          </Link>
          <button onClick={() => setQuickAddOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Quick Add Prospect
          </button>
        </div>
      </div>

      {usingFallback && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
          Showing local demo data — the shared store is unreachable right now. Changes here will sync when it comes back.
        </p>
      )}

      <div className="flex gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, industry, location, or contact…"
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="All">All statuses</option>
          <option value="Prospect">Prospect</option>
          <option value="Active">Active</option>
        </select>
      </div>

      {rows.length === 0 ? (
        <Empty title="No companies match" />
      ) : (
        <DataTable columns={columns} rows={rows} pageSize={10} searchable={false} />
      )}

      <QuickAdd open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </div>
  );
}
