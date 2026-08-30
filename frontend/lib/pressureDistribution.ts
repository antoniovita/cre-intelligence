import type { Territory } from "./types";
import { pressureLevel } from "./pressureScale";

export interface PressureBucket {
  label: string;
  color: string;
  count: number;
}

const LEVEL_ORDER = [
  "Folgado",
  "Equilibrado",
  "Atenção",
  "Pressionado",
  "Crítico",
  "Extremo",
] as const;

/** Counts territories per pressure level, in the fixed low→high order. */
export function pressureDistribution(territories: Territory[]): PressureBucket[] {
  const counts = new Map<string, number>();
  const colors = new Map<string, string>();

  for (const territory of territories) {
    const level = pressureLevel(territory.pressure);
    counts.set(level.label, (counts.get(level.label) ?? 0) + 1);
    colors.set(level.label, level.color);
  }

  return LEVEL_ORDER.map((label) => ({
    label,
    color: colors.get(label) ?? "#cbd5e1",
    count: counts.get(label) ?? 0,
  }));
}
