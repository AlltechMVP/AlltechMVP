import React from 'react';
import { useKpis } from '@/hooks/useKpis.js';
import { useHoursByWeek } from '@/hooks/useHoursByWeek.js';
import KpiCard from '@/components/kpi/KpiCard.jsx';
import AreaMini from '@/components/charts/AreaMini.jsx';
import { Loader, Empty } from '@/components/ui';

export default function CEODashboard() {
  const { data: kpi, loading: loadingKpi } = useKpis();
  const { data: series, loading: loadingSeries } = useHoursByWeek(12);

  if (loadingKpi || loadingSeries) return <div className="p-4"><Loader label="Loading dashboard…" /></div>;

  if (!kpi) return <div className="p-4"><Empty title="No KPI data yet" hint="Seed the database or run timecards." /></div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">CEO Dashboard</h1>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Active Assignments" value={kpi.active_assignments ?? 0} />
        <KpiCard label="Open Jobs" value={kpi.open_jobs ?? 0} />
        <KpiCard label="Total Candidates" value={kpi.total_candidates ?? 0} />
        <KpiCard label="Hours Pending" value={kpi.hours_pending ?? 0} hint="Submitted/Approved/Paid" />
      </div>

      <AreaMini data={series} />
    </div>
  );
}
