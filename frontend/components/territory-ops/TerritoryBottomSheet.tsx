"use client";

import type { Territory } from "@/lib/types";
import { pressureColor } from "@/lib/pressureColor";
import { pressureBand } from "@/lib/pressureBand";
import type { SimulatedUnit } from "./TerritoryOperationsScreen";

const ADD_OPTIONS = [10, 25, 50, 100];
const GAUGE_MAX = 6;
const fmt = (n: number) => n.toLocaleString("pt-BR");

interface TerritoryBottomSheetProps {
  /** The territory as it actually is, with no simulated supply applied. */
  base: Territory;
  /** The territory with every simulated unit near it folded into supply/pressure. */
  displayed: Territory;
  /** The specific simulated unit selected on the map, if any — lets the sheet target its own +N/remove controls at just this pin. */
  unit: SimulatedUnit | null;
  onAddToUnit: (amount: number) => void;
  onRemoveUnit: () => void;
  onClose: () => void;
}

export function TerritoryBottomSheet({
  base,
  displayed,
  unit,
  onAddToUnit,
  onRemoveUnit,
  onClose,
}: TerritoryBottomSheetProps) {
  const addedSupply = displayed.supply - base.supply;
  const changed = addedSupply > 0;
  const band = pressureBand(displayed.pressure);
  const baseBand = pressureBand(base.pressure);
  const dropPct = changed ? ((base.pressure - displayed.pressure) / base.pressure) * 100 : 0;
  const pct = (p: number) => Math.min(p / GAUGE_MAX, 1) * 100;
  const maxScale = Math.max(displayed.demand, displayed.supply);
  const gap = displayed.demand - displayed.supply;
  const color = pressureColor(displayed.pressure);

  return (
    <div className="absolute inset-x-3 bottom-3 z-[6] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl sm:inset-x-4 sm:bottom-4">
      <div className="mx-auto mt-2 h-[3px] w-11 rounded-full bg-slate-200" />

      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <span
          className="h-3.5 w-3.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <h2 className="text-xl font-semibold leading-tight text-slate-900">{displayed.name}</h2>
        <span className="border-l border-slate-200 pl-3 text-[11.5px] text-slate-500">
          microárea {displayed.id}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              band.tone === "critical"
                ? "bg-red-50 text-red-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {band.label}
          </span>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="grid h-7.5 w-7.5 place-items-center rounded-md border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-900"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 border-t border-slate-200 sm:grid-cols-3">
        {/* Célula 1: gauge de pressão */}
        <div className="border-slate-200 p-4 sm:border-r">
          <p className="mb-2 text-[9.5px] uppercase tracking-wide text-slate-400">
            Pressão — demanda por vaga
          </p>
          <div className="flex items-end gap-3">
            {changed && (
              <span className="flex flex-col gap-px pb-1">
                <span className="text-[9.5px] uppercase tracking-wide text-slate-400">Hoje</span>
                <span className="text-[19px] font-semibold tabular-nums text-slate-400 line-through decoration-slate-300">
                  {base.pressure.toFixed(2)}
                </span>
              </span>
            )}
            {changed && <span className="pb-2 text-[17px] text-slate-300">→</span>}
            <span className="flex items-baseline gap-2">
              <span
                key={`${displayed.id}-${addedSupply}`}
                className="animate-pressure-pop text-[52px] font-bold leading-[0.86] tabular-nums tracking-tight"
                style={{ color }}
              >
                {displayed.pressure.toFixed(2)}
              </span>
              <span className="pb-1.5 text-xs font-semibold" style={{ color }}>
                {band.label}
              </span>
            </span>
          </div>
          <p className="mt-2 min-h-4 text-xs italic text-blue-700">
            {changed
              ? `−${dropPct.toFixed(0)}% de pressão com +${addedSupply} vagas simuladas · faixa ${baseBand.label.toLowerCase()} → ${band.label.toLowerCase()}`
              : "Pressão atual, sem vagas simuladas."}
          </p>

          <div
            className="relative mt-3 h-2.5 rounded-sm"
            style={{
              background:
                "linear-gradient(to right, #22c55e 0 16.6%, #eab308 16.6% 33.3%, #f97316 33.3% 50%, #ef4444 50% 100%)",
            }}
          >
            {changed && (
              <div
                className="absolute -top-0.5 h-3.5 w-px bg-slate-400/60 transition-[left] duration-500 ease-out"
                style={{ left: `calc(${pct(base.pressure)}% - 0.5px)` }}
              />
            )}
            <div
              className="absolute -top-1 h-4.5 w-0.5 rounded-full bg-slate-900 transition-[left] duration-500 ease-out"
              style={{ left: `calc(${pct(displayed.pressure)}% - 1px)` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[9.5px] text-slate-400">
            <span>0</span><span>1</span><span>2</span><span>3</span><span>6+</span>
          </div>
        </div>

        {/* Célula 2: demanda e oferta */}
        <div className="border-slate-200 p-4 sm:border-r">
          <p className="mb-2 text-[9.5px] uppercase tracking-wide text-slate-400">
            Demanda e oferta
          </p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13.5px] text-slate-600">Demanda — crianças na fila</span>
              <span className="text-[22px] font-semibold tabular-nums text-slate-900">
                {fmt(displayed.demand)}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13.5px] text-slate-600">Oferta — vagas disponíveis</span>
              <span
                className="text-[22px] font-semibold tabular-nums"
                style={{ color: changed ? "#1d4ed8" : "#0f172a" }}
              >
                {fmt(base.supply)}
                {changed && (
                  <span className="ml-1.5 text-[12.5px] font-normal italic text-blue-700">
                    +{addedSupply}
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-slate-400">
              <span className="w-16">Demanda</span>
              <span className="h-1.75 flex-1 bg-slate-100">
                <span
                  className="block h-full bg-slate-700"
                  style={{ width: `${(displayed.demand / maxScale) * 100}%` }}
                />
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-slate-400">
              <span className="w-16">Oferta</span>
              <span className="h-1.75 flex-1 bg-slate-100">
                <span
                  className="block h-full transition-all duration-500"
                  style={{
                    width: `${(displayed.supply / maxScale) * 100}%`,
                    backgroundColor: changed ? "#2563eb" : "#94a3b8",
                  }}
                />
              </span>
            </div>
          </div>
          <p className="mt-3 text-[11.5px] leading-relaxed text-slate-500">
            {gap > 0
              ? `Faltam ${fmt(gap)} vagas para atender toda a fila deste território.`
              : `Oferta ${fmt(-gap)} vagas acima da demanda registrada.`}
          </p>
        </div>

        {/* Célula 3: simulador */}
        <div className="p-4">
          {unit ? (
            <>
              <p className="mb-2 text-[9.5px] uppercase tracking-wide text-slate-400">
                Capacidade desta unidade
              </p>
              <p className="mb-2 text-[11.5px] leading-relaxed text-blue-700">
                Unidade fictícia posicionada no mapa — vagas somadas à oferta do território mais
                próximo do ponto clicado ({base.name}).
              </p>
              <div className="grid grid-cols-4 gap-2">
                {ADD_OPTIONS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => onAddToUnit(amount)}
                    className="rounded-md border border-slate-200 py-2.5 text-[15px] font-semibold text-slate-900 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900 active:bg-blue-100"
                  >
                    +{amount}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs tabular-nums text-blue-700">
                  {unit.supply > 0 ? `${unit.supply} vagas nesta unidade` : "Nenhuma vaga ainda"}
                </span>
                <button
                  onClick={onRemoveUnit}
                  className="ml-auto rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:bg-red-50 hover:text-red-700"
                >
                  Remover unidade
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="mb-2 text-[9.5px] uppercase tracking-wide text-slate-400">
                Simular novas vagas
              </p>
              <p className="text-[11.5px] leading-relaxed text-slate-500">
                {changed
                  ? "Este território já tem unidade(s) simulada(s). Clique no pin azul no mapa para ajustar as vagas ou remover."
                  : 'Use "Simular nova creche" e clique num ponto do mapa perto deste território para começar.'}
              </p>
            </>
          )}
          <p className="mt-3 text-[11.5px] leading-relaxed text-slate-400">
            Cenário local, não altera os dados da fila. A cor do ponto no mapa acompanha a
            simulação.
          </p>
        </div>
      </div>
    </div>
  );
}
