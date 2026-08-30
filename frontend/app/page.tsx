import Link from "next/link";
import Image from "next/image";
import { Brand } from "@/components/nav/Brand";

export default function LandingPage() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto bg-white">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3.5 backdrop-blur-sm sm:px-8">
        <Brand />
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/login"
            className="rounded-full px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-900 sm:px-4"
          >
            Painel de gestão
          </Link>
          <Link
            href="/login?tipo=familia"
            className="rounded-full bg-blue-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:px-4"
          >
            Consultar inscrição
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative flex min-h-104 items-center overflow-hidden border-b border-slate-200 px-4 py-16 sm:min-h-128 sm:px-8 sm:py-24">
          <Image
            src="/photo-1483729558449-99ef09a8c325.avif"
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-b from-slate-950/80 via-slate-950/55 to-slate-950/90"
          />

          <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Inteligência de vagas para a{" "}
              <span className="text-blue-300">educação infantil</span>
            </h1>

            <p className="mt-4 max-w-xl text-base text-blue-50/90 sm:text-lg">
              Acompanhe a pressão de demanda por território, gerencie a fila
              de vagas e confirme matrículas — tudo em um só lugar, para a
              gestão e para as famílias.
            </p>
          </div>
        </section>

        {/* Entry points */}
        <section className="px-4 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                Quem está acessando?
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Escolha a área correspondente ao seu perfil
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Link
                href="/login"
                className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg sm:p-8"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <svg width="24" height="24" viewBox="0 0 256 256" aria-hidden="true">
                    <path
                      d="M40 72 L104 48 L152 72 L216 48 L216 184 L152 208 L104 184 L40 208 Z"
                      fill="currentColor"
                      opacity="0.25"
                    />
                    <path
                      d="M40 72 L104 48 L152 72 L216 48 L216 184 L152 208 L104 184 L40 208 Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="14"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <span className="w-fit rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-blue-700">
                    Equipe gestora
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    Painel de gestão
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Pressão por território, fila de vagas e simulação de
                    cenários de oferta.
                  </p>
                </div>
                <span className="mt-auto flex items-center gap-1 text-sm font-medium text-blue-700">
                  Entrar
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </Link>

              <Link
                href="/login?tipo=familia"
                className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg sm:p-8"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <svg width="24" height="24" viewBox="0 0 256 256" aria-hidden="true">
                    <path
                      d="M128 112 A36 36 0 1 0 128 40 A36 36 0 1 0 128 112 M56 208 A76 76 0 0 1 200 208 Z"
                      fill="currentColor"
                      opacity="0.25"
                    />
                    <path
                      d="M128 112 A36 36 0 1 0 128 40 A36 36 0 1 0 128 112 M56 208 A76 76 0 0 1 200 208 Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="14"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <span className="w-fit rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-blue-700">
                    Famílias
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    Consultar inscrição
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Veja o status da matrícula da sua criança usando o
                    código da inscrição.
                  </p>
                </div>
                <span className="mt-auto flex items-center gap-1 text-sm font-medium text-blue-700">
                  Consultar
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
