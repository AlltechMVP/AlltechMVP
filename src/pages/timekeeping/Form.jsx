import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getAssignments, getTimesheets, setTimesheets,
  getTimesheetById, getAssignmentById, getCandidateById, getJobById,
  uid, now, runTimesheetCompliance, applyTimesheetCompliance
} from '@/utils/storage';
import { syncTimesheetToSupabase, reconcileTimesheets } from '@/lib/pipeline';
import { useToasts } from '@/components/ui/ToastProvider.jsx';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function generateWeekDates(weekEnding) {
  if (!weekEnding) return [];
  const end = new Date(weekEnding + 'T00:00:00');
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export default function TimesheetForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToasts();
  const isEdit = Boolean(id);

  const [assignments, setAssignmentsList] = useState([]);
  const [assignmentId, setAssignmentId] = useState('');
  const [weekEnding, setWeekEnding] = useState('');
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState('Draft');
  const [approverNote, setApproverNote] = useState('');
  const [payrollStatus, setPayrollStatus] = useState('Not Ready');
  const [liveExceptions, setLiveExceptions] = useState([]);

  useEffect(() => {
    (async () => {
      const allAssign = getAssignments().filter(a => a.status === 'Active');
      setAssignmentsList(allAssign);

      if (isEdit) {
        // Resolve the demo row: by demo id, then by its Supabase id; if
        // neither exists locally, reconcile (which creates the demo twin)
        // and look again.
        let existing = getTimesheetById(id)
          || getTimesheets().find((t) => String(t.supabaseTimesheetId) === String(id));
        if (!existing) {
          try {
            await reconcileTimesheets();
            existing = getTimesheetById(id)
              || getTimesheets().find((t) => String(t.supabaseTimesheetId) === String(id));
          } catch {
            existing = null;
          }
        }
        if (!existing) {
          addToast({ type: 'error', message: 'Timesheet not found.' });
          navigate('/timekeeping');
          return;
        }
        setAssignmentId(existing.assignmentId);
        setWeekEnding(existing.weekEnding);
        setEntries(existing.entries || []);
        setStatus(existing.status);
        setApproverNote(existing.approverNote || '');
        setPayrollStatus(existing.payrollStatus || 'Not Ready');
        setClientApproval(existing.clientApprovalStatus || 'Not Submitted');
        const { exceptions } = runTimesheetCompliance(existing);
        setLiveExceptions(exceptions);

        if (existing.assignmentId && !allAssign.find(a => a.id === existing.assignmentId)) {
          const linkedAssignment = getAssignmentById(existing.assignmentId);
          if (linkedAssignment) setAssignmentsList(prev => [...prev, linkedAssignment]);
        }
      }
    })();
  }, [id, isEdit]);

  useEffect(() => {
    if (!isEdit && weekEnding) {
      const dates = generateWeekDates(weekEnding);
      setEntries(dates.map(d => ({ date: d, hours: 0 })));
    }
  }, [weekEnding, isEdit]);

  useEffect(() => {
    if (entries.length > 0) {
      const { exceptions } = runTimesheetCompliance({ entries, weekEnding, assignmentId, totalHours });
      setLiveExceptions(exceptions);
    }
  }, [entries, weekEnding, assignmentId]);

  const totalHours = useMemo(() => entries.reduce((s, e) => s + (Number(e.hours) || 0), 0), [entries]);

  const [clientApproval, setClientApproval] = useState('Not Submitted');

  const isLocked = status === 'Submitted' || status === 'Approved';
  const isDraft = status === 'Draft';
  const isRejected = status === 'Rejected';

  const blockingExceptions = liveExceptions.filter(e => e.blocking);
  const warningExceptions = liveExceptions.filter(e => !e.blocking);

  const updateHours = (idx, val) => {
    const h = Math.max(0, Math.min(24, Number(val) || 0));
    setEntries(prev => prev.map((e, i) => i === idx ? { ...e, hours: h } : e));
  };

  const saveTimesheet = async (newStatus, noteOverride) => {
    if (!assignmentId || !weekEnding) {
      addToast({ type: 'error', message: 'Assignment and Week Ending are required.' });
      return;
    }

    if (newStatus === 'Submitted' && totalHours === 0) {
      addToast({ type: 'error', message: 'Cannot submit a timesheet with 0 total hours.' });
      return;
    }

    if (newStatus === 'Submitted' && blockingExceptions.length > 0) {
      addToast({ type: 'error', message: 'Cannot submit: resolve blocking exceptions first.' });
      return;
    }

    const all = getTimesheets();
    const timestamp = now();
    const finalNote = noteOverride !== undefined ? noteOverride : approverNote;
    const record = {
      assignmentId,
      weekEnding,
      entries,
      totalHours,
      status: newStatus,
      approverNote: finalNote || null,
      updatedAt: timestamp,
    };

    if (newStatus === 'Approved') {
      record.approvedAt = timestamp;
    }

    let savedRecord;
    if (isEdit) {
      const idx = all.findIndex((t) => t.id === id || String(t.supabaseTimesheetId) === String(id));
      if (idx !== -1) {
        savedRecord = { ...all[idx], ...record };
        applyTimesheetCompliance(savedRecord);
        all[idx] = savedRecord;
      }
    } else {
      savedRecord = { id: uid(), ...record, createdAt: timestamp };
      applyTimesheetCompliance(savedRecord);
      all.push(savedRecord);
    }

    setTimesheets(all);
    setStatus(newStatus);
    if (noteOverride !== undefined) setApproverNote(noteOverride);
    if (savedRecord) {
      setPayrollStatus(savedRecord.payrollStatus || 'Not Ready');
      setLiveExceptions(savedRecord.exceptions || []);
      // Sync the timesheet row itself to Supabase before navigating, so
      // the list the user lands on re-fetches after the sync has landed
      // (a fire-and-forget sync here loses the race and the new
      // timesheet only appears after a manual reload).
      await syncTimesheetToSupabase(savedRecord);
    }

    let msg = `Timesheet ${newStatus === 'Draft' ? 'saved' : newStatus.toLowerCase()}.`;
    if (newStatus === 'Approved' && savedRecord?.payrollStatus === 'Ready') {
      msg += ' Payroll status: Ready.';
    }
    addToast({ type: 'success', message: msg });

    if (!isEdit || newStatus !== status) {
      navigate('/timekeeping');
    }
  };

  const handleApprove = () => saveTimesheet('Approved');
  const handleReject = () => {
    const note = prompt('Rejection reason:');
    if (note !== null) {
      saveTimesheet('Rejected', note);
    }
  };
  const handleReopen = () => saveTimesheet('Draft');

  const getAssignmentLabel = (a) => {
    const c = getCandidateById(a.candidateId);
    const j = getJobById(a.jobId);
    return `${c?.name || a.candidateId} - ${j?.title || a.jobId}`;
  };

  const inputCls = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  const payrollColors = {
    'Not Ready': 'bg-gray-100 text-gray-800',
    'Ready': 'bg-emerald-100 text-emerald-800',
    'In Payroll': 'bg-indigo-100 text-indigo-800',
    'Paid': 'bg-green-100 text-green-800',
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">{isEdit ? 'Edit Timesheet' : 'Create Timesheet'}</h1>

      <div className="bg-white border rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Assignment *</label>
            <select
              value={assignmentId}
              onChange={e => setAssignmentId(e.target.value)}
              className={inputCls}
              disabled={isLocked}
            >
              <option value="">Select an assignment</option>
              {assignments.map(a => (
                <option key={a.id} value={a.id}>{getAssignmentLabel(a)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Week Ending (Sunday) *</label>
            <input
              type="date"
              value={weekEnding}
              onChange={e => setWeekEnding(e.target.value)}
              className={inputCls}
              disabled={isLocked || isEdit}
            />
          </div>
        </div>

        {isEdit && (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                status === 'Approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>{status}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Client:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                clientApproval === 'Approved' ? 'bg-green-100 text-green-800' :
                clientApproval === 'Rejected' ? 'bg-red-100 text-red-800' :
                clientApproval === 'Submitted' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-500'
              }`}>{clientApproval === 'Not Submitted' ? 'N/A' : clientApproval}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Payroll:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${payrollColors[payrollStatus] || ''}`}>{payrollStatus}</span>
            </div>
          </div>
        )}

        {isEdit && clientApproval === 'Rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            Client has rejected this timecard. Internal approval is disabled.
          </div>
        )}

        {isRejected && approverNote && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
            <strong>Rejection note:</strong> {approverNote}
          </div>
        )}

        {blockingExceptions.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm font-medium text-red-800 mb-1">Blocking Issues</p>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-0.5">
              {blockingExceptions.map((e, i) => <li key={i}>{e.msg}</li>)}
            </ul>
          </div>
        )}

        {warningExceptions.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs font-medium text-amber-700 mb-1">Warnings</p>
            <ul className="list-disc list-inside text-xs text-amber-600 space-y-0.5">
              {warningExceptions.map((e, i) => <li key={i}>{e.msg}</li>)}
            </ul>
          </div>
        )}

        {entries.length > 0 && (
          <div>
            <label className={labelCls}>Daily Hours</label>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Day</th>
                    <th className="text-left px-3 py-2 font-medium">Date</th>
                    <th className="text-left px-3 py-2 font-medium">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, idx) => (
                    <tr key={entry.date} className={idx % 2 ? 'bg-white' : 'bg-gray-50/40'}>
                      <td className="px-3 py-2">{DAY_LABELS[idx] || ''}</td>
                      <td className="px-3 py-2">{entry.date}</td>
                      <td className="px-3 py-2">
                        {isLocked ? (
                          <span>{entry.hours}</span>
                        ) : (
                          <input
                            type="number"
                            min="0"
                            max="24"
                            step="0.5"
                            value={entry.hours}
                            onChange={e => updateHours(idx, e.target.value)}
                            className="w-20 border rounded px-2 py-1 text-sm"
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t bg-gray-50 font-medium">
                    <td colSpan={2} className="px-3 py-2 text-right">Total:</td>
                    <td className="px-3 py-2">{totalHours} hrs</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2 flex-wrap">
          {(isDraft || isRejected) && (
            <>
              <button
                type="button"
                onClick={() => saveTimesheet('Draft')}
                className="border px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => saveTimesheet('Submitted')}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Submit
              </button>
            </>
          )}

          {status === 'Submitted' && clientApproval !== 'Rejected' && (
            <>
              <button
                type="button"
                onClick={handleApprove}
                className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
              >
                {clientApproval === 'Approved' ? 'Final Approve' : 'Approve'}
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Reject
              </button>
            </>
          )}

          {isRejected && (
            <button
              type="button"
              onClick={handleReopen}
              className="bg-yellow-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600"
            >
              Reopen as Draft
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate('/timekeeping')}
            className="border px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            {status === 'Approved' ? 'Back' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}
