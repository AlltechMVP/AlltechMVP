
import React from 'react';
import { loadJobOrders } from './jobOrders';

export default function ImportExport() {
  const handleExportJobs = () => {
    const jobs = loadJobOrders();
    console.log('Exporting jobs:', jobs);
    alert('Jobs exported to console (simulated CSV export)');
  };

  const handleExportCandidates = () => {
    console.log('Exporting candidates (simulated)');
    alert('Candidates exported (simulated)');
  };

  const mockImportData = [
    { title: 'Software Engineer', location: 'Remote', client: 'TechCorp' },
    { title: 'Project Manager', location: 'New York', client: 'ConsultCo' },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Import/Export Center</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Export Data</h2>
          <div className="space-y-4">
            <button
              onClick={handleExportJobs}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Export Jobs to CSV
            </button>
            <button
              onClick={handleExportCandidates}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Export Candidates to CSV
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Import Preview</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Location</th>
                  <th className="px-4 py-2 text-left">Client</th>
                </tr>
              </thead>
              <tbody>
                {mockImportData.map((row, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">{row.title}</td>
                    <td className="border px-4 py-2">{row.location}</td>
                    <td className="border px-4 py-2">{row.client}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="w-full mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            Confirm Import
          </button>
        </div>
      </div>
    </div>
  );
}
