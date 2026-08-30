"use client";

import { useMemo } from "react";
import type { Territory } from "@/lib/types";
import { extractCre } from "@/lib/regionAggregate";
import { pressureColor } from "@/lib/pressureColor";

interface TerritoryListPanelProps {
  territories: Territory[];
  displayedPressureFor: (id: string) => number;
  displayedFiguresFor: (id: string) => { demand: number; supply: number };
  selectedId: string | null;
  query: string;
  onQueryChange: (query: string) => void;
  onSelect: (id: string) => void;
}

export function TerritoryListPanel({
  territories,
  displayedPressureFor,
  displayedFiguresFor,
  selectedId,
  query,
  onQueryChange,
  onSelect,
}: TerritoryListPanelProps) {
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return territories
      .filter((t) => !q || t.name.toLowerCase().includes(q) || t.id.includes(q))
      .map((t) => ({ t, p: displayedPressureFor(t.id) }))
      .sort((a, b) => b.p - a.p);
  }, [territories, query, displayedPressureFor]);

  return (
    <section className="flex h-full min-h-0 w-full shrink-0 flex-col border-r border-slate-200 bg-white sm:w-77">
      <div className="flex flex-col gap-3 p-4 pb-3">
        <div className="flex w-fit rounded-md bg-slate-100 p-0.5 text-sm">
          <span className="rounded-md bg-white px-2.5 py-1 font-semibold text-blue-900 shadow-sm">
            Microáreas ({territories.length})
          </span>
        </div>
        <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5">
          <svg width="14" height="14" viewBox="0 0 256 256" aria-hidden="true" className="shrink-0 text-slate-400">
            <circle cx="112" cy="112" r="72" fill="currentColor" opacity="0.18" />
            <circle cx="112" cy="112" r="72" fill="none" stroke="currentColor" strokeWidth="18" />
            <line x1="164" y1="164" x2="220" y2="220" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar território ou CRE"
            className="w-full border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </label>
      </div>

      <div className="flex items-baseline justify-between px-4 pb-2 text-[10px] uppercase tracking-wide text-slate-400">
        <span>Ordenado por pressão</span>
        <span>demanda / oferta</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {rows.length === 0 ? (
          <p className="p-4 text-sm text-slate-400">Nenhum território encontrado.</p>
        ) : (
          rows.map(({ t }) => {
            const p = displayedPressureFor(t.id);
            const figures = displayedFiguresFor(t.id);
            const active = t.id === selectedId;
            return (
              <button
                key={t.id}
                onClick={() => onSelect(t.id)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-2.5 text-left transition-colors ${
                  active ? "bg-blue-100" : "hover:bg-blue-50"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full shadow-[0_0_0_1px_rgba(0,0,0,0.12)]"
                  style={{ backgroundColor: pressureColor(p) }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-900">
                    {t.name}
                  </span>
                  <span className="block text-[11.5px] tabular-nums text-slate-500">
                    {extractCre(t.name) === "?" ? "" : `CRE ${extractCre(t.name)} · `}
                    {figures.demand} / {figures.supply}
                  </span>
                </span>
                <span
                  className="shrink-0 text-[17px] font-semibold tabular-nums"
                  style={{ color: pressureColor(p) }}
                >
                  {p.toFixed(2)}
                </span>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
