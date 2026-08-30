"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Brand } from "@/components/nav/Brand";
import { useFamilySession } from "@/lib/useFamilySession";

type Profile = "gestor" | "familia";

const HERO_IMAGE: Record<Profile, string> = {
  // Mesma imagem do hero da landing — alta resolução, aguenta o painel largo.
  gestor: "/photo-1483729558449-99ef09a8c325.avif",
  // Sala de creche: o que a família está de fato buscando.
  familia: "/WhatsApp-Image-2022-11-11-at-10.37.15.jpeg",
};

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: loginFamily } = useFamilySession();

  const [profile, setProfile] = useState<Profile>(
    searchParams.get("tipo") === "familia" ? "familia" : "gestor"
  );
  const [cpf, setCpf] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (profile === "gestor") {
      // TODO: validar credencial de verdade antes de liberar /admin.
      router.push("/admin");
      return;
    }
    // TODO(backend): validar a credencial contra a API antes de liberar
    // a sessão. Por ora, qualquer senha não vazia "autentica" — o que
    // importa é que a partir daqui a ação de confirmar/recusar deixa de
    // depender só de saber o código da inscrição.
    loginFamily(cpf);
    router.push("/consulta");
  }

  const isGestor = profile === "gestor";

  const hero = (
    <section className="relative hidden min-h-64 shrink-0 overflow-hidden sm:flex sm:min-h-0 sm:w-1/2 lg:w-3/5">
      {/* Ambas montadas e cruzando opacidade: troca sem flash de carregamento. */}
      {(Object.keys(HERO_IMAGE) as Profile[]).map((key) => (
        <Image
          key={key}
          src={HERO_IMAGE[key]}
          alt=""
          fill
          priority={profile === key}
          className={`object-cover transition-opacity duration-500 ease-out ${
            profile === key ? "opacity-100" : "opacity-0"
          }`}
          sizes="(min-width: 640px) 50vw, 100vw"
        />
      ))}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-b from-slate-950/80 via-slate-950/55 to-slate-950/90"
      />

      <div className="relative z-10 flex flex-col justify-between p-8 lg:p-12">
        <Brand inverted />

        <div key={profile} className="max-w-md animate-profile-swap">
          <h1 className="text-2xl font-bold tracking-tight text-white lg:text-3xl">
            {isGestor ? (
              <>
                Gestão de vagas para a{" "}
                <span className="text-blue-300">educação infantil</span>
              </>
            ) : (
              <>
                Acompanhe a vaga da sua{" "}
                <span className="text-blue-300">criança</span>
              </>
            )}
          </h1>
          <p className="mt-3 text-sm text-blue-50/90 lg:text-base">
            {isGestor
              ? "Pressão de demanda por território, fila de vagas e simulação de cenários de oferta — tudo em um só painel."
              : "Consulte uma vaga oferecida, confirme ou recuse a matrícula, ou inscreva sua criança na fila — tudo em um só lugar."}
          </p>
        </div>
      </div>
    </section>
  );

  const form = (
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

        <div key={profile} className="animate-profile-swap">
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            {isGestor ? "Painel de gestão" : "Acesso da família"}
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            {isGestor
              ? "Acesso restrito à equipe gestora da SME"
              : "Entre para consultar uma vaga oferecida ou inscrever uma criança"}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setProfile("gestor")}
            className={`rounded-md py-2 text-sm font-medium transition-colors ${
              isGestor
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Equipe gestora
          </button>
          <button
            type="button"
            onClick={() => setProfile("familia")}
            className={`rounded-md py-2 text-sm font-medium transition-colors ${
              !isGestor
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Família
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <div key={profile} className="animate-profile-swap">
            {isGestor ? (
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                Usuário
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="seu.usuario"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </label>
            ) : (
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                CPF do responsável
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </label>
            )}
          </div>

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
              <LockIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
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
  );

  // Gestor: formulário à esquerda, imagem à direita. Família: o inverso.
  // `order` (em vez de reordenar o JSX) mantém as mesmas instâncias no DOM,
  // então a troca de lado desliza em vez de remontar as seções.
  return (
    <div
      className={`flex h-full min-h-0 flex-1 flex-col sm:flex-row ${
        isGestor ? "sm:flex-row-reverse" : ""
      }`}
    >
      {hero}
      {form}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}

function UserIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 256 256"
      className={className}
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
  );
}

function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 256 256"
      className={className}
    >
      <rect x="48" y="112" width="160" height="104" rx="12" fill="none" stroke="currentColor" strokeWidth="16" />
      <path d="M88 112 V72 A40 40 0 0 1 168 72 V112" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" />
    </svg>
  );
}
