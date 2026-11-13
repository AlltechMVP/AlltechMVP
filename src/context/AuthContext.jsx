// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { isDev, canUseRoleSwitcher } from '@/config/dev';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null); // { id, email, role, client_id, is_client_approver }
  const [loading, setLoading] = useState(true);

  // DEV + DEMO role override for testing/presenting: changes only the
  // effective role used for navigation, never the signed-in account.
  // Persisted so it survives a reload mid-test; cleared on sign-out.
  // Slice 7: the override is DISABLED in production (gated on
  // canUseRoleSwitcher — local dev + Demo Mode only, not deleted).
  // The backend never sees the override: RLS keys off auth.uid() ->
  // profiles, which the override cannot touch. A leftover key from a dev
  // build is cleared on load so it can never change the effective role.
  // In Demo Mode the demo database runs permissive demo-appropriate
  // rules, so the UI persona is authoritative there.
  const [roleOverride, setRoleOverrideState] = useState(() => {
    if (!canUseRoleSwitcher) {
      try { localStorage.removeItem('alltech_role_override'); } catch { /* ignore */ }
      return null;
    }
    try { return localStorage.getItem('alltech_role_override') || null; } catch { return null; }
  });
  const setRoleOverride = (role) => {
    if (!canUseRoleSwitcher) return;
    setRoleOverrideState(role);
    try {
      if (role) localStorage.setItem('alltech_role_override', role);
      else localStorage.removeItem('alltech_role_override');
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
    localStorage.removeItem('alltech_role_override');
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

  // Load current session and subscribe to changes
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
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
