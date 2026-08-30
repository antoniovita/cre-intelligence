/**
 * Sequential blue ramp for the `pressure` metric (demand / supply),
 * using Tailwind's default blue scale. Shared by the dashboard stat
 * tiles and the territory map so the same value always reads as the
 * same color everywhere in the app.
 *
 * Thresholds are informed by the real pipeline output (see pipeline/PIPELINE.md):
 * pressure ranges ~0.31–11.0 with a median ≈ 1.12. Below 1 means supply
 * covers demand; above 2 is a territory in serious trouble.
 */

export const PRESSURE_RAMP = [
  "#dbeafe", // blue-100
  "#bfdbfe", // blue-200
  "#93c5fd", // blue-300
  "#3b82f6", // blue-500
  "#2563eb", // blue-600
  "#1d4ed8", // blue-700
  "#1e3a8a", // blue-900
] as const;

export interface PressureLevel {
  label: string;
  color: string;
}

/** Maps a pressure value to one of the 7 ramp steps + a human label. */
export function pressureLevel(pressure: number): PressureLevel {
  if (pressure < 0.75) return { label: "Folgado", color: PRESSURE_RAMP[0] };
  if (pressure < 1) return { label: "Equilibrado", color: PRESSURE_RAMP[1] };
  if (pressure < 1.5) return { label: "Atenção", color: PRESSURE_RAMP[3] };
  if (pressure < 2.5) return { label: "Pressionado", color: PRESSURE_RAMP[4] };
  if (pressure < 4) return { label: "Crítico", color: PRESSURE_RAMP[5] };
  return { label: "Extremo", color: PRESSURE_RAMP[6] };
}

export function formatPressure(pressure: number): string {
  if (!Number.isFinite(pressure)) return "—";
  return pressure.toFixed(2);
}
