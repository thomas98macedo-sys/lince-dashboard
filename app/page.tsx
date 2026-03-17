"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import { exportToCSV } from "@/lib/utils";

// Dynamic imports to reduce initial bundle
const MatrixRain = dynamic(() => import("@/components/MatrixRain"), { ssr: false });
const ParticleField = dynamic(() => import("@/components/ParticleField"), { ssr: false });
const OverviewPage = dynamic(() => import("@/components/pages/OverviewPage"), { ssr: false });
const VendasPage = dynamic(() => import("@/components/pages/VendasPage"), { ssr: false });
const PainelPage = dynamic(() => import("@/components/pages/PainelPage"), { ssr: false });
const PerformancePage = dynamic(() => import("@/components/pages/PerformancePage"), { ssr: false });
const FinanceiroPage = dynamic(() => import("@/components/pages/FinanceiroPage"), { ssr: false });
const InsightsPage = dynamic(() => import("@/components/pages/InsightsPage"), { ssr: false });

export default function Dashboard() {
  const [activePage, setActivePage] = useState("overview");
  const { base, painel, performance, financial, loading, error, refetch } = useDashboardData();
  const { lastRefresh, isRefreshing, refresh } = useAutoRefresh(30000);

  const handleRefresh = () => {
    refresh();
    refetch();
  };

  const handleExport = () => {
    if (base.length > 0) {
      exportToCSV(
        base.map((r) => ({
          Cliente: r.client,
          Serviço: r.service,
          Valor: r.value.toString(),
          Status: r.status,
          Mês: r.month,
        })),
        "lince_export"
      );
    }
  };

  if (loading && !painel) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 relative">
      {/* Background Effects */}
      <MatrixRain />
      <ParticleField />

      {/* Sidebar */}
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      {/* Main Content */}
      <div className="lg:ml-[240px] min-h-screen relative z-10 transition-all duration-300">
        <Header
          isRefreshing={isRefreshing || loading}
          lastRefresh={lastRefresh}
          onRefresh={handleRefresh}
          onExport={handleExport}
        />

        <main className="p-6">
          {error && (
            <div className="glass-panel p-4 mb-6 border-red-500/30 text-red-400 text-sm font-mono">
              Erro ao carregar dados: {error}
              <button onClick={handleRefresh} className="ml-4 text-matrix-pink underline">Tentar novamente</button>
            </div>
          )}

          {activePage === "overview" && (
            <OverviewPage base={base} painel={painel} performance={performance} financial={financial} />
          )}
          {activePage === "vendas" && <VendasPage data={base} />}
          {activePage === "painel" && <PainelPage painel={painel} />}
          {activePage === "performance" && <PerformancePage data={performance} />}
          {activePage === "financeiro" && <FinanceiroPage financial={financial} />}
          {activePage === "insights" && (
            <InsightsPage base={base} painel={painel} performance={performance} financial={financial} />
          )}
        </main>

        {/* Footer */}
        <footer className="p-4 text-center text-[10px] text-gray-700 font-mono border-t border-white/[0.03]">
          LINCE PERFORMANCE // DATA MATRIX CONTROL CENTER // AUTO-REFRESH: 30s
        </footer>
      </div>
    </div>
  );
}
