"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function EmConstrucaoContent() {
  const params = useSearchParams();
  const tela = params.get("tela") ?? "Esta tela";

  return (
    <div className="flex max-w-sm flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <span className="text-2xl" aria-hidden="true">🚧</span>
      <h1 className="text-base font-semibold text-slate-900">{tela} em construção</h1>
      <p className="text-sm text-slate-500">
        Essa área ainda não foi implementada. Volte para o Mapa de pressão ou a Fila de vagas
        pelo menu ao lado.
      </p>
    </div>
  );
}

export default function EmConstrucaoPage() {
  return (
    <div className="flex h-full min-h-0 flex-1 items-center justify-center bg-blue-50/40 p-6">
      <Suspense fallback={null}>
        <EmConstrucaoContent />
      </Suspense>
    </div>
  );
}
