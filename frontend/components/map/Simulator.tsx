"use client";

import type { Territory } from "@/lib/types";

const ADD_OPTIONS = [10, 25, 50, 100];

interface SimulatorProps {
  territory: Territory | null;
  addedSupply: number;
  onAdd: (amount: number) => void;
  onReset: () => void;
}

export default function Simulator({ territory, addedSupply, onAdd, onReset }: SimulatorProps) {
  if (!territory) return null;

  return (
    <div className="absolute bottom-4 right-4 z-10 w-72 rounded-lg border border-black/10 bg-white p-4 shadow-lg dark:border-white/10 dark:bg-zinc-900">
      <h3 className="text-sm font-semibold text-black dark:text-zinc-50">
        Simular novas vagas
      </h3>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {territory.name}
      </p>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {ADD_OPTIONS.map((amount) => (
          <button
            key={amount}
            onClick={() => onAdd(amount)}
            className="rounded border border-black/10 px-2 py-1.5 text-sm font-medium text-black transition-colors hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/10"
          >
            +{amount}
          </button>
        ))}
      </div>

      {addedSupply > 0 && (
        <button
          onClick={onReset}
          className="mt-3 w-full rounded border border-black/10 px-2 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-black/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10"
        >
          Resetar (+{addedSupply} vagas simuladas)
        </button>
      )}
    </div>
  );
}
