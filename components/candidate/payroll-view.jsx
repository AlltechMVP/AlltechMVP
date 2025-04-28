
import React from 'react';

export default function PayrollView() {
  const mockPaychecks = [
    {
      id: 1,
      startDate: '2024-03-01',
      endDate: '2024-03-15',
      regularPay: 800,
      overtimePay: 150,
      deductions: 50,
      netPay: 900
    },
    {
      id: 2,
      startDate: '2024-02-15',
      endDate: '2024-02-29',
      regularPay: 800,
      overtimePay: 200,
      deductions: 55,
      netPay: 945
    }
  ];

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Payroll Summary</h2>
      
      <div className="space-y-4">
        {mockPaychecks.map(paycheck => (
          <div key={paycheck.id} className="bg-white shadow rounded-lg p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Pay Period: {paycheck.startDate} to {paycheck.endDate}
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Regular Pay</p>
                <p className="text-lg font-semibold">${paycheck.regularPay.toFixed(2)}</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Overtime Pay</p>
                <p className="text-lg font-semibold">${paycheck.overtimePay.toFixed(2)}</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Deductions</p>
                <p className="text-lg font-semibold text-red-600">-${paycheck.deductions.toFixed(2)}</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Net Pay</p>
                <p className="text-lg font-semibold text-green-600">${paycheck.netPay.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
