import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  getClients, getClientById, getContactsForClient, getActivitiesForClient,
  getFollowUpsForClient, getJobsForClient, addCompanyContact, logCompanyActivity,
  scheduleFollowUp, setFollowUpDone, convertCompanyToClient,
} from '@/utils/storage';
import {
  fetchClients, fetchContacts, fetchActivities, fetchFollowUps, fetchJobs,
  reconcileClients, reconcileContacts, reconcileActivities, reconcileFollowUps,
  reconcileJobs, isRlsDenied,
} from '@/lib/pipeline';
import { useAuth } from '@/context/AuthContext.jsx';
import { useCapabilities } from '@/lib/capabilities';
import { useToasts } from '@/components/ui/ToastProvider.jsx';
import { Empty, AccessDenied } from '@/components/ui';

const inputCls = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

// Company record: details, contacts, activity timeline, follow-ups, and
// orders. Reads come from Supabase (shared across sessions) with a demo
// fallback; writes go to the demo store first and sync write-through.
export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { addToast } = useToasts();
  // Slice 7: converting a prospect and opening an order are capability
  // actions (crm.manage / jobs.manage — all internal staff by default).
  const { hasCapability } = useCapabilities();
  const userEmail = session?.user?.email || '';

  const [company, setCompany] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [denied, setDenied] = useState(false);

  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', title: '' });
  const [activityForm, setActivityForm] = useState({ type: 'call', contactId: '', subject: '', body: '' });
  const [followUpForm, setFollowUpForm] = useState({ title: '', dueDate: '', ownerEmail: userEmail });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await reconcileClients();
        await reconcileContacts();
        await reconcileActivities();
        await reconcileFollowUps();
        await reconcileJobs();
        const supClients = await fetchClients();
        if (!mounted) return;
        const c = getClientById(id)
          || getClients().find((x) => String(x.supabaseClientId) === String(id))
          || supClients.find((x) => String(x.supabaseClientId) === String(id))
          || supClients.find((x) => x.id === id);
        if (!c) { setNotFound(true); setLoading(false); return; }
        setCompany(c);
        const supId = c.supabaseClientId;
        const [cts, acts, fus, jbs] = await Promise.all([
          supId ? fetchContacts(supId) : Promise.resolve([]),
          supId ? fetchActivities(supId) : Promise.resolve([]),
          supId ? fetchFollowUps(supId) : Promise.resolve([]),
          fetchJobs(),
        ]);
        if (!mounted) return;
        setContacts(cts);
        setActivities(acts);
        setFollowUps(fus);
        setOrders(jbs.filter((j) => String(j.clientId) === String(supId)));
      } catch (err) {
        if (isRlsDenied(err)) {
          if (mounted) { setDenied(true); setLoading(false); }
          return;
        }
        if (!mounted) return;
        const c = getClientById(id) || getClients().find((x) => String(x.supabaseClientId) === String(id));
        if (!c) { setNotFound(true); setLoading(false); return; }
        setCompany(c);
        setContacts(getContactsForClient(c.id));
        setActivities(getActivitiesForClient(c.id));
        setFollowUps(getFollowUpsForClient(c.id));
        setOrders(getJobsForClient(c.id));
        setUsingFallback(true);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const contactNameFor = (activity) => {
    if (!activity.contactId) return '';
    const hit = contacts.find(
      (ct) => String(ct.supabaseContactId) === String(activity.contactId) || ct.id === activity.contactId
    );
    return hit ? hit.name : '';
  };

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!contactForm.name.trim()) {
      addToast({ message: 'Contact name is required.', kind: 'error' });
      return;
    }
    const created = addCompanyContact({
      clientId: company.id,
      ...contactForm,
      isPrimary: contacts.length === 0,
    });
    setContacts((prev) => [...prev, created]);
    setContactForm({ name: '', email: '', phone: '', title: '' });
    addToast({ message: `Contact ${created.name} added.`, kind: 'success' });
  };

  const handleLogActivity = (e) => {
    e.preventDefault();
    if (!activityForm.subject.trim()) {
      addToast({ message: 'A subject is required to log an activity.', kind: 'error' });
      return;
    }
    const created = logCompanyActivity({
      clientId: company.id,
      contactId: activityForm.contactId || null,
      type: activityForm.type,
      subject: activityForm.subject,
      body: activityForm.body,
      by: userEmail,
    });
    setActivities((prev) => [created, ...prev]);
    setActivityForm({ type: 'call', contactId: '', subject: '', body: '' });
    addToast({ message: 'Activity logged.', kind: 'success' });
  };

  const handleScheduleFollowUp = (e) => {
    e.preventDefault();
    if (!followUpForm.title.trim()) {
      addToast({ message: 'A title is required to schedule a follow-up.', kind: 'error' });
      return;
    }
    const created = scheduleFollowUp({
      clientId: company.id,
      title: followUpForm.title,
      dueDate: followUpForm.dueDate,
      ownerEmail: followUpForm.ownerEmail || userEmail,
    });
    setFollowUps((prev) => [...prev, created]);
    setFollowUpForm({ title: '', dueDate: '', ownerEmail: userEmail });
    addToast({ message: 'Follow-up scheduled.', kind: 'success' });
  };

  const handleToggleFollowUp = (f) => {
    const updated = setFollowUpDone(f.id, !f.done);
    if (updated) {
      setFollowUps((prev) => prev.map((x) => (x.id === f.id ? updated : x)));
    }
  };

  const handleConvert = () => {
    const { client, activity } = convertCompanyToClient(company.id, userEmail) || {};
    if (!client) return;
    setCompany(client);
    if (activity) setActivities((prev) => [activity, ...prev]);
    addToast({ message: `${client.name} is now an Active client — same record, same history.`, kind: 'success' });
  };

  if (denied) return <AccessDenied />;
  if (loading) return <div className="p-4">Loading company…</div>;
  if (notFound || !company) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <Empty title="Company not found" />
        <Link to="/companies" className="text-blue-600 hover:underline text-sm">Back to Companies</Link>
      </div>
    );
  }

  const primaryContact = contacts.find((c) => c.isPrimary);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <Link to="/companies" className="text-blue-600 hover:underline text-sm">← Companies</Link>

      <div className="flex items-start justify-between mt-2 mb-4">
        <div>
          <h1 className="text-xl font-semibold">{company.name}</h1>
          <p className="text-sm text-gray-600">
            {[company.industry, company.location].filter(Boolean).join(' · ') || '—'}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Primary contact: {company.contactPerson || primaryContact?.name || '—'}
            {company.contactEmail ? ` (${company.contactEmail})` : primaryContact?.email ? ` (${primaryContact.email})` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${company.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
            {company.status}
          </span>
          {company.status === 'Prospect' && hasCapability('crm.manage') && (
            <button onClick={handleConvert} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
              Convert to Client
            </button>
          )}
        </div>
      </div>

      {usingFallback && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
          Showing local demo data — the shared store is unreachable right now. Changes here will sync when it comes back.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contacts */}
        <section className="bg-white border rounded-xl p-4">
          <h2 className="text-base font-semibold mb-3">Contacts</h2>
          {contacts.length === 0 ? (
            <p className="text-sm text-gray-500 mb-3">No contacts in the contacts table yet — the primary contact above comes from the company record.</p>
          ) : (
            <ul className="space-y-2 mb-4">
              {contacts.map((c) => (
                <li key={c.id} className="text-sm border-b pb-2">
                  <span className="font-medium">{c.name}</span>
                  {c.isPrimary && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Primary</span>}
                  {c.title && <span className="text-gray-600"> · {c.title}</span>}
                  <span className="block text-gray-600">{[c.email, c.phone].filter(Boolean).join(' · ')}</span>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={handleAddContact} className="space-y-3 border-t pt-3">
            <p className="text-sm font-medium">Add a contact</p>
            <div>
              <label className={labelCls}>Name *</label>
              <input value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} className={inputCls} placeholder="Full name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input type="tel" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Title</label>
              <input value={contactForm.title} onChange={(e) => setContactForm({ ...contactForm, title: e.target.value })} className={inputCls} placeholder="e.g. Hiring Manager" />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Add contact</button>
          </form>
        </section>

        {/* Follow-ups */}
        <section className="bg-white border rounded-xl p-4">
          <h2 className="text-base font-semibold mb-3">Follow-ups</h2>
          {followUps.length === 0 ? (
            <p className="text-sm text-gray-500 mb-3">No follow-ups scheduled.</p>
          ) : (
            <ul className="space-y-2 mb-4">
              {followUps.map((f) => (
                <li key={f.id} className="text-sm border-b pb-2 flex items-start justify-between gap-2">
                  <div>
                    <span className={`font-medium ${f.done ? 'line-through text-gray-500' : ''}`}>{f.title}</span>
                    <span className="block text-gray-600">
                      {[f.dueDate ? `Due ${f.dueDate}` : null, f.ownerEmail].filter(Boolean).join(' · ') || 'No due date'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleFollowUp(f)}
                    className="text-blue-600 hover:underline text-xs font-medium whitespace-nowrap"
                  >
                    {f.done ? 'Reopen' : 'Mark done'}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={handleScheduleFollowUp} className="space-y-3 border-t pt-3">
            <p className="text-sm font-medium">Schedule a follow-up</p>
            <div>
              <label className={labelCls}>Title *</label>
              <input value={followUpForm.title} onChange={(e) => setFollowUpForm({ ...followUpForm, title: e.target.value })} className={inputCls} placeholder="e.g. Send rate card" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Due date</label>
                <input type="date" value={followUpForm.dueDate} onChange={(e) => setFollowUpForm({ ...followUpForm, dueDate: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Owner</label>
                <input type="email" value={followUpForm.ownerEmail} onChange={(e) => setFollowUpForm({ ...followUpForm, ownerEmail: e.target.value })} className={inputCls} placeholder="owner@email.com" />
              </div>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Schedule follow-up</button>
          </form>
        </section>
      </div>

      {/* Activity timeline */}
      <section className="bg-white border rounded-xl p-4 mt-6">
        <h2 className="text-base font-semibold mb-3">Activity</h2>
        {activities.length === 0 ? (
          <p className="text-sm text-gray-500 mb-3">No activity logged yet.</p>
        ) : (
          <ul className="space-y-3 mb-4">
            {activities.map((a) => (
              <li key={a.id} className="text-sm border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">{a.type}</span>
                  <span className="font-medium">{a.subject || '(no subject)'}</span>
                  <span className="text-gray-500 text-xs ml-auto">
                    {a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}
                    {a.createdBy ? ` · ${a.createdBy}` : ''}
                  </span>
                </div>
                {a.body && <p className="text-gray-700 mt-1 whitespace-pre-wrap">{a.body}</p>}
                {contactNameFor(a) && <p className="text-gray-500 text-xs mt-1">With: {contactNameFor(a)}</p>}
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={handleLogActivity} className="space-y-3 border-t pt-3">
          <p className="text-sm font-medium">Log an activity</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Type</label>
              <select value={activityForm.type} onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })} className={inputCls}>
                <option value="call">Call</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
                <option value="note">Note</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Contact (optional)</label>
              <select value={activityForm.contactId} onChange={(e) => setActivityForm({ ...activityForm, contactId: e.target.value })} className={inputCls}>
                <option value="">—</option>
                {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Subject *</label>
            <input value={activityForm.subject} onChange={(e) => setActivityForm({ ...activityForm, subject: e.target.value })} className={inputCls} placeholder="e.g. Intro call — needs 2 warehouse pickers" />
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <textarea rows={2} value={activityForm.body} onChange={(e) => setActivityForm({ ...activityForm, body: e.target.value })} className={inputCls} placeholder="What was discussed…" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Log activity</button>
        </form>
      </section>

      {/* Orders */}
      <section className="bg-white border rounded-xl p-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Orders</h2>
          {hasCapability('jobs.manage') && (
            <button onClick={() => navigate(`/jobs/new?clientId=${company.id}`)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              Open an Order
            </button>
          )}
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-gray-500">No orders yet for this company.</p>
        ) : (
          <ul className="space-y-2">
            {orders.map((j) => (
              <li key={j.id} className="text-sm border-b pb-2 flex items-center justify-between gap-2">
                <div>
                  <Link to={`/jobs/${j.id}/candidates`} className="text-blue-600 hover:underline font-medium">{j.title}</Link>
                  <span className="block text-gray-600">
                    {[j.location, j.rate ? `$${j.rate}/hr bill` : null, j.payRate != null ? `$${j.payRate}/hr pay` : null, `${j.openings ?? '—'} opening(s)`, j.status].filter(Boolean).join(' · ')}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${j.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{j.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
