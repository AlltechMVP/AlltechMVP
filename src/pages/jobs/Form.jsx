import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  getClients, getJobs, setJobs, getJobById, uid, now,
} from '@/utils/storage';
import { fetchJobs, fetchClients, syncJobToSupabase } from '@/lib/pipeline';
import { useToasts } from '@/components/ui/ToastProvider.jsx';

const inputCls = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

// Job-order form: opened from a company record (client pre-filled via
// ?clientId=) or from /jobs/new. Saves to the demo store first, then
// syncs write-through to Supabase (same pattern as assignments/Form.jsx).
export default function JobForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToasts();
  const isEdit = Boolean(id);
  const fromClientId = searchParams.get('clientId') || '';

  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    clientId: fromClientId,
    title: '',
    location: '',
    openings: '1',
    requirements: '',
    payRate: '',
    billRate: '',
    status: 'Open',
  });

  useEffect(() => {
    (async () => {
      const demoClients = getClients();
      setClients(demoClients);
      if (!fromClientId) {
        try {
          const supClients = await fetchClients();
          if (supClients.length > 0) {
            setClients(supClients.map((c) => ({ id: c.id, name: c.name })));
          }
        } catch { /* demo list stands */ }
      }

      if (isEdit) {
        let existing = getJobById(id)
          || getJobs().find((j) => String(j.supabaseJobId) === String(id));
        if (!existing) {
          try {
            const supJobs = await fetchJobs();
            const sup = supJobs.find((j) => String(j.id) === String(id) || j.legacyId === id);
            if (!sup) throw new Error('job not found');
            const demoClient = getClients().find((c) => String(c.supabaseClientId) === String(sup.clientId));
            existing = {
              id: sup.legacyId || String(sup.id),
              title: sup.title,
              client_name: sup.client_name,
              clientId: demoClient ? demoClient.id : 'client-001',
              location: sup.location === '—' ? '' : sup.location,
              rate: sup.rate,
              payRate: sup.payRate,
              requirements: sup.requirements || '',
              openings: sup.openings,
              status: sup.status,
              supabaseJobId: sup.id,
            };
            const all = getJobs();
            if (!all.some((j) => j.id === existing.id)) {
              all.push({ ...existing, createdAt: sup.createdAt, updatedAt: sup.updatedAt });
              setJobs(all);
            }
          } catch {
            existing = null;
          }
        }
        if (!existing) {
          addToast({ type: 'error', message: 'Order not found.' });
          navigate('/jobs');
          return;
        }
        setForm({
          clientId: existing.clientId || '',
          title: existing.title || '',
          location: existing.location || '',
          openings: existing.openings != null ? String(existing.openings) : '1',
          requirements: existing.requirements || '',
          payRate: existing.payRate != null ? String(existing.payRate) : '',
          billRate: existing.rate != null ? String(existing.rate) : '',
          status: existing.status || 'Open',
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.clientId) {
      addToast({ type: 'error', message: 'Client is required.' });
      return;
    }
    if (!form.title.trim()) {
      addToast({ type: 'error', message: 'Title is required.' });
      return;
    }
    const payRate = form.payRate ? parseFloat(form.payRate) : null;
    const billRate = form.billRate ? parseFloat(form.billRate) : null;
    if (form.payRate && (isNaN(payRate) || payRate < 0)) {
      addToast({ type: 'error', message: 'Pay Rate must be a valid positive number.' });
      return;
    }
    if (form.billRate && (isNaN(billRate) || billRate < 0)) {
      addToast({ type: 'error', message: 'Bill Rate must be a valid positive number.' });
      return;
    }
    const openings = form.openings ? parseInt(form.openings, 10) : 1;
    if (isNaN(openings) || openings < 1) {
      addToast({ type: 'error', message: 'Openings must be at least 1.' });
      return;
    }

    const client = clients.find((c) => c.id === form.clientId);
    const all = getJobs();
    const timestamp = now();

    if (isEdit) {
      const idx = all.findIndex((j) => j.id === id || String(j.supabaseJobId) === String(id));
      if (idx !== -1) {
        all[idx] = {
          ...all[idx],
          clientId: form.clientId,
          client_name: client ? client.name : all[idx].client_name,
          title: form.title.trim(),
          location: form.location.trim(),
          openings,
          requirements: form.requirements.trim(),
          payRate,
          rate: billRate,
          status: form.status,
          updatedAt: timestamp,
        };
      }
    } else {
      all.push({
        id: uid(),
        clientId: form.clientId,
        client_name: client ? client.name : '',
        title: form.title.trim(),
        location: form.location.trim(),
        openings,
        requirements: form.requirements.trim(),
        payRate,
        rate: billRate,
        status: form.status,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    setJobs(all);
    const savedJob = isEdit
      ? all.find((j) => j.id === id || String(j.supabaseJobId) === String(id))
      : all[all.length - 1];
    // Sync the job row itself to Supabase (fire-and-forget; the demo
    // write above already succeeded).
    if (savedJob) syncJobToSupabase(savedJob);
    addToast({ type: 'success', message: isEdit ? 'Order updated.' : 'Order created.' });
    if (!isEdit && fromClientId) navigate(`/companies/${fromClientId}`);
    else navigate('/jobs');
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">{isEdit ? 'Edit Order' : 'Open an Order'}</h1>

      <form onSubmit={handleSave} className="space-y-4 bg-white border rounded-xl p-6">
        <div>
          <label className={labelCls}>Client *</label>
          <select value={form.clientId} onChange={(e) => update('clientId', e.target.value)} className={inputCls}>
            <option value="">Select a client</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className={labelCls}>Job title *</label>
          <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} className={inputCls} placeholder="e.g. Warehouse Picker" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Location</label>
            <input type="text" value={form.location} onChange={(e) => update('location', e.target.value)} className={inputCls} placeholder="e.g. Dallas, TX" />
          </div>
          <div>
            <label className={labelCls}>Openings</label>
            <input type="number" min="1" step="1" value={form.openings} onChange={(e) => update('openings', e.target.value)} className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Requirements</label>
          <textarea rows={3} value={form.requirements} onChange={(e) => update('requirements', e.target.value)} className={inputCls} placeholder="e.g. Able to lift 50lbs; warehouse experience preferred" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Pay Rate ($/hr)</label>
            <input type="number" step="0.01" min="0" value={form.payRate} onChange={(e) => update('payRate', e.target.value)} className={inputCls} placeholder="0.00" />
          </div>
          <div>
            <label className={labelCls}>Bill Rate ($/hr)</label>
            <input type="number" step="0.01" min="0" value={form.billRate} onChange={(e) => update('billRate', e.target.value)} className={inputCls} placeholder="0.00" />
          </div>
        </div>

        <div>
          <label className={labelCls}>Status</label>
          <select value={form.status} onChange={(e) => update('status', e.target.value)} className={inputCls}>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            {isEdit ? 'Update Order' : 'Create Order'}
          </button>
          <button type="button" onClick={() => navigate(fromClientId ? `/companies/${fromClientId}` : '/jobs')} className="border px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
