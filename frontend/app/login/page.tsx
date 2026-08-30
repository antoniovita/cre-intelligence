"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Brand } from "@/components/nav/Brand";

export default function LoginPage() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: validar credencial de verdade antes de liberar /admin.
    router.push("/admin");
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col sm:flex-row">
      <section className="relative hidden min-h-64 shrink-0 overflow-hidden sm:flex sm:min-h-0 sm:w-1/2 lg:w-3/5">
        <Image
          src="/WhatsApp-Image-2022-11-11-at-10.37.15.jpeg"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="(min-width: 640px) 50vw, 100vw"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-b from-slate-950/80 via-slate-950/55 to-slate-950/90"
        />

        <div className="relative z-10 flex flex-col justify-between p-8 lg:p-12">
          <Brand inverted />

          <div className="max-w-md">
            <h1 className="text-2xl font-bold tracking-tight text-white lg:text-3xl">
              Gestão de vagas para a{" "}
              <span className="text-blue-300">educação infantil</span>
            </h1>
            <p className="mt-3 text-sm text-blue-50/90 lg:text-base">
              Pressão de demanda por território, fila de vagas e simulação de
              cenários de oferta — tudo em um só painel.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center bg-blue-50/40 px-4 py-10 sm:w-1/2 sm:bg-white sm:px-10 lg:w-2/5 lg:px-16">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="text-xs font-medium text-slate-400 hover:text-slate-600"
          >
            ← Voltar
          </Link>

          <div className="mt-4 sm:hidden">
            <Brand />
          </div>

          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Painel de gestão
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Acesso restrito à equipe gestora da SME
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Usuário
              <div className="relative">
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  viewBox="0 0 256 256"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  <path
                    d="M128 128 A48 48 0 1 0 128 32 A48 48 0 1 0 128 128 M40 224 A88 88 0 0 1 216 224 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="16"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  type="text"
                  required
                  placeholder="seu.usuario"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              <div className="flex items-center justify-between">
                Senha
                <Link
                  href="/admin/em-construcao?tela=Recuperar senha"
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  viewBox="0 0 256 256"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  <rect x="48" y="112" width="160" height="104" rx="12" fill="none" stroke="currentColor" strokeWidth="16" />
                  <path d="M88 112 V72 A40 40 0 0 1 168 72 V112" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" />
                </svg>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-100"
              />
              Manter-me conectado
            </label>

            <button
              type="submit"
              className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Entrar
              <span aria-hidden="true">→</span>
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Problemas para acessar?{" "}
            <Link
              href="/admin/em-construcao?tela=Suporte"
              className="font-medium text-slate-500 hover:text-blue-700"
            >
              Fale com o suporte da SME
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
