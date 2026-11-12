import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Aggregates submitted/approved timecard hours by week_start for a simple area/line chart.
 * Returns [{ week_start: 'YYYY-MM-DD', hours: 123 }]
 */
export function useHoursByWeek(limit = 12) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from('timecards')
        .select('week_start,total_hours,status')
        .in('status', ['Submitted','Approved','Paid'])
        .order('week_start', { ascending: false })
        .limit(limit);
      if (!mounted) return;
      if (error) setError(error);
      else {
        const byWeek = (data || []).reduce((acc, row) => {
          const k = row.week_start;
          acc[k] = (acc[k] || 0) + Number(row.total_hours || 0);
          return acc;
        }, {});
        const series = Object.entries(byWeek)
          .map(([week_start, hours]) => ({ week_start, hours }))
          .sort((a, b) => a.week_start.localeCompare(b.week_start));
        setData(series);
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [limit]);

  return { data, loading, error };
}
