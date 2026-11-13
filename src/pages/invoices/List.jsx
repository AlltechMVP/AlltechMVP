import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getInvoices } from '@/utils/storage';
import { fetchInvoices, reconcileInvoices, isRlsDenied } from '@/lib/pipeline';
import { useDemoClientId } from '@/lib/useDemoClientId';
import { useAuth } from '@/context/AuthContext.jsx';
import { Empty, AccessDenied } from '@/components/ui';
import DataTable from '@/components/table/DataTable.jsx';

const statusBadge = (s) => {
  const cls = {
    Draft: 'bg-gray-100 text-gray-700',
    Sent: 'bg-blue-100 text-blue-700',
    Paid: 'bg-green-100 text-green-700',
    Void: 'bg-red-100 text-red-700',
  }[s] || 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{s}</span>;
};

function overdueDays(inv) {
  if (inv.status === 'Paid' || inv.status === 'Void' || inv.status === 'Draft') return 0;
  const due = inv.dueDate || inv.issuedAt;
  if (!due) return 0;
  const diff = Math.floor((Date.now() - new Date(due).getTime()) / 86400000);
  return Math.max(0, diff);
}

// Slice 5 (thin): the invoices list reads Supabase (shared across
// sessions) with a demo-store fallback when Supabase is unreachable.
// Writes still go to the demo store and sync up from there. Each row
// carries demoInvoiceId so the View link opens the demo row the invoice
// page works on.
function attachDemoTwins(invoices) {
  const demoRows = getInvoices();
  return invoices.map((inv) => {
    const twin = demoRows.find((d) => String(d.supabaseInvoiceId) === String(inv.id))
      || demoRows.find((d) => String(d.id) === String(inv.legacyId));
    return { ...inv, demoInvoiceId: twin ? twin.id : null };
  });
}

function toRow(inv) {
  return {
    id: inv.id,
    demoInvoiceId: inv.demoInvoiceId || null,
    invoiceNumber: inv.invoiceNumber,
    clientName: inv.clientName,
    issuedAt: inv.issuedAt || '-',
    dueDate: inv.dueDate || '-',
    total: inv.total ?? 0,
    amountPaid: inv.amountPaid ?? 0,
    balanceDue: inv.balanceDue ?? 0,
    status: inv.status,
  };
}

function mapDemoRow(inv) {
  return {
    id: inv.id,
    demoInvoiceId: inv.id,
    invoiceNumber: inv.invoiceNumber,
    clientName: inv.clientName,
    issuedAt: inv.issuedAt || '-',
    dueDate: inv.dueDate || '-',
    total: inv.total ?? 0,
    amountPaid: inv.amountPaid ?? 0,
    balanceDue: inv.balanceDue ?? 0,
    status: inv.status,
  };
}

export default function InvoicesList() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [openOnly, setOpenOnly] = useState(false);
  const [data, setData] = useState([]);
  const [usingFallback, setUsingFallback] = useState(false);
  // Slice 7: an RLS denial is not an outage — show the denied state and
  // never fall back to the unscoped demo store.
  const [denied, setDenied] = useState(false);
  // A client sees only their own company's invoices. Internal staff see
  // all of them. The app filters because RLS alone does not scope the
  // demo database or the persona switcher.
  const { role } = useAuth();
  const demoClientId = useDemoClientId();
  const inScope = (inv) => role !== 'client' || inv.clientId === demoClientId;

  const loadFromSupabase = async () => {
    // Render fast from Supabase, then reconcile in the background (pushes
    // this browser's demo rows up, creates missing twins) and refresh.
    const rows = await fetchInvoices();
    setData(attachDemoTwins(rows.filter(inScope)).map(toRow));
    reconcileInvoices()
      .then((fresh) => {
        setData(attachDemoTwins(fresh.filter(inScope)).map(toRow));
      })
      .catch(() => {});
  };

  const loadFromDemo = () => {
    setData(getInvoices().filter(inScope).map(mapDemoRow));
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await loadFromSupabase();
        if (mounted) setUsingFallback(false);
      } catch (err) {
        if (isRlsDenied(err)) { if (mounted) setDenied(true); return; }
        // The shared fetch failed: try the reconcile (it re-syncs and
        // re-fetches) before falling back to local demo data.
        try {
          const rows = await reconcileInvoices();
          if (!mounted) return;
          setData(attachDemoTwins(rows.filter(inScope)).map(toRow));
          setUsingFallback(false);
        } catch (err2) {
          if (isRlsDenied(err2)) { if (mounted) setDenied(true); return; }
          if (mounted) { loadFromDemo(); setUsingFallback(true); }
        }
      }
    })();
    return () => { mounted = false; };
  }, [demoClientId, role]);

  const filtered = useMemo(() => {
    let list = data;
    if (statusFilter !== 'All') list = list.filter(i => i.status === statusFilter);
    if (openOnly) list = list.filter(i => (i.balanceDue || 0) > 0);
    return list;
  }, [data, statusFilter, openOnly]);

  const columns = [
    { key: 'invoiceNumber', header: 'Invoice #', render: (v, r) => <Link to={`/invoices/${r.demoInvoiceId || r.id}`} className="text-blue-600 hover:underline">{v}</Link> },
    { key: 'clientName', header: 'Client' },
    { key: 'issuedAt', header: 'Issued' },
    { key: 'dueDate', header: 'Due Date' },
    { key: 'total', header: 'Total', render: (v) => `$${(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
    { key: 'amountPaid', header: 'Paid', render: (v) => `$${(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
    { key: 'balanceDue', header: 'Balance Due', render: (v) => {
      const amt = v || 0;
      return <span className={amt > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>${amt.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>;
    }},
    { key: 'status', header: 'Status', render: (v, r) => {
      const od = overdueDays(r);
      return (
        <span className="flex items-center gap-1">
          {statusBadge(v)}
          {od > 0 && v === 'Sent' && <span className="px-1.5 py-0.5 rounded text-xs bg-red-100 text-red-700 font-medium">{od}d overdue</span>}
        </span>
      );
    }},
    { key: '_actions', header: '', render: (_, r) => <Link to={`/invoices/${r.demoInvoiceId || r.id}`} className="text-blue-600 hover:underline text-sm">View</Link> },
  ];

  if (denied) {
    return <AccessDenied />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Invoices</h1>
      </div>

      {usingFallback && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
          Showing local demo data — the shared invoices are unreachable right now. Changes here will sync when they come back.
        </p>
      )}

      <div className="flex items-center gap-4 mb-4">
        <label className="text-sm">
          Status:
          <select className="ml-1 border rounded px-2 py-1 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option>All</option>
            <option>Draft</option>
            <option>Sent</option>
            <option>Paid</option>
            <option>Void</option>
          </select>
        </label>
        <label className="text-sm flex items-center gap-1">
          <input type="checkbox" checked={openOnly} onChange={e => setOpenOnly(e.target.checked)} />
          Open Only (balance &gt; 0)
        </label>
      </div>

      {filtered.length === 0 ? (
        <Empty title="No invoices found" hint="Invoices will appear here once created." />
      ) : (
        <DataTable columns={columns} rows={filtered} pageSize={15} />
      )}
    </div>
  );
}
