import Papa from "papaparse";

// Spreadsheet 1: Vendas / Churning
const SPREADSHEET_1 = "1PMZF4UMeW41GELJmlopr3ok14xO8_-21wBRqaD6yuIY";
// Spreadsheet 2: Financeiro
const SPREADSHEET_2 = "1AGjF134s4YRFJUg5FHBkdV8trLQPHVco5aVXjgNEXA0";

export const SHEET_CONFIG = {
  // Spreadsheet 1 tabs
  BASE_2026: { spreadsheet: SPREADSHEET_1, gid: "1829056795", name: "Vendas & Churning", icon: "Users" },
  PAINEL: { spreadsheet: SPREADSHEET_1, gid: "502335557", name: "Painel KPIs", icon: "BarChart3" },
  PERFORMANCE: { spreadsheet: SPREADSHEET_1, gid: "86087223", name: "Performance", icon: "TrendingUp" },
  // Spreadsheet 2 tabs
  DEZEMBRO_25: { spreadsheet: SPREADSHEET_2, gid: "165795266", name: "Dez/25", icon: "Calendar" },
  JANEIRO_26: { spreadsheet: SPREADSHEET_2, gid: "1829056795", name: "Jan/26", icon: "Calendar" },
  FEVEREIRO_26: { spreadsheet: SPREADSHEET_2, gid: "1988559966", name: "Fev/26", icon: "Calendar" },
  MARCO_26: { spreadsheet: SPREADSHEET_2, gid: "879586566", name: "Mar/26", icon: "Calendar" },
} as const;

export type SheetKey = keyof typeof SHEET_CONFIG;

export interface SheetData {
  sheetName: string;
  headers: string[];
  rows: Record<string, string | number>[];
  raw: string[][];
}

function parseBRL(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace("R$", "").replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parsePercentage(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace("%", "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function normalizeValue(value: string): string | number {
  if (!value || value.trim() === "") return "";
  const trimmed = value.trim();
  if (trimmed.includes("R$")) return parseBRL(trimmed);
  if (trimmed.endsWith("%")) return parsePercentage(trimmed);
  const numericTest = trimmed.replace(/\./g, "").replace(",", ".");
  const num = parseFloat(numericTest);
  if (!isNaN(num) && numericTest.match(/^[\d.,]+$/)) return num;
  return trimmed;
}

async function fetchCSV(spreadsheetId: string, gid: string): Promise<string> {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`Failed to fetch sheet gid=${gid}`);
  return res.text();
}

export async function fetchSheet(key: SheetKey): Promise<SheetData> {
  const config = SHEET_CONFIG[key];
  const csvText = await fetchCSV(config.spreadsheet, config.gid);
  const parsed = Papa.parse(csvText, { skipEmptyLines: true });
  const rawData = parsed.data as string[][];
  if (rawData.length === 0) return { sheetName: config.name, headers: [], rows: [], raw: [] };

  // Track original column indices for non-empty headers
  const headerEntries: { name: string; colIndex: number }[] = [];
  rawData[0].forEach((h: string, i: number) => {
    const trimmed = h.trim();
    if (trimmed) headerEntries.push({ name: trimmed, colIndex: i });
  });
  const headers = headerEntries.map((e) => e.name);
  const rows = rawData.slice(1).map((row: string[]) => {
    const obj: Record<string, string | number> = {};
    headerEntries.forEach((entry) => {
      obj[entry.name] = normalizeValue(row[entry.colIndex] || "");
    });
    return obj;
  });

  return { sheetName: config.name, headers, rows, raw: rawData };
}

export async function fetchAllSheets(): Promise<Record<SheetKey, SheetData>> {
  const keys = Object.keys(SHEET_CONFIG) as SheetKey[];
  const results = await Promise.all(keys.map((k) => fetchSheet(k)));
  const map = {} as Record<SheetKey, SheetData>;
  keys.forEach((k, i) => (map[k] = results[i]));
  return map;
}

// ========== Processed types ==========

export interface ClientRecord {
  client: string;
  service: string;
  value: number;
  status: string;
  month: string;
  observations: string;
}

export interface FinancialRecord {
  client: string;
  service: string;
  value: number;
  payment: string;
  status: string;
  paymentDate: string;
  contractEnd: string;
  observations: string;
}

export interface PainelKPI {
  newBusinessRevenue: number;
  churningRevenue: number;
  averageTicket: number;
  netBalance: number;
  newBusinessCount: number;
  churningCount: number;
  newBusinessRate: number;
  churningRate: number;
}

export interface MonthlyPerformance {
  month: string;
  newBusiness: number;
  churning: number;
  balance: number;
}

export interface FinancialSummary {
  totalValue: number;
  targetValue: number;
  percentAchieved: number;
  shortfall: number;
  paidCount: number;
  unpaidCount: number;
  activeCount: number;
  inactiveCount: number;
  records: FinancialRecord[];
}

// ========== Processing functions ==========

export function processBase(data: SheetData): ClientRecord[] {
  const hMap: Record<string, string> = {};
  data.headers.forEach((h) => {
    const u = h.toUpperCase();
    if (u.includes("CLIENTE") || u.includes("CONTROLE")) hMap.client = h;
    else if (u.includes("SERVIÇO") || u.includes("SERVICO")) hMap.service = h;
    else if (u.includes("VALOR")) hMap.value = h;
    else if (u === "STATUS") hMap.status = h;
    else if (u.includes("MÊS") || u.includes("MES")) hMap.month = h;
    else if (u.includes("OBSERV")) hMap.observations = h;
  });

  return data.rows
    .filter((row) => row[hMap.client] && String(row[hMap.client]).trim() !== "")
    .map((row) => ({
      client: String(row[hMap.client] || "").trim(),
      service: String(row[hMap.service] || "").trim().toUpperCase(),
      value: Number(typeof row[hMap.value] === "number" ? row[hMap.value] : parseBRL(String(row[hMap.value] || ""))) || 0,
      status: String(row[hMap.status] || "").trim().toUpperCase(),
      month: String(row[hMap.month] || "").trim().toUpperCase(),
      observations: String(row[hMap.observations] || "").trim(),
    }));
}

export function processPainel(data: SheetData): PainelKPI {
  const raw = data.raw;
  const findValue = (label: string): number => {
    for (const row of raw) {
      for (let i = 0; i < row.length; i++) {
        if (row[i] && row[i].toUpperCase().includes(label.toUpperCase())) {
          for (let j = i + 1; j < row.length; j++) {
            if (row[j] && row[j].trim()) {
              const val = normalizeValue(row[j]);
              if (typeof val === "number") return val;
            }
          }
        }
      }
    }
    return 0;
  };

  return {
    newBusinessRevenue: findValue("NOVOS NEGÓCIOS (R$)"),
    churningRevenue: findValue("CHURNING (R$)"),
    averageTicket: findValue("TICKET MÉDIO"),
    netBalance: findValue("SALDO LÍQUIDO"),
    newBusinessCount: findValue("NOVOS NEGÓCIOS (QNT)"),
    churningCount: findValue("CHURNING (QNT)"),
    newBusinessRate: findValue("NOVOS NEGÓCIOS RATE"),
    churningRate: findValue("CHURNING RATE"),
  };
}

export function processPerformance(data: SheetData): MonthlyPerformance[] {
  const hMap: Record<string, string> = {};
  data.headers.forEach((h) => {
    const u = h.toUpperCase();
    if (u.includes("MÊS") || u.includes("MES")) hMap.month = h;
    else if (u.includes("NOVOS")) hMap.newBusiness = h;
    else if (u.includes("CHURNING")) hMap.churning = h;
    else if (u.includes("SALDO")) hMap.balance = h;
  });

  return data.rows
    .filter((row) => row[hMap.month] && String(row[hMap.month]).trim() !== "")
    .map((row) => ({
      month: String(row[hMap.month] || "").trim(),
      newBusiness: Number(typeof row[hMap.newBusiness] === "number" ? row[hMap.newBusiness] : parseBRL(String(row[hMap.newBusiness] || ""))) || 0,
      churning: Number(typeof row[hMap.churning] === "number" ? row[hMap.churning] : parseBRL(String(row[hMap.churning] || ""))) || 0,
      balance: Number(typeof row[hMap.balance] === "number" ? row[hMap.balance] : parseBRL(String(row[hMap.balance] || ""))) || 0,
    }));
}

export function processFinancial(data: SheetData): FinancialSummary {
  const hMap: Record<string, string> = {};
  data.headers.forEach((h) => {
    const u = h.toUpperCase();
    if (u.includes("CLIENTE") || u.includes("CONTROLE")) hMap.client = h;
    else if (u.includes("SERVIÇO") || u.includes("SERVICO")) hMap.service = h;
    else if (u.includes("VALOR")) hMap.value = h;
    else if (u.includes("PAGAMENTO") && !u.includes("DATA")) hMap.payment = h;
    else if (u === "STATUS") hMap.status = h;
    else if (u.includes("DATA")) hMap.paymentDate = h;
    else if (u.includes("ENCERRAMENTO") || u.includes("CONTRATO")) hMap.contractEnd = h;
    else if (u.includes("OBSERV")) hMap.observations = h;
  });

  const records: FinancialRecord[] = data.rows
    .filter((row) => row[hMap.client] && String(row[hMap.client]).trim() !== "")
    .map((row) => ({
      client: String(row[hMap.client] || "").trim(),
      service: String(row[hMap.service] || "").trim(),
      value: Number(typeof row[hMap.value] === "number" ? row[hMap.value] : parseBRL(String(row[hMap.value] || ""))) || 0,
      payment: String(row[hMap.payment] || "").trim().toUpperCase(),
      status: String(row[hMap.status] || "").trim().toUpperCase(),
      paymentDate: String(row[hMap.paymentDate] || "").trim(),
      contractEnd: String(row[hMap.contractEnd] || "").trim(),
      observations: String(row[hMap.observations] || "").trim(),
    }));

  // Extract summary KPIs from raw data (look only in columns >= 8, where summary KPIs sit)
  const raw = data.raw;
  let totalValue = 0, targetValue = 0, percentAchieved = 0, shortfall = 0;
  for (const row of raw) {
    for (let i = 8; i < row.length; i++) {
      const cell = (row[i] || "").trim().toUpperCase();
      if (cell.includes("VALOR TOTAL")) {
        const v = normalizeValue(row[i + 1] || "");
        if (typeof v === "number") totalValue = v;
      }
      if (cell === "META") {
        const v = normalizeValue(row[i + 1] || "");
        if (typeof v === "number") targetValue = v;
      }
      if (cell.includes("PORCENTAGEM ATINGIDA")) {
        const v = normalizeValue(row[i + 1] || "");
        if (typeof v === "number") percentAchieved = v;
      }
      if (cell.includes("VALOR FALTANTE")) {
        const v = normalizeValue(row[i + 1] || "");
        if (typeof v === "number") shortfall = v;
      }
    }
  }

  const paidCount = records.filter((r) => r.payment === "PAGO").length;
  const unpaidCount = records.filter((r) => r.payment.includes("NÃO")).length;
  const activeCount = records.filter((r) => r.status === "ATIVO").length;
  const inactiveCount = records.filter((r) => r.status === "INATIVO").length;

  return { totalValue, targetValue, percentAchieved, shortfall, paidCount, unpaidCount, activeCount, inactiveCount, records };
}
