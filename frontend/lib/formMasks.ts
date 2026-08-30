/**
 * Máscaras e validações dos campos da pré-inscrição. Formatam enquanto a
 * pessoa digita (em vez de exigir que ela acerte a pontuação) e validam
 * apenas o que dá para checar sem backend.
 */

/** "12345678900" -> "123.456.789-00", truncando o excedente. */
export function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

/** "21990001234" -> "(21) 99000-1234"; aceita fixo de 8 dígitos também. */
export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.replace(/^(\d{0,2})/, "($1");
  if (digits.length <= 6) return digits.replace(/^(\d{2})(\d{0,4})/, "($1) $2");
  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  }
  return digits.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

/**
 * Valida CPF pelos dois dígitos verificadores. Rejeita também os
 * repetidos (111.111.111-11), que passam no cálculo mas não existem.
 */
export function isValidCpf(value: string): boolean {
  const cpf = value.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const digit = (sliceEnd: number, startWeight: number) => {
    let sum = 0;
    for (let i = 0; i < sliceEnd; i++) {
      sum += Number(cpf[i]) * (startWeight - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return digit(9, 10) === Number(cpf[9]) && digit(10, 11) === Number(cpf[10]);
}

/** Telefone brasileiro: DDD + 8 (fixo) ou 9 (celular) dígitos. */
export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/**
 * Creche atende de 0 a ~5 anos. Datas fora dessa janela (ou no futuro)
 * quase sempre são erro de digitação no ano.
 */
export function birthDateIssue(value: string): string | null {
  if (!value) return null;
  const birth = new Date(value + "T00:00:00");
  if (Number.isNaN(birth.getTime())) return "Data inválida.";

  const today = new Date();
  if (birth > today) return "A data não pode ser no futuro.";

  const ageInYears =
    (today.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  if (ageInYears > 6) {
    return "A creche atende crianças de até 5 anos. Confira o ano.";
  }
  return null;
}

/** Rótulo de idade a partir da data — "1 ano e 3 meses", "8 meses". */
export function formatAge(value: string): string | null {
  if (!value) return null;
  const birth = new Date(value + "T00:00:00");
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  if (birth > today) return null;

  let months =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    (today.getMonth() - birth.getMonth());
  if (today.getDate() < birth.getDate()) months--;
  if (months < 0) return null;

  if (months === 0) return "menos de 1 mês";

  const years = Math.floor(months / 12);
  const restMonths = months % 12;

  const yearLabel = years === 1 ? "1 ano" : `${years} anos`;
  const monthLabel = restMonths === 1 ? "1 mês" : `${restMonths} meses`;

  if (years === 0) return monthLabel;
  if (restMonths === 0) return yearLabel;
  return `${yearLabel} e ${monthLabel}`;
}
