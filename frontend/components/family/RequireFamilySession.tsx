"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFamilySession } from "@/lib/useFamilySession";

/**
 * Gates /consulta (both tabs) behind the family login — without this,
 * anyone could open the lookup/enroll screens without going through
 * /login?tipo=familia first. Redirects when there's no session; renders
 * nothing while redirecting so the protected content never flashes.
 */
export function RequireFamilySession({ children }: { children: React.ReactNode }) {
  const { session } = useFamilySession();
  const router = useRouter();

  useEffect(() => {
    if (!session) router.replace("/login?tipo=familia");
  }, [session, router]);

  if (!session) return null;

  return <>{children}</>;
}
