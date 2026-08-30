/**
 * Family-facing translation of `pressure` into a plain-language category.
 * Deliberately hides the raw demand/supply ratio — families see "how hard
 * is it to get a spot here", never the management metric itself.
 */
export interface AvailabilityLevel {
  label: string;
  color: string;
}

export function availabilityLevel(pressure: number): AvailabilityLevel {
  if (pressure < 1) return { label: "Boa disponibilidade", color: "#22c55e" };
  if (pressure < 2) return { label: "Procura alta", color: "#eab308" };
  return { label: "Muita procura", color: "#ef4444" };
}
