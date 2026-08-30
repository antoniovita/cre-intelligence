"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: validar credencial de verdade antes de liberar /admin.
    router.push("/admin");
  }

  return (
    <div className="flex h-full min-h-0 flex-1 items-center justify-center bg-blue-50/40 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Link
          href="/"
          className="text-xs font-medium text-slate-400 hover:text-slate-600"
        >
          ← Voltar
        </Link>

        <h1 className="mt-3 text-lg font-bold tracking-tight text-blue-700">
          CRE Intelligence
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Acesso restrito à equipe gestora da SME
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Usuário
            <input
              type="text"
              required
              placeholder="seu.usuario"
              className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Senha
            <input
              type="password"
              required
              placeholder="••••••••"
              className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <button
            type="submit"
            className="mt-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
