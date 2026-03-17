"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingDown,
  Wallet,
  Target,
  Users,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import GlowCard from "@/components/GlowCard";
import NeonPieChart from "@/charts/NeonPieChart";
import NeonBarChart from "@/charts/NeonBarChart";
import { formatBRL, formatPercent } from "@/lib/utils";
import type { PainelKPI } from "@/lib/googleSheets";

interface PainelPageProps {
  painel: PainelKPI | null;
}

export default function PainelPage({ painel }: PainelPageProps) {
  if (!painel) return <div className="text-gray-600 p-8">Loading...</div>;

  const revenuePie = [
    { name: "Novos Negócios", value: painel.newBusinessRevenue, color: "#ff0088" },
    { name: "Churning", value: painel.churningRevenue, color: "#660033" },
  ];

  const countPie = [
    { name: "Novos Clientes", value: painel.newBusinessCount, color: "#ff0088" },
    { name: "Churned", value: painel.churningCount, color: "#660033" },
  ];

  const ratePie = [
    { name: "Taxa Novos", value: painel.newBusinessRate, color: "#ff0088" },
    { name: "Taxa Churn", value: painel.churningRate, color: "#660033" },
  ];

  const comparisonData = [
    { metric: "Receita", "Novos Negócios": painel.newBusinessRevenue, Churning: painel.churningRevenue },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="font-display text-xl font-bold tracking-wider text-neon mb-1">PAINEL KPIs</h2>
        <p className="text-xs text-gray-600 font-mono">Dashboard executivo // Indicadores-chave</p>
      </motion.div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlowCard
          title="Receita Novos Negócios"
          value={painel.newBusinessRevenue}
          format={formatBRL}
          icon={<DollarSign size={16} className="text-matrix-pink" />}
          delay={0}
        />
        <GlowCard
          title="Receita Churning"
          value={painel.churningRevenue}
          format={formatBRL}
          icon={<TrendingDown size={16} className="text-red-400" />}
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

      {/* Count & Rate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlowCard
          title="Qtd. Novos Negócios"
          value={painel.newBusinessCount}
          icon={<ArrowUpRight size={16} className="text-green-400" />}
          delay={0.4}
          accent="#00cc88"
        />
        <GlowCard
          title="Qtd. Churning"
          value={painel.churningCount}
          icon={<ArrowDownRight size={16} className="text-red-400" />}
          delay={0.5}
          accent="#cc0066"
        />
        <GlowCard
          title="Taxa Novos Negócios"
          value={painel.newBusinessRate}
          format={(v) => formatPercent(v)}
          icon={<Percent size={16} className="text-green-400" />}
          delay={0.6}
          accent="#00cc88"
        />
        <GlowCard
          title="Taxa Churning"
          value={painel.churningRate}
          format={(v) => formatPercent(v)}
          icon={<Percent size={16} className="text-red-400" />}
          delay={0.7}
          accent="#cc0066"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="chart-container">
          <h3 className="font-display text-sm tracking-wider text-matrix-pink mb-4">RECEITA</h3>
          <NeonPieChart data={revenuePie} height={280} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="chart-container">
          <h3 className="font-display text-sm tracking-wider text-matrix-pink mb-4">QUANTIDADE</h3>
          <NeonPieChart data={countPie} height={280} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="chart-container">
          <h3 className="font-display text-sm tracking-wider text-matrix-pink mb-4">TAXA (%)</h3>
          <NeonPieChart data={ratePie} height={280} />
        </motion.div>
      </div>

      {/* Summary Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-panel p-6"
      >
        <h3 className="font-display text-sm tracking-wider text-matrix-pink mb-4">RESUMO EXECUTIVO</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
          <div className="space-y-2">
            <p className="text-gray-400">
              A empresa fechou <span className="text-matrix-pink font-bold">{painel.newBusinessCount}</span> novos contratos gerando{" "}
              <span className="text-matrix-pink font-bold">{formatBRL(painel.newBusinessRevenue)}</span> em receita nova.
            </p>
            <p className="text-gray-400">
              O ticket médio dos contratos é de <span className="text-cyan-400 font-bold">{formatBRL(painel.averageTicket)}</span>.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-gray-400">
              Foram registrados <span className="text-red-400 font-bold">{painel.churningCount}</span> churnings totalizando{" "}
              <span className="text-red-400 font-bold">{formatBRL(painel.churningRevenue)}</span> em perda.
            </p>
            <p className="text-gray-400">
              Saldo líquido positivo de <span className="text-green-400 font-bold">{formatBRL(painel.netBalance)}</span> — taxa de retenção de{" "}
              <span className="text-green-400 font-bold">{formatPercent(painel.newBusinessRate)}</span>.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
