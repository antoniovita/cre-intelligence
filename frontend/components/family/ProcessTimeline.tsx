interface ProcessTimelineProps {
  /** Etapa atual (0-indexed). Etapas anteriores aparecem como concluídas. */
  current: number;
  /** Marca a etapa atual como encerrada sem sucesso (vaga recusada). */
  declined?: boolean;
}

const STEPS = [
  { label: "Inscrita", hint: "Inscrição registrada" },
  { label: "Na fila", hint: "Aguardando vaga" },
  { label: "Vaga oferecida", hint: "Precisa responder" },
  { label: "Confirmada", hint: "Vaga aceita" },
  { label: "Matriculada", hint: "Na unidade" },
];

/**
 * Mostra onde a criança está no processo. Existe principalmente para o caso
 * mais comum — a família que ainda NÃO tem vaga oferecida e, sem isso, veria
 * apenas um "não encontramos nada" sem saber o que está acontecendo.
 */
export function ProcessTimeline({ current, declined = false }: ProcessTimelineProps) {
  return (
    <ol className="flex items-start gap-1">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const isDeclinedStep = active && declined;

        return (
          <li key={step.label} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-center gap-1">
              <span
                aria-hidden="true"
                className={`h-0.5 flex-1 rounded ${
                  i === 0 ? "bg-transparent" : done || active ? "bg-blue-500" : "bg-slate-200"
                }`}
              />
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold ${
                  isDeclinedStep
                    ? "bg-slate-300 text-slate-600"
                    : done
                      ? "bg-blue-500 text-white"
                      : active
                        ? "bg-blue-100 text-blue-700 ring-2 ring-blue-500"
                        : "bg-slate-100 text-slate-400"
                }`}
              >
                {done ? <CheckIcon /> : isDeclinedStep ? "×" : i + 1}
              </span>
              <span
                aria-hidden="true"
                className={`h-0.5 flex-1 rounded ${
                  i === STEPS.length - 1
                    ? "bg-transparent"
                    : done
                      ? "bg-blue-500"
                      : "bg-slate-200"
                }`}
              />
            </div>
            <div className="text-center">
              <p
                className={`text-[11px] font-medium leading-tight ${
                  done || active ? "text-slate-900" : "text-slate-400"
                }`}
              >
                {step.label}
              </p>
              {active && (
                <p className="mt-0.5 hidden text-[10px] leading-tight text-slate-500 sm:block">
                  {isDeclinedStep ? "Vaga recusada" : step.hint}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 256 256" aria-hidden="true">
      <path
        d="M40 136 L96 192 L216 72"
        fill="none"
        stroke="currentColor"
        strokeWidth="28"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
