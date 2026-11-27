import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getInvoices, getClients } from '@/utils/storage';
import { formatMoney as fmt } from '@/utils/money';
import { reconcileInvoices, fetchSettledOrLocal, isRlsDenied } from '@/lib/pipeline';
import DataTable from '@/components/table/DataTable.jsx';
import { AccessDenied } from '@/components/ui';

// AR Aging buckets, by DUE DATE (the invoice's dueDate, falling back to
// issuedAt only when no due date exists): Current = not yet due or up to
// 30 days past due; 31–60 / 61–90 / 90+ by days past due. Total Open AR
// is the sum of Balance Due over every invoice the Invoices list shows —
// all statuses except Paid/Void, Drafts included — so the two pages
// reconcile. (Drafts used to be excluded here while the list counted
// their balances, which understated Open AR by exactly the Draft
// balances: INV-2026-009 + INV-2026-010.)
function computeAgingBuckets(invoices) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const clientMap = {};

  invoices.forEach(inv => {
    if (inv.status === 'Paid' || inv.status === 'Void') return;
    const bal = inv.balanceDue ?? ((inv.total || 0) - (inv.amountPaid || 0));
    if (bal <= 0) return;

    const dueStr = inv.dueDate || inv.issuedAt;
    if (!dueStr) return;
    const dueDate = new Date(dueStr);
    dueDate.setHours(0, 0, 0, 0);
    const ageDays = Math.floor((today - dueDate) / 86400000);

    if (!clientMap[inv.clientId]) {
      clientMap[inv.clientId] = {
        clientId: inv.clientId,
        clientName: inv.clientName || inv.clientId,
        openAR: 0,
        current: 0,
        d31_60: 0,
        d61_90: 0,
        d90plus: 0,
        invoiceCount: 0,
      };
    }

    const c = clientMap[inv.clientId];
    c.openAR += bal;
    c.invoiceCount += 1;

    if (ageDays <= 0) c.current += bal;
    else if (ageDays <= 30) c.current += bal;
    else if (ageDays <= 60) c.d31_60 += bal;
    else if (ageDays <= 90) c.d61_90 += bal;
    else c.d90plus += bal;
  });

  return Object.values(clientMap).sort((a, b) => b.openAR - a.openAR || String(a.clientName).localeCompare(String(b.clientName)));
}

// Slice 5 (thin): AR aging reads Supabase invoices (shared across
// sessions) with a demo-store fallback when Supabase is unreachable.
// The bucket math is unchanged — it runs on the mapped rows.
function attachDemoTwins(invoices) {
  const demoRows = getInvoices();
  return invoices.map((inv) => {
    const twin = demoRows.find((d) => String(d.supabaseInvoiceId) === String(inv.id))
      || demoRows.find((d) => String(d.id) === String(inv.legacyId));
    return { ...inv, demoInvoiceId: twin ? twin.id : null };
  });
}

export default function ArAging() {
  const [data, setData] = useState([]);
  const [drillClient, setDrillClient] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [usingFallback, setUsingFallback] = useState(false);
  // Slice 7: an RLS denial is not an outage — show the denied state and
  // never fall back to the unscoped demo store.
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let mounted = true;
    const apply = (allInv) => {
      if (!mounted) return;
      setInvoices(allInv);
      setData(computeAgingBuckets(allInv));
    };
    (async () => {
      try {
        // One settled render: reconcile first, then paint once. Rendering
        // the raw fetch first and the reconcile second flashed two
        // different row sets in sequence — the same first-load flicker
        // the payroll pages had — and the two renders could disagree on
        // buckets when the seed dates differed between stores.
        //
        // The shared read must not silently paint $0: the demo RLS policy
        // filters unauthenticated requests with HTTP 200 and no error, so
        // a fetch that goes out before the auth session settles looks
        // exactly like "no rows". fetchSettledOrLocal retries once after
        // the session settles and otherwise falls back to the demo store
        // (the designed fallback) instead of painting an empty page.
        const { rows, usingFallback } = await fetchSettledOrLocal(reconcileInvoices, getInvoices);
        let finalRows = attachDemoTwins(rows);
        let fb = usingFallback;
        // The shared read must never paint $0 while the demo store holds
        // open invoices: the 2026-11-23 live run showed $0 with no
        // fallback note, and the fetch path could not be made to
        // reproduce it with a valid session (it computes $21,150) — so
        // whatever raced there, the page now checks the COMPUTED result,
        // not just the row count. If the reconciled rows bucket to
        // nothing but the local store has open receivables, fall back to
        // the local rows and say so instead of painting an empty page.
        if (!fb && computeAgingBuckets(finalRows).length === 0) {
          const local = getInvoices();
          if (computeAgingBuckets(local).length > 0) {
            finalRows = attachDemoTwins(local);
            fb = true;
          }
        }
        apply(finalRows);
        setUsingFallback(fb);
      } catch (err) {
        if (isRlsDenied(err)) { if (mounted) setDenied(true); return; }
        if (mounted) { apply(getInvoices()); setUsingFallback(true); }
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = useMemo(() => {
    return data.reduce((t, r) => ({
      openAR: t.openAR + r.openAR,
      current: t.current + r.current,
      d31_60: t.d31_60 + r.d31_60,
      d61_90: t.d61_90 + r.d61_90,
      d90plus: t.d90plus + r.d90plus,
    }), { openAR: 0, current: 0, d31_60: 0, d61_90: 0, d90plus: 0 });
  }, [data]);

  const drillInvoices = useMemo(() => {
    if (!drillClient) return [];
    return invoices
      .filter(i => i.clientId === drillClient && i.status !== 'Paid' && i.status !== 'Void' && (i.balanceDue ?? ((i.total || 0) - (i.amountPaid || 0))) > 0)
      .sort((a, b) => {
        const aDue = new Date(a.dueDate || a.issuedAt);
        const bDue = new Date(b.dueDate || b.issuedAt);
        return aDue - bDue;
      });
  }, [drillClient, invoices]);

  const drillClientName = drillClient ? (data.find(d => d.clientId === drillClient)?.clientName || drillClient) : '';

  if (denied) {
    return <AccessDenied />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">AR Aging / Collections</h1>
      <p className="text-gray-500 text-sm mb-6">Accounts receivable aging by client. Click a client to see their open invoices.</p>

      {usingFallback && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
          Showing local demo data — the shared invoices are unreachable right now.
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase">Total Open AR</div>
          <div className="text-xl font-bold text-gray-900">{fmt(totals.openAR)}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase">Current (0-30)</div>
          <div className="text-xl font-bold text-green-700">{fmt(totals.current)}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase">31-60 Days</div>
          <div className="text-xl font-bold text-yellow-600">{fmt(totals.d31_60)}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase">61-90 Days</div>
          <div className="text-xl font-bold text-orange-600">{fmt(totals.d61_90)}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase">90+ Days</div>
          <div className="text-xl font-bold text-red-600">{fmt(totals.d90plus)}</div>
        </div>
      </div>

      <div className="overflow-auto border rounded-lg mb-6">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left font-medium px-3 py-2">Client</th>
              <th className="text-right font-medium px-3 py-2">Open AR</th>
              <th className="text-right font-medium px-3 py-2">Current (0-30)</th>
              <th className="text-right font-medium px-3 py-2">31-60</th>
              <th className="text-right font-medium px-3 py-2">61-90</th>
              <th className="text-right font-medium px-3 py-2">90+</th>
              <th className="text-center font-medium px-3 py-2">Invoices</th>
              <th className="text-left font-medium px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={8} className="px-3 py-4 text-center text-gray-500">No open receivables.</td></tr>
            ) : data.map((r, i) => (
              <tr key={r.clientId} className={`${i % 2 ? 'bg-white' : 'bg-gray-50/40'} ${drillClient === r.clientId ? 'ring-2 ring-blue-300' : ''}`}>
                <td className="px-3 py-2 font-medium">{r.clientName}</td>
                <td className="px-3 py-2 text-right font-bold">{fmt(r.openAR)}</td>
                <td className="px-3 py-2 text-right text-green-700">{r.current > 0 ? fmt(r.current) : '-'}</td>
                <td className="px-3 py-2 text-right text-yellow-600">{r.d31_60 > 0 ? fmt(r.d31_60) : '-'}</td>
                <td className="px-3 py-2 text-right text-orange-600">{r.d61_90 > 0 ? fmt(r.d61_90) : '-'}</td>
                <td className="px-3 py-2 text-right text-red-600">{r.d90plus > 0 ? fmt(r.d90plus) : '-'}</td>
                <td className="px-3 py-2 text-center">{r.invoiceCount}</td>
                <td className="px-3 py-2">
                  <button onClick={() => setDrillClient(drillClient === r.clientId ? null : r.clientId)} className="text-blue-600 hover:underline text-sm">
                    {drillClient === r.clientId ? 'Hide' : 'View Invoices'}
                  </button>
                </td>
              </tr>
            ))}
            {data.length > 0 && (
              <tr className="font-bold border-t-2 bg-gray-100">
                <td className="px-3 py-2">Total</td>
                <td className="px-3 py-2 text-right">{fmt(totals.openAR)}</td>
                <td className="px-3 py-2 text-right text-green-700">{fmt(totals.current)}</td>
                <td className="px-3 py-2 text-right text-yellow-600">{fmt(totals.d31_60)}</td>
                <td className="px-3 py-2 text-right text-orange-600">{fmt(totals.d61_90)}</td>
                <td className="px-3 py-2 text-right text-red-600">{fmt(totals.d90plus)}</td>
                <td className="px-3 py-2 text-center">{data.reduce((s, r) => s + r.invoiceCount, 0)}</td>
                <td></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {drillClient && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3">Open Invoices — {drillClientName}</h2>
          {drillInvoices.length === 0 ? (
            <p className="text-gray-500 text-sm">No open invoices for this client.</p>
          ) : (
            <table className="min-w-full text-sm border rounded">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2">Invoice #</th>
                  <th className="text-left px-3 py-2">Due Date</th>
                  <th className="text-right px-3 py-2">Total</th>
                  <th className="text-right px-3 py-2">Paid</th>
                  <th className="text-right px-3 py-2">Balance Due</th>
                  <th className="text-right px-3 py-2">Overdue</th>
                  <th className="text-left px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {drillInvoices.map((inv, i) => {
                  const bal = inv.balanceDue ?? ((inv.total || 0) - (inv.amountPaid || 0));
                  const dueStr = inv.dueDate || inv.issuedAt;
                  const od = dueStr ? Math.max(0, Math.floor((Date.now() - new Date(dueStr).getTime()) / 86400000)) : 0;
                  return (
                    <tr key={inv.id} className={i % 2 ? 'bg-white' : 'bg-gray-50/40'}>
                      <td className="px-3 py-2"><Link to={`/invoices/${inv.demoInvoiceId || inv.id}`} className="text-blue-600 hover:underline">{inv.invoiceNumber}</Link></td>
                      <td className="px-3 py-2">{inv.dueDate || '-'}</td>
                      <td className="px-3 py-2 text-right">{fmt(inv.total)}</td>
                      <td className="px-3 py-2 text-right">{fmt(inv.amountPaid)}</td>
                      <td className="px-3 py-2 text-right text-red-600 font-medium">{fmt(bal)}</td>
                      <td className="px-3 py-2 text-right">
                        {od > 0 ? <span className="text-red-600 font-medium">{od} days</span> : <span className="text-green-600">Current</span>}
                      </td>
                      <td className="px-3 py-2"><Link to={`/invoices/${inv.demoInvoiceId || inv.id}`} className="text-blue-600 hover:underline text-sm">Post Payment</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
