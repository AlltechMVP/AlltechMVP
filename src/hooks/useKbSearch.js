import { useMemo } from 'react';

export function useKbSearch(articles, query, tags = []) {
  const q = (query || '').trim().toLowerCase();
  const tagset = new Set((tags || []).map(t => t.toLowerCase()));

  return useMemo(() => {
    if (!articles || articles.length === 0) return [];
    if (!q && tagset.size === 0) return articles.slice(0, 20);

    const tokens = q ? q.split(/\s+/).filter(Boolean) : [];

    const scored = articles.map((a) => {
      const h = (a.title + ' ' + a.body + ' ' + (a.tags || []).join(' ')).toLowerCase();
      let score = 0;
      for (const t of tokens) if (h.includes(t)) score += 3;
      for (const t of tagset) if ((a.tags || []).some(x => String(x).toLowerCase() === t)) score += 2;
      return { ...a, _score: score };
    });

    return scored
      .filter(a => a._score > 0 || q || tagset.size > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 20);
  }, [articles, q, tags]);
}
