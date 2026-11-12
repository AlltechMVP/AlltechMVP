import React from 'react';
import TopNav from '@/components/layout/TopNav.jsx';
import Sidebar from '@/components/layout/Sidebar.jsx';
import StagingBanner from '@/components/common/StagingBanner.jsx';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <StagingBanner />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
