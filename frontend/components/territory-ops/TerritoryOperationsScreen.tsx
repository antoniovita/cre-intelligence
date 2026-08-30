"use client";

import { useCallback, useMemo, useState } from "react";
import { useJsonData } from "@/lib/useJsonData";
import type { Territory } from "@/lib/types";
import { simulateAddedSupply } from "@/lib/pressure";
import { TerritoryListPanel } from "./TerritoryListPanel";
import { PressureMapCanvas } from "./PressureMapCanvas";
import { TerritoryBottomSheet } from "./TerritoryBottomSheet";

export function TerritoryOperationsScreen() {
  const { data, loading, error } = useJsonData<Territory[]>("/data/territories.json");
  const territories = useMemo(() => data ?? [], [data]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addedSupply, setAddedSupply] = useState(0);
  const [query, setQuery] = useState("");

  const base = useMemo(
    () => territories.find((t) => t.id === selectedId) ?? null,
    [territories, selectedId]
  );
  const displayed = useMemo(() => {
    if (!base) return null;
    return addedSupply > 0 ? simulateAddedSupply(base, addedSupply) : base;
  }, [base, addedSupply]);

  const worstId = useMemo(() => {
    if (territories.length === 0) return null;
    return [...territories].sort((a, b) => b.pressure - a.pressure)[0].id;
  }, [territories]);

  const displayedPressureFor = useCallback(
    (id: string) => (id === selectedId && displayed ? displayed.pressure : territories.find((t) => t.id === id)?.pressure ?? 0),
    [selectedId, displayed, territories]
  );
  const displayedFiguresFor = useCallback(
    (id: string) => {
      if (id === selectedId && displayed) return { demand: displayed.demand, supply: displayed.supply };
      const t = territories.find((x) => x.id === id);
      return { demand: t?.demand ?? 0, supply: t?.supply ?? 0 };
    },
    [selectedId, displayed, territories]
  );

  function handleSelect(id: string) {
    setSelectedId(id);
    setAddedSupply(0);
  }
  function handleClose() {
    setSelectedId(null);
    setAddedSupply(0);
  }

  if (loading) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center text-sm text-slate-400">
        Carregando territórios…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center text-sm text-red-600">
        Erro ao carregar territórios: {error}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col sm:flex-row">
      <TerritoryListPanel
        territories={territories}
        displayedPressureFor={displayedPressureFor}
        displayedFiguresFor={displayedFiguresFor}
        selectedId={selectedId}
        query={query}
        onQueryChange={setQuery}
        onSelect={handleSelect}
      />

      <main className="relative min-h-80 flex-1 bg-slate-200 sm:min-h-0">
        <PressureMapCanvas
          territories={territories}
          selectedId={selectedId}
          displayedPressure={displayed?.pressure ?? null}
          worstId={worstId}
          onSelect={handleSelect}
        />

        {!selectedId && (
          <div className="absolute bottom-6 left-1/2 z-[5] flex -translate-x-1/2 items-center gap-2.5 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-lg">
            <svg width="17" height="17" viewBox="0 0 256 256" aria-hidden="true" className="shrink-0 text-blue-600">
              <path
                d="M100 40 L100 216 L140 176 L168 224 L192 212 L164 164 L216 156 Z"
                fill="#93c5fd"
                stroke="#1d4ed8"
                strokeWidth="14"
                strokeLinejoin="round"
              />
            </svg>
            <span>
              Clique num ponto de calor no mapa{" "}
              <em className="text-slate-500">— ou escolha um território na lista</em>
            </span>
          </div>
        )}

        {selectedId && base && displayed && (
          <TerritoryBottomSheet
            base={base}
            displayed={displayed}
            addedSupply={addedSupply}
            onAdd={(amount) => setAddedSupply((prev) => prev + amount)}
            onReset={() => setAddedSupply(0)}
            onClose={handleClose}
          />
        )}
      </main>
    </div>
  );
}
