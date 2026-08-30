"use client";

import { useJsonData } from "@/lib/useJsonData";
import type { VacancyQueueItem } from "@/lib/types";
import { VacancyList } from "@/components/vacancy/VacancyList";
import { VacancyQueueStats } from "@/components/vacancy/VacancyQueueStats";
import { PageContainer } from "@/components/nav/PageContainer";

export default function FilaPage() {
  const { data } = useJsonData<VacancyQueueItem[]>("/data/queue.json");

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-blue-50/40">
      <main className="min-h-0 flex-1 overflow-y-auto">
        <PageContainer className="px-4 py-4 sm:px-6">
          <h1 className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Fila de Vagas
          </h1>

          <div className="mt-3">
            {data ? (
              <VacancyQueueStats items={data} />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-18.5 animate-pulse rounded-xl border border-slate-200 bg-white" />
                ))}
              </div>
            )}
          </div>

          <div className="mt-5">
            <VacancyList showControls />
          </div>
        </PageContainer>
      </main>
    </div>
  );
}
