import React, { useState, useEffect } from 'react';
import TopNav from '@/components/layout/TopNav.jsx';
import Sidebar from '@/components/layout/Sidebar.jsx';
import StagingBanner from '@/components/common/StagingBanner.jsx';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  // A capability-gated route that denies the user redirects here with
  // state.deniedFrom — say so once, instead of silently dropping them on
  // their dashboard. The flag is cleared from history state right away
  // so a reload doesn't re-show the notice; the banner itself is
  // dismissible.
  const deniedFrom = location.state?.deniedFrom;
  const [deniedNotice, setDeniedNotice] = useState(null);
  useEffect(() => {
    if (!deniedFrom) return;
    setDeniedNotice(deniedFrom);
    navigate(location.pathname, { replace: true, state: { ...location.state, deniedFrom: null } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deniedFrom]);

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <StagingBanner />
      {deniedNotice && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-amber-800 flex items-center justify-between">
          <span>You don&apos;t have access to that page — you&apos;ve been sent to your dashboard instead.</span>
          <button onClick={() => setDeniedNotice(null)} className="text-amber-600 hover:text-amber-800 ml-2 font-bold" aria-label="Dismiss">
            &times;
          </button>
        </div>
      )}
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
