"use client";

import { useCallback, useState } from "react";

const STORAGE_KEY = "offer_decisions";

export type Decision = "confirmed" | "declined";

type DecisionMap = Record<string, Decision>;

function readStored(): DecisionMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DecisionMap) : {};
  } catch {
    return {}; // ignore malformed/unavailable storage
  }
}

/**
 * Keeps confirm/decline per vaga_id so a refresh doesn't silently undo what
 * the family already answered — without this the decision lives in a
 * component's useState and disappears on reload, which would read as "my
 * confirmation was lost".
 *
 * TODO(backend): this is local-only. The real decision has to be persisted
 * server-side (it releases the vaga to the next family), and this map should
 * become a read of that state, not the source of truth.
 */
export function useOfferDecision(vagaId: string | null) {
  const [decisions, setDecisions] = useState<DecisionMap>(readStored);

  const decide = useCallback(
    (id: string, decision: Decision) => {
      setDecisions((prev) => {
        const next = { ...prev, [id]: decision };
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // storage unavailable — decision still holds for this render
        }
        return next;
      });
    },
    []
  );

  return {
    decision: vagaId ? (decisions[vagaId] ?? null) : null,
    decide,
  };
}
