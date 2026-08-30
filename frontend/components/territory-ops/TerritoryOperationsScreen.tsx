"use client";

import { useCallback, useMemo, useState } from "react";
import { useJsonData } from "@/lib/useJsonData";
import type { Territory } from "@/lib/types";
import { simulateAddedSupply } from "@/lib/pressure";
import { nearestTerritory } from "@/lib/geo";
import { TerritoryListPanel } from "./TerritoryListPanel";
import { PressureMapCanvas } from "./PressureMapCanvas";
import { TerritoryBottomSheet } from "./TerritoryBottomSheet";

export interface SimulatedUnit {
  id: string;
  latitude: number;
  longitude: number;
  nearestId: string;
  supply: number;
}

/** Selection is either a real territory or one simulated unit pin. */
type Selection = { kind: "territory"; id: string } | { kind: "unit"; id: string } | null;

export function TerritoryOperationsScreen() {
  const { data, loading, error } = useJsonData<Territory[]>("/data/territories.json");
  const territories = useMemo(() => data ?? [], [data]);

  const [selection, setSelection] = useState<Selection>(null);
  const [query, setQuery] = useState("");
  const [placingMode, setPlacingMode] = useState(false);
  const [units, setUnits] = useState<SimulatedUnit[]>([]);

  const selectedTerritoryId = selection?.kind === "territory" ? selection.id : null;
  const selectedUnit = selection?.kind === "unit" ? units.find((u) => u.id === selection.id) ?? null : null;
  // A unit pin's own bottom sheet still needs its parent territory's base figures.
  const activeTerritoryId = selectedTerritoryId ?? selectedUnit?.nearestId ?? null;

  const base = useMemo(
    () => territories.find((t) => t.id === activeTerritoryId) ?? null,
    [territories, activeTerritoryId]
  );

  /** Total simulated supply attached to a territory, across every unit placed near it. */
  const addedSupplyFor = useCallback(
    (territoryId: string) =>
      units.filter((u) => u.nearestId === territoryId).reduce((sum, u) => sum + u.supply, 0),
    [units]
  );

  const displayed = useMemo(() => {
    if (!base) return null;
    const added = addedSupplyFor(base.id);
    return added > 0 ? simulateAddedSupply(base, added) : base;
  }, [base, addedSupplyFor]);

  const handlePlaceUnit = useCallback(
    (lat: number, lon: number) => {
      const nearest = nearestTerritory(lat, lon, territories);
      if (!nearest) return;
      const id = `unit-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      setUnits((prev) => [...prev, { id, latitude: lat, longitude: lon, nearestId: nearest.id, supply: 0 }]);
      setPlacingMode(false);
      setSelection({ kind: "unit", id });
    },
    [territories]
  );

  const handleAddToUnit = useCallback((unitId: string, amount: number) => {
    setUnits((prev) => prev.map((u) => (u.id === unitId ? { ...u, supply: u.supply + amount } : u)));
  }, []);

  const handleRemoveUnit = useCallback((unitId: string) => {
    setUnits((prev) => prev.filter((u) => u.id !== unitId));
    setSelection((prev) => (prev?.kind === "unit" && prev.id === unitId ? null : prev));
  }, []);

  const worstId = useMemo(() => {
    if (territories.length === 0) return null;
    return [...territories].sort((a, b) => b.pressure - a.pressure)[0].id;
  }, [territories]);

  const displayedPressureFor = useCallback(
    (id: string) => {
      const t = territories.find((x) => x.id === id);
      if (!t) return 0;
      const added = addedSupplyFor(id);
      return added > 0 ? simulateAddedSupply(t, added).pressure : t.pressure;
    },
    [territories, addedSupplyFor]
  );
  const displayedFiguresFor = useCallback(
    (id: string) => {
      const t = territories.find((x) => x.id === id);
      if (!t) return { demand: 0, supply: 0 };
      const added = addedSupplyFor(id);
      return added > 0 ? simulateAddedSupply(t, added) : t;
    },
    [territories, addedSupplyFor]
  );

  function handleSelectTerritory(id: string) {
    setSelection({ kind: "territory", id });
  }
  function handleSelectUnit(id: string) {
    setSelection({ kind: "unit", id });
  }
  function handleClose() {
    setSelection(null);
  }
  function handleTogglePlacing() {
    setPlacingMode((prev) => !prev);
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
        selectedId={selectedTerritoryId}
        query={query}
        onQueryChange={setQuery}
        onSelect={handleSelectTerritory}
      />

      <main className="relative h-full min-h-80 flex-1 bg-slate-200 sm:min-h-0">
        <PressureMapCanvas
          territories={territories}
          selectedId={selectedTerritoryId}
          displayedPressure={displayed?.pressure ?? null}
          worstId={worstId}
          onSelect={handleSelectTerritory}
          placingMode={placingMode}
          onPlaceUnit={handlePlaceUnit}
          units={units}
          selectedUnitId={selectedUnit?.id ?? null}
          onSelectUnit={handleSelectUnit}
        />

        <button
          onClick={handleTogglePlacing}
          className={`absolute left-4 top-4 z-[5] flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium shadow-lg transition-colors ${
            placingMode
              ? "border-blue-700 bg-blue-600 text-white"
              : "border-slate-200 bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-900"
          }`}
        >
          <span className="text-base leading-none">+</span>
          {placingMode ? "Clique no mapa para posicionar…" : "Simular nova creche"}
        </button>

        {units.length > 0 && (
          <div className="absolute left-4 top-16 z-[5] rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 shadow-lg">
            {units.length} {units.length === 1 ? "unidade simulada" : "unidades simuladas"}
          </div>
        )}

        {!selection && !placingMode && (
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

        {selection && base && displayed && (
          <TerritoryBottomSheet
            base={base}
            displayed={displayed}
            unit={selectedUnit}
            onAddToUnit={(amount) => selectedUnit && handleAddToUnit(selectedUnit.id, amount)}
            onRemoveUnit={() => selectedUnit && handleRemoveUnit(selectedUnit.id)}
            onClose={handleClose}
          />
        )}
      </main>
    </div>
  );
}
