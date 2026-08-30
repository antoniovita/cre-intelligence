/**
 * Qualitative pressure band used by the operational map screen (bottom
 * sheet badge + delta narration). Four bands aligned to the same
 * green/yellow/orange/red thresholds as pressureColor.ts, distinct from
 * the 6-step pressureScale.ts used elsewhere in the dashboard.
 */
export interface PressureBand {
  label: string;
  tone: "neutral" | "critical";
}

export function pressureBand(pressure: number): PressureBand {
  if (pressure < 1) return { label: "Equilibrada", tone: "neutral" };
  if (pressure < 2) return { label: "Atenção", tone: "neutral" };
  if (pressure < 3) return { label: "Crítica", tone: "critical" };
  return { label: "Emergência", tone: "critical" };
}
