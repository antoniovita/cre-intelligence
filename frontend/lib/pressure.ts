// Lógica pura do simulador (Módulo 3). Sem I/O, sem estado — só a fórmula,
// pra não ficar espalhada em componentes de UI. P2 é dono deste arquivo.

import type { Territory } from "./types";

/**
 * Aplica +N vagas de supply a um território e recalcula pressure.
 * Não muta o território original.
 */
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
