import React, { useState, useMemo, useEffect } from 'react';
import {
  getTimesheets, setTimesheets, getAssignmentById, getCandidateById, getJobById,
  createInvoicesFromPaidTimesheets,
  now
} from '@/utils/storage';
import DataTable from '@/components/table/DataTable.jsx';
import { Empty } from '@/components/ui';
import { useToasts } from '@/components/ui/ToastProvider.jsx';

const PAYROLL_STATUS_OPTIONS = ['Ready', 'In Payroll', 'Paid'];

export default function PayrollQueue() {
  const [statusFilter, setStatusFilter] = useState('Ready');
  const [data, setData] = useState([]);
  const { addToast } = useToasts();

  useEffect(() => {
    setData(getTimesheets());
  }, []);

  const updatePayrollStatus = (tsId, newStatus) => {
    const all = getTimesheets();
    const idx = all.findIndex(t => t.id === tsId);
    if (idx === -1) return;
    all[idx].payrollStatus = newStatus;
    all[idx].updatedAt = now();
    setTimesheets(all);
    setData([...all]);
    addToast({ type: 'success', message: `Timesheet marked as "${newStatus}".` });
  };

  const billableCount = data.filter(t => t.payrollStatus === 'Paid' && !t.invoiceId && (t.totalHours || 0) > 0).length;

  const createInvoices = () => {
    const created = createInvoicesFromPaidTimesheets();
    if (created.length === 0) {
      addToast({ type: 'info', message: 'No paid timesheets ready to invoice.' });
      return;
    }
    setData(getTimesheets());
    const summary = created.map(i => `${i.invoiceNumber} (${i.clientName}, $${i.total.toFixed(2)})`).join(', ');
    addToast({ type: 'success', message: `Created ${created.length} invoice${created.length > 1 ? 's' : ''}: ${summary}` });
  };

  const rows = useMemo(() => {
    return data
      .filter(t => t.payrollStatus === statusFilter)
      .sort((a, b) => (b.weekEnding || '').localeCompare(a.weekEnding || ''))
      .map(t => {
        const assignment = getAssignmentById(t.assignmentId);
        const cand = assignment ? getCandidateById(assignment.candidateId) : null;
        const job = assignment ? getJobById(assignment.jobId) : null;
        const flags = [];
        if (t.compliance?.overtimeFlag) flags.push('OT');
        if (t.compliance?.mealBreakMissing) flags.push('Meal');
        return {
          id: t.id,
          candidate: cand?.name || '-',
          job: job?.title || '-',
          weekEnding: t.weekEnding || '-',
          totalHours: t.totalHours ?? 0,
          flags: flags.join(', ') || '-',
          payrollStatus: t.payrollStatus,
          updated: t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : '-',
        };
      });
  }, [data, statusFilter]);

  const columns = [
    { key: 'candidate', header: 'Candidate' },
    { key: 'job', header: 'Job' },
    { key: 'weekEnding', header: 'Week Ending' },
    { key: 'totalHours', header: 'Total Hours' },
    { key: 'flags', header: 'Flags', render: (v) => {
      if (v === '-') return <span className="text-gray-400">-</span>;
      return <span className="text-amber-600 text-xs font-medium">{v}</span>;
    }},
    { key: 'updated', header: 'Updated' },
    { key: 'id', header: 'Actions', render: (_, row) => {
      if (row.payrollStatus === 'Ready') {
        return (
          <button
            onClick={() => updatePayrollStatus(row.id, 'In Payroll')}
            className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-indigo-700"
          >
            Mark In Payroll
          </button>
        );
      }
      if (row.payrollStatus === 'In Payroll') {
        return (
          <button
            onClick={() => updatePayrollStatus(row.id, 'Paid')}
            className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700"
          >
            Mark Paid
          </button>
        );
      }
      return <span className="text-green-700 text-xs font-medium">Paid</span>;
    }},
  ];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Payroll Queue</h1>

      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm text-gray-600">Status:</label>
        {PAYROLL_STATUS_OPTIONS.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
              statusFilter === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {s}
          </button>
        ))}
        <button
          onClick={createInvoices}
          disabled={billableCount === 0}
          className="ml-auto bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500"
        >
          Create invoices ({billableCount} ready)
        </button>
      </div>

      {rows.length === 0 ? (
        <Empty
          title={`No ${statusFilter.toLowerCase()} timesheets`}
          hint={statusFilter === 'Ready' ? 'Approved timesheets that pass compliance checks will appear here.' : `No timesheets with "${statusFilter}" status.`}
        />
      ) : (
        <DataTable columns={columns} rows={rows} pageSize={15} />
      )}
    </div>
  );
}
