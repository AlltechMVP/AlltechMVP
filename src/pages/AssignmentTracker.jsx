
import { useState } from "react";
import { assignments } from "../data/assignments";

function AssignmentTracker() {
  const [data, setData] = useState(assignments);

  const handlePunchIn = (id) => {
    setData((prev) =>
      prev.map((assign) =>
        assign.id === id ? { ...assign, punchedIn: !assign.punchedIn } : assign
      )
    );
    alert("Punch action recorded!");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Assignment Tracker</h1>
      <table className="w-full text-left border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Employee</th>
            <th className="p-2 border">Job</th> 
            <th className="p-2 border">Location</th>
            <th className="p-2 border">Shift</th>
            <th className="p-2 border">Punch Status</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((assign) => (
            <tr key={assign.id}>
              <td className="p-2 border">{assign.employee}</td>
              <td className="p-2 border">{assign.jobTitle}</td>
              <td className="p-2 border">{assign.location}</td>
              <td className="p-2 border">{assign.shiftStart} - {assign.shiftEnd}</td>
              <td className="p-2 border">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  assign.punchedIn ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {assign.punchedIn ? "Punched In" : "Not Punched"}
                </span>
              </td>
              <td className="p-2 border">
                <button
                  className={`px-4 py-2 rounded ${
                    assign.punchedIn ? "bg-red-500" : "bg-green-500"
                  } text-white hover:opacity-90`}
                  onClick={() => handlePunchIn(assign.id)}
                >
                  {assign.punchedIn ? "Punch Out" : "Punch In"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AssignmentTracker;
