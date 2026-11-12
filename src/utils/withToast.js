import { useToasts } from '@/components/ui/ToastProvider.jsx';

export function useWithToast() {
  const { addToast } = useToasts();
  async function withToast(fn, { success, error } = {}) {
    try {
      const res = await fn();
      if (res?.error) throw res.error;
      if (success) addToast({ message: success, kind: 'success' });
      return res;
    } catch (e) {
      addToast({ message: error || (e?.message || 'Something went wrong'), kind: 'error' });
      return { error: e };
    }
  }
  return { withToast };
}
