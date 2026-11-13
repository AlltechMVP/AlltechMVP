import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getClients, getContacts, createCompany } from '@/utils/storage';
import { useToasts } from '@/components/ui/ToastProvider.jsx';

const inputCls = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

// Quick Add Prospect/Client: short required fields, live duplicate flag.
// A company created here starts as a Prospect (convert it on its record);
// the status can be set to Active directly when the company is already a
// client. The primary contact is saved both as the company's display
// contact and as a row in the contacts table.
export function QuickAddForm({ onCancel, onCreated }) {
  const navigate = useNavigate();
  const { addToast } = useToasts();
  const [form, setForm] = useState({
    name: '',
    industry: '',
    location: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    status: 'Prospect',
  });
  const [error, setError] = useState('');

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  // Live duplicate flag: same name (case-insensitive) or same primary
  // contact email as an existing company.
  const duplicates = useMemo(() => {
    const name = form.name.trim().toLowerCase();
    const email = form.contactEmail.trim().toLowerCase();
    if (!name && !email) return [];
    const clients = getClients();
    const contacts = getContacts();
    const hits = [];
    for (const c of clients) {
      const nameHit = name && (c.name || '').trim().toLowerCase() === name;
      const emailHit = email && (c.contactEmail || '').trim().toLowerCase() === email;
      if (nameHit || emailHit) {
        hits.push({ client: c, reason: nameHit && emailHit ? 'Same name and contact email' : nameHit ? 'Same company name' : 'Same contact email' });
      }
    }
    if (email && hits.length === 0) {
      const contactHit = contacts.find((ct) => (ct.email || '').trim().toLowerCase() === email);
      if (contactHit) {
        const c = clients.find((cl) => cl.id === contactHit.clientId);
        if (c) hits.push({ client: c, reason: 'Contact email already belongs to this company' });
      }
    }
    return hits;
  }, [form.name, form.contactEmail]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Company name is required.');
      return;
    }
    const { client } = createCompany(form);
    addToast({ message: `${client.name} added as a ${client.status}.`, kind: 'success' });
    if (onCreated) onCreated(client);
    else navigate(`/companies/${client.id}`);
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <label className={labelCls}>Company name *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          className={inputCls}
          placeholder="e.g. Northwind Traders"
          autoFocus
        />
      </div>

      {duplicates.length > 0 && (
        <div className="border border-amber-300 bg-amber-50 rounded-lg px-3 py-2 text-sm">
          <p className="font-medium text-amber-800">Likely duplicate — a matching company already exists:</p>
          <ul className="mt-1 space-y-1">
            {duplicates.map((d) => (
              <li key={d.client.id}>
                <Link to={`/companies/${d.client.id}`} className="text-blue-700 hover:underline font-medium">
                  {d.client.name}
                </Link>
                <span className="text-amber-800"> — {d.reason}</span>
              </li>
            ))}
          </ul>
          <p className="text-amber-700 mt-1">Open the existing record instead of creating a duplicate, or keep going to create a new one.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Industry</label>
          <input type="text" value={form.industry} onChange={(e) => update('industry', e.target.value)} className={inputCls} placeholder="e.g. Manufacturing" />
        </div>
        <div>
          <label className={labelCls}>Location</label>
          <input type="text" value={form.location} onChange={(e) => update('location', e.target.value)} className={inputCls} placeholder="e.g. Dallas, TX" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Status</label>
        <select value={form.status} onChange={(e) => update('status', e.target.value)} className={inputCls}>
          <option value="Prospect">Prospect</option>
          <option value="Active">Active client</option>
        </select>
      </div>

      <div className="border-t pt-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Primary contact</p>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Contact name</label>
            <input type="text" value={form.contactName} onChange={(e) => update('contactName', e.target.value)} className={inputCls} placeholder="e.g. Alex Rivera" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Contact email</label>
              <input type="email" value={form.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} className={inputCls} placeholder="alex@company.com" />
            </div>
            <div>
              <label className={labelCls}>Contact phone</label>
              <input type="tel" value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} className={inputCls} placeholder="555-0100" />
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          Add company
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="border px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

// Modal wrapper used from the nav and the Companies page. After creation
// it navigates to the new company record.
export default function QuickAdd({ open, onClose }) {
  const navigate = useNavigate();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg mt-10 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Quick Add Prospect / Client</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl leading-none" aria-label="Close">×</button>
        </div>
        <QuickAddForm
          onCancel={onClose}
          onCreated={(client) => {
            onClose();
            navigate(`/companies/${client.id}`);
          }}
        />
      </div>
    </div>
  );
}
