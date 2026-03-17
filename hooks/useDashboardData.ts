"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  SheetData,
  SheetKey,
  ClientRecord,
  PainelKPI,
  MonthlyPerformance,
  FinancialSummary,
} from "@/lib/googleSheets";

interface DashboardData {
  sheets: Record<string, SheetData> | null;
  base: ClientRecord[];
  painel: PainelKPI | null;
  performance: MonthlyPerformance[];
  financial: Record<string, FinancialSummary>;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDashboardData(): DashboardData {
  const [sheets, setSheets] = useState<Record<string, SheetData> | null>(null);
  const [base, setBase] = useState<ClientRecord[]>([]);
  const [painel, setPainel] = useState<PainelKPI | null>(null);
  const [performance, setPerformance] = useState<MonthlyPerformance[]>([]);
  const [financial, setFinancial] = useState<Record<string, FinancialSummary>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/sheets");
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();

      setSheets(data.sheets);
      setBase(data.base);
      setPainel(data.painel);
      setPerformance(data.performance);
      setFinancial(data.financial);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { sheets, base, painel, performance, financial, loading, error, refetch: fetchData };
}
