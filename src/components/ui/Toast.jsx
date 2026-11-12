import React, { useEffect, useState } from 'react';

export default function Toast({ message, kind = 'info', duration = 2500, onClose }) {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => { setOpen(false); onClose?.(); }, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);
  if (!open) return null;
  return (
    <div className={`px-3 py-2 rounded-md shadow ${
      kind === 'error' ? 'bg-red-600 text-white' : kind === 'success' ? 'bg-green-600 text-white' : 'bg-gray-800 text-white'
    }`}>{message}</div>
  );
}
