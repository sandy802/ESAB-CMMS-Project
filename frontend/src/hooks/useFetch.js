// hooks/useFetch.js
// Fixed: removed urlRef pattern — url is passed directly into the fetch call.
// The urlRef approach had a stale closure bug where fetch() could run with
// the wrong URL if the component mounted before the ref updated.

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/auth.api';

const useFetch = (url) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(!!url); // false if url is empty/null
  const [error,   setError]   = useState(null);

  // Track mounted state to avoid setting state after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchData = useCallback(async (targetUrl, silent = false) => {
    if (!targetUrl) return;
    if (!silent) {
      if (mountedRef.current) setLoading(true);
    }
    if (mountedRef.current) setError(null);

    try {
      const { data: responseData } = await api.get(targetUrl);
      if (mountedRef.current) setData(responseData);
    } catch (err) {
      if (mountedRef.current) {
        const msg = err?.response?.data?.message || 'Failed to load data.';
        setError(msg);
        setData(null);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  // Re-fetch whenever URL changes
  useEffect(() => {
    if (url) {
      fetchData(url);
    } else {
      setData(null);
      setLoading(false);
    }
  }, [url, fetchData]);

  const refetch = useCallback(
    (silent = false) => fetchData(url, silent),
    [url, fetchData]
  );

  return { data, loading, error, refetch };
};

export default useFetch;