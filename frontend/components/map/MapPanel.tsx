"use client";

import { useMemo, useState } from "react";
import TerritoryMap from "./TerritoryMap";
import TerritoryDetail from "./TerritoryDetail";
import Simulator from "./Simulator";
import { simulateAddedSupply } from "@/lib/pressure";
import type { Territory } from "@/lib/types";

interface MapPanelProps {
  className?: string;
}

/**
 * Shared map + detail + simulator experience. Used both as a compact
 * preview (Visão Geral) and full-screen (Territórios) — the parent
 * controls size via `className`, this component just fills it.
 */
export function MapPanel({ className = "" }: MapPanelProps) {
  const [selected, setSelected] = useState<Territory | null>(null);
  const [addedSupply, setAddedSupply] = useState(0);

  const displayed = useMemo(() => {
    if (!selected) return null;
    return addedSupply > 0 ? simulateAddedSupply(selected, addedSupply) : selected;
  }, [selected, addedSupply]);

  function handleSelect(territory: Territory) {
    setSelected(territory);
    setAddedSupply(0);
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-200 ${className}`}>
      <TerritoryMap onSelectTerritory={handleSelect} overrideTerritory={displayed} />
      <TerritoryDetail
        territory={displayed}
        onClose={() => {
          setSelected(null);
          setAddedSupply(0);
        }}
      />
      <Simulator
        territory={selected}
        addedSupply={addedSupply}
        onAdd={(amount) => setAddedSupply((prev) => prev + amount)}
        onReset={() => setAddedSupply(0)}
      />
    </div>
  );
}
