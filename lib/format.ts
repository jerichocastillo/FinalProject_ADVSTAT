/** Small helpers shared by the calculators (parsing and display only, no statistics). */

/** True when the text box is empty or only spaces. */
export function isBlank(input: string): boolean {
  return input.trim() === "";
}

/**
 * Turns text from an input box into a number.
 * Returns null when the text is empty or is not a finite number.
 */
export function parseNumber(input: string): number | null {
  const text = input.trim();
  if (text === "") return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

/** Rounds for display (default 4 decimals) and drops trailing zeros and "-0". */
export function fmt(value: number, digits = 4): string {
  if (!Number.isFinite(value)) return "—";
  const rounded = Number(value.toFixed(digits));
  return (Object.is(rounded, -0) ? 0 : rounded).toString();
}

/** Same as fmt but wraps negative numbers in parentheses, e.g. 3 + (-2)(4). */
export function fmtParen(value: number, digits = 4): string {
  const text = fmt(value, digits);
  return value < 0 ? `(${text})` : text;
}
