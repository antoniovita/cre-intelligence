import { TerritoryTable } from "@/components/dashboard/TerritoryTable";
import { PageContainer } from "@/components/nav/PageContainer";

export default function TerritoriosPage() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-blue-50/40">
      <PageContainer className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 lg:overflow-visible">
        <main className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr] lg:overflow-hidden">
          <section
            aria-label="Mapa de territórios"
            className="flex min-h-80 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-sm text-slate-400 lg:min-h-0"
          >
            Mapa de territórios (em desenvolvimento)
          </section>

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
