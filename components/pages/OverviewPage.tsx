"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  Target,
  Percent,
  Wallet,
  ArrowUpRight,
} from "lucide-react";
import GlowCard from "@/components/GlowCard";
import NeonAreaChart from "@/charts/NeonAreaChart";
import NeonPieChart from "@/charts/NeonPieChart";
import NeonBarChart from "@/charts/NeonBarChart";
import { formatBRL, formatPercent, getMonthShort } from "@/lib/utils";
import type { ClientRecord, PainelKPI, MonthlyPerformance, FinancialSummary } from "@/lib/googleSheets";

interface OverviewPageProps {
  base: ClientRecord[];
  painel: PainelKPI | null;
  performance: MonthlyPerformance[];
  financial: Record<string, FinancialSummary>;
}

export default function OverviewPage({ base, painel, performance, financial }: OverviewPageProps) {
  if (!painel) return <div className="text-gray-600 p-8">Loading...</div>;

  // Latest financial month
  const latestFinancial = financial.MARCO_26 || financial.FEVEREIRO_26;

  // Performance chart data (only months with data)
  const perfData = performance
    .filter((p) => p.newBusiness > 0 || p.churning > 0)
    .map((p) => ({
      month: getMonthShort(p.month),
      "Novos Negócios": p.newBusiness,
      Churning: p.churning,
      Saldo: p.balance,
    }));

  // Status distribution (by revenue)
  const statusData = [
    { name: "Novos Negócios", value: painel.newBusinessRevenue, color: "#ff0088" },
    { name: "Churning", value: painel.churningRevenue, color: "#660033" },
  ];

  // Service distribution from base (sum values)
  const serviceValues: Record<string, number> = {};
  base.forEach((r) => {
    const svc = r.service.includes("TUDO") ? "FULL SERVICE" : r.service.includes("TRAFEGO") || r.service.includes("TRÁFEGO") ? "TRÁFEGO PAGO" : r.service.includes("SOCIAL") ? "SOCIAL MEDIA" : r.service.includes("LANDING") || r.service.includes("SITE") ? "WEB/LANDING" : "OUTROS";
    serviceValues[svc] = (serviceValues[svc] || 0) + r.value;
  });
  const serviceColors = ["#ff0088", "#cc0066", "#990044", "#00ffff", "#ff44aa"];
  const serviceData = Object.entries(serviceValues).map(([name, value], i) => ({
    name,
    value,
    color: serviceColors[i % serviceColors.length],
  }));

  // Financial comparison across months
  const financialComparison = [
    { month: "Dez/25", Total: financial.DEZEMBRO_25?.totalValue || 0, Meta: financial.DEZEMBRO_25?.targetValue || 0 },
    { month: "Jan/26", Total: financial.JANEIRO_26?.totalValue || 0, Meta: financial.JANEIRO_26?.targetValue || 0 },
    { month: "Fev/26", Total: financial.FEVEREIRO_26?.totalValue || 0, Meta: financial.FEVEREIRO_26?.targetValue || 0 },
    { month: "Mar/26", Total: financial.MARCO_26?.totalValue || 0, Meta: financial.MARCO_26?.targetValue || 0 },
  ];

  // Calculate total financial across all months
  const totalFinancialRevenue = Object.values(financial).reduce((sum, f) => sum + f.totalValue, 0);
  const totalFinancialTarget = Object.values(financial).reduce((sum, f) => sum + f.targetValue, 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="font-display text-xl font-bold tracking-wider text-neon mb-1">VISÃO GERAL</h2>
        <p className="text-xs text-gray-600 font-mono">Métricas consolidadas // Atualização em tempo real</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlowCard
          title="Novos Negócios"
          value={painel.newBusinessRevenue}
          format={formatBRL}
          icon={<DollarSign size={16} className="text-matrix-pink" />}
          trend={{ value: painel.newBusinessRate, positive: true }}
          delay={0}
        />
        <GlowCard
          title="Churning"
          value={painel.churningRevenue}
          format={formatBRL}
          icon={<TrendingDown size={16} className="text-red-400" />}
          trend={{ value: -painel.churningRate, positive: false }}
          delay={0.1}
          accent="#cc0066"
        />
        <GlowCard
          title="Saldo Líquido"
          value={painel.netBalance}
          format={formatBRL}
          icon={<Wallet size={16} className="text-green-400" />}
          delay={0.2}
          accent="#00cc88"
        />
        <GlowCard
          title="Ticket Médio"
          value={painel.averageTicket}
          format={formatBRL}
          icon={<Target size={16} className="text-cyan-400" />}
          delay={0.3}
          accent="#00ffff"
        />
      </div>

      {/* Second row KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlowCard
          title="Total Clientes"
          value={base.length}
          icon={<Users size={16} className="text-matrix-pink" />}
          delay={0.4}
        />
        <GlowCard
          title="Taxa Novos Negócios"
          value={painel.newBusinessRate}
          format={(v) => formatPercent(v)}
          icon={<Percent size={16} className="text-green-400" />}
          delay={0.5}
          accent="#00cc88"
        />
        <GlowCard
          title="Receita Financeira Total"
          value={totalFinancialRevenue}
          format={formatBRL}
          icon={<ArrowUpRight size={16} className="text-matrix-pink" />}
          delay={0.6}
        />
        <GlowCard
          title="Meta Total Financeiro"
          value={totalFinancialTarget}
          format={formatBRL}
          icon={<Target size={16} className="text-cyan-400" />}
          delay={0.7}
          accent="#00ffff"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="chart-container lg:col-span-2"
        >
          <h3 className="font-display text-sm tracking-wider text-matrix-pink mb-4">PERFORMANCE MENSAL</h3>
          <NeonAreaChart
            data={perfData}
            xKey="month"
            areas={[
              { key: "Novos Negócios", color: "#ff0088", name: "Novos Negócios" },
              { key: "Churning", color: "#660033", name: "Churning" },
              { key: "Saldo", color: "#00ffff", name: "Saldo" },
            ]}
            height={280}
          />
        </motion.div>

        {/* Status Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="chart-container"
        >
          <h3 className="font-display text-sm tracking-wider text-matrix-pink mb-4">NOVOS vs CHURNING</h3>
          <NeonPieChart data={statusData} height={280} />
        </motion.div>
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="chart-container"
        >
          <h3 className="font-display text-sm tracking-wider text-matrix-pink mb-4">DISTRIBUIÇÃO POR SERVIÇO</h3>
          <NeonPieChart data={serviceData} height={280} innerRadius={50} />
        </motion.div>

        {/* Financial Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="chart-container"
        >
          <h3 className="font-display text-sm tracking-wider text-matrix-pink mb-4">FINANCEIRO vs META</h3>
          <NeonBarChart
            data={financialComparison}
            xKey="month"
            bars={[
              { key: "Total", color: "#ff0088", name: "Total Atingido" },
              { key: "Meta", color: "#00ffff", name: "Meta" },
            ]}
            height={280}
          />
        </motion.div>
      </div>
    </div>
  );
}
