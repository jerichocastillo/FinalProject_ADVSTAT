"use client";

import { useMemo, useState } from "react";
import { Eraser } from "lucide-react";
import { fmt, isBlank } from "@/lib/format";
import {
  ALPHA_OPTIONS,
  TAIL_LABELS,
  runOneSampleZTest,
  runTwoSampleZTest,
  type Alpha,
  type Tail,
  type TestKind,
} from "@/lib/hypothesis-testing";
import NormalDistributionChart from "./NormalDistributionChart";
import {
  Card,
  EmptyState,
  Field,
  inputClass,
  Notice,
  PageHeader,
  secondaryButton,
  Stat,
} from "./ui";

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
    label: "Luggage weight (one-sample, two-tailed)",
    kind: "one-sample",
    tail: "two",
    alpha: 0.05,
    values: { n: "50", sampleMean: "38", mu0: "40", sigma: "9.5" },
  },
  {
    label: "Cereal boxes (one-sample, two-tailed)",
    kind: "one-sample",
    tail: "two",
    alpha: 0.05,
    values: { n: "36", sampleMean: "495", mu0: "500", sigma: "10" },
  },
  {
    label: "Test scores above 75 (one-sample, right-tailed)",
    kind: "one-sample",
    tail: "right",
    alpha: 0.05,
    values: { n: "100", sampleMean: "78", mu0: "75", sigma: "8" },
  },
  {
    label: "Full-time vs working students (two-sample, two-tailed)",
    kind: "two-sample",
    tail: "two",
    alpha: 0.05,
    // The lesson gives variances 10.5 and 8.5, so σ = √variance (rounded to 4 decimals).
    values: { n1: "50", mean1: "95", sigma1: "3.2404", n2: "50", mean2: "88", sigma2: "2.9155" },
  },
];

const EMPTY_ONE = { n: "", sampleMean: "", mu0: "", sigma: "" };
const EMPTY_TWO = { n1: "", mean1: "", sigma1: "", n2: "", mean2: "", sigma2: "" };

export default function HypothesisTesting() {
  const [kind, setKind] = useState<TestKind>("one-sample");
  const [alpha, setAlpha] = useState<Alpha>(0.05);
  const [tail, setTail] = useState<Tail>("two");
  const [h0, setH0] = useState("");
  const [h1, setH1] = useState("");
  const [one, setOne] = useState(EMPTY_ONE);
  const [two, setTwo] = useState(EMPTY_TWO);

  function loadExample(index: number) {
    const example = EXAMPLES[index];
    if (!example) return;
    setKind(example.kind);
    setTail(example.tail);
    setAlpha(example.alpha);
    setH0("");
    setH1("");
    if (example.kind === "one-sample") {
      setOne({ ...EMPTY_ONE, ...example.values });
    } else {
      setTwo({ ...EMPTY_TWO, ...example.values });
    }
  }

  function clearAll() {
    setH0("");
    setH1("");
    setOne(EMPTY_ONE);
    setTwo(EMPTY_TWO);
  }

  const numericFields = kind === "one-sample" ? Object.values(one) : Object.values(two);
  const nothingEntered = numericFields.every(isBlank);

  const outcome = useMemo(() => {
    if (kind === "one-sample") {
      return runOneSampleZTest({ h0, h1, alpha, tail, ...one });
    }
    return runTwoSampleZTest({ h0, h1, alpha, tail, ...two });
  }, [kind, h0, h1, alpha, tail, one, two]);

  const result = outcome.ok ? outcome.value : null;

  const symbol = tail === "left" ? "<" : tail === "right" ? ">" : "≠";
  const h0Placeholder = kind === "one-sample" ? "Leave blank for μ = μ₀" : "Leave blank for μ₁ = μ₂";
  const h1Placeholder =
    kind === "one-sample" ? `Leave blank for μ ${symbol} μ₀` : `Leave blank for μ₁ ${symbol} μ₂`;

  return (
    <div>
      <PageHeader
        title="Hypothesis Testing"
        description="Test a claim about a population mean using the Z-test. Choose the test, set the significance level, enter your sample values, and read the decision."
      />

      <div className="space-y-5">
        {/* ---------------- Inputs ---------------- */}
        <Card title="1. Set up the test">
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div className="min-w-56 flex-1 sm:max-w-md">
              <Field label="Load an example from the lesson (optional)" htmlFor="example">
                <select
                  id="example"
                  className={inputClass}
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value !== "") loadExample(Number(e.target.value));
                    e.target.value = "";
                  }}
                >
                  <option value="">Choose an example…</option>
                  {EXAMPLES.map((example, index) => (
                    <option key={example.label} value={index}>
                      {example.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <button type="button" className={secondaryButton} onClick={clearAll}>
              <Eraser className="h-4 w-4" /> Clear inputs
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Test" htmlFor="kind">
              <select
                id="kind"
                className={inputClass}
                value={kind}
                onChange={(e) => setKind(e.target.value as TestKind)}
              >
                <option value="one-sample">One-sample Z-test (one mean)</option>
                <option value="two-sample">Two-sample Z-test (two independent means)</option>
              </select>
            </Field>
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
            <div className="hidden sm:block" />
            <Field label="Null hypothesis (H₀)" htmlFor="h0" hint="Optional. Written in words or symbols, e.g. μ = 40.">
              <input
                id="h0"
                type="text"
                className={inputClass}
                value={h0}
                onChange={(e) => setH0(e.target.value)}
                placeholder={h0Placeholder}
              />
            </Field>
            <Field label="Alternative hypothesis (H₁)" htmlFor="h1" hint="Optional. It should match the test type you chose.">
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

          <div className="mt-6 border-t border-slate-100 pt-5">
            <h4 className="mb-1 text-sm font-semibold text-slate-900">
              {kind === "one-sample" ? "One-sample data" : "Two-sample data"}
            </h4>
            <p className="mb-4 text-xs text-slate-500">
              {kind === "one-sample"
                ? "Formula: z = (x̄ − μ₀) / (σ / √n)"
                : "Formula: z = (x̄₁ − x̄₂) / √(σ₁²/n₁ + σ₂²/n₂). If your problem gives variances, use σ = √variance."}
            </p>

            {kind === "one-sample" ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Sample size (n)" htmlFor="n">
                  <input id="n" type="text" inputMode="decimal" className={inputClass} value={one.n}
                    onChange={(e) => setOne({ ...one, n: e.target.value })} placeholder="e.g. 50" />
                </Field>
                <Field label="Sample mean (x̄)" htmlFor="xbar">
                  <input id="xbar" type="text" inputMode="decimal" className={inputClass} value={one.sampleMean}
                    onChange={(e) => setOne({ ...one, sampleMean: e.target.value })} placeholder="e.g. 38" />
                </Field>
                <Field label="Hypothesized mean (μ₀)" htmlFor="mu0">
                  <input id="mu0" type="text" inputMode="decimal" className={inputClass} value={one.mu0}
                    onChange={(e) => setOne({ ...one, mu0: e.target.value })} placeholder="e.g. 40" />
                </Field>
                <Field label="Population std. deviation (σ)" htmlFor="sigma">
                  <input id="sigma" type="text" inputMode="decimal" className={inputClass} value={one.sigma}
                    onChange={(e) => setOne({ ...one, sigma: e.target.value })} placeholder="e.g. 9.5" />
                </Field>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <fieldset className="space-y-4 rounded-lg border border-slate-200 p-4">
                  <legend className="px-1 text-sm font-semibold text-slate-800">Sample 1</legend>
                  <Field label="Sample size (n₁)" htmlFor="n1">
                    <input id="n1" type="text" inputMode="decimal" className={inputClass} value={two.n1}
                      onChange={(e) => setTwo({ ...two, n1: e.target.value })} placeholder="e.g. 50" />
                  </Field>
                  <Field label="Sample mean (x̄₁)" htmlFor="mean1">
                    <input id="mean1" type="text" inputMode="decimal" className={inputClass} value={two.mean1}
                      onChange={(e) => setTwo({ ...two, mean1: e.target.value })} placeholder="e.g. 95" />
                  </Field>
                  <Field label="Population std. deviation (σ₁)" htmlFor="sigma1">
                    <input id="sigma1" type="text" inputMode="decimal" className={inputClass} value={two.sigma1}
                      onChange={(e) => setTwo({ ...two, sigma1: e.target.value })} placeholder="e.g. 3.2404" />
                  </Field>
                </fieldset>
                <fieldset className="space-y-4 rounded-lg border border-slate-200 p-4">
                  <legend className="px-1 text-sm font-semibold text-slate-800">Sample 2</legend>
                  <Field label="Sample size (n₂)" htmlFor="n2">
                    <input id="n2" type="text" inputMode="decimal" className={inputClass} value={two.n2}
                      onChange={(e) => setTwo({ ...two, n2: e.target.value })} placeholder="e.g. 50" />
                  </Field>
                  <Field label="Sample mean (x̄₂)" htmlFor="mean2">
                    <input id="mean2" type="text" inputMode="decimal" className={inputClass} value={two.mean2}
                      onChange={(e) => setTwo({ ...two, mean2: e.target.value })} placeholder="e.g. 88" />
                  </Field>
                  <Field label="Population std. deviation (σ₂)" htmlFor="sigma2">
                    <input id="sigma2" type="text" inputMode="decimal" className={inputClass} value={two.sigma2}
                      onChange={(e) => setTwo({ ...two, sigma2: e.target.value })} placeholder="e.g. 2.9155" />
                  </Field>
                </fieldset>
              </div>
            )}

            <div className="mt-4">
              <Notice tone="info" title="Requirements for the Z-test">
                The Z-test needs a known population standard deviation and a random sample from a normal
                population (or a large sample, n ≥ 30 in the lesson).
                {kind === "two-sample" && " The two samples must be independent of each other."}
              </Notice>
            </div>
          </div>
        </Card>

        {/* ---------------- States ---------------- */}
        {nothingEntered && (
          <EmptyState title="No values entered yet">
            Fill in the sample values above, or choose an example from the lesson, to see the test
            statistic, the decision, and the normal curve.
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
            <Card title="2. Test results" subtitle={result.testName}>
              <div className="mb-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 p-3 text-sm">
                  <span className="font-semibold text-slate-900">H₀: </span>
                  {result.h0}
                </div>
                <div className="rounded-lg border border-slate-200 p-3 text-sm">
                  <span className="font-semibold text-slate-900">H₁: </span>
                  {result.h1}
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-medium text-slate-900">{result.formula}</p>
                <p className="mt-1 wrap-break-word">{result.substitution}</p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat label="Z-test statistic" value={fmt(result.zStat)} />
                <Stat label="Significance level (α)" value={result.alpha.toFixed(2)} sub={TAIL_LABELS[result.tail]} />
                <Stat
                  label={result.criticalValues.length > 1 ? "Critical Z values" : "Critical Z value"}
                  value={result.criticalValues.map((c) => fmt(c, 4)).join(" and ")}
                />
                <Stat label="Rejection region" value={result.rejectionRegion} />
              </div>

              <div
                className={`mt-4 rounded-lg border p-4 ${
                  result.reject ? "border-rose-200 bg-rose-50" : "border-sky-200 bg-sky-50"
                }`}
              >
                <p className={`text-xs font-semibold uppercase tracking-wide ${result.reject ? "text-rose-700" : "text-sky-700"}`}>
                  Decision
                </p>
                <p className={`mt-1 text-xl font-bold ${result.reject ? "text-rose-900" : "text-sky-900"}`}>
                  {result.decision}
                </p>
                <p className={`mt-2 text-sm ${result.reject ? "text-rose-900" : "text-sky-900"}`}>
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

              <details className="mt-4 rounded-lg border border-slate-200 p-3 text-sm">
                <summary className="cursor-pointer font-medium text-slate-800">Assumptions of this test</summary>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
                  {result.assumptions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </details>
            </Card>

            <Card
              title="3. Normal distribution graph"
              subtitle="The shaded area is the rejection region. The indigo line is your test statistic."
            >
              <NormalDistributionChart
                zStat={result.zStat}
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
