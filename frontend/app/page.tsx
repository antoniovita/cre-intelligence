import { VacancyList } from "@/components/vacancy/VacancyList";
import { HeadlineStats } from "@/components/dashboard/HeadlineStats";
import { PageContainer } from "@/components/nav/PageContainer";
import { MapPanel } from "@/components/map/MapPanel";

export default function Home() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-blue-50/40">
      <PageContainer className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 lg:overflow-visible">
        <div className="border-b border-slate-200 pb-4">
          <HeadlineStats />
        </div>

        <main className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr] lg:overflow-hidden">
          <MapPanel className="min-h-80 lg:min-h-0" />

          <section
            aria-label="Vagas em aberto"
            className="flex min-h-0 flex-col gap-3 lg:h-full"
          >
            <h2 className="shrink-0 text-sm font-medium uppercase tracking-wide text-slate-400">
              Vagas em aberto
            </h2>
            <div className="min-h-0 flex-1 lg:overflow-y-auto lg:pr-1 lg:pb-2">
              <VacancyList layout="single" />
            </div>
          </section>
        </main>
      </PageContainer>
    </div>
  );
}
