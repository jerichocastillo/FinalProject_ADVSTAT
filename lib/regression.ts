import { fmt, isBlank, parseNumber } from "./format";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

/** One row of the data-entry table exactly as typed by the user. */
export interface RawRow {
  id: number;
  x: string;
  y: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface ParsedData {
  /** Rows that have a valid number in both X and Y. */
  points: Point[];
  /** Human-readable problems (incomplete or non-numeric rows). */
  errors: string[];
}

export interface RegressionResult {
  n: number;
  meanX: number;
  meanY: number;
  /** Σ(x − x̄)² */
  sxx: number;
  /** Σ(y − ȳ)² */
  syy: number;
  /** Σ(x − x̄)(y − ȳ) */
  sxy: number;
  /** B, the slope */
  slope: number;
  /** A, the y-intercept */
  intercept: number;
  /** Pearson r, or null when it cannot be calculated */
  r: number | null;
  /** Explains why r is null */
  rNote: string | null;
  minX: number;
  maxX: number;
}

export type RegressionOutcome =
  | { ok: true; result: RegressionResult }
  | { ok: false; message: string };

export interface CorrelationInfo {
  strength: string | null;
  direction: "positive" | "negative" | "none" | null;
  summary: string;
}

/* ------------------------------------------------------------------ */
/* Input handling                                                       */
/* ------------------------------------------------------------------ */

/**
 * Reads the table. Completely empty rows are ignored. A row with only one
 * value, or with text that is not a number, is reported as an error and is
 * never used in the calculation.
 */
export function parseRows(rows: RawRow[]): ParsedData {
  const points: Point[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const label = `Row ${index + 1}`;
    const xBlank = isBlank(row.x);
    const yBlank = isBlank(row.y);

    if (xBlank && yBlank) return; // empty row: ignore

    if (xBlank || yBlank) {
      errors.push(`${label}: enter both X and Y (one of them is empty).`);
      return;
    }

    const x = parseNumber(row.x);
    const y = parseNumber(row.y);
    if (x === null || y === null) {
      errors.push(`${label}: X and Y must both be valid numbers.`);
      return;
    }

    points.push({ x, y });
  });

  return { points, errors };
}

/* ------------------------------------------------------------------ */
/* Calculations                                                         */
/* ------------------------------------------------------------------ */

/** Least-squares regression and Pearson correlation. */
export function computeRegression(points: Point[]): RegressionOutcome {
  const n = points.length;
  if (n < 2) {
    return { ok: false, message: "Enter at least two valid (X, Y) pairs." };
  }

  const allXSame = points.every((p) => p.x === points[0].x);
  if (allXSame) {
    return {
      ok: false,
      message:
        "All X values are identical, so Σ(x − x̄)² = 0 and the slope cannot be calculated (division by zero). Use at least two different X values.",
    };
  }

  const allYSame = points.every((p) => p.y === points[0].y);

  const meanX = points.reduce((sum, p) => sum + p.x, 0) / n;
  const meanY = points.reduce((sum, p) => sum + p.y, 0) / n;

  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (const p of points) {
    const dx = p.x - meanX;
    const dy = p.y - meanY;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }

  const slope = sxy / sxx; // B
  const intercept = meanY - slope * meanX; // A

  let r: number | null = null;
  let rNote: string | null = null;
  if (allYSame) {
    rNote =
      "All Y values are identical, so Σ(y − ȳ)² = 0 and r cannot be calculated (division by zero). The regression line is horizontal.";
  } else {
    const denominator = Math.sqrt(sxx * syy);
    if (!Number.isFinite(denominator) || denominator === 0) {
      rNote = "r cannot be calculated because the denominator is zero or not a finite number.";
    } else {
      // Clamp to guard against tiny floating-point drift such as 1.0000000000000002
      r = Math.max(-1, Math.min(1, sxy / denominator));
    }
  }

  return {
    ok: true,
    result: {
      n,
      meanX,
      meanY,
      sxx,
      syy,
      sxy,
      slope,
      intercept,
      r,
      rNote,
      minX: Math.min(...points.map((p) => p.x)),
      maxX: Math.max(...points.map((p) => p.x)),
    },
  };
}

/** ŷ = A + Bx */
export function predictY(result: Pick<RegressionResult, "intercept" | "slope">, x: number): number {
  return result.intercept + result.slope * x;
}

/** Reads |r| using the ranges from the lesson. */
export function describeCorrelation(r: number | null, rNote: string | null): CorrelationInfo {
  if (r === null) {
    return {
      strength: null,
      direction: null,
      summary: rNote ?? "The correlation coefficient cannot be calculated.",
    };
  }

  const abs = Math.abs(r);
  let strength: string;
  if (abs < 0.2) strength = "Very weak";
  else if (abs < 0.4) strength = "Weak";
  else if (abs < 0.6) strength = "Moderate";
  else if (abs < 0.8) strength = "Strong";
  else strength = "Very strong";

  if (r === 0) {
    return {
      strength,
      direction: "none",
      summary: "r = 0: there is no linear relationship between X and Y.",
    };
  }

  const direction = r > 0 ? "positive" : "negative";
  const meaning =
    direction === "positive"
      ? "Y tends to increase as X increases."
      : "Y tends to decrease as X increases.";
  return {
    strength,
    direction,
    summary: `${strength} ${direction} linear relationship (r = ${fmt(r)}). ${meaning}`,
  };
}

/** Builds the equation text, e.g. "ŷ = 52.4 + 6.1x" or "ŷ = 10 − 2.5x". */
export function formatEquation(intercept: number, slope: number, digits = 4): string {
  const a = fmt(intercept, digits);
  const b = fmt(Math.abs(slope), digits);
  const sign = slope < 0 ? "−" : "+";
  return `ŷ = ${a} ${sign} ${b}x`;
}
