"use client";
import { useState, useEffect, useCallback, useRef } from "react";

interface FetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

interface FetchOptions<T> {
  refreshInterval?: number;
  transform?: (data: unknown) => T;
  cacheKey?: string;
  enabled?: boolean;
}

const cache = new Map<string, { data: unknown; timestamp: number }>();

export function useFetch<T = unknown>(
  url: string | null,
  options: FetchOptions<T> = {}
): FetchResult<T> {
  const {
    refreshInterval = 5 * 60 * 1000,
    transform = (data: unknown) => data as T,
    cacheKey = url ?? "",
    enabled = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transformRef = useRef(transform);
  transformRef.current = transform;

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (!enabled || !url) return;

      if (!isRefresh && cache.has(cacheKey)) {
        const cached = cache.get(cacheKey)!;
        if (Date.now() - cached.timestamp < refreshInterval) {
          setData(cached.data as T);
          setLastUpdated(new Date(cached.timestamp));
          setLoading(false);
          return;
        }
      }

      if (!isRefresh) setLoading(true);
      setError(null);

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const raw = await response.json();
        const transformed = transformRef.current(raw);

        cache.set(cacheKey, { data: transformed, timestamp: Date.now() });
        setData(transformed);
        setLastUpdated(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        if (cache.has(cacheKey)) {
          setData(cache.get(cacheKey)!.data as T);
        }
      } finally {
        setLoading(false);
      }
    },
    [url, cacheKey, enabled, refreshInterval]
  );

  useEffect(() => {
    fetchData();

    if (refreshInterval > 0 && enabled) {
      intervalRef.current = setInterval(() => fetchData(true), refreshInterval);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData, refreshInterval, enabled]);

  const refresh = useCallback(() => fetchData(true), [fetchData]);

  return { data, loading, error, lastUpdated, refresh };
}
