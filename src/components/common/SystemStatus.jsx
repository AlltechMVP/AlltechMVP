
import React from "react";

export default function SystemStatus() {
  const uptime = "99.9%";
  const lastDeploy = new Date().toLocaleString();
  const env = "Mock | LocalStorage Only";

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">System Status</h2>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          <span>System Operational</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded p-3">
            <div className="text-sm text-gray-600">Uptime</div>
            <div className="font-semibold">{uptime}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-sm text-gray-600">Environment</div>
            <div className="font-semibold">{env}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-sm text-gray-600">Last Deployment</div>
            <div className="font-semibold">{lastDeploy}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-sm text-gray-600">Auth Status</div>
            <div className="font-semibold">Mock Users Active</div>
          </div>
        </div>
      </div>
    </div>
  );
}
