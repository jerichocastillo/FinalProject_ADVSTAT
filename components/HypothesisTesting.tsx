"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Eraser } from "lucide-react";
import { fmt, isBlank } from "@/lib/format";
import {
  ALPHA_OPTIONS,
  TAIL_LABELS,
  runOneSampleTTest,
  runOneSampleZTest,
  runTwoSampleTTest,
  runTwoSampleZTest,
  type Alpha,
  type Tail,
  type TestKind,
  type TestOutcome,
  type Validation,
} from "@/lib/hypothesis-testing";
import NormalDistributionChart from "./NormalDistributionChart";
import {
  Card,
  EmptyState,
  Field,
  inputClass,
  Notice,
  secondaryButton,
  Stat,
} from "./ui";

/* ---------- Empty input sets (one per test) ---------- */

const EMPTY_Z_ONE = { n: "", sampleMean: "", mu0: "", sigma: "" };
const EMPTY_Z_TWO = { n1: "", mean1: "", sigma1: "", n2: "", mean2: "", sigma2: "" };
const EMPTY_T_ONE = { n: "", sampleMean: "", mu0: "", s: "" };
const EMPTY_T_TWO = { n1: "", mean1: "", s1: "", n2: "", mean2: "", s2: "" };

/* ---------- Examples taken from the lesson slides ---------- */

interface Example {
  label: string;
  kind: TestKind;
  tail: Tail;
  alpha: Alpha;
  values: Record<string, string>;
}

const EXAMPLES: Example[] = [
  {
    label: "Z · Luggage weight (one-sample, two-tailed)",
    kind: "z-one",
    tail: "two",
    alpha: 0.05,
    values: { n: "50", sampleMean: "38", mu0: "40", sigma: "9.5" },
  },
  {
    label: "Z · Cereal boxes (one-sample, two-tailed)",
    kind: "z-one",
    tail: "two",
    alpha: 0.05,
    values: { n: "36", sampleMean: "495", mu0: "500", sigma: "10" },
  },
  {
    label: "Z · Test scores above 75 (one-sample, right-tailed)",
    kind: "z-one",
    tail: "right",
    alpha: 0.05,
    values: { n: "100", sampleMean: "78", mu0: "75", sigma: "8" },
  },
  {
    label: "Z · Full-time vs working students (two-sample, two-tailed)",
    kind: "z-two",
    tail: "two",
    alpha: 0.05,
    // The lesson gives variances 10.5 and 8.5, so σ = √variance.
    values: { n1: "50", mean1: "95", sigma1: "3.2404", n2: "50", mean2: "88", sigma2: "2.9155" },
  },
  {
    label: "t · Light bulb life span (one-sample, left-tailed)",
    kind: "t-one",
    tail: "left",
    alpha: 0.05,
    values: { n: "20", sampleMean: "700", mu0: "725", s: "40" },
  },
  {
    label: "t · Coffee shop waiting time (one-sample, left-tailed)",
    kind: "t-one",
    tail: "left",
    alpha: 0.05,
    values: { n: "25", sampleMean: "3.6", mu0: "4", s: "0.8" },
  },
  {
    label: "t · Public vs private school (two-sample, two-tailed)",
    kind: "t-two",
    tail: "two",
    alpha: 0.05,
    // The lesson gives variances 48 and 38, so s = √variance.
    values: { n1: "10", mean1: "86", s1: "6.928203", n2: "12", mean2: "88", s2: "6.164414" },
  },
  {
    label: "t · Teaching methods A (sample 1) vs B (sample 2), B higher (left-tailed)",
    kind: "t-two",
    tail: "left",
    alpha: 0.05,
    values: { n1: "30", mean1: "75", s1: "8", n2: "35", mean2: "78", s2: "7" },
  },
];

/* ---------- Small reusable pieces ---------- */

/** A row of buttons where exactly one is selected (like tabs). */
function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-sm font-semibold text-slate-700">{label}</p>
      <div
        role="radiogroup"
        aria-label={label}
        className="inline-flex w-full rounded-xl border border-slate-200 bg-slate-100/80 p-1"
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={`flex min-h-10 flex-1 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-1 ${
                active
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** A labelled number box (keeps the form code short). */
function NumberField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <Field label={label} htmlFor={id}>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        className={inputClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </Field>
  );
}

const FORMULA_HINTS: Record<TestKind, string> = {
  "z-one": "Formula: z = (x̄ − μ₀) / (σ / √n)",
  "z-two": "Formula: z = (x̄₁ − x̄₂) / √(σ₁²/n₁ + σ₂²/n₂). If your problem gives variances, use σ = √variance.",
  "t-one": "Formula: t = (x̄ − μ₀) / (s / √n), with df = n − 1",
  "t-two":
    "Formula (pooled): t = (x̄₁ − x̄₂) / (sp·√(1/n₁ + 1/n₂)), with df = n₁ + n₂ − 2. If your problem gives variances, use s = √variance.",
};

type Family = "z" | "t";
type SampleCount = "one" | "two";

export default function HypothesisTesting() {
  const [kind, setKind] = useState<TestKind>("z-one");
  const [alpha, setAlpha] = useState<Alpha>(0.05);
  const [tail, setTail] = useState<Tail>("two");
  const [h0, setH0] = useState("");
  const [h1, setH1] = useState("");
  const [zOne, setZOne] = useState(EMPTY_Z_ONE);
  const [zTwo, setZTwo] = useState(EMPTY_Z_TWO);
  const [tOne, setTOne] = useState(EMPTY_T_ONE);
  const [tTwo, setTTwo] = useState(EMPTY_T_TWO);
  const [equalVariances, setEqualVariances] = useState(true);
  const [selectedExample, setSelectedExample] = useState("");

  // The selected test is made of two choices: Z or t, and one or two samples.
  const family: Family = kind.startsWith("z") ? "z" : "t";
  const sampleCount: SampleCount = kind.endsWith("one") ? "one" : "two";

  function chooseFamily(next: Family) {
    setKind(`${next}-${sampleCount}` as TestKind);
  }

  function chooseSampleCount(next: SampleCount) {
    setKind(`${family}-${next}` as TestKind);
  }

  function loadExample(index: number) {
    const example = EXAMPLES[index];
    if (!example) return;
    setKind(example.kind);
    setTail(example.tail);
    setAlpha(example.alpha);
    setH0("");
    setH1("");
    if (example.kind === "z-one") setZOne({ ...EMPTY_Z_ONE, ...example.values });
    if (example.kind === "z-two") setZTwo({ ...EMPTY_Z_TWO, ...example.values });
    if (example.kind === "t-one") setTOne({ ...EMPTY_T_ONE, ...example.values });
    if (example.kind === "t-two") {
      setTTwo({ ...EMPTY_T_TWO, ...example.values });
      setEqualVariances(true);
    }
  }

  function clearAll() {
    setSelectedExample("");
    setH0("");
    setH1("");
    setZOne(EMPTY_Z_ONE);
    setZTwo(EMPTY_Z_TWO);
    setTOne(EMPTY_T_ONE);
    setTTwo(EMPTY_T_TWO);
  }

  const activeValues = { "z-one": zOne, "z-two": zTwo, "t-one": tOne, "t-two": tTwo }[kind];
  const nothingEntered = Object.values(activeValues).every(isBlank);

  const outcome: Validation<TestOutcome> = useMemo(() => {
    switch (kind) {
      case "z-one":
        return runOneSampleZTest({ h0, h1, alpha, tail, ...zOne });
      case "z-two":
        return runTwoSampleZTest({ h0, h1, alpha, tail, ...zTwo });
      case "t-one":
        return runOneSampleTTest({ h0, h1, alpha, tail, ...tOne });
      case "t-two":
        return runTwoSampleTTest({ h0, h1, alpha, tail, equalVariances, ...tTwo });
    }
  }, [kind, h0, h1, alpha, tail, zOne, zTwo, tOne, tTwo, equalVariances]);

  const result = outcome.ok ? outcome.value : null;
  const isOneSample = sampleCount === "one";
  const isT = family === "t";
  const statName = isT ? "t" : "z";

  const symbol = tail === "left" ? "<" : tail === "right" ? ">" : "≠";
  const h0Placeholder = isOneSample ? "Leave blank for μ = μ₀" : "Leave blank for μ₁ = μ₂";
  const h1Placeholder = isOneSample ? `Leave blank for μ ${symbol} μ₀` : `Leave blank for μ₁ ${symbol} μ₂`;

  return (
    <div className="mx-auto w-full max-w-5xl min-w-0">
      <header className="mb-7 border-b border-slate-200/80 pb-6 sm:mb-8 sm:pb-7">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Hypothesis Testing
        </h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600 sm:mt-3 sm:text-base sm:leading-7">
          Test a claim about a population mean using the Z-test or the t-test. Choose the test, set the significance level, enter your sample values, and read the decision.
        </p>
      </header>

      <div className="space-y-6">
        {/* ---------------- Inputs ---------------- */}
        <Card
          title="1. Set up the test"
          className="border-slate-200/90 shadow-[0_12px_28px_rgba(15,23,42,0.045)]"
        >
          {/* Choose the test: Z or t, one or two samples */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Segmented<Family>
              label="Type of test"
              value={family}
              onChange={chooseFamily}
              options={[
                { value: "z", label: "Z-Test" },
                { value: "t", label: "T-Test" },
              ]}
            />
            <Segmented<SampleCount>
              label="Number of samples"
              value={sampleCount}
              onChange={chooseSampleCount}
              options={[
                { value: "one", label: "One-sample" },
                { value: "two", label: "Two-sample" },
              ]}
            />
          </div>

          <div className="mb-4 mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 sm:max-w-xl">
              <Field label="Load an example:" htmlFor="example">
                <select
                  id="example"
                  className={inputClass}
                  value={selectedExample}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedExample(value);
                    if (value !== "") loadExample(Number(value));
                  }}
                >
                  <option value="" disabled hidden>Choose an example…</option>
                  {EXAMPLES.map((example, index) => (
                    <option key={example.label} value={index}>
                      {example.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <button type="button" className={`${secondaryButton} w-full whitespace-nowrap sm:w-auto`} onClick={clearAll}>
              <Eraser className="h-4 w-4" /> Clear inputs
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Test type (tails)" htmlFor="tail">
              <select
                id="tail"
                className={inputClass}
                value={tail}
                onChange={(e) => setTail(e.target.value as Tail)}
              >
                {(Object.keys(TAIL_LABELS) as Tail[]).map((t) => (
                  <option key={t} value={t}>
                    {TAIL_LABELS[t]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Significance level (α)" htmlFor="alpha">
              <select
                id="alpha"
                className={inputClass}
                value={alpha}
                onChange={(e) => setAlpha(Number(e.target.value) as Alpha)}
              >
                {ALPHA_OPTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a.toFixed(2)}
                  </option>
                ))}
              </select>
            </Field>
            {kind === "t-two" && (
              <div className="sm:col-span-2">
                <Field
                  label="Variances"
                  htmlFor="variances"
                  hint="Pooled is the usual method when the two variances are assumed equal."
                >
                  <select
                    id="variances"
                    className={inputClass}
                    value={equalVariances ? "equal" : "unequal"}
                    onChange={(e) => setEqualVariances(e.target.value === "equal")}
                  >
                    <option value="equal">Assume equal variances (pooled)</option>
                    <option value="unequal">Do not assume equal variances (Welch)</option>
                  </select>
                </Field>
              </div>
            )}
            <Field label="Null hypothesis (H₀)" htmlFor="h0">
              <input
                id="h0"
                type="text"
                className={inputClass}
                value={h0}
                onChange={(e) => setH0(e.target.value)}
                placeholder={h0Placeholder}
              />
            </Field>
            <Field label="Alternative hypothesis (H₁)" htmlFor="h1">
              <input
                id="h1"
                type="text"
                className={inputClass}
                value={h1}
                onChange={(e) => setH1(e.target.value)}
                placeholder={h1Placeholder}
              />
            </Field>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
            <h4 className="mb-3 text-sm font-semibold text-slate-900">
              {isT ? "t-test" : "Z-test"} · {isOneSample ? "one-sample data" : "two-sample data"}
            </h4>
            <div className="mb-5 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3.5 sm:p-4">
              <p className="wrap-break-word text-sm leading-6 text-slate-700">{FORMULA_HINTS[kind]}</p>
            </div>

            {kind === "z-one" && (
              <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <NumberField id="n" label="Sample size (n)" value={zOne.n} onChange={(v) => setZOne({ ...zOne, n: v })} placeholder="e.g. 50" />
                <NumberField id="xbar" label="Sample mean (x̄)" value={zOne.sampleMean} onChange={(v) => setZOne({ ...zOne, sampleMean: v })} placeholder="e.g. 38" />
                <NumberField id="mu0" label="Hypothesized mean (μ₀)" value={zOne.mu0} onChange={(v) => setZOne({ ...zOne, mu0: v })} placeholder="e.g. 40" />
                <NumberField id="sigma" label="Population std. deviation (σ)" value={zOne.sigma} onChange={(v) => setZOne({ ...zOne, sigma: v })} placeholder="e.g. 9.5" />
              </div>
            )}

            {kind === "t-one" && (
              <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <NumberField id="tn" label="Sample size (n)" value={tOne.n} onChange={(v) => setTOne({ ...tOne, n: v })} placeholder="e.g. 20" />
                <NumberField id="txbar" label="Sample mean (x̄)" value={tOne.sampleMean} onChange={(v) => setTOne({ ...tOne, sampleMean: v })} placeholder="e.g. 700" />
                <NumberField id="tmu0" label="Hypothesized mean (μ₀)" value={tOne.mu0} onChange={(v) => setTOne({ ...tOne, mu0: v })} placeholder="e.g. 725" />
                <NumberField id="ts" label="Sample std. deviation (s)" value={tOne.s} onChange={(v) => setTOne({ ...tOne, s: v })} placeholder="e.g. 40" />
              </div>
            )}

            {kind === "z-two" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <fieldset className="min-w-0 space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <legend className="px-1 text-sm font-semibold text-slate-800">Sample 1</legend>
                  <NumberField id="n1" label="Sample size (n₁)" value={zTwo.n1} onChange={(v) => setZTwo({ ...zTwo, n1: v })} placeholder="e.g. 50" />
                  <NumberField id="mean1" label="Sample mean (x̄₁)" value={zTwo.mean1} onChange={(v) => setZTwo({ ...zTwo, mean1: v })} placeholder="e.g. 95" />
                  <NumberField id="sigma1" label="Population std. deviation (σ₁)" value={zTwo.sigma1} onChange={(v) => setZTwo({ ...zTwo, sigma1: v })} placeholder="e.g. 3.2404" />
                </fieldset>
                <fieldset className="min-w-0 space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <legend className="px-1 text-sm font-semibold text-slate-800">Sample 2</legend>
                  <NumberField id="n2" label="Sample size (n₂)" value={zTwo.n2} onChange={(v) => setZTwo({ ...zTwo, n2: v })} placeholder="e.g. 50" />
                  <NumberField id="mean2" label="Sample mean (x̄₂)" value={zTwo.mean2} onChange={(v) => setZTwo({ ...zTwo, mean2: v })} placeholder="e.g. 88" />
                  <NumberField id="sigma2" label="Population std. deviation (σ₂)" value={zTwo.sigma2} onChange={(v) => setZTwo({ ...zTwo, sigma2: v })} placeholder="e.g. 2.9155" />
                </fieldset>
              </div>
            )}

            {kind === "t-two" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <fieldset className="min-w-0 space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <legend className="px-1 text-sm font-semibold text-slate-800">Sample 1</legend>
                  <NumberField id="tn1" label="Sample size (n₁)" value={tTwo.n1} onChange={(v) => setTTwo({ ...tTwo, n1: v })} placeholder="e.g. 10" />
                  <NumberField id="tmean1" label="Sample mean (x̄₁)" value={tTwo.mean1} onChange={(v) => setTTwo({ ...tTwo, mean1: v })} placeholder="e.g. 86" />
                  <NumberField id="ts1" label="Sample std. deviation (s₁)" value={tTwo.s1} onChange={(v) => setTTwo({ ...tTwo, s1: v })} placeholder="e.g. 6.9282" />
                </fieldset>
                <fieldset className="min-w-0 space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <legend className="px-1 text-sm font-semibold text-slate-800">Sample 2</legend>
                  <NumberField id="tn2" label="Sample size (n₂)" value={tTwo.n2} onChange={(v) => setTTwo({ ...tTwo, n2: v })} placeholder="e.g. 12" />
                  <NumberField id="tmean2" label="Sample mean (x̄₂)" value={tTwo.mean2} onChange={(v) => setTTwo({ ...tTwo, mean2: v })} placeholder="e.g. 88" />
                  <NumberField id="ts2" label="Sample std. deviation (s₂)" value={tTwo.s2} onChange={(v) => setTTwo({ ...tTwo, s2: v })} placeholder="e.g. 6.1644" />
                </fieldset>
              </div>
            )}

            <div className="mt-5">
              {isT ? (
                <Notice tone="info" title="Requirements for the t-test">
                  The t-test is used when the population standard deviation is unknown (so the sample
                  standard deviation s is used), especially for small samples (n &lt; 30 in the lesson).
                  It assumes the population is approximately normal.
                  {kind === "t-two" && " The two samples must be independent of each other."}
                </Notice>
              ) : (
                <Notice tone="info" title="Requirements for the Z-test">
                  The Z-test needs a known population standard deviation and a random sample from a
                  normal population (or a large sample, n ≥ 30 in the lesson).
                  {kind === "z-two" && " The two samples must be independent of each other."}
                </Notice>
              )}
            </div>
          </div>
        </Card>

        {/* ---------------- States ---------------- */}
        {nothingEntered && (
          <EmptyState title="No values entered yet">
            Fill in the sample values above, or choose an example from the lesson, to see the test
            statistic, the decision, and the graph.
          </EmptyState>
        )}

        {!nothingEntered && !outcome.ok && (
          <Notice tone="error" title="Please check your inputs">
            <ul className="list-disc space-y-0.5 pl-5">
              {outcome.errors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </Notice>
        )}

        {/* ---------------- Results ---------------- */}
        {!nothingEntered && result && (
          <>
            <Card
              title="2. Test results"
              subtitle={result.testName}
              className="border-slate-200/90 shadow-[0_12px_28px_rgba(15,23,42,0.045)]"
            >
              <div className="mb-5 grid gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="min-w-0 wrap-break-word rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 text-sm leading-6 text-slate-700">
                  <span className="font-semibold text-indigo-700">H₀: </span>
                  {result.h0}
                </div>
                <div className="min-w-0 wrap-break-word rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm leading-6 text-slate-700">
                  <span className="font-semibold text-slate-900">H₁: </span>
                  {result.h1}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm leading-6 text-slate-700 sm:p-5">
                <p className="wrap-break-word font-medium text-slate-900">{result.formula}</p>
                <p className="mt-2 wrap-break-word">{result.substitution}</p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <Stat
                  label={`${statName.toUpperCase()}-test statistic`}
                  value={fmt(result.statistic)}
                  sub={result.df !== null ? `df = ${fmt(result.df, 2)}` : undefined}
                />
                <Stat label="Significance level (α)" value={result.alpha.toFixed(2)} sub={TAIL_LABELS[result.tail]} />
                <Stat
                  label={
                    result.criticalValues.length > 1
                      ? `Critical ${statName.toUpperCase()} values`
                      : `Critical ${statName.toUpperCase()} value`
                  }
                  value={result.criticalValues.map((c) => fmt(c, 4)).join(" and ")}
                />
                <Stat label="Rejection region" value={result.rejectionRegion} />
              </div>

              <div
                className={`mt-4 rounded-lg border p-4 ${
                  result.reject ? "border-rose-200 bg-rose-50" : "border-indigo-200 bg-indigo-50"
                }`}
              >
                <p className={`text-xs font-semibold uppercase tracking-wide ${result.reject ? "text-rose-700" : "text-indigo-700"}`}>
                  Decision
                </p>
                <p className={`mt-2 text-xl font-bold tracking-tight ${result.reject ? "text-rose-700" : "text-indigo-800"} sm:text-2xl`}>
                  {result.decision}
                </p>
                <p className={`mt-3 border-t pt-3 text-sm leading-6 ${result.reject ? "border-rose-200 text-rose-700" : "border-indigo-200 text-indigo-800"}`}>
                  {result.interpretation}
                </p>
              </div>

              {result.warnings.length > 0 && (
                <div className="mt-4 space-y-2">
                  {result.warnings.map((w) => (
                    <Notice key={w} tone="warning">
                      {w}
                    </Notice>
                  ))}
                </div>
              )}

              <details className="group mt-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-sm sm:p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-2 py-2 font-semibold text-slate-800 marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
                  Assumptions of this test
                  <ChevronDown className="h-4 w-4 shrink-0 text-indigo-600 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <ul className="mt-3 space-y-2 border-t border-slate-200 pt-3 text-slate-700">
                  {result.assumptions.map((a) => (
                    <li key={a} className="flex items-start gap-3 rounded-xl bg-white px-3 py-3 leading-6">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" aria-hidden="true" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </details>
            </Card>

            <Card
              title={`3. ${isT ? "t-distribution" : "Normal distribution"} graph`}
              subtitle="The acceptance and rejection regions are shaded. The vertical indigo line is your test statistic."
              className="border-slate-200/90 shadow-[0_12px_28px_rgba(15,23,42,0.045)]"
            >
              <NormalDistributionChart
                statistic={result.statistic}
                symbol={result.statisticName}
                df={result.df}
                criticalValues={result.criticalValues}
                tail={result.tail}
                alpha={result.alpha}
              />
            </Card>
          </>
        )}
      </div>
    </div>
  );
}