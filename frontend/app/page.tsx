"use client";

import { useState } from "react";
import TerritoryMap from "@/components/map/TerritoryMap";
import TerritoryDetail from "@/components/map/TerritoryDetail";
import type { Territory } from "@/lib/types";

export default function Home() {
  const [selected, setSelected] = useState<Territory | null>(null);

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="h-screen w-full">
        <TerritoryMap onSelectTerritory={setSelected} />
      </div>
      <TerritoryDetail territory={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
