import { fmt, isBlank, parseNumber } from "./format";
import { tQuantile } from "./t-distribution";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export type Alpha = 0.1 | 0.05 | 0.01;
export type Tail = "left" | "right" | "two";
export type TestKind = "z-one" | "z-two" | "t-one" | "t-two";

export const ALPHA_OPTIONS: Alpha[] = [0.1, 0.05, 0.01];

export const TAIL_LABELS: Record<Tail, string> = {
  left: "Left-tailed",
  right: "Right-tailed",
  two: "Two-tailed",
};

export const TEST_LABELS: Record<TestKind, string> = {
  "z-one": "One-sample Z-test (σ known)",
  "z-two": "Two-sample Z-test (σ₁ and σ₂ known)",
  "t-one": "One-sample t-test (σ unknown)",
  "t-two": "Two-sample t-test (σ unknown)",
};

/** Critical Z values from the standard normal table. */
const CRITICAL_Z: Record<Alpha, { oneTail: number; twoTail: number }> = {
  0.1: { oneTail: 1.2816, twoTail: 1.6449 },
  0.05: { oneTail: 1.6449, twoTail: 1.96 },
  0.01: { oneTail: 2.3263, twoTail: 2.5758 },
};

interface BaseRaw {
  h0: string;
  h1: string;
  alpha: Alpha;
  tail: Tail;
}

export interface OneSampleRaw extends BaseRaw {
  n: string;
  sampleMean: string;
  mu0: string;
  sigma: string;
}

export interface TwoSampleRaw extends BaseRaw {
  n1: string;
  mean1: string;
  sigma1: string;
  n2: string;
  mean2: string;
  sigma2: string;
}

export interface OneSampleTRaw extends BaseRaw {
  n: string;
  sampleMean: string;
  mu0: string;
  /** Sample standard deviation */
  s: string;
}

export interface TwoSampleTRaw extends BaseRaw {
  n1: string;
  mean1: string;
  s1: string;
  n2: string;
  mean2: string;
  s2: string;
  /** true: pooled variance (equal variances). false: Welch (unequal variances). */
  equalVariances: boolean;
}

export interface TestOutcome {
  kind: TestKind;
  statisticName: "z" | "t";
  testName: string;
  formula: string;
  /** The formula with the user's numbers substituted in. */
  substitution: string;
  standardError: number;
  /** The test statistic (z or t). */
  statistic: number;
  /** Degrees of freedom (t-tests only). */
  df: number | null;
  alpha: Alpha;
  tail: Tail;
  /** Critical value(s): one for a one-tailed test, ±c for two-tailed. */
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

/** Critical t value(s) for df degrees of freedom, rounded to 3 decimals like a printed t-table. */
export function getTCriticalValues(alpha: Alpha, tail: Tail, df: number): number[] {
  const upperProbability = tail === "two" ? 1 - alpha / 2 : 1 - alpha;
  const c = Number(tQuantile(upperProbability, df).toFixed(3));
  if (tail === "left") return [-c];
  if (tail === "right") return [c];
  return [-c, c];
}

function describeRegion(symbol: string, tail: Tail, critical: number[]): string {
  if (tail === "left") return `${symbol} < ${fmt(critical[0], 4)}`;
  if (tail === "right") return `${symbol} > ${fmt(critical[0], 4)}`;
  return `${symbol} < ${fmt(critical[0], 4)} or ${symbol} > ${fmt(critical[1], 4)}`;
}

/**
 * Left-tailed:  reject H0 when the statistic < critical (negative) value.
 * Right-tailed: reject H0 when the statistic > critical value.
 * Two-tailed:   reject H0 when |statistic| > positive critical value.
 */
export function shouldReject(statistic: number, tail: Tail, critical: number[]): boolean {
  if (tail === "left") return statistic < critical[0];
  if (tail === "right") return statistic > critical[0];
  return Math.abs(statistic) > critical[1];
}

/* ------------------------------------------------------------------ */
/* Default hypothesis statements                                        */
/* ------------------------------------------------------------------ */

function tailSymbol(tail: Tail): string {
  return tail === "left" ? "<" : tail === "right" ? ">" : "≠";
}

function defaultOneSampleHypotheses(tail: Tail, mu0: number) {
  const m = fmt(mu0);
  return { h0: `μ = ${m}`, h1: `μ ${tailSymbol(tail)} ${m}` };
}

function defaultTwoSampleHypotheses(tail: Tail) {
  return { h0: "μ₁ = μ₂", h1: `μ₁ ${tailSymbol(tail)} μ₂` };
}

/* ------------------------------------------------------------------ */
/* Shared decision builder                                              */
/* ------------------------------------------------------------------ */

function buildDecision(
  symbol: "z" | "t",
  statistic: number,
  criticalValues: number[],
  alpha: Alpha,
  tail: Tail,
  h0: string,
  h1: string
): Pick<TestOutcome, "criticalValues" | "rejectionRegion" | "reject" | "decision" | "interpretation"> {
  const rejectionRegion = describeRegion(symbol, tail, criticalValues);
  const reject = shouldReject(statistic, tail, criticalValues);

  const compare =
    tail === "two"
      ? `|${symbol}| = ${fmt(Math.abs(statistic))} ${reject ? ">" : "≤"} ${fmt(criticalValues[1])}`
      : `${symbol} = ${fmt(statistic)} ${
          tail === "left" ? (reject ? "<" : "≥") : reject ? ">" : "≤"
        } ${fmt(criticalValues[0])}`;

  const level = `${fmt(alpha * 100, 2)}% level of significance`;

  if (reject) {
    return {
      criticalValues,
      rejectionRegion,
      reject,
      decision: "Reject H₀",
      interpretation:
        `The test statistic ${symbol} = ${fmt(statistic)} falls in the rejection region (${rejectionRegion}) because ${compare}. ` +
        `So we reject H₀ (${h0}) at the ${level}. ` +
        `There is enough evidence to support H₁ (${h1}).`,
    };
  }

  return {
    criticalValues,
    rejectionRegion,
    reject,
    decision: "Fail to reject H₀",
    interpretation:
      `The test statistic ${symbol} = ${fmt(statistic)} does not fall in the rejection region (${rejectionRegion}) because ${compare}. ` +
      `So we fail to reject H₀ (${h0}) at the ${level}. ` +
      `There is not enough evidence to support H₁ (${h1}). ` +
      `This does not prove that H₀ is true; it only means the sample did not give strong enough evidence against it.`,
  };
}

/* ------------------------------------------------------------------ */
/* Input validation helpers                                             */
/* ------------------------------------------------------------------ */

function readSampleSize(text: string, label: string, errors: string[], min = 1): number | null {
  if (isBlank(text)) {
    errors.push(`${label} is required.`);
    return null;
  }
  const value = parseNumber(text);
  if (value === null) {
    errors.push(`${label} must be a number.`);
    return null;
  }
  if (!Number.isInteger(value) || value < min) {
    errors.push(`${label} must be a whole number of at least ${min}.`);
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

const NOT_FINITE = ["The test statistic could not be calculated from these values."];

/* ------------------------------------------------------------------ */
/* One-sample Z-test                                                    */
/* ------------------------------------------------------------------ */

/** z = (x̄ − μ₀) / (σ / √n) */
export function runOneSampleZTest(raw: OneSampleRaw): Validation<TestOutcome> {
  const errors: string[] = [];
  const n = readSampleSize(raw.n, "Sample size (n)", errors);
  const sampleMean = readNumber(raw.sampleMean, "Sample mean (x̄)", errors);
  const mu0 = readNumber(raw.mu0, "Hypothesized mean (μ₀)", errors);
  const sigma = readPositive(raw.sigma, "Population standard deviation (σ)", errors);

  if (errors.length > 0 || n === null || sampleMean === null || mu0 === null || sigma === null) {
    return { ok: false, errors };
  }

  const standardError = sigma / Math.sqrt(n);
  const z = (sampleMean - mu0) / standardError;
  if (!Number.isFinite(z)) return { ok: false, errors: NOT_FINITE };

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
      kind: "z-one",
      statisticName: "z",
      testName: "One-sample Z-test (mean)",
      formula: "z = (x̄ − μ₀) / (σ / √n)",
      substitution: `z = (${fmt(sampleMean)} − ${fmt(mu0)}) / (${fmt(sigma)} / √${n}) = ${fmt(sampleMean - mu0)} / ${fmt(standardError)} = ${fmt(z)}`,
      standardError,
      statistic: z,
      df: null,
      alpha: raw.alpha,
      tail: raw.tail,
      ...buildDecision("z", z, getCriticalValues(raw.alpha, raw.tail), raw.alpha, raw.tail, h0, h1),
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
export function runTwoSampleZTest(raw: TwoSampleRaw): Validation<TestOutcome> {
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
  const z = (mean1 - mean2) / standardError;
  if (!Number.isFinite(z)) return { ok: false, errors: NOT_FINITE };

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
      kind: "z-two",
      statisticName: "z",
      testName: "Two-sample Z-test (difference of two independent means)",
      formula: "z = (x̄₁ − x̄₂) / √(σ₁²/n₁ + σ₂²/n₂)",
      substitution: `z = (${fmt(mean1)} − ${fmt(mean2)}) / √(${fmt(sigma1 * sigma1)}/${n1} + ${fmt(sigma2 * sigma2)}/${n2}) = ${fmt(mean1 - mean2)} / ${fmt(standardError)} = ${fmt(z)}`,
      standardError,
      statistic: z,
      df: null,
      alpha: raw.alpha,
      tail: raw.tail,
      ...buildDecision("z", z, getCriticalValues(raw.alpha, raw.tail), raw.alpha, raw.tail, h0, h1),
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
/* One-sample t-test                                                    */
/* ------------------------------------------------------------------ */

/** t = (x̄ − μ₀) / (s / √n), with df = n − 1 */
export function runOneSampleTTest(raw: OneSampleTRaw): Validation<TestOutcome> {
  const errors: string[] = [];
  const n = readSampleSize(raw.n, "Sample size (n)", errors, 2);
  const sampleMean = readNumber(raw.sampleMean, "Sample mean (x̄)", errors);
  const mu0 = readNumber(raw.mu0, "Hypothesized mean (μ₀)", errors);
  const s = readPositive(raw.s, "Sample standard deviation (s)", errors);

  if (errors.length > 0 || n === null || sampleMean === null || mu0 === null || s === null) {
    return { ok: false, errors };
  }

  const df = n - 1;
  const standardError = s / Math.sqrt(n);
  const t = (sampleMean - mu0) / standardError;
  if (!Number.isFinite(t)) return { ok: false, errors: NOT_FINITE };

  const defaults = defaultOneSampleHypotheses(raw.tail, mu0);
  const h0 = isBlank(raw.h0) ? defaults.h0 : raw.h0.trim();
  const h1 = isBlank(raw.h1) ? defaults.h1 : raw.h1.trim();

  return {
    ok: true,
    value: {
      kind: "t-one",
      statisticName: "t",
      testName: "One-sample t-test (mean)",
      formula: "t = (x̄ − μ₀) / (s / √n),   df = n − 1",
      substitution: `t = (${fmt(sampleMean)} − ${fmt(mu0)}) / (${fmt(s)} / √${n}) = ${fmt(sampleMean - mu0)} / ${fmt(standardError)} = ${fmt(t)},   df = ${n} − 1 = ${df}`,
      standardError,
      statistic: t,
      df,
      alpha: raw.alpha,
      tail: raw.tail,
      ...buildDecision("t", t, getTCriticalValues(raw.alpha, raw.tail, df), raw.alpha, raw.tail, h0, h1),
      h0,
      h1,
      assumptions: [
        "The population standard deviation is unknown, so the sample standard deviation s is used.",
        "The sample is random and the observations are independent.",
        "The population is approximately normal (this matters most when n is small).",
      ],
      warnings: [],
    },
  };
}

/* ------------------------------------------------------------------ */
/* Two-sample t-test                                                    */
/* ------------------------------------------------------------------ */

/**
 * Pooled (equal variances):  t = (x̄₁ − x̄₂) / (sp·√(1/n₁ + 1/n₂)),  df = n₁ + n₂ − 2
 * Welch (unequal variances): t = (x̄₁ − x̄₂) / √(s₁²/n₁ + s₂²/n₂),  df by Welch–Satterthwaite
 */
export function runTwoSampleTTest(raw: TwoSampleTRaw): Validation<TestOutcome> {
  const errors: string[] = [];
  const n1 = readSampleSize(raw.n1, "Sample 1 size (n₁)", errors, 2);
  const mean1 = readNumber(raw.mean1, "Sample 1 mean (x̄₁)", errors);
  const s1 = readPositive(raw.s1, "Sample 1 standard deviation (s₁)", errors);
  const n2 = readSampleSize(raw.n2, "Sample 2 size (n₂)", errors, 2);
  const mean2 = readNumber(raw.mean2, "Sample 2 mean (x̄₂)", errors);
  const s2 = readPositive(raw.s2, "Sample 2 standard deviation (s₂)", errors);

  if (
    errors.length > 0 ||
    n1 === null ||
    mean1 === null ||
    s1 === null ||
    n2 === null ||
    mean2 === null ||
    s2 === null
  ) {
    return { ok: false, errors };
  }

  const v1 = s1 * s1;
  const v2 = s2 * s2;
  let standardError: number;
  let df: number;
  let formula: string;
  let working: string;
  let assumptions: string[];

  if (raw.equalVariances) {
    df = n1 + n2 - 2;
    const pooledVariance = ((n1 - 1) * v1 + (n2 - 1) * v2) / df;
    standardError = Math.sqrt(pooledVariance * (1 / n1 + 1 / n2));
    formula =
      "t = (x̄₁ − x̄₂) / (sp·√(1/n₁ + 1/n₂)),   sp² = [(n₁−1)s₁² + (n₂−1)s₂²] / (n₁ + n₂ − 2),   df = n₁ + n₂ − 2";
    working =
      `sp² = [(${n1}−1)(${fmt(v1)}) + (${n2}−1)(${fmt(v2)})] / ${df} = ${fmt(pooledVariance)};   ` +
      `SE = √[${fmt(pooledVariance)}(1/${n1} + 1/${n2})] = ${fmt(standardError)};   df = ${n1} + ${n2} − 2 = ${df}`;
    assumptions = [
      "The two samples are random and independent of each other.",
      "Both populations are approximately normal.",
      "The two population variances are assumed equal (pooled variance).",
      "H₀ states that the two population means are equal (μ₁ − μ₂ = 0).",
    ];
  } else {
    const a = v1 / n1;
    const b = v2 / n2;
    standardError = Math.sqrt(a + b);
    df = ((a + b) * (a + b)) / ((a * a) / (n1 - 1) + (b * b) / (n2 - 1));
    formula =
      "t = (x̄₁ − x̄₂) / √(s₁²/n₁ + s₂²/n₂),   df = (s₁²/n₁ + s₂²/n₂)² / [ (s₁²/n₁)²/(n₁−1) + (s₂²/n₂)²/(n₂−1) ]";
    working = `SE = √(${fmt(v1)}/${n1} + ${fmt(v2)}/${n2}) = ${fmt(standardError)};   df = ${fmt(df, 2)}`;
    assumptions = [
      "The two samples are random and independent of each other.",
      "Both populations are approximately normal.",
      "The population variances are not assumed equal (Welch's t-test).",
      "H₀ states that the two population means are equal (μ₁ − μ₂ = 0).",
    ];
  }

  const t = (mean1 - mean2) / standardError;
  if (!Number.isFinite(t) || !Number.isFinite(df)) return { ok: false, errors: NOT_FINITE };

  const defaults = defaultTwoSampleHypotheses(raw.tail);
  const h0 = isBlank(raw.h0) ? defaults.h0 : raw.h0.trim();
  const h1 = isBlank(raw.h1) ? defaults.h1 : raw.h1.trim();

  return {
    ok: true,
    value: {
      kind: "t-two",
      statisticName: "t",
      testName: raw.equalVariances
        ? "Two-sample t-test (equal variances, pooled)"
        : "Two-sample t-test (unequal variances, Welch)",
      formula,
      substitution: `${working};   t = (${fmt(mean1)} − ${fmt(mean2)}) / ${fmt(standardError)} = ${fmt(t)}`,
      standardError,
      statistic: t,
      df,
      alpha: raw.alpha,
      tail: raw.tail,
      ...buildDecision("t", t, getTCriticalValues(raw.alpha, raw.tail, df), raw.alpha, raw.tail, h0, h1),
      h0,
      h1,
      assumptions,
      warnings: [],
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