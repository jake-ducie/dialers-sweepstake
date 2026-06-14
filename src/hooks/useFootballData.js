import { useState, useEffect, useCallback } from 'react';

const cache = {};

export function useApi(path, enabled = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch_ = useCallback(async () => {
    if (!path || !enabled) return;
    if (cache[path]) { setData(cache[path]); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/football?path=${encodeURIComponent(path)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      cache[path] = json;
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [path, enabled]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { data, loading, error, refetch: fetch_ };
}
