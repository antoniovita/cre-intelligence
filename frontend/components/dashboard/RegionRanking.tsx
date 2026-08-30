"use client";

import { useMemo, useState } from "react";
import { useJsonData } from "@/lib/useJsonData";
import type { Territory } from "@/lib/types";
import { formatPressure, pressureLevel } from "@/lib/pressureScale";
import { aggregateByRegion } from "@/lib/regionAggregate";

export function RegionRanking() {
  const { data, loading, error } = useJsonData<Territory[]>(
    "/data/territories.json"
  );
  const [search, setSearch] = useState("");

  const regions = useMemo(() => {
    const all = aggregateByRegion(data ?? []).sort(
      (a, b) => b.pressure - a.pressure
    );
    const query = search.trim().toLowerCase();
    if (!query) return all;
    return all.filter((r) => `cre ${r.cre}`.includes(query));
  }, [data, search]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-xl border border-slate-200 bg-white"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="flex items-center gap-1.5 text-sm text-red-600">
        <span aria-hidden="true">✕</span>
        Erro ao carregar territórios: {error}
      </p>
    );
  }

  const maxPressure = Math.max(...regions.map((r) => r.pressure), 1);

  return (
    <div className="flex h-100 flex-col gap-2">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar CRE… (ex.: CRE 7)"
        className="shrink-0 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />

      {regions.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-400">
          Nenhuma CRE encontrada.
        </p>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="flex flex-col gap-2">
            {regions.map((region, index) => {
              const level = pressureLevel(region.pressure);
              const barWidth = Math.max((region.pressure / maxPressure) * 100, 4);

              return (
                <div
                  key={region.cre}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium tabular-nums text-slate-400">
                        #{index + 1}
                      </span>
                      <h3 className="font-semibold text-slate-900">
                        CRE {region.cre}
                      </h3>
                      <span className="text-xs text-slate-400">
                        {region.territoryCount}{" "}
                        {region.territoryCount === 1 ? "território" : "territórios"}
                      </span>
                    </div>
                    <span
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ color: level.color }}
                    >
                      <span
                        aria-hidden="true"
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: level.color }}
                      />
                      {level.label}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${barWidth}%`, backgroundColor: level.color }}
                      />
                    </div>
                    <span className="w-14 shrink-0 text-right text-sm font-semibold tabular-nums text-slate-900">
                      {formatPressure(region.pressure)}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    {region.demand.toLocaleString("pt-BR")} demanda ·{" "}
                    {region.supply.toLocaleString("pt-BR")} oferta · pior
                    território:{" "}
                    <span className="font-medium text-slate-700">
                      {region.worstTerritory.name}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
