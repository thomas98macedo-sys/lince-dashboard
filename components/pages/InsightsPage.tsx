"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  Target,
  Users,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { formatBRL, formatPercent, getMonthShort } from "@/lib/utils";
import type { ClientRecord, PainelKPI, MonthlyPerformance, FinancialSummary } from "@/lib/googleSheets";

interface InsightsPageProps {
  base: ClientRecord[];
  painel: PainelKPI | null;
  performance: MonthlyPerformance[];
  financial: Record<string, FinancialSummary>;
}

interface Insight {
  type: "success" | "warning" | "danger" | "info";
  icon: React.ReactNode;
  title: string;
  description: string;
  metric?: string;
}

export default function InsightsPage({ base, painel, performance, financial }: InsightsPageProps) {
  const insights = useMemo(() => {
    const list: Insight[] = [];
    if (!painel) return list;

    // Growth analysis
    const activePerf = performance.filter((d) => d.newBusiness > 0);
    if (activePerf.length >= 2) {
      const first = activePerf[0];
      const last = activePerf[activePerf.length - 1];
      const growth = first.newBusiness > 0 ? ((last.newBusiness - first.newBusiness) / first.newBusiness) * 100 : 0;
      if (growth > 0) {
        list.push({
          type: "success",
          icon: <TrendingUp size={18} className="text-green-400" />,
          title: "Crescimento de Receita",
          description: `Novos negócios cresceram ${growth.toFixed(1)}% de ${getMonthShort(first.month)} para ${getMonthShort(last.month)}. A receita saltou de ${formatBRL(first.newBusiness)} para ${formatBRL(last.newBusiness)}.`,
          metric: `+${growth.toFixed(1)}%`,
        });
      }
    }

    // Biggest spike
    if (activePerf.length >= 2) {
      let maxSpike = 0, spikeMonth = "";
      for (let i = 1; i < activePerf.length; i++) {
        const diff = activePerf[i].newBusiness - activePerf[i - 1].newBusiness;
        if (diff > maxSpike) {
          maxSpike = diff;
          spikeMonth = activePerf[i].month;
        }
      }
      if (maxSpike > 0) {
        list.push({
          type: "info",
          icon: <Zap size={18} className="text-matrix-pink" />,
          title: "Maior Spike de Receita",
          description: `O mês de ${spikeMonth} registrou o maior aumento absoluto de receita nova: +${formatBRL(maxSpike)} em comparação ao mês anterior.`,
          metric: formatBRL(maxSpike),
        });
      }
    }

    // Churn analysis
    const highChurnMonths = activePerf.filter((d) => d.churning > d.newBusiness * 0.5);
    if (highChurnMonths.length > 0) {
      list.push({
        type: "warning",
        icon: <AlertTriangle size={18} className="text-yellow-400" />,
        title: "Alerta de Churning Elevado",
        description: `${highChurnMonths.length} mês(es) apresentaram churning superior a 50% dos novos negócios. Meses: ${highChurnMonths.map((m) => getMonthShort(m.month)).join(", ")}.`,
      });
    }

    // Net balance positive
    if (painel.netBalance > 0) {
      list.push({
        type: "success",
        icon: <DollarSign size={18} className="text-green-400" />,
        title: "Saldo Líquido Positivo",
        description: `A operação apresenta saldo positivo de ${formatBRL(painel.netBalance)}, indicando que a aquisição de novos contratos supera as perdas por churning em ${formatPercent(((painel.newBusinessRevenue - painel.churningRevenue) / painel.newBusinessRevenue) * 100)}.`,
        metric: formatBRL(painel.netBalance),
      });
    }

    // New business rate
    if (painel.newBusinessRate > 60) {
      list.push({
        type: "success",
        icon: <Users size={18} className="text-cyan-400" />,
        title: "Taxa de Aquisição Saudável",
        description: `A taxa de novos negócios está em ${formatPercent(painel.newBusinessRate)}, indicando forte capacidade de aquisição. De ${painel.newBusinessCount + painel.churningCount} movimentações, ${painel.newBusinessCount} foram novos contratos.`,
        metric: formatPercent(painel.newBusinessRate),
      });
    }

    // Financial targets
    const finEntries = Object.entries(financial);
    const aboveTarget = finEntries.filter(([, f]) => f.percentAchieved >= 90);
    const belowTarget = finEntries.filter(([, f]) => f.percentAchieved > 0 && f.percentAchieved < 70);

    if (aboveTarget.length > 0) {
      list.push({
        type: "success",
        icon: <Target size={18} className="text-green-400" />,
        title: "Metas Financeiras Superadas",
        description: `${aboveTarget.length} mês(es) atingiram ou chegaram perto da meta (>90%): ${aboveTarget.map(([k, f]) => `${k.replace("_", "/")} (${formatPercent(f.percentAchieved)})`).join(", ")}.`,
      });
    }

    if (belowTarget.length > 0) {
      list.push({
        type: "danger",
        icon: <TrendingDown size={18} className="text-red-400" />,
        title: "Meses Abaixo da Meta",
        description: `${belowTarget.length} mês(es) ficaram significativamente abaixo da meta (<70%): ${belowTarget.map(([k, f]) => `${k.replace("_", "/")} (${formatPercent(f.percentAchieved)})`).join(", ")}.`,
      });
    }

    // Top service
    const serviceRevenue: Record<string, number> = {};
    base.filter((r) => r.status === "NOVOS NEGÓCIOS").forEach((r) => {
      const svc = r.service.includes("TUDO") ? "Full Service" : r.service.includes("TRAFEGO") || r.service.includes("TRÁFEGO") ? "Tráfego Pago" : r.service.includes("SOCIAL") ? "Social Media" : "Outros";
      serviceRevenue[svc] = (serviceRevenue[svc] || 0) + r.value;
    });
    const topService = Object.entries(serviceRevenue).sort(([, a], [, b]) => b - a)[0];
    if (topService) {
      list.push({
        type: "info",
        icon: <BarChart3 size={18} className="text-matrix-pink" />,
        title: "Serviço Mais Rentável",
        description: `"${topService[0]}" lidera em receita com ${formatBRL(topService[1])}. Este é o principal motor de faturamento nos novos negócios.`,
        metric: formatBRL(topService[1]),
      });
    }

    // Average ticket analysis
    if (painel.averageTicket > 0) {
      const highValue = base.filter((r) => r.value > painel.averageTicket * 1.5);
      list.push({
        type: "info",
        icon: <DollarSign size={18} className="text-cyan-400" />,
        title: "Análise de Ticket",
        description: `Ticket médio de ${formatBRL(painel.averageTicket)}. ${highValue.length} cliente(s) possuem contratos acima de 1.5x a média (${formatBRL(painel.averageTicket * 1.5)}), representando oportunidades de upsell.`,
      });
    }

    // Unpaid contracts
    const latestFin = financial.MARCO_26 || financial.FEVEREIRO_26;
    if (latestFin && latestFin.unpaidCount > 0) {
      const unpaidValue = latestFin.records.filter((r) => r.payment.includes("NÃO")).reduce((s, r) => s + r.value, 0);
      list.push({
        type: "warning",
        icon: <AlertTriangle size={18} className="text-yellow-400" />,
        title: "Contratos Não Pagos",
        description: `${latestFin.unpaidCount} contratos pendentes de pagamento no mês mais recente, totalizando ${formatBRL(unpaidValue)}. Recomenda-se ação de cobrança imediata.`,
        metric: formatBRL(unpaidValue),
      });
    }

    return list;
  }, [base, painel, performance, financial]);

  const typeStyles = {
    success: "border-green-500/30 bg-green-500/[0.03]",
    warning: "border-yellow-500/30 bg-yellow-500/[0.03]",
    danger: "border-red-500/30 bg-red-500/[0.03]",
    info: "border-matrix-pink/30 bg-matrix-pink/[0.03]",
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="font-display text-xl font-bold tracking-wider text-neon mb-1">INSIGHTS & ANÁLISE</h2>
        <p className="text-xs text-gray-600 font-mono">Inteligência de dados // Gerado automaticamente</p>
      </motion.div>

      {/* AI Disclaimer */}
      <div className="glass-panel p-3 flex items-center gap-2 text-xs text-gray-500 font-mono">
        <Zap size={14} className="text-matrix-pink" />
        <span>Insights gerados automaticamente com base na análise dos dados das planilhas.</span>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-xl border p-5 ${typeStyles[insight.type]} transition-all hover:scale-[1.01]`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">{insight.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="font-display text-sm font-bold text-gray-200 tracking-wider">{insight.title}</h4>
                  {insight.metric && (
                    <span className="text-xs font-mono text-matrix-pink font-bold bg-matrix-pink/10 px-2 py-0.5 rounded shrink-0">
                      {insight.metric}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 font-mono leading-relaxed">{insight.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      {painel && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: insights.length * 0.1 }}
          className="glass-panel p-6"
        >
          <h3 className="font-display text-sm tracking-wider text-matrix-pink mb-3">DIAGNÓSTICO GERAL</h3>
          <div className="text-sm font-mono text-gray-400 space-y-3 leading-relaxed">
            <p>
              A Lince Performance apresenta uma operação{" "}
              {painel.netBalance > 0 ? (
                <span className="text-green-400">saudável e em crescimento</span>
              ) : (
                <span className="text-red-400">que necessita de atenção</span>
              )}
              . Com {base.length} clientes na base e um ticket médio de {formatBRL(painel.averageTicket)}, a empresa mantém uma carteira diversificada de serviços.
            </p>
            <p>
              O saldo líquido de {formatBRL(painel.netBalance)} demonstra que a aquisição ({formatBRL(painel.newBusinessRevenue)}) supera significativamente o churning ({formatBRL(painel.churningRevenue)}), resultando em uma taxa de retenção efetiva de {formatPercent(painel.newBusinessRate)}.
            </p>
            <p>
              Recomendações: foco em reduzir o churning através de programas de fidelização, explorar upsell nos clientes de ticket acima da média, e manter a consistência na aquisição de novos negócios.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
