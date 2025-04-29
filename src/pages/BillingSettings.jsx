
function BillingSettings() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Billing Settings</h1>
      <div className="border rounded p-4">
        <p>Current Plan: <strong>Professional</strong></p>
        <p>Renewal Date: <strong>May 15, 2025</strong></p>
        <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
          Manage Payment Info
        </button>
      </div>
    </div>
  );
}

export default BillingSettings;
