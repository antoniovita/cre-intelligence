import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center bg-blue-50/40 px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-blue-700">
          CRE Intelligence
        </h1>
        <p className="mt-2 text-sm text-slate-500">Quem está acessando?</p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2">
        <Link
          href="/login"
          className="group relative flex h-80 flex-col justify-end overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-xl hover:ring-blue-300 sm:h-96"
        >
          <Image
            src="/caption.jpg"
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 640px) 50vw, 100vw"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-blue-950/90 via-blue-950/40 to-transparent" />

          <div className="relative flex flex-col gap-1.5 p-6 text-white">
            <span
              className="w-fit rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide backdrop-blur-sm"
              aria-hidden="true"
            >
              Equipe gestora
            </span>
            <h2 className="text-xl font-semibold">Painel de gestão</h2>
            <p className="text-sm text-blue-50/90">
              Pressão por território, fila de vagas e simulação de cenários de
              oferta.
            </p>
            <span className="mt-3 flex items-center gap-1 text-sm font-medium text-white">
              Entrar
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </div>
        </Link>

        <Link
          href="/consulta"
          className="group relative flex h-80 flex-col justify-end overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-xl hover:ring-blue-300 sm:h-96"
        >
          <Image
            src="/images-2.jpeg"
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 640px) 50vw, 100vw"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-blue-950/90 via-blue-950/40 to-transparent" />

          <div className="relative flex flex-col gap-1.5 p-6 text-white">
            <span
              className="w-fit rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide backdrop-blur-sm"
              aria-hidden="true"
            >
              Famílias
            </span>
            <h2 className="text-xl font-semibold">Consultar inscrição</h2>
            <p className="text-sm text-blue-50/90">
              Veja o status da matrícula da sua criança usando o código da
              inscrição.
            </p>
            <span className="mt-3 flex items-center gap-1 text-sm font-medium text-white">
              Consultar
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
