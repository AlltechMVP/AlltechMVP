import React from 'react';
import { appEnv, isStagingLike } from '@/config/flags.js';

export default function StagingBanner() {
  if (!isStagingLike()) return null;
  return (
    <div className="w-full bg-yellow-100 text-yellow-900 border-b border-yellow-300">
      <div className="mx-auto max-w-7xl px-4 py-1 text-xs font-medium flex items-center gap-2">
        <span>⚠️</span>
        <span>This is a {appEnv} environment. Data may be test-only.</span>
      </div>
    </div>
  );
}
