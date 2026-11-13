
export const isDev = import.meta.env.MODE !== 'production';

// Demo Mode: a separate demo deployment sets VITE_DEMO_MODE=true (and
// points at the demo Supabase project, synthetic data only). Demo Mode
// enables the persona switcher so a presenter can flip between roles in
// one click without signing in and out. It does NOT enable the other
// dev-only conveniences (mock user, devLoginAs) — demo sign-ins are real
// test accounts. Production never sets this flag, so the switcher stays
// off there. The demo database runs permissive demo-appropriate rules,
// so the UI persona is authoritative in demo mode; production keeps the
// strict RLS from slice 7.
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

// The persona/role switcher is available in local dev AND in Demo Mode.
export const canUseRoleSwitcher = isDev || isDemoMode;

export const mockUser = {
  id: 'demo-user-123',
  email: 'demo@alltech.com',
  role: 'recruiter',
  name: 'Demo User'
};
