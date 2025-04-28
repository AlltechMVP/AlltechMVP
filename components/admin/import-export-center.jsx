
import React from 'react';

export default function ImportExportCenter() {
  const mockFiles = [
    { id: 1, name: 'candidate_data_2024.csv', uploadDate: '2024-03-15' },
    { id: 2, name: 'placements_q1.xlsx', uploadDate: '2024-03-14' },
    { id: 3, name: 'job_orders_march.csv', uploadDate: '2024-03-13' }
  ];

  const handleUpload = () => {
    alert('Upload functionality coming soon!');
  };

  const handleExport = () => {
    alert('Export functionality coming soon!');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Import / Export Center</h1>
      
      <div className="flex gap-4 mb-8">
        <button 
          onClick={handleUpload}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Upload File
        </button>
        <button 
          onClick={handleExport}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Export Data
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Upload Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockFiles.map(file => (
              <tr key={file.id}>
                <td className="px-6 py-4">{file.name}</td>
                <td className="px-6 py-4">{file.uploadDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
