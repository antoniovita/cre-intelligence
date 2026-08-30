import type { VacancyQueueItem } from "@/lib/types";
import { StatTile } from "../ui/StatTile";

interface VacancyQueueStatsProps {
  items: VacancyQueueItem[];
}

export function VacancyQueueStats({ items }: VacancyQueueStatsProps) {
  const vencendo = items.filter((q) => q.status === "vencendo").length;
  const aguardando = items.filter((q) => q.status === "aguardando_confirmacao").length;
  const confirmada = items.filter((q) => q.status === "confirmada").length;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatTile label="Total de vagas" value={String(items.length)} hint="na fila de confirmação" />
      <StatTile
        label="Vencendo"
        value={String(vencendo)}
        hint="prazo expira em breve"
        accent={vencendo > 0 ? "#dc2626" : undefined}
      />
      <StatTile
        label="Aguardando confirmação"
        value={String(aguardando)}
        hint="dentro do prazo"
        accent={aguardando > 0 ? "#b45309" : undefined}
      />
      <StatTile label="Confirmadas" value={String(confirmada)} hint="matrícula garantida" accent="#059669" />
    </div>
  );
}
