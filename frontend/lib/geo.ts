import type { Territory } from "./types";

/**
 * Território cujo centroide está mais próximo de (latitude, longitude).
 * Distância euclidiana simples sobre graus — suficiente para achar o
 * vizinho mais próximo na escala de uma cidade; não é para medir distância
 * real (usar haversine se isso passar a importar em algum lugar).
 */
export function nearestTerritory(
  latitude: number,
  longitude: number,
  territories: Territory[]
): Territory | null {
  let closest: Territory | null = null;
  let closestDistSq = Infinity;

  for (const t of territories) {
    const dLat = t.latitude - latitude;
    const dLon = t.longitude - longitude;
    const distSq = dLat * dLat + dLon * dLon;
    if (distSq < closestDistSq) {
      closestDistSq = distSq;
      closest = t;
    }
  }

  return closest;
}
