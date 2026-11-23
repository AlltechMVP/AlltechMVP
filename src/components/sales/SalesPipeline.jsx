import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getClients, getJobs } from "@/utils/storage";
import {
  fetchClients,
  fetchJobs,
  reconcileClients,
  reconcileJobs,
  isRlsDenied,
} from "@/lib/pipeline";
import { AccessDenied } from "@/components/ui";

// Sales Pipeline, built from live CRM records — no invented numbers.
// The CRM holds no deal stages or deal values, so there is no Discovery /
// Demo Scheduled / Proposal Sent funnel to show. The honest funnel is the
// one the data supports: Prospects -> Active Clients -> Open Orders,
// with the actual company and order names under each stage.
const SalesPipeline = () => {
  const [clients, setClients] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // One settled render: reconcile first, then paint once.
        await reconcileClients();
        await reconcileJobs();
        const [liveClients, liveJobs] = await Promise.all([fetchClients(), fetchJobs()]);
        if (!mounted) return;
        setClients(liveClients);
        setJobs(liveJobs);
      } catch (err) {
        if (isRlsDenied(err)) {
          if (mounted) setDenied(true);
        } else if (mounted) {
          setClients(getClients());
          setJobs(getJobs());
          setUsingFallback(true);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (denied) {
    return <AccessDenied />;
  }

  // In live mode a job's clientId is the numeric Supabase client id and a
  // client's key is supabaseClientId; in demo-store fallback both are the
  // legacy ids (client-001). Same split as the Companies list.
  const clientKey = (c) => (usingFallback ? c.id : c.supabaseClientId);
  const openOrdersFor = (c) =>
    jobs.filter(
      (j) => String(j.clientId) === String(clientKey(c)) && j.status === "Open"
    );

  const prospects = clients.filter((c) => c.status === "Prospect");
  const activeClients = clients.filter((c) => c.status === "Active");
  const openOrders = jobs.filter((j) => j.status === "Open");
  const clientNameFor = (job) => {
    const c = clients.find(
      (x) => String(clientKey(x)) === String(job.clientId)
    );
    return c ? c.name : "—";
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-2">Sales Pipeline</h1>
      <p className="text-gray-500 text-sm mb-4">
        Live CRM funnel — prospects, active clients, and their open orders.
        The CRM holds no deal stages or values, so this shows the real
        prospect-to-order flow instead of a staged forecast.
      </p>
      {usingFallback && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
          Showing local demo data — the shared CRM records are unreachable right now.
        </p>
      )}
      {loading ? (
        <p className="text-gray-500 text-sm">Loading pipeline…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border p-4 rounded shadow bg-white">
            <h2 className="text-lg font-semibold">Prospects</h2>
            <p className="text-3xl font-bold mt-2">{prospects.length}</p>
            {prospects.length === 0 ? (
              <p className="text-sm text-gray-500 mt-2">No prospects yet.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {prospects.map((c) => (
                  <li key={c.id} className="text-sm">
                    <Link to={`/companies/${c.id}`} className="text-blue-600 hover:underline">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border p-4 rounded shadow bg-white">
            <h2 className="text-lg font-semibold">Active Clients</h2>
            <p className="text-3xl font-bold mt-2">{activeClients.length}</p>
            {activeClients.length === 0 ? (
              <p className="text-sm text-gray-500 mt-2">No active clients yet.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {activeClients.map((c) => {
                  const open = openOrdersFor(c).length;
                  return (
                    <li key={c.id} className="text-sm">
                      <Link to={`/companies/${c.id}`} className="text-blue-600 hover:underline">
                        {c.name}
                      </Link>
                      <span className="text-gray-500">
                        {" "}
                        — {open} open order{open === 1 ? "" : "s"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border p-4 rounded shadow bg-white">
            <h2 className="text-lg font-semibold">Open Orders</h2>
            <p className="text-3xl font-bold mt-2">{openOrders.length}</p>
            {openOrders.length === 0 ? (
              <p className="text-sm text-gray-500 mt-2">No open orders yet.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {openOrders.map((j) => (
                  <li key={j.legacyId || j.id} className="text-sm">
                    <Link
                      to={`/jobs/${j.legacyId || j.id}/candidates`}
                      className="text-blue-600 hover:underline"
                    >
                      {j.title}
                    </Link>
                    <span className="text-gray-500"> — {clientNameFor(j)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPipeline;
