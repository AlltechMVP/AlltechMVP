import React, { useState } from 'react';
import { useKbArticles } from '@/hooks/useKbArticles.js';
import { useKbSearch } from '@/hooks/useKbSearch.js';
import { useAuth } from '@/context/AuthContext.jsx';
import { Loader, Empty } from '@/components/ui';

export default function BrowseKb() {
  const { role } = useAuth();
  const { data, loading } = useKbArticles({ role });
  const [q, setQ] = useState('');
  const results = useKbSearch(data, q);

  if (loading) return <div className="p-4"><Loader label="Loading knowledge base…" /></div>;

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">Knowledge Base</h1>
      <input className="border rounded px-3 py-2 text-sm" placeholder="Search articles…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="grid gap-2">
        {results.length === 0 && <Empty title="No articles yet" hint="Try a different query." />}
        {results.map(a => (
          <article key={a.id} className="border rounded-lg p-3 bg-white">
            <div className="font-medium">{a.title}</div>
            <div className="text-xs text-gray-500">Tags: {(a.tags || []).join(', ')}</div>
            <p className="mt-2 text-sm whitespace-pre-wrap">{a.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
