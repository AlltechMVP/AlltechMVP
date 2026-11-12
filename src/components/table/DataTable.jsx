import React, { useMemo, useState } from 'react';

export default function DataTable({ columns, rows, pageSize = 10, searchable = true }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: null, dir: 'asc' });
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let data = rows || [];
    if (query) {
      const q = query.toLowerCase();
      data = data.filter((r) => Object.values(r).some(v => String(v ?? '').toLowerCase().includes(q)));
    }
    if (sort.key) {
      data = [...data].sort((a, b) => {
        const av = a[sort.key];
        const bv = b[sort.key];
        if (av === bv) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        return sort.dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
    }
    return data;
  }, [rows, query, sort]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  const onSort = (key) => setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));

  return (
    <div className="w-full">
      {searchable && (
        <div className="mb-2">
          <input
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder="Search…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            aria-label="Search table"
          />
        </div>
      )}

      <div className="overflow-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="text-left font-medium px-3 py-2 whitespace-nowrap">
                  <button className="flex items-center gap-1" onClick={() => onSort(c.key)}>
                    <span>{c.header}</span>
                    {sort.key === c.key && <span aria-hidden>({sort.dir})</span>}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r, i) => (
              <tr key={r.id || i} className={i % 2 ? 'bg-white' : 'bg-gray-50/40'}>
                {columns.map((c) => (
                  <td key={c.key} className="px-3 py-2 whitespace-nowrap">
                    {c.render ? c.render(r[c.key], r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
        <span>
          {total === 0 ? '0 results' : `${start + 1}-${Math.min(start + pageSize, total)} of ${total}`}
        </span>
        <div className="flex items-center gap-1">
          <button className="border rounded px-2 py-1" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Prev
          </button>
          <span>Page {page} / {totalPages}</span>
          <button className="border rounded px-2 py-1" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
