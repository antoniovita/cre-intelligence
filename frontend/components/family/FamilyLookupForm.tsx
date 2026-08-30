"use client";

import { useState } from "react";
import { useFamilyLookup, type FamilyOffer } from "@/lib/useFamilyLookup";
import { useCountdown } from "@/components/vacancy/useCountdown";

type Decision = "confirmed" | "declined" | null;

export function FamilyLookupForm() {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [decision, setDecision] = useState<Decision>(null);

  const result = useFamilyLookup(submitted);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDecision(null);
    setSubmitted(input.trim());
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite o código da inscrição (ex.: aluno_0056777)"
          className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Consultar
        </button>
      </form>

      {result.state === "loading" && (
        <p className="text-sm text-slate-400">Consultando…</p>
      )}

      {result.state === "not-found" && (
        <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
          Não encontramos nenhuma vaga em oferta para o código{" "}
          <span className="font-mono text-slate-700">{submitted}</span>. Isso
          pode significar que a inscrição ainda está na lista de espera sem
          vaga oferecida no momento.
        </div>
      )}

      {result.state === "error" && (
        <p className="flex items-center gap-1.5 text-sm text-red-600">
          <span aria-hidden="true">✕</span>
          Erro ao consultar: {result.message}
        </p>
      )}

      {result.state === "found" && (
        <FamilyOfferCard
          offer={result.offer}
          decision={decision}
          onConfirm={() => setDecision("confirmed")}
          onDecline={() => setDecision("declined")}
        />
      )}
    </div>
  );
}

function FamilyOfferCard({
  offer,
  decision,
  onConfirm,
  onDecline,
}: {
  offer: FamilyOffer;
  decision: Decision;
  onConfirm: () => void;
  onDecline: () => void;
}) {
  const countdown = useCountdown(offer.prazo);

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
        Vaga oferecida
      </p>
      <h2 className="mt-1 text-lg font-semibold text-slate-900">
        {offer.unidade}
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Código da inscrição:{" "}
        <span className="font-mono text-slate-700">{offer.crianca_id}</span>
      </p>

      <p
        className={`mt-3 text-sm ${
          countdown.expired
            ? "font-medium text-red-600"
            : countdown.urgent
              ? "font-medium text-amber-600"
              : "text-slate-600"
        }`}
      >
        ⏱ Prazo para confirmar: {countdown.label}
      </p>

      {decision === null && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={onConfirm}
            className="flex-1 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            ✓ Confirmar vaga
          </button>
          <button
            onClick={onDecline}
            className="flex-1 rounded-full border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Recusar vaga
          </button>
        </div>
      )}

      {decision === "confirmed" && (
        <p className="mt-4 flex items-center gap-1.5 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
          <span aria-hidden="true">✓</span>
          Vaga confirmada! A unidade foi notificada.
        </p>
      )}

      {decision === "declined" && (
        <p className="mt-4 flex items-center gap-1.5 rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-600">
          Vaga recusada. A próxima família da fila será chamada.
        </p>
      )}
    </div>
  );
}
