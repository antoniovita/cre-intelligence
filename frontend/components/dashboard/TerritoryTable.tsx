"use client";

import { useMemo, useState } from "react";
import { useJsonData } from "@/lib/useJsonData";
import type { Territory } from "@/lib/types";
import { formatPressure, pressureLevel } from "@/lib/pressureScale";
import { usePagination } from "@/lib/usePagination";
import { PaginationControls } from "./PaginationControls";

const CRE_PATTERN = /CRE (\d+)/;

export function TerritoryTable() {
  const { data, loading, error } = useJsonData<Territory[]>(
    "/data/territories.json"
  );
  const [search, setSearch] = useState("");
  const [creFilter, setCreFilter] = useState<string>("all");

  const creOptions = useMemo(() => {
    const set = new Set<string>();
    for (const t of data ?? []) {
      const match = t.name.match(CRE_PATTERN);
      if (match) set.add(match[1]);
    }
    return [...set].sort((a, b) => Number(a) - Number(b));
  }, [data]);

  const filtered = useMemo(() => {
    const sorted = [...(data ?? [])].sort((a, b) => b.pressure - a.pressure);
    const query = search.trim().toLowerCase();

    return sorted.filter((t) => {
      const matchesSearch = !query || t.name.toLowerCase().includes(query);
      const matchesCre =
        creFilter === "all" || t.name.match(CRE_PATTERN)?.[1] === creFilter;
      return matchesSearch && matchesCre;
    });
  }, [data, search, creFilter]);

  const { page, totalPages, pageItems, setPage } = usePagination(filtered);

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-10 animate-pulse rounded-lg border border-slate-200 bg-white"
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

  return (
    <div className="flex h-100 flex-col gap-2">
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar território…"
          className="flex-1 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <select
          value={creFilter}
          onChange={(e) => setCreFilter(e.target.value)}
          className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-600 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          <option value="all">Todas as CREs</option>
          {creOptions.map((cre) => (
            <option key={cre} value={cre}>
              CRE {cre}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-400">
          Nenhum território encontrado.
        </p>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-2.5 font-medium">Território</th>
                <th className="px-4 py-2.5 text-right font-medium">Demanda</th>
                <th className="px-4 py-2.5 text-right font-medium">Oferta</th>
                <th className="px-4 py-2.5 text-right font-medium">Pressão</th>
                <th className="px-4 py-2.5 font-medium">Situação</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((territory) => {
                const level = pressureLevel(territory.pressure);
                return (
                  <tr
                    key={territory.id}
                    className="border-b border-slate-200 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-2.5 text-slate-900">
                      {territory.name}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-500">
                      {territory.demand.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-500">
                      {territory.supply.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                      {formatPressure(territory.pressure)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{ color: level.color }}
                      >
                        <span
                          aria-hidden="true"
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: level.color }}
                        />
                        {level.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
