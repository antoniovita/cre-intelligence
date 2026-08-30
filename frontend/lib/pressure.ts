import type { Territory } from "./types";

export function simulateAddedSupply(
  territory: Territory,
  additionalSupply: number
): Territory {
  const supply = territory.supply + additionalSupply;
  return {
    ...territory,
    supply,
    pressure: supply > 0 ? territory.demand / supply : Infinity,
  };
}
