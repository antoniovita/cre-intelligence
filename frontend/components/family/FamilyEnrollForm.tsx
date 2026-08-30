"use client";

import { useMemo, useState } from "react";
import { useJsonData } from "@/lib/useJsonData";
import type { Territory } from "@/lib/types";

type Step = "form" | "success";

const RENDA_OPTIONS = [
  "Até 1 salário mínimo",
  "De 1 a 2 salários mínimos",
  "De 2 a 3 salários mínimos",
  "Acima de 3 salários mínimos",
];

interface EnrollFormData {
  criancaNome: string;
  nascimento: string;
  criancaCpf: string;
  responsavelNome: string;
  responsavelCpf: string;
  telefone: string;
  email: string;
  territorioId: string;
  unidadePreferencia: string;
  renda: string;
  pessoasResidencia: string;
  programaSocial: boolean;
}

const EMPTY_FORM: EnrollFormData = {
  criancaNome: "",
  nascimento: "",
  criancaCpf: "",
  responsavelNome: "",
  responsavelCpf: "",
  telefone: "",
  email: "",
  territorioId: "",
  unidadePreferencia: "",
  renda: "",
  pessoasResidencia: "",
  programaSocial: false,
};

/** Fields required to submit — drives the progress indicator. */
const REQUIRED_FIELDS: (keyof EnrollFormData)[] = [
  "criancaNome",
  "nascimento",
  "responsavelNome",
  "responsavelCpf",
  "telefone",
  "territorioId",
  "renda",
  "pessoasResidencia",
];

/**
 * Mocked enrollment form — no backend, submitting just generates a
 * protocol number and shows a confirmation screen. Mirrors the fields
 * a real SME pre-inscrição would collect (child, guardian, address,
 * socioeconomic snapshot) so the flow reads as complete end to end.
 */
export function FamilyEnrollForm() {
  const { data: territories } = useJsonData<Territory[]>(
    "/data/territories.json"
  );
  const [step, setStep] = useState<Step>("form");
  const [protocolo, setProtocolo] = useState("");
  const [form, setForm] = useState<EnrollFormData>(EMPTY_FORM);

  function set<K extends keyof EnrollFormData>(key: K, value: EnrollFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const filledCount = useMemo(
    () => REQUIRED_FIELDS.filter((key) => String(form[key]).trim() !== "").length,
    [form]
  );
  const progress = Math.round((filledCount / REQUIRED_FIELDS.length) * 100);

  const territoryName = useMemo(
    () => territories?.find((t) => t.id === form.territorioId)?.name ?? null,
    [territories, form.territorioId]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = `PRE-${new Date().getFullYear()}-${Math.floor(
      100000 + Math.random() * 900000
    )}`;
    setProtocolo(id);
    setStep("success");
  }

  function handleReset() {
    setForm(EMPTY_FORM);
    setStep("form");
  }

  if (step === "success") {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-6 text-center sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckIcon />
          </div>
          <h2 className="mt-3 text-lg font-semibold text-slate-900">
            Pré-inscrição enviada
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Guarde o número de protocolo abaixo para acompanhar o status na
            aba <span className="font-medium text-slate-800">Consultar inscrição</span>.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 font-mono text-sm font-medium text-emerald-700">
            {protocolo}
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Resumo da inscrição
          </h3>
          <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <SummaryItem label="Criança" value={form.criancaNome} />
            <SummaryItem
              label="Nascimento"
              value={
                form.nascimento
                  ? new Date(form.nascimento + "T00:00:00").toLocaleDateString("pt-BR")
                  : "—"
              }
            />
            <SummaryItem label="Responsável" value={form.responsavelNome} />
            <SummaryItem label="Contato" value={form.telefone} />
            <SummaryItem label="Território" value={territoryName ?? "—"} />
            <SummaryItem
              label="Unidade de preferência"
              value={form.unidadePreferencia || "Nenhuma indicada"}
            />
          </dl>
        </div>

        <div className="mt-5 text-center">
          <button
            onClick={handleReset}
            className="text-sm font-medium text-slate-500 hover:text-blue-700"
          >
            ← Inscrever outra criança
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Pré-inscrição
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Preencha os dados abaixo para inscrever sua criança na fila de
            vagas da rede municipal.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2.5 sm:w-48">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="whitespace-nowrap text-xs font-medium text-slate-500">
            {filledCount}/{REQUIRED_FIELDS.length}
          </span>
        </div>
      </div>

      <FormSection step={1} title="Dados da criança" icon={<ChildIcon />}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Nome completo" required className="sm:col-span-2 lg:col-span-1">
            <input
              type="text"
              required
              value={form.criancaNome}
              onChange={(e) => set("criancaNome", e.target.value)}
              placeholder="Nome da criança"
              className="input"
            />
          </Field>
          <Field label="Data de nascimento" required>
            <input
              type="date"
              required
              value={form.nascimento}
              onChange={(e) => set("nascimento", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="CPF da criança (opcional)">
            <input
              type="text"
              value={form.criancaCpf}
              onChange={(e) => set("criancaCpf", e.target.value)}
              placeholder="000.000.000-00"
              className="input"
            />
          </Field>
        </div>
      </FormSection>

      <FormSection step={2} title="Responsável" icon={<UserIcon />}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Nome completo" required className="sm:col-span-2 lg:col-span-1">
            <input
              type="text"
              required
              value={form.responsavelNome}
              onChange={(e) => set("responsavelNome", e.target.value)}
              placeholder="Nome do responsável"
              className="input"
            />
          </Field>
          <Field label="CPF" required>
            <input
              type="text"
              required
              value={form.responsavelCpf}
              onChange={(e) => set("responsavelCpf", e.target.value)}
              placeholder="000.000.000-00"
              className="input"
            />
          </Field>
          <Field label="Telefone" required>
            <div className="relative">
              <PhoneIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                required
                value={form.telefone}
                onChange={(e) => set("telefone", e.target.value)}
                placeholder="(21) 90000-0000"
                className="input pl-10"
              />
            </div>
          </Field>
          <Field label="E-mail" className="sm:col-span-2 lg:col-span-1">
            <div className="relative">
              <MailIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="voce@exemplo.com"
                className="input pl-10"
              />
            </div>
          </Field>
        </div>
      </FormSection>

      <FormSection step={3} title="Endereço" icon={<PinIcon />}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Território / bairro" required>
            <select
              required
              value={form.territorioId}
              onChange={(e) => set("territorioId", e.target.value)}
              className="input"
            >
              <option value="" disabled>
                Selecione o território
              </option>
              {(territories ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Unidade de preferência (opcional)">
            <input
              type="text"
              value={form.unidadePreferencia}
              onChange={(e) => set("unidadePreferencia", e.target.value)}
              placeholder="Ex.: CM Rio Novo"
              className="input"
            />
          </Field>
        </div>
      </FormSection>

      <FormSection step={4} title="Situação socioeconômica" icon={<HomeIcon />}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Renda familiar" required>
            <select
              required
              value={form.renda}
              onChange={(e) => set("renda", e.target.value)}
              className="input"
            >
              <option value="" disabled>
                Selecione uma faixa
              </option>
              {RENDA_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Pessoas na residência" required>
            <input
              type="number"
              min={1}
              required
              value={form.pessoasResidencia}
              onChange={(e) => set("pessoasResidencia", e.target.value)}
              placeholder="Ex.: 4"
              className="input"
            />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={form.programaSocial}
            onChange={(e) => set("programaSocial", e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-100"
          />
          Família participa de programa social (Bolsa Família, CadÚnico, etc.)
        </label>
      </FormSection>

      <div className="border-t border-slate-200 pt-5">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 sm:w-auto"
        >
          Enviar pré-inscrição
          <span aria-hidden="true">→</span>
        </button>
        <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-400">
          <LockIcon className="mt-0.5 shrink-0" />
          Formulário de demonstração — nenhum dado é enviado a um servidor
          ou armazenado.
        </p>
      </div>
    </form>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-slate-800">{value || "—"}</dd>
    </div>
  );
}

function FormSection({
  step,
  title,
  icon,
  children,
}: {
  step: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-3 border-t border-slate-200 pt-5 first:border-t-0 first:pt-0">
      <legend className="mb-1 flex w-full items-center gap-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-700">
          {icon}
        </span>
        <span className="text-sm font-semibold text-slate-900">
          {step}. {title}
        </span>
      </legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  required,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`flex flex-col gap-1.5 text-sm font-medium text-slate-700 ${className}`}
    >
      {label}
      {required && <span className="text-blue-600"> *</span>}
      {children}
    </label>
  );
}

function ChildIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 256 256" aria-hidden="true">
      <circle cx="128" cy="72" r="40" fill="none" stroke="currentColor" strokeWidth="16" />
      <path d="M56 224 A72 72 0 0 1 200 224" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 256 256" aria-hidden="true">
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

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 256 256" aria-hidden="true">
      <path
        d="M128 232 C128 232 200 164 200 104 A72 72 0 0 0 56 104 C56 164 128 232 128 232 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="16"
        strokeLinejoin="round"
      />
      <circle cx="128" cy="104" r="24" fill="currentColor" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 256 256" aria-hidden="true">
      <path
        d="M48 208 V104 L128 48 L208 104 V208 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="16"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PhoneIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 256 256" aria-hidden="true" className={className}>
      <path
        d="M72 32 L104 32 L120 80 L96 96 C104 128 128 152 160 160 L176 136 L224 152 L224 184 A24 24 0 0 1 200 208 C120 208 48 136 48 56 A24 24 0 0 1 72 32 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="14"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 256 256" aria-hidden="true" className={className}>
      <rect x="32" y="56" width="192" height="144" rx="12" fill="none" stroke="currentColor" strokeWidth="14" />
      <path d="M40 64 L128 144 L216 64" fill="none" stroke="currentColor" strokeWidth="14" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 256 256" aria-hidden="true" className={className}>
      <rect x="48" y="112" width="160" height="104" rx="12" fill="none" stroke="currentColor" strokeWidth="16" />
      <path d="M88 112 V72 A40 40 0 0 1 168 72 V112" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 256 256" aria-hidden="true">
      <path
        d="M40 136 L96 192 L216 72"
        fill="none"
        stroke="currentColor"
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
