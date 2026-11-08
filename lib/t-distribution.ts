/**
 * Student's t-distribution helpers (no external libraries).
 * Used to find critical t values for any degrees of freedom and to draw the curve.
 */

/** Natural log of the gamma function (Lanczos approximation). */
function logGamma(x: number): number {
  const coefficients = [
    76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155,
    0.1208650973866179e-2, -0.5395239384953e-5,
  ];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let series = 1.000000000190015;
  for (const c of coefficients) {
    y += 1;
    series += c / y;
  }
  return -tmp + Math.log((2.5066282746310005 * series) / x);
}

/** Continued fraction used by the incomplete beta function. */
function betaContinuedFraction(a: number, b: number, x: number): number {
  const MAX_ITERATIONS = 300;
  const EPSILON = 3e-14;
  const TINY = 1e-300;

  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < TINY) d = TINY;
  d = 1 / d;
  let h = d;

  for (let m = 1; m <= MAX_ITERATIONS; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < TINY) d = TINY;
    c = 1 + aa / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    h *= d * c;

    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < TINY) d = TINY;
    c = 1 + aa / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < EPSILON) break;
  }
  return h;
}

/** Regularized incomplete beta function I_x(a, b). */
function regularizedIncompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const front = Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x)
  );
  if (x < (a + 1) / (a + b + 2)) {
    return (front * betaContinuedFraction(a, b, x)) / a;
  }
  return 1 - (front * betaContinuedFraction(b, a, 1 - x)) / b;
}

/** Cumulative probability P(T ≤ t) for a t-distribution with df degrees of freedom. */
export function tCdf(t: number, df: number): number {
  const x = df / (df + t * t);
  const tail = regularizedIncompleteBeta(x, df / 2, 0.5);
  return t >= 0 ? 1 - 0.5 * tail : 0.5 * tail;
}

/** The t value whose cumulative probability is p (the inverse of tCdf). */
export function tQuantile(p: number, df: number): number {
  if (!(p > 0 && p < 1) || !(df > 0)) return NaN;
  if (p === 0.5) return 0;
  if (p < 0.5) return -tQuantile(1 - p, df);

  let low = 0;
  let high = 1;
  while (tCdf(high, df) < p && high < 1e9) high *= 2;
  for (let i = 0; i < 200; i++) {
    const mid = (low + high) / 2;
    if (tCdf(mid, df) < p) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

/** Probability density of the t-distribution (used to draw the curve). */
export function tPdf(t: number, df: number): number {
  const constant = Math.exp(logGamma((df + 1) / 2) - logGamma(df / 2)) / Math.sqrt(df * Math.PI);
  return constant * Math.pow(1 + (t * t) / df, -(df + 1) / 2);
}