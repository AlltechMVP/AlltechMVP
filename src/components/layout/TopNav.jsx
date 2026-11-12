import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext.jsx';
import AssistantPanel from '@/components/ai/AssistantPanel.jsx';

const DEV_ROLES = ['recruiter', 'client', 'candidate', 'ceo', 'cfo'];

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
          {/* DEV-ONLY role override for testing. It changes only the role
              used for navigation, not the signed-in account. Remove before
              real users rely on this app. */}
          <div
            className="flex items-center gap-1 border border-amber-400 bg-amber-50 rounded px-1 py-0.5"
            title="Dev-only role override for testing. It changes only the role used for navigation, not the signed-in account. Clear it before real use."
          >
            <span className="text-[10px] uppercase tracking-wide text-amber-700 px-1">Dev role</span>
            {DEV_ROLES.map((r) => (
              <button
                key={r}
                className={`px-2 py-1 text-xs border rounded ${roleOverride === r ? 'bg-gray-800 text-white border-gray-800' : 'bg-white'}`}
                onClick={() => setRoleOverride(r)}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
            {roleOverride && (
              <button className="px-2 py-1 text-xs border rounded bg-white" onClick={() => setRoleOverride(null)}>
                Reset
              </button>
            )}
          </div>
          <button className="px-2 py-1 text-xs border rounded" onClick={signOut}>Sign out</button>
        </div>
      </div>
      <AssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </header>
  );
}