import { TerritoryTable } from "@/components/dashboard/TerritoryTable";
import { PageContainer } from "@/components/nav/PageContainer";
import { MapPanel } from "@/components/map/MapPanel";

export default function TerritoriosPage() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-blue-50/40">
      <PageContainer className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 lg:overflow-visible">
        <main className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr] lg:overflow-hidden">
          <MapPanel className="min-h-100 lg:min-h-0" />

          <section className="flex min-h-0 flex-col gap-3 lg:h-full lg:overflow-hidden">
            <h2 className="shrink-0 text-sm font-medium uppercase tracking-wide text-slate-400">
              Todas as microáreas
            </h2>
            <div className="min-h-0 flex-1 lg:overflow-y-auto">
              <TerritoryTable />
            </div>
          </section>
        </main>
      </PageContainer>
    </div>
  );
}
