"use client";

import { motion } from "framer-motion";
import { TrendingUp, DollarSign, ArrowDownRight, BarChart3 } from "lucide-react";
import GlowCard from "@/components/GlowCard";
import NeonLineChart from "@/charts/NeonLineChart";
import NeonAreaChart from "@/charts/NeonAreaChart";
import NeonBarChart from "@/charts/NeonBarChart";
import { formatBRL, getMonthShort } from "@/lib/utils";
import type { MonthlyPerformance } from "@/lib/googleSheets";

interface PerformancePageProps {
  data: MonthlyPerformance[];
}

export default function PerformancePage({ data }: PerformancePageProps) {
  const active = data.filter((d) => d.newBusiness > 0 || d.churning > 0);

  const chartData = active.map((d) => ({
    month: getMonthShort(d.month),
    "Novos Negócios": d.newBusiness,
    Churning: d.churning,
    Saldo: d.balance,
  }));

  const totalNewBiz = active.reduce((s, d) => s + d.newBusiness, 0);
  const totalChurn = active.reduce((s, d) => s + d.churning, 0);
  const totalBalance = active.reduce((s, d) => s + d.balance, 0);
  const bestMonth = active.reduce((best, d) => (d.balance > best.balance ? d : best), active[0]);
  const avgMonthly = active.length > 0 ? totalNewBiz / active.length : 0;

  // Growth rate
  let growth = 0;
  if (active.length >= 2) {
    const first = active[0].newBusiness;
    const last = active[active.length - 1].newBusiness;
    if (first > 0) growth = ((last - first) / first) * 100;
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="font-display text-xl font-bold tracking-wider text-neon mb-1">PERFORMANCE MENSAL</h2>
        <p className="text-xs text-gray-600 font-mono">Evolução mensal // Tendências e projeções</p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlowCard
          title="Total Novos Negócios"
          value={totalNewBiz}
          format={formatBRL}
          icon={<DollarSign size={16} className="text-matrix-pink" />}
          delay={0}
        />
        <GlowCard
          title="Total Churning"
          value={totalChurn}
          format={formatBRL}
          icon={<ArrowDownRight size={16} className="text-red-400" />}
          delay={0.1}
          accent="#cc0066"
        />
        <GlowCard
          title="Saldo Acumulado"
          value={totalBalance}
          format={formatBRL}
          icon={<TrendingUp size={16} className="text-green-400" />}
          delay={0.2}
          accent="#00cc88"
        />
        <GlowCard
          title="Crescimento"
          value={growth}
          format={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`}
          icon={<BarChart3 size={16} className="text-cyan-400" />}
          delay={0.3}
          accent="#00ffff"
        />
      </div>

      {/* Line Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="chart-container">
        <h3 className="font-display text-sm tracking-wider text-matrix-pink mb-4">EVOLUÇÃO DA RECEITA</h3>
        <NeonLineChart
          data={chartData}
          xKey="month"
          lines={[
            { key: "Novos Negócios", color: "#ff0088", name: "Novos Negócios" },
            { key: "Churning", color: "#cc0066", name: "Churning" },
            { key: "Saldo", color: "#00ffff", name: "Saldo" },
          ]}
          height={320}
        />
      </motion.div>

      {/* Area and Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="chart-container">
          <h3 className="font-display text-sm tracking-wider text-matrix-pink mb-4">ÁREA ACUMULADA</h3>
          <NeonAreaChart
            data={chartData}
            xKey="month"
            areas={[
              { key: "Novos Negócios", color: "#ff0088", name: "Novos Negócios" },
              { key: "Churning", color: "#660033", name: "Churning" },
            ]}
            height={280}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="chart-container">
          <h3 className="font-display text-sm tracking-wider text-matrix-pink mb-4">SALDO MENSAL</h3>
          <NeonBarChart
            data={chartData}
            xKey="month"
            bars={[{ key: "Saldo", color: "#00ffff", name: "Saldo Líquido" }]}
            height={280}
          />
        </motion.div>
      </div>

      {/* Monthly Detail Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="chart-container">
        <h3 className="font-display text-sm tracking-wider text-matrix-pink mb-4">DETALHAMENTO MENSAL</h3>
        <div className="overflow-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-matrix-pink/10 text-gray-500">
                <th className="text-left py-2 px-3">Mês</th>
                <th className="text-right py-2 px-3">Novos Negócios</th>
                <th className="text-right py-2 px-3">Churning</th>
                <th className="text-right py-2 px-3">Saldo</th>
                <th className="text-right py-2 px-3">Variação</th>
              </tr>
            </thead>
            <tbody>
              {active.map((row, i) => {
                const prev = i > 0 ? active[i - 1].balance : 0;
                const change = prev > 0 ? ((row.balance - prev) / prev) * 100 : 0;
                return (
                  <tr key={i} className="border-b border-white/[0.03] hover:bg-matrix-pink/5 transition-colors">
                    <td className="py-2 px-3 text-gray-300">{row.month}</td>
                    <td className="py-2 px-3 text-right text-matrix-pink">{formatBRL(row.newBusiness)}</td>
                    <td className="py-2 px-3 text-right text-red-400">{formatBRL(row.churning)}</td>
                    <td className="py-2 px-3 text-right text-cyan-400 font-bold">{formatBRL(row.balance)}</td>
                    <td className="py-2 px-3 text-right">
                      {i > 0 ? (
                        <span className={change >= 0 ? "text-green-400" : "text-red-400"}>
                          {change >= 0 ? "+" : ""}{change.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
