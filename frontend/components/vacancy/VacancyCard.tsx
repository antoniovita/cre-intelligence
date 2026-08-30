"use client";

import { useState } from "react";
import type { VacancyQueueItem, VacancyStatus } from "@/lib/types";
import { NextInQueue } from "./NextInQueue";
import { useCountdown } from "./useCountdown";

const STATUS_CONFIG: Record<
  VacancyStatus,
  { label: string; icon: string; badge: string }
> = {
  aguardando_confirmacao: {
    label: "Aguardando confirmação",
    icon: "●",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
  },
  confirmada: {
    label: "Confirmada",
    icon: "✓",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  vencendo: {
    label: "Vencendo",
    icon: "▲",
    badge: "border-red-200 bg-red-50 text-red-700",
  },
};

interface VacancyCardProps {
  item: VacancyQueueItem;
}

export function VacancyCard({ item }: VacancyCardProps) {
  const countdown = useCountdown(item.prazo);
  const [reminderSent, setReminderSent] = useState(false);
  const status = STATUS_CONFIG[item.status];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{item.unidade}</h3>
          <p className="mt-0.5 font-mono text-xs text-slate-400">
            {item.vaga_id} · {item.crianca_atual}
          </p>
        </div>
        <span
          className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${status.badge}`}
        >
          <span aria-hidden="true">{status.icon}</span>
          {status.label}
        </span>
      </div>

      <p
        className={`mt-2 text-sm ${
          countdown.expired
            ? "font-medium text-red-600"
            : countdown.urgent
              ? "font-medium text-amber-600"
              : "text-slate-500"
        }`}
      >
        ⏱ {countdown.label}
      </p>

      <div className="mt-3">
        <NextInQueue data={item.proxima_da_fila} />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          disabled={reminderSent}
          onClick={() => setReminderSent(true)}
          className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-default disabled:opacity-60"
        >
          {reminderSent ? "✓ Lembrete registrado" : "Enviar lembrete"}
        </button>
      </div>
    </div>
  );
}
