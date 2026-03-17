"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Download } from "lucide-react";
import FilterBar from "@/components/FilterBar";
import NeonBarChart from "@/charts/NeonBarChart";
import NeonPieChart from "@/charts/NeonPieChart";
import NeonRadarChart from "@/charts/NeonRadarChart";
import { formatBRL, getMonthShort, MONTH_ORDER, exportToCSV } from "@/lib/utils";
import type { ClientRecord } from "@/lib/googleSheets";

interface VendasPageProps {
  data: ClientRecord[];
}

export default function VendasPage({ data }: VendasPageProps) {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedService, setSelectedService] = useState("");

  const months = useMemo(() => [...new Set(data.map((d) => d.month).filter(Boolean))], [data]);
  const statuses = useMemo(() => [...new Set(data.map((d) => d.status).filter(Boolean))], [data]);
  const services = useMemo(() => {
    const raw = data.map((d) => d.service).filter(Boolean);
    const normalized = raw.map((s) =>
      s.includes("TUDO") ? "FULL SERVICE" : s.includes("TRAFEGO") || s.includes("TRÁFEGO") ? "TRÁFEGO PAGO" : s.includes("SOCIAL") ? "SOCIAL MEDIA" : s.includes("LANDING") || s.includes("SITE") ? "WEB" : "OUTROS"
    );
    return [...new Set(normalized)];
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter((row) => {
      if (selectedMonth && row.month !== selectedMonth) return false;
      if (selectedStatus && row.status !== selectedStatus) return false;
      if (selectedService) {
        const svc = row.service.includes("TUDO") ? "FULL SERVICE" : row.service.includes("TRAFEGO") || row.service.includes("TRÁFEGO") ? "TRÁFEGO PAGO" : row.service.includes("SOCIAL") ? "SOCIAL MEDIA" : row.service.includes("LANDING") || row.service.includes("SITE") ? "WEB" : "OUTROS";
        if (svc !== selectedService) return false;
      }
      return true;
    });
  }, [data, selectedMonth, selectedStatus, selectedService]);

  // By month breakdown
  const byMonth = useMemo(() => {
    const map: Record<string, { novos: number; churning: number; novosCount: number; churningCount: number }> = {};
    filtered.forEach((r) => {
      if (!r.month) return;
      if (!map[r.month]) map[r.month] = { novos: 0, churning: 0, novosCount: 0, churningCount: 0 };
      if (r.status === "NOVOS NEGÓCIOS") {
        map[r.month].novos += r.value;
        map[r.month].novosCount++;
      } else {
        map[r.month].churning += r.value;
        map[r.month].churningCount++;
      }
    });
    return MONTH_ORDER
      .filter((m) => map[m])
      .map((m) => ({
        month: getMonthShort(m),
        "Novos Negócios": map[m].novos,
        Churning: map[m].churning,
      }));
  }, [filtered]);

  // Status pie
  const novos = filtered.filter((r) => r.status === "NOVOS NEGÓCIOS");
  const churning = filtered.filter((r) => r.status !== "NOVOS NEGÓCIOS");
  const statusPie = [
    { name: `Novos (${novos.length})`, value: novos.reduce((s, r) => s + r.value, 0), color: "#ff0088" },
    { name: `Churning (${churning.length})`, value: churning.reduce((s, r) => s + r.value, 0), color: "#660033" },
  ];

  // Service radar
  const serviceMap: Record<string, { novos: number; churning: number }> = {};
  filtered.forEach((r) => {
    const svc = r.service.includes("TUDO") ? "Full Service" : r.service.includes("TRAFEGO") || r.service.includes("TRÁFEGO") ? "Tráfego" : r.service.includes("SOCIAL") ? "Social Media" : r.service.includes("LANDING") || r.service.includes("SITE") ? "Web" : "Outros";
    if (!serviceMap[svc]) serviceMap[svc] = { novos: 0, churning: 0 };
    if (r.status === "NOVOS NEGÓCIOS") serviceMap[svc].novos += r.value;
    else serviceMap[svc].churning += r.value;
  });
  const radarData = Object.entries(serviceMap).map(([name, vals]) => ({
    service: name,
    "Novos Negócios": vals.novos,
    Churning: vals.churning,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold tracking-wider text-neon mb-1">VENDAS & CHURNING</h2>
          <p className="text-xs text-gray-600 font-mono">Base de clientes // {filtered.length} registros</p>
        </div>
        <button
          onClick={() => exportToCSV(filtered.map((r) => ({ ...r, value: r.value.toString() })), "vendas_churning")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-matrix-pink/20 text-gray-500 hover:text-matrix-pink hover:border-matrix-pink/40 transition-all text-xs font-mono"
        >
          <Download size={12} /> EXPORT CSV
        </button>
      </div>

      <FilterBar
        months={months}
        statuses={statuses}
        services={services}
        selectedMonth={selectedMonth}
        selectedStatus={selectedStatus}
        selectedService={selectedService}
        onMonthChange={setSelectedMonth}
        onStatusChange={setSelectedStatus}
        onServiceChange={setSelectedService}
        onClear={() => { setSelectedMonth(""); setSelectedStatus(""); setSelectedService(""); }}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="chart-container lg:col-span-2">
          <h3 className="font-display text-sm tracking-wider text-matrix-pink mb-4">RECEITA POR MÊS</h3>
          <NeonBarChart
            data={byMonth}
            xKey="month"
            bars={[
              { key: "Novos Negócios", color: "#ff0088", name: "Novos Negócios" },
              { key: "Churning", color: "#660033", name: "Churning" },
            ]}
            height={300}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="chart-container">
          <h3 className="font-display text-sm tracking-wider text-matrix-pink mb-4">STATUS</h3>
          <NeonPieChart data={statusPie} height={300} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="chart-container">
          <h3 className="font-display text-sm tracking-wider text-matrix-pink mb-4">RADAR POR SERVIÇO</h3>
          <NeonRadarChart
            data={radarData}
            nameKey="service"
            radars={[
              { key: "Novos Negócios", color: "#ff0088", name: "Novos" },
              { key: "Churning", color: "#660033", name: "Churning" },
            ]}
            height={300}
          />
        </motion.div>

        {/* Client Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="chart-container overflow-hidden">
          <h3 className="font-display text-sm tracking-wider text-matrix-pink mb-4">CLIENTES ({filtered.length})</h3>
          <div className="overflow-auto max-h-[260px]">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-matrix-pink/10 text-gray-500">
                  <th className="text-left py-2 px-2">Cliente</th>
                  <th className="text-left py-2 px-2">Valor</th>
                  <th className="text-left py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 20).map((row, i) => (
                  <tr key={i} className="border-b border-white/[0.03] hover:bg-matrix-pink/5 transition-colors">
                    <td className="py-1.5 px-2 text-gray-300">{row.client}</td>
                    <td className="py-1.5 px-2 text-gray-400">{row.value > 0 ? formatBRL(row.value) : "—"}</td>
                    <td className="py-1.5 px-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${row.status === "NOVOS NEGÓCIOS" ? "bg-matrix-pink/15 text-matrix-pink" : "bg-red-500/15 text-red-400"}`}>
                        {row.status === "NOVOS NEGÓCIOS" ? "NOVO" : "CHURN"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
