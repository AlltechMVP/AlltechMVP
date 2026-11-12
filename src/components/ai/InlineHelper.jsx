import React from 'react';
import { useKbArticles } from '@/hooks/useKbArticles.js';
import { useAuth } from '@/context/AuthContext.jsx';

export default function InlineHelper({ tag, className = '' }) {
  const { role } = useAuth();
  const { data = [] } = useKbArticles({ role });
  const hit = data.find(a => (a.tags || []).includes(tag));
  if (!hit) return null;
  return (
    <div className={`rounded-lg border p-3 bg-white ${className}`}>
      <div className="text-sm font-medium">Help: {hit.title}</div>
      <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{hit.body}</p>
    </div>
  );
}
