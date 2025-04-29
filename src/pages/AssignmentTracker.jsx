
import React, { useState } from 'react';
import { assignments } from '../data/assignments';

function AssignmentTracker() {
  const [filter, setFilter] = useState('all');
  
  const filteredAssignments = filter === 'all' 
    ? assignments 
    : assignments.filter(a => a.punchedIn === (filter === 'active'));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assignment Tracker</h1>
        <div className="space-x-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded ${filter === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            Active
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredAssignments.map(assignment => (
          <div key={assignment.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{assignment.employee}</h3>
                <p className="text-gray-600">{assignment.jobTitle}</p>
                <p className="text-sm text-gray-500">{assignment.location}</p>
                <p className="text-sm">
                  Shift: {assignment.shiftStart} - {assignment.shiftEnd}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                assignment.punchedIn 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {assignment.punchedIn ? 'On Shift' : 'Not Started'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AssignmentTracker;
