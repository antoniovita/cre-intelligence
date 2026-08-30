"use client";

import { useEffect, useState } from "react";

interface Countdown {
  label: string;
  expired: boolean;
  urgent: boolean; // less than 24h remaining
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return "vencido";

  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h restantes`;
  if (hours > 0) return `${hours}h ${minutes}min restantes`;
  return `${minutes}min restantes`;
}

export function useCountdown(prazo: string): Countdown {
  const target = new Date(prazo).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const remaining = target - now;

  return {
    label: formatRemaining(remaining),
    expired: remaining <= 0,
    urgent: remaining > 0 && remaining < 24 * 60 * 60 * 1000,
  };
}
