import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext.jsx';
import { isDev } from '@/config/dev';
import AssistantPanel from '@/components/ai/AssistantPanel.jsx';

export default function TopNav() {
  const { profile, role, devLoginAs, signOut } = useAuth();
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
          {isDev && (
            <div className="flex items-center gap-1">
              <button className="px-2 py-1 text-xs border rounded" onClick={() => devLoginAs('recruiter')}>Recruiter</button>
              <button className="px-2 py-1 text-xs border rounded" onClick={() => devLoginAs('client')}>Client</button>
              <button className="px-2 py-1 text-xs border rounded" onClick={() => devLoginAs('candidate')}>Candidate</button>
              <button className="px-2 py-1 text-xs border rounded" onClick={() => devLoginAs('ceo')}>CEO</button>
              <button className="px-2 py-1 text-xs border rounded" onClick={() => devLoginAs('cfo')}>CFO</button>
            </div>
          )}
          <button className="px-2 py-1 text-xs border rounded" onClick={signOut}>Sign out</button>
        </div>
      </div>
      <AssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </header>
  );
}