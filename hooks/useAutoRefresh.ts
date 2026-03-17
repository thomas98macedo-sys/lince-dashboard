"use client";

import { useEffect, useCallback, useState } from "react";

export function useAutoRefresh(intervalMs: number = 30000) {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    setLastRefresh(new Date());
    // Allow components to react to the change
    setTimeout(() => setIsRefreshing(false), 1000);
  }, []);

  useEffect(() => {
    const timer = setInterval(refresh, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs, refresh]);

  return { lastRefresh, isRefreshing, refresh };
}
