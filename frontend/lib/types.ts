export interface Territory {
  id: string;
  name: string;
  demand: number;
  supply: number;
  pressure: number; // demand / supply
  latitude: number;
  longitude: number;
}

export type VacancyStatus =
  | "aguardando_confirmacao"
  | "confirmada"
  | "vencendo";

export interface NextInQueue {
  crianca_id: string;
  elegibilidade: string;
  prioridade_score: number;
  resposta_socioeconomica_resumo: Record<string, unknown>;
}

export interface VacancyQueueItem {
  vaga_id: string;
  unidade: string;
  /** Coordenadas reais da unidade; null quando a fonte não tem geocodificação. */
  unidade_latitude: number | null;
  unidade_longitude: number | null;
  unidade_endereco: string | null;
  crianca_atual: string;
  status: VacancyStatus;
  prazo: string; // ISO timestamp
  proxima_da_fila: NextInQueue;
}
