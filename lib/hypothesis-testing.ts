import { fmt, isBlank, parseNumber } from "./format";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export type Alpha = 0.1 | 0.05 | 0.01;
export type Tail = "left" | "right" | "two";
export type TestKind = "one-sample" | "two-sample";

export const ALPHA_OPTIONS: Alpha[] = [0.1, 0.05, 0.01];

export const TAIL_LABELS: Record<Tail, string> = {
  left: "Left-tailed",
  right: "Right-tailed",
  two: "Two-tailed",
};

/** Critical Z values from the standard normal table. */
const CRITICAL_Z: Record<Alpha, { oneTail: number; twoTail: number }> = {
  0.1: { oneTail: 1.2816, twoTail: 1.6449 },
  0.05: { oneTail: 1.6449, twoTail: 1.96 },
  0.01: { oneTail: 2.3263, twoTail: 2.5758 },
};

export interface OneSampleRaw {
  h0: string;
  h1: string;
  alpha: Alpha;
  tail: Tail;
  n: string;
  sampleMean: string;
  mu0: string;
  sigma: string;
}

export interface TwoSampleRaw {
  h0: string;
  h1: string;
  alpha: Alpha;
  tail: Tail;
  n1: string;
  mean1: string;
  sigma1: string;
  n2: string;
  mean2: string;
  sigma2: string;
}

export interface ZTestOutcome {
  kind: TestKind;
  testName: string;
  formula: string;
  /** The formula with the user's numbers substituted in. */
  substitution: string;
  standardError: number;
  zStat: number;
  alpha: Alpha;
  tail: Tail;
  /** Critical Z value(s): one for a one-tailed test, ±c for two-tailed. */
  criticalValues: number[];
  rejectionRegion: string;
  reject: boolean;
  decision: string;
  interpretation: string;
  h0: string;
  h1: string;
  assumptions: string[];
  warnings: string[];
}

export type Validation<T> = { ok: true; value: T } | { ok: false; errors: string[] };

/* ------------------------------------------------------------------ */
/* Critical values and decision rule                                    */
/* ------------------------------------------------------------------ */

export function getCriticalValues(alpha: Alpha, tail: Tail): number[] {
  const { oneTail, twoTail } = CRITICAL_Z[alpha];
  if (tail === "left") return [-oneTail];
  if (tail === "right") return [oneTail];
  return [-twoTail, twoTail];
}

function describeRegion(tail: Tail, critical: number[]): string {
  if (tail === "left") return `z < ${fmt(critical[0], 4)}`;
  if (tail === "right") return `z > ${fmt(critical[0], 4)}`;
  return `z < ${fmt(critical[0], 4)} or z > ${fmt(critical[1], 4)}`;
}

/**
 * Left-tailed:  reject H0 when z < critical (negative) value.
 * Right-tailed: reject H0 when z > critical value.
 * Two-tailed:   reject H0 when |z| > positive critical value.
 */
export function shouldReject(z: number, tail: Tail, critical: number[]): boolean {
  if (tail === "left") return z < critical[0];
  if (tail === "right") return z > critical[0];
  return Math.abs(z) > critical[1];
}

/* ------------------------------------------------------------------ */
/* Default hypothesis statements                                        */
/* ------------------------------------------------------------------ */

function defaultOneSampleHypotheses(tail: Tail, mu0: number) {
  const m = fmt(mu0);
  const symbol = tail === "left" ? "<" : tail === "right" ? ">" : "≠";
  return { h0: `μ = ${m}`, h1: `μ ${symbol} ${m}` };
}

function defaultTwoSampleHypotheses(tail: Tail) {
  const symbol = tail === "left" ? "<" : tail === "right" ? ">" : "≠";
  return { h0: "μ₁ = μ₂", h1: `μ₁ ${symbol} μ₂` };
}

/* ------------------------------------------------------------------ */
/* Shared result builder                                                */
/* ------------------------------------------------------------------ */

function buildDecision(
  z: number,
  alpha: Alpha,
  tail: Tail,
  h0: string,
  h1: string
): Pick<ZTestOutcome, "criticalValues" | "rejectionRegion" | "reject" | "decision" | "interpretation"> {
  const criticalValues = getCriticalValues(alpha, tail);
  const rejectionRegion = describeRegion(tail, criticalValues);
  const reject = shouldReject(z, tail, criticalValues);

  const compare =
    tail === "two"
      ? `|z| = ${fmt(Math.abs(z))} ${reject ? ">" : "≤"} ${fmt(criticalValues[1])}`
      : `z = ${fmt(z)} ${tail === "left" ? (reject ? "<" : "≥") : reject ? ">" : "≤"} ${fmt(criticalValues[0])}`;

  if (reject) {
    return {
      criticalValues,
      rejectionRegion,
      reject,
      decision: "Reject H₀",
      interpretation:
        `The test statistic z = ${fmt(z)} falls in the rejection region (${rejectionRegion}) because ${compare}. ` +
        `So we reject H₀ (${h0}) at the ${fmt(alpha * 100, 2)}% level of significance. ` +
        `There is enough evidence to support H₁ (${h1}).`,
    };
  }

  return {
    criticalValues,
    rejectionRegion,
    reject,
    decision: "Fail to reject H₀",
    interpretation:
      `The test statistic z = ${fmt(z)} does not fall in the rejection region (${rejectionRegion}) because ${compare}. ` +
      `So we fail to reject H₀ (${h0}) at the ${fmt(alpha * 100, 2)}% level of significance. ` +
      `There is not enough evidence to support H₁ (${h1}). ` +
      `This does not prove that H₀ is true; it only means the sample did not give strong enough evidence against it.`,
  };
}

/* ------------------------------------------------------------------ */
/* Input validation helpers                                             */
/* ------------------------------------------------------------------ */

function readSampleSize(text: string, label: string, errors: string[]): number | null {
  if (isBlank(text)) {
    errors.push(`${label} is required.`);
    return null;
  }
  const value = parseNumber(text);
  if (value === null) {
    errors.push(`${label} must be a number.`);
    return null;
  }
  if (!Number.isInteger(value) || value < 1) {
    errors.push(`${label} must be a whole number of at least 1.`);
    return null;
  }
  return value;
}

function readNumber(text: string, label: string, errors: string[]): number | null {
  if (isBlank(text)) {
    errors.push(`${label} is required.`);
    return null;
  }
  const value = parseNumber(text);
  if (value === null) {
    errors.push(`${label} must be a valid number.`);
    return null;
  }
  return value;
}

function readPositive(text: string, label: string, errors: string[]): number | null {
  const value = readNumber(text, label, errors);
  if (value === null) return null;
  if (value <= 0) {
    errors.push(`${label} must be greater than 0.`);
    return null;
  }
  return value;
}

/* ------------------------------------------------------------------ */
/* One-sample Z-test                                                    */
/* ------------------------------------------------------------------ */

/** z = (x̄ − μ₀) / (σ / √n) */
export function runOneSampleZTest(raw: OneSampleRaw): Validation<ZTestOutcome> {
  const errors: string[] = [];
  const n = readSampleSize(raw.n, "Sample size (n)", errors);
  const sampleMean = readNumber(raw.sampleMean, "Sample mean (x̄)", errors);
  const mu0 = readNumber(raw.mu0, "Hypothesized mean (μ₀)", errors);
  const sigma = readPositive(raw.sigma, "Population standard deviation (σ)", errors);

  if (errors.length > 0 || n === null || sampleMean === null || mu0 === null || sigma === null) {
    return { ok: false, errors };
  }

  const standardError = sigma / Math.sqrt(n);
  const zStat = (sampleMean - mu0) / standardError;
  if (!Number.isFinite(zStat)) {
    return { ok: false, errors: ["The test statistic could not be calculated from these values."] };
  }

  const defaults = defaultOneSampleHypotheses(raw.tail, mu0);
  const h0 = isBlank(raw.h0) ? defaults.h0 : raw.h0.trim();
  const h1 = isBlank(raw.h1) ? defaults.h1 : raw.h1.trim();

  const warnings: string[] = [];
  if (n < 30) {
    warnings.push(
      "The lesson uses the Z-test when n ≥ 30. With a smaller sample, the Z-test is only appropriate if the population is normal and σ is truly known."
    );
  }

  return {
    ok: true,
    value: {
      kind: "one-sample",
      testName: "One-sample Z-test (mean)",
      formula: "z = (x̄ − μ₀) / (σ / √n)",
      substitution: `z = (${fmt(sampleMean)} − ${fmt(mu0)}) / (${fmt(sigma)} / √${n}) = ${fmt(sampleMean - mu0)} / ${fmt(standardError)} = ${fmt(zStat)}`,
      standardError,
      zStat,
      alpha: raw.alpha,
      tail: raw.tail,
      ...buildDecision(zStat, raw.alpha, raw.tail, h0, h1),
      h0,
      h1,
      assumptions: [
        "The population standard deviation σ is known.",
        "The sample is random and the observations are independent.",
        "The population is normal, or the sample is large (n ≥ 30).",
      ],
      warnings,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Two-sample Z-test                                                    */
/* ------------------------------------------------------------------ */

/** z = (x̄₁ − x̄₂) / √(σ₁²/n₁ + σ₂²/n₂), testing H₀: μ₁ = μ₂ */
export function runTwoSampleZTest(raw: TwoSampleRaw): Validation<ZTestOutcome> {
  const errors: string[] = [];
  const n1 = readSampleSize(raw.n1, "Sample 1 size (n₁)", errors);
  const mean1 = readNumber(raw.mean1, "Sample 1 mean (x̄₁)", errors);
  const sigma1 = readPositive(raw.sigma1, "Population standard deviation of group 1 (σ₁)", errors);
  const n2 = readSampleSize(raw.n2, "Sample 2 size (n₂)", errors);
  const mean2 = readNumber(raw.mean2, "Sample 2 mean (x̄₂)", errors);
  const sigma2 = readPositive(raw.sigma2, "Population standard deviation of group 2 (σ₂)", errors);

  if (
    errors.length > 0 ||
    n1 === null ||
    mean1 === null ||
    sigma1 === null ||
    n2 === null ||
    mean2 === null ||
    sigma2 === null
  ) {
    return { ok: false, errors };
  }

  const standardError = Math.sqrt((sigma1 * sigma1) / n1 + (sigma2 * sigma2) / n2);
  const zStat = (mean1 - mean2) / standardError;
  if (!Number.isFinite(zStat)) {
    return { ok: false, errors: ["The test statistic could not be calculated from these values."] };
  }

  const defaults = defaultTwoSampleHypotheses(raw.tail);
  const h0 = isBlank(raw.h0) ? defaults.h0 : raw.h0.trim();
  const h1 = isBlank(raw.h1) ? defaults.h1 : raw.h1.trim();

  const warnings: string[] = [];
  if (n1 < 30 || n2 < 30) {
    warnings.push(
      "The lesson uses the Z-test when samples are large (n ≥ 30). With smaller samples, the Z-test is only appropriate if both populations are normal and both σ values are truly known."
    );
  }

  return {
    ok: true,
    value: {
      kind: "two-sample",
      testName: "Two-sample Z-test (difference of two independent means)",
      formula: "z = (x̄₁ − x̄₂) / √(σ₁²/n₁ + σ₂²/n₂)",
      substitution: `z = (${fmt(mean1)} − ${fmt(mean2)}) / √(${fmt(sigma1 * sigma1)}/${n1} + ${fmt(sigma2 * sigma2)}/${n2}) = ${fmt(mean1 - mean2)} / ${fmt(standardError)} = ${fmt(zStat)}`,
      standardError,
      zStat,
      alpha: raw.alpha,
      tail: raw.tail,
      ...buildDecision(zStat, raw.alpha, raw.tail, h0, h1),
      h0,
      h1,
      assumptions: [
        "The two samples are random and independent of each other.",
        "Both population standard deviations (σ₁ and σ₂) are known.",
        "Both populations are normal, or both samples are large (n ≥ 30).",
        "H₀ states that the two population means are equal (μ₁ − μ₂ = 0).",
      ],
      warnings,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Normal curve helper (used by the chart)                              */
/* ------------------------------------------------------------------ */

/** Standard normal probability density function. */
export function normalPdf(z: number): number {
  return Math.exp(-(z * z) / 2) / Math.sqrt(2 * Math.PI);
}
