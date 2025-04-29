
function ImportExportCenter() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Import/Export Center</h1>
      <div className="space-y-6">
        <div className="border p-4 rounded shadow">
          <h2 className="font-bold mb-2">Upload Data</h2>
          <input type="file" className="border p-2 rounded w-full" />
          <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
            Upload
          </button>
        </div>

        <div className="border p-4 rounded shadow">
          <h2 className="font-bold mb-2">Download Templates</h2>
          <button className="bg-green-500 text-white px-4 py-2 rounded">
            Download CSV Template
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportExportCenter;
