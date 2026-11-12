import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppRoutes from '@/routes/index.jsx';
import { validateSystem, getSeedVersion, getExpectedSeedVersion, seedIfMissing, reconcileAll } from '@/utils/storage';

export default function App() {
  const [versionBanner, setVersionBanner] = useState(false);
  const [healthBanner, setHealthBanner] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    seedIfMissing();
    reconcileAll();

    const current = getSeedVersion();
    const expected = getExpectedSeedVersion();
    if (current && current !== expected) {
      setVersionBanner(true);
    }

    try {
      const result = validateSystem();
      const total = result.errors.length + result.warnings.length;
      if (total > 0) {
        console.info(
          `[System Validator] ${result.errors.length} error(s), ${result.warnings.length} warning(s). Visit /tools for details.`
        );
        if (result.errors.length > 0) {
          setHealthBanner(true);
          setErrorCount(result.errors.length);
        }
      }
    } catch (e) {
      console.warn('[System Validator] Failed to run:', e);
    }
  }, []);

  return (
    <>
      {versionBanner && (
        <div className="bg-amber-100 border-b border-amber-300 px-4 py-2 text-sm text-amber-800 flex items-center justify-between">
          <span>
            Demo data may be outdated (version: {getSeedVersion()}).{' '}
            <Link to="/tools" className="underline font-medium">Reset from Tools</Link> for the latest experience.
          </span>
          <button
            onClick={() => setVersionBanner(false)}
            className="text-amber-600 hover:text-amber-800 ml-2 font-bold"
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      )}
      {healthBanner && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-700 flex items-center justify-between">
          <span>
            Data issues detected ({errorCount} error{errorCount !== 1 ? 's' : ''}) &mdash;{' '}
            <Link to="/tools" className="underline font-medium">open Tools to review</Link>.
          </span>
          <button
            onClick={() => setHealthBanner(false)}
            className="text-red-500 hover:text-red-700 ml-2 font-bold"
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      )}
      <AppRoutes />
    </>
  );
}
