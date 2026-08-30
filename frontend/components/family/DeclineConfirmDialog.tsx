"use client";

import { useEffect, useRef } from "react";

interface DeclineConfirmDialogProps {
  unidade: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Recusar libera a vaga para a próxima família da fila — é irreversível e um
 * clique acidental custa a vaga. Este passo intermediário existe para tornar
 * essa consequência explícita antes da ação.
 */
export function DeclineConfirmDialog({
  unidade,
  onConfirm,
  onCancel,
}: DeclineConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    cancelRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        onClick={onCancel}
        className="absolute inset-0 bg-slate-900/50"
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="decline-title"
        aria-describedby="decline-desc"
        className="relative w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
            <WarnIcon />
          </div>
          <div className="min-w-0">
            <h2 id="decline-title" className="text-base font-semibold text-slate-900">
              Recusar esta vaga?
            </h2>
            <p id="decline-desc" className="mt-1.5 text-sm text-slate-600">
              A vaga em <span className="font-medium text-slate-900">{unidade}</span>{" "}
              será liberada para a próxima família da fila.{" "}
              <span className="font-medium">Não é possível desfazer</span> — sua
              criança voltará a aguardar uma nova oferta.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
          >
            Sim, recusar vaga
          </button>
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}

function WarnIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 256 256" aria-hidden="true">
      <path
        d="M128 32 L232 216 L24 216 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="18"
        strokeLinejoin="round"
      />
      <path d="M128 100 V152" fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
      <circle cx="128" cy="184" r="9" fill="currentColor" />
    </svg>
  );
}
