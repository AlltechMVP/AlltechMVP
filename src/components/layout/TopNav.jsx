import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext.jsx';
import { isDev } from '@/config/dev';
import AssistantPanel from '@/components/ai/AssistantPanel.jsx';

const DEV_ROLES = [
  { value: 'recruiter', label: 'Recruiter' },
  { value: 'client', label: 'Client' },
  { value: 'candidate', label: 'Candidate' },
  { value: 'ceo', label: 'CEO' },
  { value: 'cfo', label: 'CFO' },
  { value: 'director', label: 'Director' },
  { value: 'branch-manager', label: 'Branch Mgr' },
  { value: 'sales-rep', label: 'Sales Rep' },
  { value: 'sales-manager', label: 'Sales Mgr' },
  { value: 'backoffice', label: 'Backoffice' },
  { value: 'admin', label: 'Admin' },
];

export default function TopNav() {
  const { profile, role, roleOverride, setRoleOverride, signOut } = useAuth();
  const [assistantOpen, setAssistantOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setAssistantOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="w-full border-b bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="font-semibold">Alltech</div>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 text-xs border rounded" onClick={() => setAssistantOpen(true)}>Help</button>
          {profile?.email && (
            <span className="text-sm text-gray-600" title={profile.email}>
              {role ? `${role} · ` : ''}{profile.email}
            </span>
          )}
          {/* Slice 7: the dev role override renders ONLY in dev. It changes
              only the role used for navigation, not the signed-in account.
              It stays for local development and isolated demos with
              synthetic data; production (and anywhere real customer data
              is used) never shows it. */}
          {isDev && (
          <div
            className="flex items-center gap-1 border border-amber-400 bg-amber-50 rounded px-1 py-0.5"
            title="Dev-only role override for testing. It changes only the role used for navigation, not the signed-in account. Clear it before real use."
          >
            <span className="text-[10px] uppercase tracking-wide text-amber-700 px-1">Dev role</span>
            {DEV_ROLES.map((r) => (
              <button
                key={r.value}
                className={`px-2 py-1 text-xs border rounded ${roleOverride === r.value ? 'bg-gray-800 text-white border-gray-800' : 'bg-white'}`}
                onClick={() => setRoleOverride(r.value)}
              >
                {r.label}
              </button>
            ))}
            {roleOverride && (
              <button className="px-2 py-1 text-xs border rounded bg-white" onClick={() => setRoleOverride(null)}>
                Reset
              </button>
            )}
          </div>
          )}
          <button className="px-2 py-1 text-xs border rounded" onClick={signOut}>Sign out</button>
        </div>
      </div>
      <AssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </header>
  );
}