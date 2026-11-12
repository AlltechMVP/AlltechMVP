import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getInvoiceById, getPaymentsForInvoice, postPayment, getInvoices, setInvoices, getPayments, uid, now, getClientById } from '@/utils/storage';
import { fetchInvoice, fetchPaymentsForInvoice, reconcileInvoices, syncInvoiceToSupabase, syncPaymentToSupabase } from '@/lib/pipeline';
import { useToasts } from '@/components/ui/ToastProvider.jsx';

const statusBadge = (s) => {
  const cls = {
    Draft: 'bg-gray-100 text-gray-700',
    Sent: 'bg-blue-100 text-blue-700',
    Paid: 'bg-green-100 text-green-700',
    Void: 'bg-red-100 text-red-700',
  }[s] || 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{s}</span>;
};

// Slice 5 (thin): the invoice detail reads Supabase (shared across
// sessions) with a demo-store fallback when Supabase is unreachable.
// Writes still go to the demo store (the canonical write path) and sync
// up from there: Send flips the demo invoice, Post Payment appends a demo
// payment and updates the demo invoice totals.
export default function InvoiceView() {
  const { id } = useParams();
  const { addToast } = useToasts();
  const [invoice, setInvoice] = useState(null);
  const [payments, setPayments] = useState([]);
  const [usingFallback, setUsingFallback] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('ACH');
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().slice(0, 10));
  const [memo, setMemo] = useState('');
  const [error, setError] = useState('');

  // Resolve the demo row (the write target) by demo id, then by its
  // Supabase id; if neither exists locally, reconcile (which creates the
  // demo twin) and look again.
  const resolveDemoInvoice = async () => {
    let demo = getInvoiceById(id)
      || getInvoices().find((i) => String(i.supabaseInvoiceId) === String(id));
    if (!demo) {
      try {
        await reconcileInvoices();
        demo = getInvoiceById(id)
          || getInvoices().find((i) => String(i.supabaseInvoiceId) === String(id));
      } catch {
        demo = null;
      }
    }
    return demo;
  };

  const reload = async () => {
    const demo = await resolveDemoInvoice();
    if (!demo) { setInvoice(null); setPayments([]); return; }
    try {
      const row = await fetchInvoice(demo.supabaseInvoiceId || demo.id);
      const mapped = {
        ...row,
        demoInvoiceId: demo.id,
      };
      setInvoice(mapped);
      setPayments(await fetchPaymentsForInvoice(row.id));
      setUsingFallback(false);
    } catch {
      setInvoice({ ...demo, demoInvoiceId: demo.id });
      setPayments(getPaymentsForInvoice(demo.id));
      setUsingFallback(true);
    }
  };

  useEffect(() => { reload(); }, [id]);

  if (!invoice) return <div className="p-6">Invoice not found. <Link to="/invoices" className="text-blue-600 hover:underline">Back to Invoices</Link></div>;

  const balanceDue = invoice.balanceDue ?? (invoice.total - (invoice.amountPaid || 0));

  const handleSubmitPayment = (e) => {
    e.preventDefault();
    setError('');
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { setError('Amount must be greater than 0.'); return; }
    if (amt > balanceDue) { setError(`Amount cannot exceed balance due ($${balanceDue.toFixed(2)}).`); return; }

    const demoId = invoice.demoInvoiceId || invoice.id;
    const payment = {
      id: `pmt-${uid()}`,
      clientId: invoice.clientId,
      invoiceId: demoId,
      amount: amt,
      method,
      receivedDate,
      memo,
      createdAt: now(),
      updatedAt: now(),
    };

    postPayment(payment);
    // Sync the payment up (which also re-syncs the parent invoice totals).
    syncPaymentToSupabase(payment);
    addToast(amt === balanceDue ? 'Payment posted — invoice is now Paid!' : `Partial payment of $${amt.toFixed(2)} posted.`, amt === balanceDue ? 'success' : 'info');
    setShowForm(false);
    setAmount('');
    setMemo('');
    // Show the demo result in place — do not refetch, the sync may not
    // have landed yet and a stale fetch would overwrite the new totals.
    const updated = getInvoiceById(demoId);
    if (updated) setInvoice({ ...updated, demoInvoiceId: updated.id });
    setPayments(getPaymentsForInvoice(demoId));
  };

  const sendInvoice = async () => {
    const demo = await resolveDemoInvoice();
    if (!demo) return;
    const all = getInvoices();
    const idx = all.findIndex(i => i.id === demo.id);
    if (idx === -1) return;
    all[idx].status = 'Sent';
    all[idx].updatedAt = now();
    setInvoices(all);
    // Sync the status flip up (fire-and-forget; the demo write succeeded).
    syncInvoiceToSupabase(all[idx]);
    addToast('Invoice sent.', 'success');
    // Show the demo result in place — do not refetch, the sync may not
    // have landed yet and a stale fetch would overwrite the new status.
    setInvoice({ ...all[idx], demoInvoiceId: all[idx].id });
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-4">
        <Link to="/invoices" className="text-blue-600 hover:underline text-sm">&larr; Back to Invoices</Link>
      </div>

      {usingFallback && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
          Showing local demo data — the shared invoice is unreachable right now. Changes here will sync when it comes back.
        </p>
      )}

      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
            <p className="text-gray-600">{invoice.clientName}</p>
          </div>
          <div className="text-right">
            {statusBadge(invoice.status)}
            {invoice.status === 'Draft' && (
              <button onClick={sendInvoice} className="mt-2 ml-auto block bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">
                Send Invoice
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
          <div>
            <span className="text-gray-500">Issued</span>
            <div className="font-medium">{invoice.issuedAt}</div>
          </div>
          <div>
            <span className="text-gray-500">Due Date</span>
            <div className="font-medium">{invoice.dueDate}</div>
          </div>
          <div>
            <span className="text-gray-500">Total</span>
            <div className="font-medium">${(invoice.total || 0).toFixed(2)}</div>
          </div>
          <div>
            <span className="text-gray-500">Balance Due</span>
            <div className={`font-bold text-lg ${balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>${balanceDue.toFixed(2)}</div>
          </div>
        </div>

        <h3 className="font-semibold mb-2 text-sm text-gray-500 uppercase">Line Items</h3>
        <table className="min-w-full text-sm border rounded mb-4">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2">Description</th>
              <th className="text-right px-3 py-2">Hours</th>
              <th className="text-right px-3 py-2">Rate</th>
              <th className="text-right px-3 py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.lineItems || []).map((li, i) => (
              <tr key={i} className={i % 2 ? 'bg-white' : 'bg-gray-50/40'}>
                <td className="px-3 py-2">{li.description}</td>
                <td className="px-3 py-2 text-right">{li.hours}</td>
                <td className="px-3 py-2 text-right">${(li.rate || 0).toFixed(2)}</td>
                <td className="px-3 py-2 text-right">${(li.amount || 0).toFixed(2)}</td>
              </tr>
            ))}
            <tr className="font-bold border-t">
              <td className="px-3 py-2" colSpan={3}>Total</td>
              <td className="px-3 py-2 text-right">${(invoice.total || 0).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Payment History</h2>
          {balanceDue > 0 && invoice.status !== 'Void' && invoice.status !== 'Draft' && (
            <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
              {showForm ? 'Cancel' : 'Post Payment'}
            </button>
          )}
        </div>

        {payments.length === 0 ? (
          <p className="text-gray-500 text-sm">No payments recorded.</p>
        ) : (
          <table className="min-w-full text-sm border rounded">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">Date</th>
                <th className="text-left px-3 py-2">Method</th>
                <th className="text-right px-3 py-2">Amount</th>
                <th className="text-left px-3 py-2">Memo</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={p.id} className={i % 2 ? 'bg-white' : 'bg-gray-50/40'}>
                  <td className="px-3 py-2">{p.receivedDate}</td>
                  <td className="px-3 py-2">{p.method || '-'}</td>
                  <td className="px-3 py-2 text-right text-green-700 font-medium">${(p.amount || 0).toFixed(2)}</td>
                  <td className="px-3 py-2 text-gray-600">{p.memo || '-'}</td>
                </tr>
              ))}
              <tr className="font-bold border-t">
                <td className="px-3 py-2" colSpan={2}>Total Paid</td>
                <td className="px-3 py-2 text-right text-green-700">${(invoice.amountPaid || 0).toFixed(2)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        )}

        {showForm && (
          <form onSubmit={handleSubmitPayment} className="mt-4 border-t pt-4">
            <h3 className="font-medium mb-3">Post Payment</h3>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-2 rounded mb-3">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={balanceDue}
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder={`Max: $${balanceDue.toFixed(2)}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                <select className="w-full border rounded px-3 py-2 text-sm" value={method} onChange={e => setMethod(e.target.value)}>
                  <option>ACH</option>
                  <option>Check</option>
                  <option>Wire</option>
                  <option>Card</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Received</label>
                <input type="date" className="w-full border rounded px-3 py-2 text-sm" value={receivedDate} onChange={e => setReceivedDate(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Memo</label>
                <input type="text" className="w-full border rounded px-3 py-2 text-sm" value={memo} onChange={e => setMemo(e.target.value)} placeholder="Optional note" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">Submit Payment</button>
              <button type="button" onClick={() => { setShowForm(false); setError(''); }} className="border px-4 py-2 rounded text-sm hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
