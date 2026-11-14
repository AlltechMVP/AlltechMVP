import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { getCandidates, getPortalPhase } from '@/utils/storage';

// Onboarding milestone Slice 1: the portal header shows the person's
// phase (Applicant / Onboarding / Active Employee, from the #6 derived
// flag), and the Enter Time card renders only for employees — a person
// who hasn't started yet would only hit the form's "no active
// assignments" message. The person is resolved by the SIGNED-IN email
// (Supabase first, demo-store fallback), never by the demo persona
// switcher, which fakes the role but not the identity — so a switcher
// session with no person record reads as Applicant.
const PHASE_BADGE = {
  'Active Employee': 'bg-emerald-100 text-emerald-800',
  'Onboarding': 'bg-blue-100 text-blue-800',
  'Applicant': 'bg-gray-100 text-gray-800',
};

export default function CandidateDashboard() {
  const [phase, setPhase] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      let demoId = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const email = (user?.email || '').trim().toLowerCase();
        if (email) {
          try {
            const { data: person } = await supabase
              .from('candidates')
              .select('legacy_id')
              .eq('email', email)
              .single();
            demoId = person?.legacy_id || null;
          } catch {
            // Fall through to the demo store.
          }
          if (!demoId) {
            demoId = getCandidates().find(
              (c) => (c.email || '').trim().toLowerCase() === email
            )?.id || null;
          }
        }
      } catch {
        // Unresolved identity reads as Applicant.
      }
      if (mounted) setPhase(getPortalPhase(demoId));
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Candidate Dashboard</h1>
      {phase && (
        <p className="text-sm text-gray-600 mb-6">
          Status:{' '}
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PHASE_BADGE[phase] || 'bg-gray-100'}`}>{phase}</span>
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Link to="/candidate/jobs" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold mb-2">Browse Jobs</h3>
          <p className="text-gray-600">Find your next opportunity</p>
        </Link>

        <Link to="/candidate/jobs" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold mb-2">My Applications</h3>
          <p className="text-gray-600">See the jobs you have applied to</p>
        </Link>

        {phase === 'Active Employee' && (
          <Link to="/timekeeping/entry" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">Enter Time</h3>
            <p className="text-gray-600">Submit your hours</p>
          </Link>
        )}
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="text-blue-700">
          <strong>Welcome!</strong> Use the navigation above to get started.
        </p>
      </div>
    </div>
  );
}
