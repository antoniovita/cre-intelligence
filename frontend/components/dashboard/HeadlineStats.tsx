"use client";

import { useJsonData } from "@/lib/useJsonData";
import type { Territory, VacancyQueueItem } from "@/lib/types";
import { formatPressure } from "@/lib/pressureScale";
import { StatTile } from "./StatTile";

export function HeadlineStats() {
  const { data: territories } = useJsonData<Territory[]>(
    "/data/territories.json"
  );
  const { data: queue } = useJsonData<VacancyQueueItem[]>("/data/queue.json");

  if (!territories || !queue) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-18.5 animate-pulse rounded-xl border border-slate-200 bg-white"
          />
        ))}
      </div>
    );
  }

  const sorted = [...territories].sort((a, b) => b.pressure - a.pressure);
  const worst = sorted[0];
  const median = sorted[Math.floor(sorted.length / 2)];
  const aguardando = queue.filter(
    (q) => q.status === "aguardando_confirmacao"
  ).length;
  const vencendo = queue.filter((q) => q.status === "vencendo").length;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatTile
        label="Territórios monitorados"
        value={String(territories.length)}
        hint="microáreas com demanda e oferta"
      />
      <StatTile
        label="Pressão mais crítica"
        value={formatPressure(worst?.pressure ?? 0)}
        hint={worst?.name}
        accent="#1d4ed8"
      />
      <StatTile
        label="Pressão mediana"
        value={formatPressure(median?.pressure ?? 0)}
        hint="demanda / oferta"
      />
      <StatTile
        label="Vagas em risco"
        value={`${vencendo} vencendo`}
        hint={`${aguardando} aguardando confirmação`}
        accent={vencendo > 0 ? "#dc2626" : undefined}
      />
    </div>
  );
}
