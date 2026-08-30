"use client";

import { useState } from "react";
import Link from "next/link";
import { useFamilyLookup, type FamilyOffer } from "@/lib/useFamilyLookup";
import { useCountdown } from "@/components/vacancy/useCountdown";
import { useFamilySession } from "@/lib/useFamilySession";

type Decision = "confirmed" | "declined" | null;

export function FamilyLookupForm() {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [decision, setDecision] = useState<Decision>(null);

  const result = useFamilyLookup(submitted);
  const { session } = useFamilySession();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDecision(null);
    setSubmitted(input.trim());
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <label
          htmlFor="crianca_id"
          className="text-sm font-medium text-slate-700"
        >
          Código da inscrição
        </label>
        <form
          onSubmit={handleSubmit}
          className="mt-2 flex flex-col gap-2 sm:flex-row"
        >
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="crianca_id"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ex.: aluno_0056777"
              className="input pl-10"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            Consultar
          </button>
        </form>
      </div>

      {result.state === "loading" && (
        <p className="text-sm text-slate-400">Consultando…</p>
      )}

      {result.state === "not-found" && (
        <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
          <InfoIcon className="mt-0.5 shrink-0 text-slate-400" />
          <p>
            Não encontramos nenhuma vaga em oferta para o código{" "}
            <span className="font-mono text-slate-700">{submitted}</span>.
            Isso pode significar que a inscrição ainda está na lista de
            espera, sem vaga oferecida no momento.
          </p>
        </div>
      )}

      {result.state === "error" && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <ErrorIcon className="shrink-0" />
          Erro ao consultar: {result.message}
        </div>
      )}

      {result.state === "found" && (
        <FamilyOfferCard
          offer={result.offer}
          decision={decision}
          canAct={session !== null}
          onConfirm={() => setDecision("confirmed")}
          onDecline={() => setDecision("declined")}
        />
      )}
    </div>
  );
}

const STATUS_LABEL: Record<FamilyOffer["status"], string> = {
  aguardando_confirmacao: "Aguardando confirmação",
  confirmada: "Confirmada",
  vencendo: "Prazo se esgotando",
};

function FamilyOfferCard({
  offer,
  decision,
  canAct,
  onConfirm,
  onDecline,
}: {
  offer: FamilyOffer;
  decision: Decision;
  /** Whether there's a logged-in family session. */
  canAct: boolean;
  onConfirm: () => void;
  onDecline: () => void;
}) {
  const countdown = useCountdown(offer.prazo);
  const isDecided = decision !== null;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-blue-50/60 px-5 py-3 sm:px-6">
        <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">
          Vaga oferecida
        </span>
        {!isDecided && (
          <StatusBadge status={offer.status} expired={countdown.expired} />
        )}
        {decision === "confirmed" && (
          <StatusPill tone="emerald" label="Confirmada" icon={<CheckIcon />} />
        )}
        {decision === "declined" && (
          <StatusPill tone="slate" label="Recusada" />
        )}
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-blue-100 text-blue-700">
            <PinIcon />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold leading-tight text-slate-900">
              {offer.unidade}
            </h2>
            {offer.bairro && (
              <p className="mt-0.5 text-sm text-slate-500">
                {offer.bairro} · Rio de Janeiro
              </p>
            )}
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Código da inscrição
            </dt>
            <dd className="mt-0.5 font-mono text-sm text-slate-700">
              {offer.crianca_id}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Prazo para confirmar
            </dt>
            <dd
              className={`mt-0.5 flex items-center gap-1.5 text-sm font-medium ${
                countdown.expired
                  ? "text-red-600"
                  : countdown.urgent
                    ? "text-amber-600"
                    : "text-slate-700"
              }`}
            >
              <ClockIcon className="shrink-0" />
              {countdown.label}
            </dd>
          </div>
        </dl>

        {decision === null && canAct && (
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button
              onClick={onConfirm}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              <CheckIcon />
              Confirmar vaga
            </button>
            <button
              onClick={onDecline}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Recusar vaga
            </button>
          </div>
        )}

        {decision === null && !canAct && (
          <div className="mt-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <InfoIcon className="mt-0.5 shrink-0 text-amber-500" />
            <p className="text-sm text-amber-800">
              Para confirmar ou recusar esta vaga, entre com a conta da
              família dona desta inscrição.{" "}
              <Link
                href="/login?tipo=familia"
                className="font-semibold underline underline-offset-2 hover:text-amber-900"
              >
                Fazer login da família
              </Link>
            </p>
          </div>
        )}

        {decision === "confirmed" && (
          <div className="mt-5 flex items-start gap-3 rounded-lg bg-emerald-50 px-4 py-3">
            <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckIcon />
            </div>
            <p className="text-sm text-emerald-800">
              <span className="font-semibold">Vaga confirmada!</span> A
              unidade foi notificada e sua criança está matriculada em{" "}
              <span className="font-semibold">{offer.unidade}</span>
              {offer.bairro && ` (${offer.bairro})`}.
            </p>
          </div>
        )}

        {decision === "declined" && (
          <div className="mt-5 rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-600">
            Vaga recusada. A próxima família da fila será chamada.
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  expired,
}: {
  status: FamilyOffer["status"];
  expired: boolean;
}) {
  if (expired) {
    return <StatusPill tone="red" label="Prazo vencido" />;
  }
  const tone =
    status === "confirmada"
      ? "emerald"
      : status === "vencendo"
        ? "amber"
        : "blue";
  return <StatusPill tone={tone} label={STATUS_LABEL[status]} />;
}

const TONE_CLASSES: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700",
  emerald: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  slate: "bg-slate-200 text-slate-600",
};

function StatusPill({
  tone,
  label,
  icon,
}: {
  tone: string;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {icon}
      {label}
    </span>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 256 256" aria-hidden="true" className={className}>
      <circle cx="116" cy="116" r="76" fill="none" stroke="currentColor" strokeWidth="16" />
      <path d="M172 172 L224 224" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 256 256" aria-hidden="true">
      <path
        d="M128 232 C128 232 200 164 200 104 A72 72 0 0 0 56 104 C56 164 128 232 128 232 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="14"
        strokeLinejoin="round"
      />
      <circle cx="128" cy="104" r="26" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="14" />
    </svg>
  );
}

function ClockIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 256 256" aria-hidden="true" className={className}>
      <circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" strokeWidth="16" />
      <path d="M128 72 V128 L172 152" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 256 256" aria-hidden="true">
      <path d="M40 136 L96 192 L216 72" fill="none" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 256 256" aria-hidden="true" className={className}>
      <circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" strokeWidth="16" />
      <path d="M128 116 V180" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" />
      <circle cx="128" cy="82" r="10" fill="currentColor" />
    </svg>
  );
}

function ErrorIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 256 256" aria-hidden="true" className={className}>
      <circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" strokeWidth="16" />
      <path d="M92 92 L164 164 M164 92 L92 164" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" />
    </svg>
  );
}
