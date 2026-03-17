import { NextResponse } from "next/server";
import {
  fetchAllSheets,
  processBase,
  processPainel,
  processPerformance,
  processFinancial,
} from "@/lib/googleSheets";

export const revalidate = 30;

export async function GET() {
  try {
    const allSheets = await fetchAllSheets();

    const base = processBase(allSheets.BASE_2026);
    const painel = processPainel(allSheets.PAINEL);
    const performance = processPerformance(allSheets.PERFORMANCE);

    const financial: Record<string, ReturnType<typeof processFinancial>> = {
      DEZEMBRO_25: processFinancial(allSheets.DEZEMBRO_25),
      JANEIRO_26: processFinancial(allSheets.JANEIRO_26),
      FEVEREIRO_26: processFinancial(allSheets.FEVEREIRO_26),
      MARCO_26: processFinancial(allSheets.MARCO_26),
    };

    return NextResponse.json({
      sheets: allSheets,
      base,
      painel,
      performance,
      financial,
    });
  } catch (error) {
    console.error("Sheet fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sheets" },
      { status: 500 }
    );
  }
}
