"use client";

import { useJsonData } from "@/lib/useJsonData";
import type { Territory } from "@/lib/types";
import { formatPressure, pressureLevel } from "@/lib/pressureScale";

export function TerritoryTable() {
  const { data, loading, error } = useJsonData<Territory[]>(
    "/data/territories.json"
  );

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

  const sorted = [...(data ?? [])].sort((a, b) => b.pressure - a.pressure);

  return (
    <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
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
          {sorted.map((territory) => {
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
  );
}
