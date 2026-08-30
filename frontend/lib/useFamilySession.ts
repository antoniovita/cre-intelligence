"use client";

import { useCallback, useState } from "react";

const STORAGE_KEY = "family_session";

export interface FamilySession {
  responsavel_cpf: string;
}

/**
 * Mocked family session — no backend yet, so this only proves "this
 * browser tab went through the family login screen". It exists so that:
 *
 * 1. /consulta (both "consultar" and "inscrever" tabs) requires a login
 *    before showing anything, instead of being open to anyone who visits
 *    the URL.
 * 2. Confirming/declining a vacancy offer can never be driven purely by
 *    knowing someone else's crianca_id (see FamilyLookupForm): the
 *    confirm/decline actions are gated on being logged in, not on the
 *    lookup input alone.
 *
 * The mock data has no responsável↔crianca_id link to check against, so
 * this can't yet verify that the logged-in family actually owns the
 * crianca_id being looked up — only that *some* family authenticated.
 *
 * sessionStorage (not localStorage) on purpose: the "login" shouldn't
 * silently persist across browser restarts on a shared/public device.
 *
 * TODO(backend): replace with a real session (httpOnly cookie + server
 * validation of the family credential, checked against the actual
 * responsável↔crianca_id link) once an API exists.
 */
function readStoredSession(): FamilySession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FamilySession) : null;
  } catch {
    return null; // ignore malformed/unavailable storage
  }
}

export function useFamilySession() {
  const [session, setSession] = useState<FamilySession | null>(readStoredSession);

  const login = useCallback((cpf: string) => {
    const next: FamilySession = { responsavel_cpf: cpf.trim() };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  return { session, login, logout };
}
