import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext.jsx';
import {
  ALL_ROLES, ADMIN_FLOOR_CAPABILITIES, CAPABILITY_CATALOG,
  DEFAULT_CAPABILITIES, invalidateCapabilityCache,
} from '@/lib/capabilities';
import { useToasts } from '@/components/ui/ToastProvider.jsx';
import Loader from '@/components/ui/Loader.jsx';

// Slice 7 (ATS/CRM milestone): /admin/permissions — compose each role from
// capabilities. The grid edits role_capabilities (prod DB); every change is
// written to capability_audit_log. The DEMO DB has no role_capabilities
// table, so there the page is read-only and shows the default template.
//
// Admin floor (break-glass, Dalton 2026-11-12): the admin role ALWAYS keeps
// permissions.manage + roles.assign — the DB function enforces it too, but
// the UI refuses the revoke first (the checkboxes are locked) and the save
// double-checks the diff. A non-admin cannot open this page at all (the
// route requires permissions.manage), so the save cannot be used to
// self-elevate.
const GROUPS = [];
CAPABILITY_CATALOG.forEach(({ area, capability, description }) => {
  let g = GROUPS.find((x) => x.area === area);
  if (!g) { g = { area, items: [] }; GROUPS.push(g); }
  g.items.push({ capability, description });
});

function grantsFromRows(rows) {
  const out = {};
  ALL_ROLES.forEach((r) => { out[r] = new Set(DEFAULT_CAPABILITIES[r] || []); });
  return out;
}

function cloneGrants(g) {
  const out = {};
  Object.keys(g).forEach((r) => { out[r] = new Set(g[r]); });
  return out;
}

export default function Permissions() {
  const { session, profile } = useAuth();
  const { addToast } = useToasts();
  const [grants, setGrants] = useState(() => grantsFromRows());
  const [savedGrants, setSavedGrants] = useState(() => grantsFromRows());
  const [loading, setLoading] = useState(true);
  const [usingDefaults, setUsingDefaults] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [audit, setAudit] = useState([]);

  const adminEmail = session?.user?.email || profile?.email || 'unknown';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Live grants (admin sees all rows). Any failure — the table does
      // not exist on the demo DB, network down, RLS denial — falls back
      // to the default template and the page becomes read-only.
      const { data, error: qErr } = await supabase
        .from('role_capabilities')
        .select('role, capability')
        .eq('tenant_id', 'demo');
      if (cancelled) return;
      if (qErr || !Array.isArray(data)) {
        setUsingDefaults(true);
        setGrants(grantsFromRows());
        setSavedGrants(grantsFromRows());
      } else {
        const live = {};
        ALL_ROLES.forEach((r) => { live[r] = new Set(); });
        data.forEach(({ role, capability }) => {
          if (live[role] && capability) live[role].add(capability);
        });
        // The floor holds even if the table lost the rows.
        ADMIN_FLOOR_CAPABILITIES.forEach((c) => live.admin.add(c));
        setGrants(live);
        setSavedGrants(cloneGrants(live));
      }
      setLoading(false);
      const { data: log } = await supabase
        .from('capability_audit_log')
        .select('admin_email, role, capability, action, created_at')
        .eq('tenant_id', 'demo')
        .order('created_at', { ascending: false })
        .limit(10);
      if (!cancelled && Array.isArray(log)) setAudit(log);
    })();
    return () => { cancelled = true; };
  }, []);

  const dirty = useMemo(() => {
    for (const r of ALL_ROLES) {
      if (grants[r].size !== savedGrants[r].size) return true;
      for (const c of grants[r]) if (!savedGrants[r].has(c)) return true;
    }
    return false;
  }, [grants, savedGrants]);

  const toggle = (role, capability) => {
    if (role === 'admin' && ADMIN_FLOOR_CAPABILITIES.includes(capability)) return;
    setGrants((prev) => {
      const next = cloneGrants(prev);
      if (next[role].has(capability)) next[role].delete(capability);
      else next[role].add(capability);
      return next;
    });
  };

  const handleReset = () => {
    setGrants(cloneGrants(savedGrants));
    setMessage('');
    setError('');
  };

  const handleSave = async () => {
    setError('');
    setMessage('');
    // Defensive floor check (the UI locks these cells, but never trust it).
    for (const cap of ADMIN_FLOOR_CAPABILITIES) {
      if (!grants.admin.has(cap)) {
        setError(`Refused: the admin role must keep ${cap} (break-glass floor).`);
        return;
      }
    }
    if (usingDefaults) {
      setError('The live grants table is not reachable here, so changes cannot be saved.');
      return;
    }
    const toGrant = [];
    const toRevoke = [];
    for (const r of ALL_ROLES) {
      for (const c of grants[r]) if (!savedGrants[r].has(c)) toGrant.push({ role: r, capability: c });
      for (const c of savedGrants[r]) if (!grants[r].has(c)) toRevoke.push({ role: r, capability: c });
    }
    if (toGrant.length === 0 && toRevoke.length === 0) return;
    setSaving(true);
    try {
      // Grants first, then revokes, then one audit row per change.
      if (toGrant.length > 0) {
        const { error: insErr } = await supabase.from('role_capabilities').upsert(
          toGrant.map(({ role, capability }) => ({
            tenant_id: 'demo', role, capability, granted_by: adminEmail,
          })),
          { onConflict: 'tenant_id,role,capability' },
        );
        if (insErr) throw new Error(`Could not save grants: ${insErr.message}`);
      }
      for (const { role, capability } of toRevoke) {
        const { error: delErr } = await supabase
          .from('role_capabilities')
          .delete()
          .eq('tenant_id', 'demo')
          .eq('role', role)
          .eq('capability', capability);
        if (delErr) throw new Error(`Could not revoke ${capability} from ${role}: ${delErr.message}`);
      }
      const auditRows = [
        ...toGrant.map(({ role, capability }) => ({
          admin_email: adminEmail, role, capability, action: 'grant', tenant_id: 'demo',
        })),
        ...toRevoke.map(({ role, capability }) => ({
          admin_email: adminEmail, role, capability, action: 'revoke', tenant_id: 'demo',
        })),
      ];
      const { error: logErr } = await supabase.from('capability_audit_log').insert(auditRows);
      if (logErr) throw new Error(`Grants saved but the audit log failed: ${logErr.message}`);
      setSavedGrants(cloneGrants(grants));
      invalidateCapabilityCache();
      const msg = `Saved: ${toGrant.length} grant(s), ${toRevoke.length} revoke(s).`;
      setMessage(msg);
      addToast({ type: 'success', message: msg });
      const { data: log } = await supabase
        .from('capability_audit_log')
        .select('admin_email, role, capability, action, created_at')
        .eq('tenant_id', 'demo')
        .order('created_at', { ascending: false })
        .limit(10);
      if (Array.isArray(log)) setAudit(log);
    } catch (err) {
      setError(err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4"><Loader label="Loading permissions…" /></div>;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-semibold">Permissions</h1>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            disabled={!dirty || saving}
            className="border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty || saving || usingDefaults}
            title={usingDefaults ? 'The live grants table is not reachable in this environment.' : ''}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Compose each role from capabilities. Deny-by-default: a role can only do what is
        checked here. The admin role always keeps <code>permissions.manage</code> and{' '}
        <code>roles.assign</code> (break-glass floor — those boxes are locked).
      </p>
      {usingDefaults && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
          Showing the default template — the live grants table is not reachable in this
          environment (the demo database has no role_capabilities table), so changes
          cannot be saved here. On production this page edits the live grants.
        </p>
      )}
      {error && (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{error}</p>
      )}
      {message && (
        <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded px-3 py-2 mb-4">{message}</p>
      )}

      <div className="overflow-x-auto border rounded-xl bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-3 py-2 font-semibold sticky left-0 bg-gray-50">Capability</th>
              {ALL_ROLES.map((r) => (
                <th key={r} className="px-2 py-2 font-semibold text-center capitalize">{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GROUPS.map((g) => (
              <React.Fragment key={g.area}>
                <tr className="bg-gray-100">
                  <td colSpan={ALL_ROLES.length + 1} className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {g.area}
                  </td>
                </tr>
                {g.items.map(({ capability, description }) => (
                  <tr key={capability} className="border-t">
                    <td className="px-3 py-2 sticky left-0 bg-white">
                      <span className="font-mono text-xs">{capability}</span>
                      <span className="block text-xs text-gray-500">{description}</span>
                    </td>
                    {ALL_ROLES.map((r) => {
                      const locked = r === 'admin' && ADMIN_FLOOR_CAPABILITIES.includes(capability);
                      return (
                        <td key={r} className="px-2 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={grants[r].has(capability)}
                            disabled={locked || saving}
                            title={locked ? 'Locked: the admin role always keeps this (break-glass floor).' : `${capability} for ${r}`}
                            onChange={() => toggle(r, capability)}
                            className="h-4 w-4"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {audit.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold mb-2">Recent changes</h2>
          <ul className="text-xs text-gray-600 space-y-1">
            {audit.map((a, i) => (
              <li key={i}>
                {a.created_at ? new Date(a.created_at).toLocaleString() : ''} — {a.admin_email}{' '}
                {a.action === 'grant' ? 'granted' : 'revoked'}{' '}
                <span className="font-mono">{a.capability}</span> {a.action === 'grant' ? 'to' : 'from'} {a.role}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
