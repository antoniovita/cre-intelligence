"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "./Brand";

interface SidebarItem {
  href: string;
  label: string;
  count?: string;
  icon: string;
}

const NAV_MAIN: SidebarItem[] = [
  {
    href: "/admin",
    label: "Mapa de pressão",
    count: "96",
    icon: "M40 72 L104 48 L152 72 L216 48 L216 184 L152 208 L104 184 L40 208 Z",
  },
  {
    href: "/admin/fila",
    label: "Fila de vagas",
    count: "20",
    icon: "M48 64 H208 M48 128 H208 M48 192 H144",
  },
  {
    href: "/admin/em-construcao?tela=Relatórios",
    label: "Relatórios",
    icon: "M56 200 V96 M112 200 V56 M168 200 V128 M224 200 V80",
  },
  {
    href: "/admin/em-construcao?tela=Alertas",
    label: "Alertas",
    icon: "M128 32 A96 96 0 1 0 128 224 A96 96 0 1 0 128 32 M128 80 V136 M128 168 V176",
  },
];

const NAV_OTHER: SidebarItem[] = [
  {
    href: "/admin/em-construcao?tela=Unidades",
    label: "Unidades",
    icon: "M48 208 V104 L128 48 L208 104 V208 Z",
  },
  {
    href: "/admin/em-construcao?tela=Equipe",
    label: "Equipe",
    icon: "M128 112 A36 36 0 1 0 128 40 A36 36 0 1 0 128 112 M56 208 A76 76 0 0 1 200 208 Z",
  },
  {
    href: "/admin/em-construcao?tela=Configurações",
    label: "Configurações",
    icon: "M128 88 A40 40 0 1 0 128 168 A40 40 0 1 0 128 88 M128 24 V56 M128 200 V232 M24 128 H56 M200 128 H232",
  },
];

function NavIcon({ path }: { path: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 256 256" aria-hidden="true" className="shrink-0">
      <path d={path} fill="currentColor" opacity="0.22" />
      <path d={path} fill="none" stroke="currentColor" strokeWidth="14" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function NavList({ items, pathname }: { items: SidebarItem[]; pathname: string }) {
  return (
    <nav className="flex flex-col gap-0.5 px-2">
      {items.map((item) => {
        const [base] = item.href.split("?");
        const active = base === "/admin" ? pathname === "/admin" : pathname === base;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors ${
              active
                ? "bg-blue-100 font-semibold text-blue-900"
                : "text-slate-700 hover:bg-blue-50"
            }`}
          >
            <NavIcon path={item.icon} />
            <span className="min-w-0 flex-1 truncate lg:inline">{item.label}</span>
            {item.count && (
              <span className={`text-xs tabular-nums ${active ? "text-blue-700" : "text-slate-400"}`}>
                {item.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-16 shrink-0 flex-col border-r border-slate-200 bg-white py-4 lg:w-60">
      <div className="mb-2 hidden flex-col gap-0.5 px-4 lg:flex">
        <Brand />
      </div>
      <div className="mb-2 flex justify-center px-4 lg:hidden">
        <svg width="18" height="18" viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
          <circle cx="16" cy="16" r="15" fill="#dbeafe" />
          <circle cx="16" cy="16" r="6.5" fill="#2563eb" />
          <circle cx="16" cy="16" r="2.4" fill="#ffffff" />
        </svg>
      </div>

      <span className="hidden px-4 py-2 text-[9.5px] uppercase tracking-wide text-slate-400 lg:block">
        Painel
      </span>
      <NavList items={NAV_MAIN} pathname={pathname} />

      <span className="hidden px-4 py-2 pt-3 text-[9.5px] uppercase tracking-wide text-slate-400 lg:block">
        Gestão
      </span>
      <NavList items={NAV_OTHER} pathname={pathname} />

      <div className="mt-auto flex items-center justify-center gap-2.5 border-t border-slate-100 px-4 pt-3 lg:justify-start">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-700">
          AV
        </span>
        <div className="hidden lg:block">
          <div className="text-[13px] font-semibold leading-tight text-slate-900">Ana Vieira</div>
          <div className="text-[11px] text-slate-400">Planejamento · SME</div>
        </div>
      </div>
    </aside>
  );
}
