"use client";

import { useJsonData } from "@/lib/useJsonData";
import type { VacancyQueueItem } from "@/lib/types";
import { VacancyCard } from "./VacancyCard";

interface VacancyListProps {
  /** Optional territory/unidade filter, e.g. selecionado no mapa */
  unidadeFilter?: string;
  /**
   * "single" always stacks one card per row (e.g. narrow side panels).
   * "grid" (default) adapts columns to the available width via container queries.
   */
  layout?: "single" | "grid";
}

export function VacancyList({ unidadeFilter, layout = "grid" }: VacancyListProps) {
  const { data, loading, error } = useJsonData<VacancyQueueItem[]>(
    "/data/queue.json"
  );

  const gridClass =
    layout === "single"
      ? "flex flex-col gap-3"
      : "@container grid grid-cols-1 gap-3 @sm:grid-cols-2 @2xl:grid-cols-3";

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-xl border border-slate-200 bg-white"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="flex items-center gap-1.5 text-sm text-red-600">
        <span aria-hidden="true">✕</span>
        Erro ao carregar vagas: {error}
      </p>
    );
  }

  const items = (data ?? []).filter(
    (item) => !unidadeFilter || item.unidade === unidadeFilter
  );

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-400">
        Nenhuma vaga em aberto{unidadeFilter ? " para este território" : ""}.
      </p>
    );
  }

  return (
    <div className={gridClass}>
      {items.map((item) => (
        <VacancyCard key={item.vaga_id} item={item} />
      ))}
    </div>
  );
}
