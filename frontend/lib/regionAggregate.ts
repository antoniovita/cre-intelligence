import type { Territory } from "./types";

export interface RegionSummary {
  cre: string;
  demand: number;
  supply: number;
  pressure: number;
  territoryCount: number;
  worstTerritory: Territory;
}

const CRE_PATTERN = /CRE (\d+)/;

/** Extracts the CRE number from a territory name (e.g. "Microárea 7.28 (CRE 7)" -> "7"). */
export function extractCre(name: string): string {
  return name.match(CRE_PATTERN)?.[1] ?? "?";
}

/**
 * Groups territories by CRE (extracted from `name`, e.g. "Microárea 7.28 (CRE 7)")
 * and aggregates demand/supply, recomputing pressure from the aggregated totals
 * — never averaging the per-territory pressure values, which would distort
 * regions with very different territory sizes.
 */
export function aggregateByRegion(territories: Territory[]): RegionSummary[] {
  const groups = new Map<string, Territory[]>();

  for (const territory of territories) {
    const cre = extractCre(territory.name);
    const list = groups.get(cre) ?? [];
    list.push(territory);
    groups.set(cre, list);
  }

  const summaries: RegionSummary[] = [];
  for (const [cre, list] of groups) {
    const demand = list.reduce((sum, t) => sum + t.demand, 0);
    const supply = list.reduce((sum, t) => sum + t.supply, 0);
    const worstTerritory = [...list].sort((a, b) => b.pressure - a.pressure)[0];

    summaries.push({
      cre,
      demand,
      supply,
      pressure: supply > 0 ? demand / supply : Infinity,
      territoryCount: list.length,
      worstTerritory,
    });
  }

  return summaries.sort((a, b) => Number(a.cre) - Number(b.cre));
}
