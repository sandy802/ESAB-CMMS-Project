// hooks/useMutation.js
// Wraps POST / PATCH / DELETE calls.
// Calls onSuccess / onError callbacks so the page can refetch or show toasts.
//
// Usage:
//   const { mutate, loading } = useMutation('/api/assets', 'POST', {
//     onSuccess: (data) => { refetch(); toast.success('Created'); },
//     onError:   (msg)  => { toast.error(msg); },
//   });
//   await mutate({ name: 'Machine X', asset_code: 'ESAB-001' });
//
// For PATCH/DELETE with an id in the URL, pass the url dynamically:
//   const { mutate } = useMutation(`/api/assets/${id}`, 'PATCH', { ... });

import { useState, useCallback } from 'react';
import api from '../services/auth.api';

const useMutation = (url, method = 'POST', { onSuccess, onError } = {}) => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const mutate = useCallback(async (body = null) => {
    setLoading(true);
    setError(null);
    try {
      const config = { method: method.toLowerCase(), url };
      if (body !== null) config.data = body;
      const { data } = await api(config);
      onSuccess?.(data);
      return { success: true, data };
    } catch (err) {
      const msg = err?.response?.data?.message || 'Something went wrong.';
      setError(msg);
      onError?.(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [url, method, onSuccess, onError]);

  return { mutate, loading, error };
};

export default useMutation;