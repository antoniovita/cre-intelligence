// baixa pressão -> alta pressão
export function pressureColor(pressure: number): string {
  if (pressure < 1) return "#22c55e";
  if (pressure < 2) return "#eab308";
  if (pressure < 3) return "#f97316";
  return "#ef4444";
}
