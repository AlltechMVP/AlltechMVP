
function ComplianceSettings() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Compliance Settings</h1>
      <div className="space-y-4">
        <div className="border rounded p-4">
          <p>Background Check Provider: Not connected</p>
          <p className="text-sm text-gray-500 mt-1">No background-check integration is set up — background check consent is tracked as an onboarding checklist task.</p>
        </div>
        <div className="border rounded p-4">
          <p>I-9/E-Verify: Not connected</p>
          <p className="text-sm text-gray-500 mt-1">No E-Verify integration is set up — I-9 completion is tracked as an onboarding checklist task.</p>
        </div>
      </div>
    </div>
  );
}

export default ComplianceSettings;
