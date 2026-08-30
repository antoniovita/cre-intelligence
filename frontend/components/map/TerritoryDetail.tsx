"use client";

import type { Territory } from "@/lib/types";
import { pressureColor } from "@/lib/pressureColor";

interface TerritoryDetailProps {
  territory: Territory | null;
  onClose?: () => void;
}

export default function TerritoryDetail({ territory, onClose }: TerritoryDetailProps) {
  if (!territory) return null;

  return (
    <div className="absolute top-4 right-4 z-10 w-72 rounded-lg border border-black/10 bg-white p-4 shadow-lg dark:border-white/10 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
          {territory.name}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        )}
      </div>

      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-zinc-500 dark:text-zinc-400">Demanda</dt>
          <dd className="font-medium text-black dark:text-zinc-50">{territory.demand}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-zinc-500 dark:text-zinc-400">Oferta</dt>
          <dd className="font-medium text-black dark:text-zinc-50 transition-all duration-300">
            {territory.supply}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-zinc-500 dark:text-zinc-400">Pressure</dt>
          <dd
            className="rounded px-2 py-0.5 font-semibold text-white transition-colors duration-300"
            style={{ backgroundColor: pressureColor(territory.pressure) }}
          >
            {territory.pressure.toFixed(2)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
