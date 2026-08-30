import Link from "next/link";
import { FamilyLookupForm } from "@/components/family/FamilyLookupForm";
import { FamilyMap } from "@/components/family/FamilyMap";

export default function ConsultaPage() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-blue-50/40">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="text-xs font-medium text-slate-400 hover:text-slate-600"
        >
          ← Voltar
        </Link>
        <h1 className="mt-1 text-base font-bold tracking-tight text-blue-700">
          CRE Intelligence
        </h1>
        <p className="text-sm text-slate-500">
          Consulte o status da inscrição da sua criança
        </p>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <FamilyMap />
          <FamilyLookupForm />
        </div>
      </main>
    </div>
  );
}
