"use client";

import { useState } from "react";
import { TerritoryTable } from "@/components/dashboard/TerritoryTable";
import { RegionRanking } from "@/components/dashboard/RegionRanking";
import { PressureDistributionChart } from "@/components/dashboard/PressureDistributionChart";
import { PageContainer } from "@/components/nav/PageContainer";
import { MapPanel } from "@/components/map/MapPanel";

type Level = "microarea" | "cre";

export default function TerritoriosPage() {
  const [level, setLevel] = useState<Level>("microarea");

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-blue-50/40">
      <main className="min-h-0 flex-1 overflow-y-auto">
        <PageContainer className="gap-4 px-4 py-4 sm:px-6">
          <MapPanel className="h-[70vh] min-h-125" />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr]">
            <PressureDistributionChart />

            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium uppercase tracking-wide text-slate-400">
                  {level === "microarea" ? "Todas as microáreas" : "Ranking por CRE"}
                </h2>
                <div className="flex rounded-full border border-slate-200 bg-white p-0.5 text-xs font-medium">
                  <button
                    onClick={() => setLevel("microarea")}
                    className={`rounded-full px-3 py-1 transition-colors ${
                      level === "microarea"
                        ? "bg-blue-600 text-white"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Microárea
                  </button>
                  <button
                    onClick={() => setLevel("cre")}
                    className={`rounded-full px-3 py-1 transition-colors ${
                      level === "cre"
                        ? "bg-blue-600 text-white"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    CRE
                  </button>
                </div>
              </div>
              {level === "microarea" ? <TerritoryTable /> : <RegionRanking />}
            </section>
          </div>
        </PageContainer>
      </main>
    </div>
  );
}
