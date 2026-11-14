import React, { useState, useEffect } from 'react';
import AccessDenied from '@/components/ui/AccessDenied.jsx';
import {
  fetchPersons, fetchJobs, fetchTimesheets, fetchApplications, isRlsDenied,
} from '@/lib/pipeline';
import { getCandidates, getJobs, getTimesheets, getJobById } from '@/utils/storage';

// Recent pipeline transitions, newest first, as feed items.
function buildActivity(entries) {
  const items = [];
  for (const e of entries) {
    for (const h of e.history || []) {
      items.push({
        type: h.to === 'Active Assignment' || h.to === 'Assigned' ? 'job' : 'candidate',
        text: `${e.name} — ${e.jobTitle || '—'}: ${h.from} → ${h.to}${h.note ? ` (${h.note})` : ''}`,
        timestamp: h.at || null,
      });
    }
  }
  return items
    .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
    .slice(0, 8);
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    activeJobs: 0,
    submittedTimesheets: 0
  });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [persons, jobs, sheets, apps] = await Promise.all([
          fetchPersons(), fetchJobs(), fetchTimesheets(), fetchApplications(),
        ]);
        if (!mounted) return;
        setStats({
          totalCandidates: persons.length,
          activeJobs: jobs.filter((j) => j.status === 'Open').length,
          submittedTimesheets: sheets.filter((t) => t.status === 'Submitted').length,
        });
        setActivity(buildActivity(apps.map((a) => ({
          name: a.name, jobTitle: a.jobTitle, history: a.history,
        }))));
      } catch (err) {
        // An RLS denial is not an outage — show the denied state, never
        // fall back to the unscoped demo store for a denied reader.
        if (isRlsDenied(err)) {
          if (mounted) setDenied(true);
          return;
        }
        if (!mounted) return;
        // Offline fallback: demo store. Persons are deduped by email —
        // the demo candidates collection holds one row per person-order.
        const demoPersons = getCandidates();
        const emails = new Set(
          demoPersons.map((c) => (c.email || '').trim().toLowerCase()).filter(Boolean)
        );
        setStats({
          totalCandidates: emails.size,
          activeJobs: getJobs().filter((j) => j.status === 'Open').length,
          submittedTimesheets: getTimesheets().filter((t) => t.status === 'Submitted').length,
        });
        setActivity(buildActivity(demoPersons.map((c) => {
          const job = c.submittedJobId ? getJobById(c.submittedJobId) : null;
          return { name: c.name, jobTitle: job?.title || '—', history: c.statusHistory || [] };
        })));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const getTypeColor = (type) => {
    switch (type) {
      case 'candidate': return 'border-green-500';
      case 'job': return 'border-blue-500';
      default: return 'border-gray-500';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'candidate': return '👤';
      case 'job': return '📦';
      default: return '⚙️';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="p-6">Loading</div>;
  }

  if (denied) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{stats.totalCandidates}</p>
          <p className="text-gray-600">Total Candidates</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{stats.activeJobs}</p>
          <p className="text-gray-600">Active Jobs</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">{stats.submittedTimesheets}</p>
          <p className="text-gray-600">Submitted Timesheets</p>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {activity.length > 0 ? (
            activity.map((item, index) => (
              <div key={index} className={`border-l-4 pl-4 ${getTypeColor(item.type)} py-2`}>
                <p className="text-sm">
                  {getTypeIcon(item.type)} {item.text}
                </p>
                <p className="text-xs text-gray-500 mt-1">{formatTime(item.timestamp)}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No recent activity.</p>
          )}
        </div>
      </div>

      {/* User Management Placeholder */}
      <div className="bg-gray-50 border rounded-lg p-6 mt-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">User Management</h2>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
            Manage Users
          </button>
        </div>
        <p className="text-gray-600 mt-2">
          Manage system users, roles, and permissions
        </p>
      </div>
    </div>
  );
}
