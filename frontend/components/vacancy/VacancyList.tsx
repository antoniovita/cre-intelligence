"use client";

import { useMemo, useState } from "react";
import { useJsonData } from "@/lib/useJsonData";
import { usePagination } from "@/lib/usePagination";
import type { VacancyQueueItem, VacancyStatus } from "@/lib/types";
import { VacancyCard } from "./VacancyCard";
import { PaginationControls } from "../ui/PaginationControls";

interface VacancyListProps {
  /** Optional territory/unidade filter, e.g. selecionado no mapa */
  unidadeFilter?: string;
  /**
   * "single" always stacks one card per row (e.g. narrow side panels).
   * "grid" (default) adapts columns to the available width via container queries.
   */
  layout?: "single" | "grid";
  /** Shows the status/search toolbar and paginates. Off by default for embedded uses (e.g. territory panel). */
  showControls?: boolean;
}

// Most urgent status first; within the same status, closer deadlines first
// (an expired "vencendo" prazo still outranks a fresh "aguardando").
const STATUS_RANK: Record<VacancyStatus, number> = {
  vencendo: 0,
  aguardando_confirmacao: 1,
  confirmada: 2,
};

const STATUS_FILTERS: { value: VacancyStatus | "todas"; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "vencendo", label: "Vencendo" },
  { value: "aguardando_confirmacao", label: "Aguardando" },
  { value: "confirmada", label: "Confirmada" },
];

const PAGE_SIZE = 12;

export function VacancyList({ unidadeFilter, layout = "grid", showControls = false }: VacancyListProps) {
  const { data, loading, error } = useJsonData<VacancyQueueItem[]>(
    "/data/queue.json"
  );
  const [statusFilter, setStatusFilter] = useState<VacancyStatus | "todas">("todas");
  const [query, setQuery] = useState("");

  const gridClass =
    layout === "single"
      ? "flex flex-col gap-3"
      : "@container grid grid-cols-1 gap-3 @sm:grid-cols-2 @2xl:grid-cols-3";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? [])
      .filter((item) => !unidadeFilter || item.unidade === unidadeFilter)
      .filter((item) => statusFilter === "todas" || item.status === statusFilter)
      .filter(
        (item) =>
          !q ||
          item.unidade.toLowerCase().includes(q) ||
          item.crianca_atual.toLowerCase().includes(q) ||
          item.vaga_id.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const rankDiff = STATUS_RANK[a.status] - STATUS_RANK[b.status];
        if (rankDiff !== 0) return rankDiff;
        return new Date(a.prazo).getTime() - new Date(b.prazo).getTime();
      });
  }, [data, unidadeFilter, statusFilter, query]);

  // usePagination reseta para a página 1 sozinho quando `filtered` muda de
  // identidade (novo filtro/busca), então os handlers abaixo só setam o filtro.
  const { page, totalPages, pageItems, setPage } = usePagination(
    filtered,
    PAGE_SIZE
  );
  const paged = showControls ? pageItems : filtered;

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

  return (
    <div className="flex flex-col gap-3">
      {showControls && (
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === f.value
                    ? "border-blue-700 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-900"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 sm:w-64">
            <svg width="14" height="14" viewBox="0 0 256 256" aria-hidden="true" className="shrink-0 text-slate-400">
              <circle cx="112" cy="112" r="72" fill="currentColor" opacity="0.18" />
              <circle cx="112" cy="112" r="72" fill="none" stroke="currentColor" strokeWidth="18" />
              <line x1="164" y1="164" x2="220" y2="220" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar unidade, criança ou vaga"
              className="w-full border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </label>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-400">
          Nenhuma vaga encontrada{unidadeFilter ? " para este território" : ""}.
        </p>
      ) : (
        <div className={gridClass}>
          {paged.map((item) => (
            <VacancyCard key={item.vaga_id} item={item} />
          ))}
        </div>
      )}

      {showControls && (
        <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
