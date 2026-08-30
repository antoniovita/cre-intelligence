"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brand } from "./Brand";
import { useFamilySession } from "@/lib/useFamilySession";

interface FamilySidebarItem {
  id: string;
  label: string;
  icon: string;
}

const NAV_FAMILY: FamilySidebarItem[] = [
  {
    id: "consultar",
    label: "Consultar inscrição",
    icon: "M116 40 A76 76 0 1 0 116 192 A76 76 0 1 0 116 40 M172 172 L224 224",
  },
  {
    id: "inscrever",
    label: "Inscrever criança",
    icon: "M128 112 A36 36 0 1 0 128 40 A36 36 0 1 0 128 112 M56 208 A76 76 0 0 1 176 187 M176 152 V216 M144 184 H208",
  },
];

interface FamilySidebarProps {
  active: string;
  onSelect: (id: string) => void;
}

function NavIcon({ path }: { path: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 256 256" aria-hidden="true" className="shrink-0">
      <path d={path} fill="currentColor" opacity="0.22" />
      <path d={path} fill="none" stroke="currentColor" strokeWidth="14" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Sidebar for the family-facing area — mirrors AdminSidebar's structure
 * (brand, section label, icon nav list, footer) so both areas share one
 * visual language, but drives tab state instead of routing.
 */
export function FamilySidebar({ active, onSelect }: FamilySidebarProps) {
  const { logout } = useFamilySession();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/");
  }

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
        Família
      </span>
      <nav className="flex flex-col gap-0.5 px-2">
        {NAV_FAMILY.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-blue-100 font-semibold text-blue-900"
                  : "text-slate-700 hover:bg-blue-50"
              }`}
            >
              <NavIcon path={item.icon} />
              <span className="min-w-0 flex-1 truncate text-left lg:inline">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2 border-t border-slate-100 px-4 pt-3">
        <button
          onClick={handleLogout}
          className="hidden text-left text-xs font-medium text-slate-400 hover:text-slate-600 lg:inline"
        >
          Sair
        </button>
        <button
          onClick={handleLogout}
          aria-label="Sair"
          className="flex justify-center text-slate-400 hover:text-slate-600 lg:hidden"
        >
          ⏻
        </button>
        <Link
          href="/"
          className="hidden text-xs font-medium text-slate-400 hover:text-slate-600 lg:inline"
        >
          ← Voltar ao início
        </Link>
        <Link
          href="/"
          aria-label="Voltar ao início"
          className="flex justify-center text-slate-400 hover:text-slate-600 lg:hidden"
        >
          ←
        </Link>
      </div>
    </aside>
  );
}
