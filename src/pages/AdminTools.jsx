
import { users } from "../data/users";
import { useState } from "react";

function AdminTools() {
  const [data, setData] = useState(users);

  const handleRemove = (id) => {
    setData(data.filter((user) => user.id !== id));
    alert("User removed.");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Tools Center</h1>
      <table className="w-full text-left border mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((u) => (
            <tr key={u.id}>
              <td className="p-2 border">{u.name}</td>
              <td className="p-2 border">{u.role}</td>
              <td className="p-2 border">
                <button
                  onClick={() => handleRemove(u.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="px-4 py-2 bg-green-600 text-white rounded">
        Export User List
      </button>
    </div>
  );
}

export default AdminTools;
