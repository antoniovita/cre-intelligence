"use client";

import { useEffect, useRef, useState } from "react";
import type { Territory } from "@/lib/types";
import { pressureColor } from "@/lib/pressureColor";

interface TerritoryDetailProps {
  territory: Territory | null;
  onClose?: () => void;
}

export default function TerritoryDetail({ territory, onClose }: TerritoryDetailProps) {
  const [pulse, setPulse] = useState(false);
  const prevPressureRef = useRef<number | null>(null);

  useEffect(() => {
    if (!territory) return;
    const changed =
      prevPressureRef.current !== null && prevPressureRef.current !== territory.pressure;
    prevPressureRef.current = territory.pressure;
    if (!changed) return;

    setPulse(true);
    const timeout = setTimeout(() => setPulse(false), 400);
    return () => clearTimeout(timeout);
  }, [territory]);

  if (!territory) return null;

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
        <div className="flex items-center justify-between">
          <dt className="text-slate-500">Pressure</dt>
          <dd
            className={`rounded px-2 py-0.5 font-semibold text-white transition-all duration-300 ${
              pulse ? "scale-125" : "scale-100"
            }`}
            style={{ backgroundColor: pressureColor(territory.pressure) }}
          >
            {territory.pressure.toFixed(2)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
