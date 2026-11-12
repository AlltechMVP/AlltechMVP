import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Toast from './Toast.jsx';

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, ...t }]);
  }, []);
  const removeToast = useCallback((id) => setToasts((p) => p.filter((x) => x.id !== id)), []);

  const value = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] grid gap-2">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToasts() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToasts must be used within <ToastProvider>');
  return ctx;
}
