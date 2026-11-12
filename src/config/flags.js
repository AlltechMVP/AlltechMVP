export const appEnv = import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development';

const flagsRaw = (import.meta.env.VITE_FLAGS || '').trim();
const flagSet = new Set(flagsRaw ? flagsRaw.split(/\s*,\s*/) : []);

export function flagEnabled(name) {
  return flagSet.has(name);
}

export function isStagingLike() {
  return appEnv !== 'production' || flagEnabled('SHOW_STAGING_BANNER');
}
