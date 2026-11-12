
import React, { useState, useEffect } from 'react';

export default function DemoModeToggle() {
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    const storedMode = localStorage.getItem('demoMode') === 'true';
    setDemoMode(storedMode);
  }, []);

  const toggleDemoMode = (enabled) => {
    setDemoMode(enabled);
    localStorage.setItem('demoMode', enabled.toString());
  };

  return (
    <>
      {demoMode && (
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 text-sm text-center">
          Demo Mode is Active – Data will not be saved
        </div>
      )}
      
      <div className="p-4 border-b">
        <label className="flex items-center cursor-pointer">
          <span className="mr-3 font-medium">Demo Mode</span>
          <div className="relative">
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => toggleDemoMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
        </label>
      </div>
    </>
  );
}
