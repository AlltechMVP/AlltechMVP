import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { fetchOnboardingDefs, fetchOnboardingTasks, ensureOnboardingTasks, setOnboardingTaskDone } from '@/lib/pipeline';
import { getCandidates, getPortalPhase, getAssignments, getJobById, getClientById } from '@/utils/storage';

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
  const [demoId, setDemoId] = useState(null);
  // Slice 3: the Supabase candidate uuid (for the onboarding checklist).
  // The demo-store fallback gives a demo id but no uuid — then the
  // checklist stays hidden (it lives in Supabase, not the demo store).
  const [personUuid, setPersonUuid] = useState(null);
  const [onboardingDefs, setOnboardingDefs] = useState([]);
  const [onboardingTasks, setOnboardingTasks] = useState({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      let resolvedId = null;
      let resolvedUuid = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const email = (user?.email || '').trim().toLowerCase();
        if (email) {
          try {
            const { data: person } = await supabase
              .from('candidates')
              .select('id,legacy_id')
              .eq('email', email)
              .single();
            resolvedId = person?.legacy_id || null;
            resolvedUuid = person?.id || null;
          } catch {
            // Fall through to the demo store.
          }
          if (!resolvedId) {
            resolvedId = getCandidates().find(
              (c) => (c.email || '').trim().toLowerCase() === email
            )?.id || null;
          }
        }
      } catch {
        // Unresolved identity reads as Applicant.
      }
      if (mounted) {
        setDemoId(resolvedId);
        setPersonUuid(resolvedUuid);
        setPhase(getPortalPhase(resolvedId));
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Slice 3: the onboarding checklist. Shown once the person holds an
  // Active assignment (Onboarding or Active Employee phase — the
  // assignment initiates onboarding). Rows are created on first view
  // for any enabled task that lacks one; checking a box records
  // completion (V1 records completion only — nothing is filed).
  useEffect(() => {
    if (!personUuid || (phase !== 'Onboarding' && phase !== 'Active Employee')) return;
    let mounted = true;
    (async () => {
      try {
        const defs = (await fetchOnboardingDefs()).filter((d) => d.enabled);
        if (!mounted) return;
        setOnboardingDefs(defs);
        const keys = defs.map((d) => d.task_key);
        await ensureOnboardingTasks(personUuid, keys);
        if (!mounted) return;
        const rows = await fetchOnboardingTasks(personUuid);
        if (!mounted) return;
        const map = {};
        for (const r of rows) map[r.task_key] = r;
        setOnboardingTasks(map);
      } catch {
        // Checklist stays empty on outage; the rest of the portal works.
      }
    })();
    return () => { mounted = false; };
  }, [personUuid, phase]);

  const toggleOnboardingTask = async (taskKey, done) => {
    try {
      const row = await setOnboardingTaskDone(personUuid, taskKey, done);
      setOnboardingTasks((prev) => ({ ...prev, [taskKey]: row }));
    } catch {
      // Leave the checkbox as it was; the write did not land.
    }
  };

  // Slice 4: the employee's Active assignments, read from the demo store
  // (the canonical write path). Renders only for the Active Employee
  // phase — the same gate as the Enter Time card.
  const myAssignments = useMemo(() => {
    if (!demoId) return [];
    return getAssignments().filter(
      (a) => String(a.candidateId) === String(demoId) && a.status === 'Active'
    );
  }, [demoId]);

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

      {phase === 'Active Employee' && myAssignments.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">My Assignments</h2>
          <div className="space-y-3">
            {myAssignments.map((a) => {
              const job = a.jobId ? getJobById(a.jobId) : null;
              // Demo jobs carry client_name directly; Supabase-mapped jobs
              // carry clientId instead — prefer the name when present.
              const clientName = job?.client_name
                || (job?.clientId ? getClientById(job.clientId)?.name : null);
              return (
                <div key={a.id} className="border rounded p-3">
                  <p className="font-medium">{job?.title || '—'}{clientName ? ` — ${clientName}` : ''}</p>
                  <p className="text-sm text-gray-600">
                    Pay ${a.payRate ?? '—'}/hr · Started {a.startDate || '—'}{a.endDate ? ` · Ends ${a.endDate}` : ''}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(phase === 'Onboarding' || phase === 'Active Employee') && onboardingDefs.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-1">Onboarding Checklist</h2>
          <p className="text-sm text-gray-600 mb-4">
            {onboardingDefs.filter((d) => onboardingTasks[d.task_key]?.done).length} of {onboardingDefs.length} complete
          </p>
          <div className="space-y-2">
            {onboardingDefs.map((d) => {
              const row = onboardingTasks[d.task_key];
              return (
                <label key={d.task_key} className="flex items-center gap-3 border rounded p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!row?.done}
                    onChange={(e) => toggleOnboardingTask(d.task_key, e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className={row?.done ? 'line-through text-gray-500' : ''}>{d.label}</span>
                  {row?.done && row.done_at && (
                    <span className="ml-auto text-xs text-gray-500">
                      Done {new Date(row.done_at).toLocaleDateString()}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="text-blue-700">
          <strong>Welcome!</strong> Use the navigation above to get started.
        </p>
      </div>
    </div>
  );
}
