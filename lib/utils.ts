export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatCompact(value: number): string {
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}K`;
  return formatBRL(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const MONTH_ORDER = [
  "JANEIRO",
  "FEVEREIRO",
  "MARÇO",
  "ABRIL",
  "MAIO",
  "JUNHO",
  "JULHO",
  "AGOSTO",
  "SETEMBRO",
  "OUTUBRO",
  "NOVEMBRO",
  "DEZEMBRO",
];

export const MONTH_SHORT: Record<string, string> = {
  JANEIRO: "Jan",
  FEVEREIRO: "Fev",
  MARÇO: "Mar",
  ABRIL: "Abr",
  MAIO: "Mai",
  JUNHO: "Jun",
  JULHO: "Jul",
  AGOSTO: "Ago",
  SETEMBRO: "Set",
  OUTUBRO: "Out",
  NOVEMBRO: "Nov",
  DEZEMBRO: "Dez",
  DEZEZEMBRO: "Dez",
};

export function getMonthShort(month: string): string {
  return MONTH_SHORT[month.toUpperCase()] || month.slice(0, 3);
}

export function exportToCSV(
  data: Record<string, string | number>[],
  filename: string
) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          const str = String(val);
          return str.includes(",") ? `"${str}"` : str;
        })
        .join(",")
    ),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
