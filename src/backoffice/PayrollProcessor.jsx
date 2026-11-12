
import React, { useState, useEffect } from 'react';
import { getStoredTimesheets } from '../data/mockTimesheets';
import { calculatePayPeriod } from '../utils/timesheetAuditor';

export default function PayrollProcessor() {
  const [payrollRecords, setPayrollRecords] = useState([]);
  const TAX_RATE = 0.15;
  const MOCK_HOURLY_RATE = 17;

  useEffect(() => {
    const timesheets = getStoredTimesheets();
    const approvedSheets = timesheets.filter(ts => ts.status === "Approved");
    
    const processedRecords = approvedSheets.map(ts => {
      const grossPay = ts.totalHours * MOCK_HOURLY_RATE;
      const taxes = grossPay * TAX_RATE;
      
      return {
        candidateId: ts.candidateId,
        candidateName: ts.candidateName,
        payPeriod: calculatePayPeriod(ts.date),
        hours: ts.totalHours,
        grossPay,
        taxes,
        netPay: grossPay - taxes,
        status: "Ready for Processing"
      };
    });

    setPayrollRecords(processedRecords);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Payroll Processing Center</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Employee</th>
              <th className="px-6 py-3 text-left">Pay Period</th>
              <th className="px-6 py-3 text-right">Hours</th>
              <th className="px-6 py-3 text-right">Gross Pay</th>
              <th className="px-6 py-3 text-right">Taxes</th>
              <th className="px-6 py-3 text-right">Net Pay</th>
              <th className="px-6 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {payrollRecords.map((record, idx) => (
              <tr key={`${record.candidateId}-${record.payPeriod}`}>
                <td className="px-6 py-4">{record.candidateName}</td>
                <td className="px-6 py-4">{record.payPeriod}</td>
                <td className="px-6 py-4 text-right">{record.hours}</td>
                <td className="px-6 py-4 text-right">${record.grossPay.toFixed(2)}</td>
                <td className="px-6 py-4 text-right">${record.taxes.toFixed(2)}</td>
                <td className="px-6 py-4 text-right">${record.netPay.toFixed(2)}</td>
                <td className="px-6 py-4 text-center">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
