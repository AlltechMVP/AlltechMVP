
import React from "react";

const DevRoleSelector = ({ selectedRole, setSelectedRole }) => {
  if (localStorage.getItem("devMode") !== "true") return null;

  return (
    <div className="p-2">
      <label className="mr-2 text-sm font-medium">Dev Role Override:</label>
      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        className="border px-2 py-1 rounded"
      >
        <option value="">Select role</option>
        <option value="recruiter">Recruiter</option>
        <option value="client">Client</option>
        <option value="candidate">Candidate</option>
        <option value="admin">Admin</option>
        <option value="cfo">CFO</option>
        <option value="ceo">CEO</option>
      </select>
    </div>
  );
};

export default DevRoleSelector;
