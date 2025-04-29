
function AccountSettings() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Account Settings</h1>
      <div className="border rounded p-4">
        <label className="block mb-2">
          Name:
          <input type="text" value="Dalton DeLeon" className="border p-2 w-full rounded" disabled />
        </label>
        <label className="block mb-2">
          Email:
          <input type="email" value="dalton@example.com" className="border p-2 w-full rounded" disabled />
        </label>
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          Update Password
        </button>
      </div>
    </div>
  );
}

export default AccountSettings;
