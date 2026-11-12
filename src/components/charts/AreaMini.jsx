import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AreaMini({ data, xKey = 'week_start', yKey = 'hours', height = 220 }) {
  return (
    <div className="rounded-2xl border p-4 bg-white">
      <div className="text-sm font-medium mb-2">Weekly Hours</div>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopOpacity={0.35} />
                <stop offset="95%" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey={yKey} strokeWidth={2} fillOpacity={1} fill="url(#fillArea)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
