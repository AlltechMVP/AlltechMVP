import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AppRoutes from '@/routes/index.jsx';
import { validateSystem, getSeedVersion, getExpectedSeedVersion, seedIfMissing, reconcileAll } from '@/utils/storage';

export default function App() {
  const [versionBanner, setVersionBanner] = useState(false);
  const [healthBanner, setHealthBanner] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  // Re-read the seed version and the validator from the (local) demo
  // store. Runs on mount and again after a demo reset — the banners are
  // app-level state, so without the refresh a stale "1 error" count (or
  // a stale version warning) would linger until a full page reload.
  const refreshBanners = useCallback(() => {
    const current = getSeedVersion();
    const expected = getExpectedSeedVersion();
    setVersionBanner(Boolean(current && current !== expected));

    try {
      const result = validateSystem();
      const total = result.errors.length + result.warnings.length;
      if (total > 0) {
        console.info(
          `[System Validator] ${result.errors.length} error(s), ${result.warnings.length} warning(s). Visit /tools for details.`
        );
      }
      setHealthBanner(result.errors.length > 0);
      setErrorCount(result.errors.length);
    } catch (e) {
      console.warn('[System Validator] Failed to run:', e);
    }
  }, []);

  useEffect(() => {
    seedIfMissing();
    reconcileAll();
    refreshBanners();
  }, [refreshBanners]);

  // The demo reset lives in AdminTools (a routed child) — it dispatches
  // this event once the fresh seed is in place.
  useEffect(() => {
    window.addEventListener('alltech:demo-reset', refreshBanners);
    return () => window.removeEventListener('alltech:demo-reset', refreshBanners);
  }, [refreshBanners]);

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
