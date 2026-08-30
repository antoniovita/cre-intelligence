"use client";

import { useEffect, useRef, useState } from "react";
import type { Territory } from "@/lib/types";
import { pressureColor } from "@/lib/pressureColor";

interface TerritoryDetailProps {
  territory: Territory | null;
  /** The territory before any simulated supply was added — used to show the before→after comparison. */
  originalTerritory?: Territory | null;
  onClose?: () => void;
}

const GAUGE_MAX = 4;

export default function TerritoryDetail({
  territory,
  originalTerritory,
  onClose,
}: TerritoryDetailProps) {
  const [pop, setPop] = useState(false);
  const prevPressureRef = useRef<number | null>(null);

  useEffect(() => {
    if (!territory) return;
    const changed =
      prevPressureRef.current !== null && prevPressureRef.current !== territory.pressure;
    prevPressureRef.current = territory.pressure;
    if (!changed) return;

    setPop(true);
    const timeout = setTimeout(() => setPop(false), 400);
    return () => clearTimeout(timeout);
  }, [territory]);

  if (!territory) return null;

  const changed =
    !!originalTerritory && originalTerritory.pressure !== territory.pressure;
  const gaugePct = Math.min(territory.pressure / GAUGE_MAX, 1) * 100;

  return (
    <div className="absolute top-4 right-4 z-10 w-72 rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">
          {territory.name}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-slate-400 hover:text-slate-700"
          >
            ✕
          </button>
        )}
      </div>

      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-slate-500">Demanda</dt>
          <dd className="font-medium text-slate-900">{territory.demand}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-slate-500">Oferta</dt>
          <dd className="font-medium text-slate-900 transition-all duration-300">
            {territory.supply}
          </dd>
        </div>
      </dl>

      <div className="mt-3 border-t border-slate-100 pt-3">
        <span className="text-[10.5px] font-medium uppercase tracking-wide text-slate-400">
          Pressure
        </span>
        <div className="mt-0.5 flex items-baseline gap-2">
          {changed && (
            <>
              <span className="text-[15px] font-semibold text-slate-400 line-through decoration-slate-300">
                {originalTerritory!.pressure.toFixed(2)}
              </span>
              <span className="text-sm text-slate-400">→</span>
            </>
          )}
          <span
            key={`${territory.id}-${territory.pressure}`}
            className={`text-3xl font-bold leading-none tabular-nums transition-colors duration-300 ${pop ? "animate-pressure-pop" : ""}`}
            style={{ color: pressureColor(territory.pressure) }}
          >
            {territory.pressure.toFixed(2)}
          </span>
        </div>

        <div
          className="relative mt-2 h-2 rounded-full"
          style={{
            background:
              "linear-gradient(to right, #22c55e 0 25%, #eab308 25% 50%, #f97316 50% 75%, #ef4444 75% 100%)",
          }}
        >
          <div
            className="absolute -top-0.5 h-3 w-0.5 rounded-full bg-slate-900 shadow transition-[left] duration-500 ease-out"
            style={{ left: `calc(${gaugePct}% - 1px)` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[9.5px] text-slate-400">
          <span>0</span>
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4+</span>
        </div>
      </div>
    </div>
  );
}
