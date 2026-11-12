import React from 'react';
import { useHoursByWeek } from '@/hooks/useHoursByWeek.js';
import { Loader, Empty } from '@/components/ui';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function CFODashboard() {
  const { data: series, loading } = useHoursByWeek(16);

  if (loading) return <div className="p-4"><Loader label="Loading CFO overview…" /></div>;
  if (!series || series.length === 0) return <div className="p-4"><Empty title="No timecard data" /></div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">CFO Dashboard</h1>

      <div className="rounded-2xl border p-4 bg-white">
        <div className="text-sm font-medium mb-2">Weekly Hours Trend</div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={series} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week_start" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="hours" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
