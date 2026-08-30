import type { NextInQueue as NextInQueueType } from "@/lib/types";

interface NextInQueueProps {
  data: NextInQueueType;
}

export function NextInQueue({ data }: NextInQueueProps) {
  const resumo = Object.entries(data.resposta_socioeconomica_resumo ?? {});
  const eligible = data.elegibilidade === "ok";

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Próxima da fila
        </span>
        <span
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
            eligible ? "text-emerald-600" : "text-red-600"
          }`}
        >
          <span aria-hidden="true">{eligible ? "✓" : "✕"}</span>
          {eligible ? "elegível" : data.elegibilidade}
        </span>
      </div>

      <div className="mt-1.5 flex items-baseline justify-between gap-2">
        <span className="font-mono text-sm text-slate-900">
          {data.crianca_id}
        </span>
        <span className="text-sm text-slate-500">
          score{" "}
          <span className="font-semibold tabular-nums text-slate-900">
            {data.prioridade_score}
          </span>
        </span>
      </div>

      {resumo.length > 0 && (
        <dl className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
          {resumo.map(([key, value]) => (
            <div key={key} className="flex gap-1">
              <dt className="capitalize">{key}:</dt>
              <dd className="text-slate-500">{String(value)}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
