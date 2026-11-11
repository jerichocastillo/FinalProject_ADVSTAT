
export function isBlank(input: string): boolean {
  return input.trim() === "";
}

export function parseNumber(input: string): number | null {
  const text = input.trim();
  if (text === "") return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

export function fmt(value: number, digits = 4): string {
  if (!Number.isFinite(value)) return "—";
  const rounded = Number(value.toFixed(digits));
  return (Object.is(rounded, -0) ? 0 : rounded).toString();
}

export function fmtParen(value: number, digits = 4): string {
  const text = fmt(value, digits);
  return value < 0 ? `(${text})` : text;
}
