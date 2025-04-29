
function ComplianceSettings() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Compliance Settings</h1>
      <div className="space-y-4">
        <div className="border rounded p-4">
          <p>Background Check Provider: VerifiedNow</p>
          <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
            Update Integration
          </button>
        </div>
        <div className="border rounded p-4">
          <p>I-9/E-Verify: Enabled</p>
          <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
            Manage Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default ComplianceSettings;
