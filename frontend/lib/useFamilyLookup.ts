"use client";

import { useMemo } from "react";
import { useJsonData } from "./useJsonData";
import type { VacancyQueueItem } from "./types";

export interface FamilyOffer {
  vaga_id: string;
  unidade: string;
  status: VacancyQueueItem["status"];
  prazo: string;
  crianca_id: string;
  elegibilidade: string;
  prioridade_score: number;
}

export type FamilyLookupResult =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "error"; message: string }
  | { state: "not-found" }
  | { state: "found"; offer: FamilyOffer };

/**
 * Looks up whether a given `crianca_id` is the next-in-line candidate
 * for an open vacancy (the only case where a family has something to
 * act on — being "next" means a vaga is being held for them).
 */
export function useFamilyLookup(criancaId: string | null): FamilyLookupResult {
  const { data, loading, error } = useJsonData<VacancyQueueItem[]>(
    "/data/queue.json"
  );

  return useMemo(() => {
    if (!criancaId) return { state: "idle" };
    if (loading) return { state: "loading" };
    if (error) return { state: "error", message: error };

    const normalized = criancaId.trim().toLowerCase();
    const match = (data ?? []).find(
      (item) => item.proxima_da_fila.crianca_id.toLowerCase() === normalized
    );

    if (!match) return { state: "not-found" };

    return {
      state: "found",
      offer: {
        vaga_id: match.vaga_id,
        unidade: match.unidade,
        status: match.status,
        prazo: match.prazo,
        crianca_id: match.proxima_da_fila.crianca_id,
        elegibilidade: match.proxima_da_fila.elegibilidade,
        prioridade_score: match.proxima_da_fila.prioridade_score,
      },
    };
  }, [criancaId, data, loading, error]);
}
