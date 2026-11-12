
import React, { useState, useEffect } from 'react';

export default function AuditLogViewer() {
  const [logs, setLogs] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  
  useEffect(() => {
    const storedLogs = JSON.parse(localStorage.getItem('mockAuditLogs') || '[]');
    setLogs(storedLogs);
  }, []);

  const sortedLogs = [logs].sort((a, b) => {
    const comparison = new Date(b.timestamp) - new Date(a.timestamp);
    return sortOrder === 'desc' ? comparison : -comparison;
  });

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">System Audit Logs</h2>
        <button 
          onClick={toggleSort}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
        >
          Sort {sortOrder === 'desc' ? '↓' : '↑'}
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">User</th>
              <th className="px-4 py-2 text-left">Action</th>
              <th className="px-4 py-2 text-left">Time</th>
            </tr>
          </thead>
          <tbody>
            {sortedLogs.map(log => (
              <tr key={log.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{log.user}</td>
                <td className="px-4 py-2">{log.action}</td>
                <td className="px-4 py-2">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
