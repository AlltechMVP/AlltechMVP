
import React, { useState } from 'react';

export default function TimesheetEntry() {
  const [timesheet, setTimesheet] = useState({
    weekEnding: '',
    regularHours: '',
    overtimeHours: '',
    doubleTimeHours: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Timesheet submitted:', timesheet);
    alert('Timesheet submitted successfully!');
    setTimesheet({
      weekEnding: '',
      regularHours: '',
      overtimeHours: '',
      doubleTimeHours: '',
      notes: ''
    });
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Submit Timesheet</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Week Ending Date
          </label>
          <input
            type="date"
            value={timesheet.weekEnding}
            onChange={(e) => setTimesheet({...timesheet, weekEnding: e.target.value})}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Regular Hours
          </label>
          <input
            type="number"
            value={timesheet.regularHours}
            onChange={(e) => setTimesheet({...timesheet, regularHours: e.target.value})}
            className="w-full p-2 border rounded-md"
            min="0"
            step="0.5"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Overtime Hours
          </label>
          <input
            type="number"
            value={timesheet.overtimeHours}
            onChange={(e) => setTimesheet({...timesheet, overtimeHours: e.target.value})}
            className="w-full p-2 border rounded-md"
            min="0"
            step="0.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Double-Time Hours
          </label>
          <input
            type="number"
            value={timesheet.doubleTimeHours}
            onChange={(e) => setTimesheet({...timesheet, doubleTimeHours: e.target.value})}
            className="w-full p-2 border rounded-md"
            min="0"
            step="0.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={timesheet.notes}
            onChange={(e) => setTimesheet({...timesheet, notes: e.target.value})}
            className="w-full p-2 border rounded-md"
            rows="3"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Submit Timesheet
        </button>
      </form>
    </div>
  );
}
