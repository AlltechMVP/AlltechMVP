
import React, { useState, useEffect } from 'react';

export default function ImportExportCenter() {
  const [activeTab, setActiveTab] = useState('import');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewData, setPreviewData] = useState({ columns: [], rows: [] });
  const [fieldMappings, setFieldMappings] = useState({});
  
  useEffect(() => {
    // Initialize mock data if not present
    if (!localStorage.getItem('mockCandidates')) {
      localStorage.setItem('mockCandidates', JSON.stringify([
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Developer' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Designer' }
      ]));
    }
    
    if (!localStorage.getItem('mockTimesheets')) {
      localStorage.setItem('mockTimesheets', JSON.stringify({
        'john@example.com': [{ date: '2024-04-29', hours: 8 }],
        'jane@example.com': [{ date: '2024-04-29', hours: 7 }]
      }));
    }
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      let data;
      
      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
        const columns = Object.keys(data[0] || {});
        setPreviewData({ columns, rows: data });
      } else if (file.name.endsWith('.csv')) {
        const rows = text.split('\n').map(row => row.split(','));
        const columns = rows[0];
        const dataRows = rows.slice(1).map(row => 
          Object.fromEntries(row.map((cell, i) => [columns[i], cell]))
        );
        setPreviewData({ columns, rows: dataRows });
      }
      
      setUploadedFile(file);
      // Initialize field mappings
      const newMappings = {};
      previewData.columns.forEach(col => {
        newMappings[col] = col.toLowerCase();
      });
      setFieldMappings(newMappings);
    } catch (err) {
      console.error('Error processing file:', err);
      alert('Error processing file. Please check the format.');
    }
  };

  const handleExport = (key) => {
    const data = localStorage.getItem(key);
    if (!data) return;
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${key}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Import/Export Center</h1>
      
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          className={`px-3 py-1 rounded ${activeTab === 'import' ? 'bg-blue-500 text-white' : 'bg-blue-100'}`}
          onClick={() => setActiveTab('import')}
        >
          Import Data
        </button>
        <button
          className={`px-3 py-1 rounded ${activeTab === 'export' ? 'bg-blue-500 text-white' : 'bg-blue-100'}`}
          onClick={() => setActiveTab('export')}
        >
          Export Data
        </button>
      </div>

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold mb-4">Import Data</h2>
          <input
            type="file"
            accept=".csv,.json"
            onChange={handleFileUpload}
            className="border p-2 w-full"
          />
          
          {uploadedFile && previewData.rows.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Preview (First 5 Records)</h3>
              <div className="overflow-x-auto">
                <table className="text-sm border w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      {previewData.columns.map((col, i) => (
                        <th key={i} className="p-2 border">
                          {col}
                          <select
                            value={fieldMappings[col] || ''}
                            onChange={(e) => setFieldMappings({
                              fieldMappings,
                              [col]: e.target.value
                            })}
                            className="block mt-1 border p-1 rounded text-xs w-full"
                          >
                            <option value="name">Name</option>
                            <option value="email">Email</option>
                            <option value="job">Job Title</option>
                            <option value="ignore">Ignore</option>
                          </select>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.rows.slice(0, 5).map((row, i) => (
                      <tr key={i}>
                        {previewData.columns.map((col, j) => (
                          <td key={j} className="p-2 border">{row[col]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="aiMatching" disabled />
                  <label htmlFor="aiMatching" className="text-gray-600">
                    Enable AI Matching (coming soon)
                  </label>
                </div>

                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-blue-100 rounded" disabled>
                    Save Mapping Template
                  </button>
                  <button className="px-3 py-1 bg-blue-100 rounded" disabled>
                    Load Template
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold mb-4">Export Data</h2>
          
          <div className="space-y-4">
            {['mockCandidates', 'mockTimesheets', 'mockClientApprovals'].map(key => {
              const data = JSON.parse(localStorage.getItem(key) || '[]');
              return (
                <div key={key} className="border rounded p-4">
                  <h3 className="font-semibold mb-2">{key}</h3>
                  <pre className="text-xs bg-gray-50 p-2 rounded mb-2">
                    {JSON.stringify(data.slice(0, 3), null, 2)}
                  </pre>
                  <button
                    onClick={() => handleExport(key)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Download JSON
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
