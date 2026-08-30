"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Visão Geral", short: "Geral" },
  { href: "/territorios", label: "Territórios", short: "Territórios" },
  { href: "/fila", label: "Fila de Vagas", short: "Fila" },
] as const;

export function Navbar() {
  const pathname = usePathname();

  return (
    <div className="shrink-0 px-3 pt-3 sm:px-4 sm:pt-4">
      <nav className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto rounded-full bg-blue-600 px-2 py-2 text-white shadow-sm">
        <Link
          href="/"
          className="shrink-0 px-2.5 py-1.5 text-sm font-bold tracking-tight sm:px-3"
        >
          <span className="hidden sm:inline">CRE Intelligence</span>
          <span className="sm:hidden">CRE</span>
        </Link>

        <ul className="flex shrink-0 items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`block whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3 ${
                    active
                      ? "bg-white/15 text-white"
                      : "text-blue-100 hover:text-white"
                  }`}
                >
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.short}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <span className="ml-auto hidden shrink-0 px-3 text-xs text-blue-100 md:block">
          Rio de Janeiro · SME
        </span>
      </nav>
    </div>
  );
}
