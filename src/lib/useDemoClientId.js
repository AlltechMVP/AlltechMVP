import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext.jsx';
import { getDemoClientId } from '@/utils/storage';

// The client whose rows the signed-in user may see on client-facing pages:
// profiles.client_id 1-4 maps to the seeded demo ids client-001..004.
// A user with no client link yet (e.g. the demo persona switcher, which
// fakes the role without a client profile) falls back to the demo client.
export function useDemoClientId() {
  const { profile } = useAuth();
  return useMemo(() => {
    const cid = profile?.client_id;
    if (cid !== undefined && cid !== null && cid !== '') {
      return `client-${String(cid).padStart(3, '0')}`;
    }
    return getDemoClientId();
  }, [profile?.client_id]);
}
