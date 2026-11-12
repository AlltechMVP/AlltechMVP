import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  clearAlltechKeys, seedDemoData, validateSystem, applySafeFixes,
  getSeedVersion, getExpectedSeedVersion,
  getCandidates, getJobs, getAssignments, getTimesheets
} from '@/utils/storage';
import { useToasts } from '@/components/ui/ToastProvider.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { clearSupabasePipeline, reconcilePipeline, clearSupabaseAssignments, reconcileAssignments, clearSupabaseTimesheets, reconcileTimesheets, clearSupabaseInvoices, reconcileInvoices } from '@/lib/pipeline';

const SEV_STYLE = {
  error: 'bg-red-100 text-red-800 border-red-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

export default function AdminTools() {
  const navigate = useNavigate();
  const { addToast } = useToasts();
  // Slice 7: the demo reset is an ADMIN action — only admins see a
  // working reset button. (The route stays open for viewing; a non-admin
  // triggering the reset would be denied by RLS at the Supabase step.)
  const { role } = useAuth();
  const canReset = role === 'admin';
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [report, setReport] = useState(null);
  const [fixableIssues, setFixableIssues] = useState([]);

  const FIXABLE_TYPES = ['orphan_assignment_ref', 'hours_mismatch', 'past_end_active'];

  const runValidation = useCallback(() => {
    const result = validateSystem();
    setReport(result);
    const all = [...result.errors, ...result.warnings];
    setFixableIssues(all.filter(i => FIXABLE_TYPES.includes(i.type)));
  }, []);

  useEffect(() => {
    runValidation();
  }, [runValidation]);

  const handleReset = async () => {
    if (!canReset) return;
    setResetting(true);
    try {
      clearAlltechKeys();
      seedDemoData();
      setConfirmReset(false);
      // Slice 1-5 (thin): the shared pipeline, assignments, timesheets, and
      // invoices live in Supabase too. Clear them and re-sync the fresh seed
      // up, so a presentation starts clean in both stores. Best-effort: the
      // demo reset itself never fails because of this. Order matters: clear
      // assignments first (they reference persons), reconcile invoices last
      // (invoice creation stamps timesheets).
      try {
        await clearSupabaseAssignments();
        await clearSupabasePipeline();
        await clearSupabaseTimesheets();
        await clearSupabaseInvoices();
        await reconcilePipeline();
        await reconcileAssignments();
        await reconcileTimesheets();
        await reconcileInvoices();
      } catch {
        addToast({ type: 'error', message: 'Demo data reset locally; shared reset failed — it will re-sync on next load.' });
      }
      addToast({ type: 'success', message: 'Demo data reset.' });
      runValidation();
      navigate('/candidates');
    } finally {
      setResetting(false);
    }
  };

  const handleAutoFix = () => {
    const count = applySafeFixes(fixableIssues);
    addToast({ type: 'success', message: `Auto-fixed ${count} issue(s).` });
    runValidation();
  };

  const currentVersion = getSeedVersion();
  const expectedVersion = getExpectedSeedVersion();
  const versionMismatch = currentVersion && currentVersion !== expectedVersion;

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Tools</h1>

      {versionMismatch && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            Seed data version mismatch: current <strong>{currentVersion}</strong>, expected <strong>{expectedVersion}</strong>.
            Consider resetting demo data for the latest experience.
          </p>
        </div>
      )}

      <section className="bg-white border rounded-lg p-5 space-y-4">
        <h2 className="text-lg font-medium">Demo Reset</h2>
        <p className="text-sm text-gray-600">
          Clear all local demo data and reseed a fresh dataset that covers the full workflow:
          candidates across multiple statuses, jobs, active and ended assignments, and timesheets in every stage.
        </p>
        {!canReset ? (
          <p className="text-sm text-gray-500">Demo reset is an admin action — sign in as an admin to reset the demo data.</p>
        ) : !confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            disabled={resetting}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:bg-red-300"
          >
            {resetting ? 'Resetting…' : 'Reset Demo Data'}
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
            <p className="text-sm text-red-800 font-medium">
              This will clear local demo data and reseed the app. Continue?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Yes, Reset Now
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="bg-white border rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">System Validator</h2>
          <button
            onClick={runValidation}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Run System Check
          </button>
        </div>

        {report && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(report.stats).map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-800">{v}</div>
                  <div className="text-xs text-gray-500 capitalize">{k}</div>
                </div>
              ))}
            </div>

            {report.errors.length === 0 && report.warnings.length === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                All checks passed. No issues found.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Found <strong className="text-red-600">{report.errors.length}</strong> error(s) and{' '}
                    <strong className="text-yellow-600">{report.warnings.length}</strong> warning(s).
                  </p>
                  {fixableIssues.length > 0 && (
                    <button
                      onClick={handleAutoFix}
                      className="bg-emerald-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-emerald-700"
                    >
                      Auto-fix {fixableIssues.length} safe issue(s)
                    </button>
                  )}
                </div>

                <ul className="space-y-1 max-h-80 overflow-y-auto">
                  {[...report.errors, ...report.warnings].map((issue, i) => (
                    <li
                      key={i}
                      className={`text-sm px-3 py-2 rounded border ${SEV_STYLE[issue.severity]}`}
                    >
                      <span className="font-medium uppercase text-xs mr-2">{issue.severity}</span>
                      {issue.msg}
                      {FIXABLE_TYPES.includes(issue.type) && (
                        <span className="ml-2 text-xs opacity-70">(auto-fixable)</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="bg-white border rounded-lg p-5 space-y-3">
        <h2 className="text-lg font-medium">Data Summary</h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Seed version: <strong>{currentVersion || 'not set'}</strong></p>
          <p>Candidates: <strong>{getCandidates().length}</strong></p>
          <p>Jobs: <strong>{getJobs().length}</strong></p>
          <p>Assignments: <strong>{getAssignments().length}</strong></p>
          <p>Timesheets: <strong>{getTimesheets().length}</strong></p>
        </div>
      </section>
    </div>
  );
}
