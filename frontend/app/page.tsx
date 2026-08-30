"use client";

import { useMemo, useState } from "react";
import TerritoryMap from "@/components/map/TerritoryMap";
import TerritoryDetail from "@/components/map/TerritoryDetail";
import Simulator from "@/components/map/Simulator";
import { simulateAddedSupply } from "@/lib/pressure";
import type { Territory } from "@/lib/types";

export default function Home() {
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
    <div className="relative flex flex-1 flex-col">
      <div className="h-screen w-full">
        <TerritoryMap onSelectTerritory={handleSelect} overrideTerritory={displayed} />
      </div>
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
