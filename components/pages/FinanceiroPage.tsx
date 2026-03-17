"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Target,
  CheckCircle,
  XCircle,
  Download,
} from "lucide-react";
import GlowCard from "@/components/GlowCard";
import NeonBarChart from "@/charts/NeonBarChart";
import NeonPieChart from "@/charts/NeonPieChart";
import NeonLineChart from "@/charts/NeonLineChart";
import { formatBRL, formatPercent, exportToCSV } from "@/lib/utils";
import type { FinancialSummary } from "@/lib/googleSheets";

interface FinanceiroPageProps {
  financial: Record<string, FinancialSummary>;
}

const MONTH_LABELS: Record<string, string> = {
  DEZEMBRO_25: "Dez/25",
  JANEIRO_26: "Jan/26",
  FEVEREIRO_26: "Fev/26",
  MARCO_26: "Mar/26",
};

export default function FinanceiroPage({ financial }: FinanceiroPageProps) {
  const [selectedMonth, setSelectedMonth] = useState("MARCO_26");

  const current = financial[selectedMonth];
  if (!current) return <div className="text-gray-600 p-8">Loading...</div>;

  // Trend across months
  const trendData = Object.entries(MONTH_LABELS).map(([key, label]) => {
    const f = financial[key];
    return {
      month: label,
      "Total Faturado": f?.totalValue || 0,
      Meta: f?.targetValue || 0,
      Faltante: f?.shortfall || 0,
    };
  });

  // Payment status pie
  const paymentPie = [
    { name: `Pago (${current.paidCount})`, value: current.paidCount, color: "#ff0088" },
    { name: `Não Pago (${current.unpaidCount})`, value: current.unpaidCount, color: "#660033" },
  ];

  // Active status pie
  const statusPie = [
    { name: `Ativo (${current.activeCount})`, value: current.activeCount, color: "#00ffff" },
    { name: `Inativo (${current.inactiveCount})`, value: current.inactiveCount, color: "#333" },
  ];

  // Client values bar (top 10)
  const topClients = [...current.records]
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
    .map((r) => ({
      client: r.client.length > 15 ? r.client.slice(0, 15) + "..." : r.client,
      Valor: r.value,
    }));

  // Progress towards target
  const progressPercent = current.targetValue > 0 ? (current.totalValue / current.targetValue) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold tracking-wider text-neon mb-1">CONTROLE FINANCEIRO</h2>
          <p className="text-xs text-gray-600 font-mono">Faturamento mensal // {current.records.length} contratos</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Month Tabs */}
          <div className="flex gap-1">
            {Object.entries(MONTH_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedMonth(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  selectedMonth === key
                    ? "bg-matrix-pink/20 text-matrix-pink border border-matrix-pink/40"
                    : "text-gray-600 border border-white/[0.05] hover:text-gray-400 hover:border-matrix-pink/20"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => exportToCSV(current.records.map((r) => ({ ...r, value: r.value.toString() })), `financeiro_${selectedMonth}`)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-matrix-pink/20 text-gray-500 hover:text-matrix-pink text-xs font-mono transition-all"
          >
            <Download size={12} /> CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlowCard
          title="Total Faturado"
          value={current.totalValue}
          format={formatBRL}
          icon={<DollarSign size={16} className="text-matrix-pink" />}
          delay={0}
        />
        <GlowCard
          title="Meta"
          value={current.targetValue}
          format={formatBRL}
          icon={<Target size={16} className="text-cyan-400" />}
          delay={0.1}
          accent="#00ffff"
        />
        <GlowCard
          title="% Atingida"
          value={current.percentAchieved || progressPercent}
          format={(v) => formatPercent(v)}
          icon={<CheckCircle size={16} className="text-green-400" />}
          delay={0.2}
          accent="#00cc88"
        />
        <GlowCard
          title="Faltante"
          value={current.shortfall}
          format={formatBRL}
          icon={<XCircle size={16} className="text-red-400" />}
          delay={0.3}
          accent="#cc0066"
        />
      </div>

      {/* Progress Bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-panel p-4">
        <div className="flex justify-between text-xs font-mono text-gray-500 mb-2">
          <span>Progresso para a Meta</span>
          <span className="text-matrix-pink">{formatPercent(current.percentAchieved || progressPercent)}</span>
        </div>
        <div className="h-3 rounded-full bg-white/[0.03] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(current.percentAchieved || progressPercent, 100)}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #660033, #ff0088, #ff44aa)",
              boxShadow: "0 0 10px #ff008877",
            }}
          />
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="chart-container lg:col-span-2">
          <h3 className="font-display text-sm tracking-wider text-matrix-pink mb-4">EVOLUÇÃO FINANCEIRA</h3>
          <NeonLineChart
            data={trendData}
            xKey="month"
            lines={[
              { key: "Total Faturado", color: "#ff0088", name: "Total Faturado" },
              { key: "Meta", color: "#00ffff", name: "Meta" },
            ]}
            height={280}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="chart-container">
          <h3 className="font-display text-sm tracking-wider text-matrix-pink mb-4">PAGAMENTOS</h3>
          <NeonPieChart data={paymentPie} height={280} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="chart-container">
          <h3 className="font-display text-sm tracking-wider text-matrix-pink mb-4">TOP 10 CLIENTES</h3>
          <NeonBarChart
            data={topClients}
            xKey="client"
            bars={[{ key: "Valor", color: "#ff0088", name: "Valor" }]}
            height={280}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="chart-container">
          <h3 className="font-display text-sm tracking-wider text-matrix-pink mb-4">STATUS DOS CONTRATOS</h3>
          <NeonPieChart data={statusPie} height={280} />
        </motion.div>
      </div>

      {/* Full Client Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="chart-container">
        <h3 className="font-display text-sm tracking-wider text-matrix-pink mb-4">
          CONTRATOS — {MONTH_LABELS[selectedMonth]}
        </h3>
        <div className="overflow-auto max-h-[400px]">
          <table className="w-full text-xs font-mono">
            <thead className="sticky top-0" style={{ background: "rgba(10,10,30,0.95)" }}>
              <tr className="border-b border-matrix-pink/10 text-gray-500">
                <th className="text-left py-2 px-2">Cliente</th>
                <th className="text-left py-2 px-2">Serviço</th>
                <th className="text-right py-2 px-2">Valor</th>
                <th className="text-center py-2 px-2">Pagamento</th>
                <th className="text-center py-2 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {current.records.map((row, i) => (
                <tr key={i} className="border-b border-white/[0.03] hover:bg-matrix-pink/5 transition-colors">
                  <td className="py-1.5 px-2 text-gray-300">{row.client}</td>
                  <td className="py-1.5 px-2 text-gray-500 max-w-[200px] truncate">{row.service || "—"}</td>
                  <td className="py-1.5 px-2 text-right text-gray-300">{row.value > 0 ? formatBRL(row.value) : "—"}</td>
                  <td className="py-1.5 px-2 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${row.payment === "PAGO" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                      {row.payment || "—"}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${row.status === "ATIVO" ? "bg-cyan-500/10 text-cyan-400" : "bg-gray-500/10 text-gray-500"}`}>
                      {row.status || "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
