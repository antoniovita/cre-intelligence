"use client";

import { useState } from "react";
import { FamilyLookupForm } from "@/components/family/FamilyLookupForm";
import { FamilyEnrollForm } from "@/components/family/FamilyEnrollForm";
import { RequireFamilySession } from "@/components/family/RequireFamilySession";
import { FamilySidebar } from "@/components/nav/FamilySidebar";
import { PageContainer } from "@/components/nav/PageContainer";

type Tab = "consultar" | "inscrever";

export default function ConsultaPage() {
  const [tab, setTab] = useState<Tab>("consultar");

  return (
    <RequireFamilySession>
      <div className="flex h-full min-h-0 flex-1 flex-col sm:flex-row">
        <FamilySidebar active={tab} onSelect={(id) => setTab(id as Tab)} />

        <main className="min-h-0 flex-1 overflow-y-auto bg-blue-50/40">
          <PageContainer className="px-4 py-6 sm:px-6">
            {tab === "consultar" ? (
              <div className="flex flex-col gap-6 pb-6">
                <FamilyLookupForm />
              </div>
            ) : (
              <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <FamilyEnrollForm />
              </div>
            )}
          </PageContainer>
        </main>
      </div>
    </RequireFamilySession>
  );
}
