import { VacancyList } from "@/components/vacancy/VacancyList";
import { PageContainer } from "@/components/nav/PageContainer";

export default function FilaPage() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-blue-50/40">
      <main className="min-h-0 flex-1 overflow-y-auto">
        <PageContainer className="px-4 py-4 sm:px-6">
          <h1 className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Fila de Vagas
          </h1>
          <div className="mt-3">
            <VacancyList />
          </div>
        </PageContainer>
      </main>
    </div>
  );
}
