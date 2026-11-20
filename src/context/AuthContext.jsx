// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { isDev, canUseRoleSwitcher } from '@/config/dev';

const AuthContext = createContext(null);

// The demo "View as" override belongs to the account that picked it:
// the override's owner (auth user id) is stored alongside it, so a
// leftover key from another account can never change the new account's
// effective role.
const OVERRIDE_KEY = 'alltech_role_override';
const OVERRIDE_OWNER_KEY = 'alltech_role_override_for';

// Synchronously read the signed-in user id from the stored session, if
// any (the Supabase session token, sb-*-auth-token, written at sign-in).
// Returns null when nobody is signed in.
function storedSessionUserId() {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        const parsed = JSON.parse(localStorage.getItem(key) || 'null');
        if (parsed?.user?.id) return parsed.user.id;
      }
    }
  } catch { /* ignore — fall through to null */ }
  return null;
}

function clearStoredOverride() {
  try {
    localStorage.removeItem(OVERRIDE_KEY);
    localStorage.removeItem(OVERRIDE_OWNER_KEY);
  } catch { /* ignore */ }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null); // { id, email, role, client_id, is_client_approver }
  const [loading, setLoading] = useState(true);

  // DEV + DEMO role override for testing/presenting: changes only the
  // effective role used for navigation, never the signed-in account.
  // Persisted so it survives a reload mid-test; cleared on sign-out and
  // whenever a different account signs in. Slice 7: the override is
  // DISABLED in production (gated on canUseRoleSwitcher — local dev +
  // Demo Mode only, not deleted). The backend never sees the override:
  // RLS keys off auth.uid() -> profiles, which the override cannot
  // touch. A leftover key from a dev build is cleared on load so it can
  // never change the effective role. In Demo Mode the demo database runs
  // permissive demo-appropriate rules, so the UI persona is authoritative
  // there.
  // The override is restored on load ONLY when it was set by the
  // currently signed-in account (owner id stored alongside it). A stale
  // override from another account — e.g. a backoffice persona picked
  // during an admin session — used to survive into the next account's
  // session on reload (observed 2026-11-20: candidate-test landing on
  // /finance/reports as "backoffice"); that key is now dropped.
  const [roleOverride, setRoleOverrideState] = useState(() => {
    if (!canUseRoleSwitcher) {
      clearStoredOverride();
      return null;
    }
    try {
      const stored = localStorage.getItem(OVERRIDE_KEY);
      if (!stored) return null;
      const owner = localStorage.getItem(OVERRIDE_OWNER_KEY);
      const currentUserId = storedSessionUserId();
      if (!owner || !currentUserId || owner !== currentUserId) {
        clearStoredOverride();
        return null;
      }
      return stored;
    } catch { return null; }
  });
  const setRoleOverride = (role) => {
    if (!canUseRoleSwitcher) return;
    setRoleOverrideState(role);
    try {
      if (role) {
        localStorage.setItem(OVERRIDE_KEY, role);
        const ownerId = session?.user?.id || profile?.id || null;
        if (ownerId) localStorage.setItem(OVERRIDE_OWNER_KEY, ownerId);
        else localStorage.removeItem(OVERRIDE_OWNER_KEY);
      } else {
        clearStoredOverride();
      }
    } catch { /* storage unavailable */ }
  };

  // DEV-ONLY: allow role override without Supabase
  const devLoginAs = (role) => {
    if (!isDev) return;
    const fake = { id: 'dev-user', email: 'dev@local', role };
    localStorage.setItem('user', JSON.stringify(fake));
    setSession({ user: { id: 'dev-user', email: 'dev@local' } });
    setProfile({ id: 'dev-user', email: 'dev@local', role });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    clearStoredOverride();
    setRoleOverrideState(null);
    setSession(null);
    setProfile(null);
  };

  const loadProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id,email,role,client_id,is_client_approver')
      .eq('id', userId)
      .single();
    if (!error && data) {
      setProfile(data);
      localStorage.setItem('user', JSON.stringify(data));
      return;
    }
    // No profile row yet (e.g. a restored or newly signed-up account):
    // fall back to the role stored on the auth user, so the session is
    // still recognised instead of bouncing back to /login.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // Slice 7: never trust user_metadata for a privileged role — a new
    // signup could self-assign one. Only the three low-privilege roles
    // may come from metadata; anything else defaults to recruiter.
    const metadataRole = user.user_metadata?.role;
    const fallback = {
      id: user.id,
      email: user.email,
      role: ['recruiter', 'candidate', 'client'].includes(metadataRole) ? metadataRole : 'recruiter',
    };
    setProfile(fallback);
    localStorage.setItem('user', JSON.stringify(fallback));
    // Self-heal: create the missing profile row for next time. Only when
    // the row is genuinely missing (PGRST116) — any other error (network,
    // missing column, denial) must NOT upsert, or it would overwrite a
    // real profile row with a default role.
    if (error && error.code === 'PGRST116') {
      await supabase.from('profiles').upsert(fallback);
    }
  };

  // The account the current session belongs to. The override is bound
  // to it: when a different account signs in (or the session ends), the
  // override is dropped so a stale persona can never leak into the new
  // session — including a sign-in that happens without a page reload,
  // where the initializer above does not re-run.
  const lastUserIdRef = useRef(null);

  // Load current session and subscribe to changes
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      lastUserIdRef.current = data.session?.user?.id || null;
      setSession(data.session ?? null);
      if (data.session?.user?.id) {
        await loadProfile(data.session.user.id);
      } else if (isDev) {
        // respect any dev-stored user
        const stored = safeParse(localStorage.getItem('user'));
        if (stored) setProfile(stored);
      }
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      const newUserId = newSession?.user?.id || null;
      if (lastUserIdRef.current && newUserId !== lastUserIdRef.current) {
        setRoleOverrideState(null);
        clearStoredOverride();
      }
      lastUserIdRef.current = newUserId;
      if (newSession?.user?.id) loadProfile(newSession.user.id);
      else setProfile(null);
    });

    return () => {
      mounted = false;
      sub.subscription?.unsubscribe?.();
    };
  }, []);

  const value = useMemo(() => ({
    loading,
    session,
    profile,
    // Slice 7: the override applies only in dev + Demo Mode. In
    // production the effective role is always the signed-in account's
    // real profile role.
    role: (canUseRoleSwitcher ? roleOverride : null) || profile?.role || null,
    roleOverride,
    setRoleOverride,
    devLoginAs,
    signOut,
  }), [loading, session, profile, roleOverride]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

function safeParse(text) {
  try { return JSON.parse(text || 'null'); } catch { return null; }
}
