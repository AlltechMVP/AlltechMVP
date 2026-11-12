import React, { useMemo, useState } from 'react';
import { useKbArticles } from '@/hooks/useKbArticles.js';
import { useKbSearch } from '@/hooks/useKbSearch.js';
import { useAuth } from '@/context/AuthContext.jsx';

export default function AssistantPanel({ open, onClose }) {
  const { role } = useAuth();
  const { data: articles } = useKbArticles({ role });
  const [query, setQuery] = useState('');
  const [tags, setTags] = useState([]);
  const results = useKbSearch(articles, query, tags);

  const allTags = useMemo(() => {
    const t = new Set();
    (articles || []).forEach(a => (a.tags || []).forEach(x => t.add(x)));
    return Array.from(t).sort();
  }, [articles]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30">
      <div className="w-full sm:max-w-2xl bg-white rounded-2xl shadow-xl m-2 p-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Assistant</div>
          <button className="px-2 py-1 text-sm border rounded" onClick={onClose}>Close</button>
        </div>

        <div className="mt-3">
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Ask a question (e.g., *How do client approvals work?*)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {allTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {allTags.map(t => (
                <button
                  key={t}
                  className={`px-2 py-1 text-xs border rounded ${tags.includes(t) ? 'bg-gray-900 text-white' : ''}`}
                  onClick={() => setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                >{t}</button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-2 max-h-80 overflow-auto">
          {results.map(r => (
            <article key={r.id} className="border rounded-lg p-3">
              <div className="font-medium">{r.title}</div>
              <div className="text-xs text-gray-500">Tags: {(r.tags || []).join(', ')}</div>
              <p className="mt-2 text-sm whitespace-pre-wrap">{r.body}</p>
            </article>
          ))}
          {results.length === 0 && (
            <div className="text-sm text-gray-600">No results yet. Try searching or selecting a tag.</div>
          )}
        </div>
      </div>
    </div>
  );
}
