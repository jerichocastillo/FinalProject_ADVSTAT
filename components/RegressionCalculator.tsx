"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronDown, Eraser, FlaskConical, Plus, Trash2 } from "lucide-react";
import { fmt, fmtParen, isBlank, parseNumber } from "@/lib/format";
import {
  computeRegression,
  describeCorrelation,
  formatEquation,
  parseRows,
  predictY,
  type RawRow,
} from "@/lib/regression";
import RegressionChart from "./RegressionChart";
import {
  Card,
  EmptyState,
  Field,
  inputClass,
  Notice,
  primaryButton,
  secondaryButton,
  Stat,
} from "./ui";

const SAMPLE: { x: number; y: number }[] = [
  { x: 2, y: 65 },
  { x: 3, y: 75 },
  { x: 4, y: 82 },
  { x: 5, y: 88 },
  { x: 6, y: 92 },
  { x: 7, y: 98 },
  { x: 8, y: 105 },
  { x: 9, y: 112 },
  { x: 10, y: 118 },
  { x: 11, y: 122 },
];

const STARTING_ROWS = 4;

export default function RegressionCalculator() {
  const nextId = useRef(STARTING_ROWS + 1);
  const [rows, setRows] = useState<RawRow[]>(() =>
    Array.from({ length: STARTING_ROWS }, (_, i) => ({ id: i + 1, x: "", y: "" }))
  );
  const [predictX, setPredictX] = useState("");


  function updateRow(id: number, field: "x" | "y", value: string) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  }

  function addRow() {
    setRows((current) => [...current, { id: nextId.current++, x: "", y: "" }]);
  }

  function removeRow(id: number) {
    setRows((current) => (current.length > 2 ? current.filter((row) => row.id !== id) : current));
  }

  function clearData() {
    setRows(Array.from({ length: STARTING_ROWS }, () => ({ id: nextId.current++, x: "", y: "" })));
    setPredictX("");
  }

  function loadSample() {
    setRows(SAMPLE.map((p) => ({ id: nextId.current++, x: String(p.x), y: String(p.y) })));
    setPredictX("12");
  }


  const parsed = useMemo(() => parseRows(rows), [rows]);

  const outcome = useMemo(() => {
    if (parsed.errors.length > 0) return null;
    if (parsed.points.length === 0) return null;
    return computeRegression(parsed.points);
  }, [parsed]);

  const result = outcome && outcome.ok ? outcome.result : null;
  const correlation = result ? describeCorrelation(result.r, result.rNote) : null;

  const prediction = useMemo(() => {
    if (!result) return null;
    if (isBlank(predictX)) return { state: "empty" as const };
    const x = parseNumber(predictX);
    if (x === null) return { state: "invalid" as const };
    return {
      state: "ok" as const,
      x,
      y: predictY(result, x),
      extrapolated: x < result.minX || x > result.maxX,
    };
  }, [result, predictX]);

  const predictedPoint = prediction && prediction.state === "ok" ? { x: prediction.x, y: prediction.y } : null;

  return (
    <div className="mx-auto w-full max-w-5xl min-w-0">
      <header className="mb-7 border-b border-slate-200/80 pb-6 sm:mb-8 sm:pb-7">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Simple Linear Regression
        </h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600 sm:mt-3 sm:text-base sm:leading-7">
          Enter pairs of X (independent) and Y (dependent) values. The calculator finds the least-squares regression line ŷ = A + Bx and the Pearson correlation coefficient r.
        </p>
      </header>

      <div className="space-y-6">
        <Card
          title="1. Enter your data"
          subtitle="Type one X and one Y value per row. Empty rows are ignored. At least two complete pairs are needed."
          className="border-slate-200/90 shadow-[0_12px_28px_rgba(15,23,42,0.045)]"
        >
          <div className="mb-4 flex flex-wrap gap-2.5">
            <button type="button" className={`${primaryButton} flex-1 whitespace-nowrap sm:flex-none`} onClick={addRow}>
              <Plus className="h-4 w-4" /> Add row
            </button>
            <button type="button" className={`${secondaryButton} flex-1 whitespace-nowrap sm:flex-none`} onClick={loadSample}>
              <FlaskConical className="h-4 w-4" /> Load sample data
            </button>
            <button type="button" className={`${secondaryButton} flex-1 whitespace-nowrap sm:flex-none`} onClick={clearData}>
              <Eraser className="h-4 w-4" /> Clear data
            </button>
          </div>

          <div className="max-h-96 overflow-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full table-fixed text-sm">
              <thead className="sticky top-0 z-10 bg-slate-100/90 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="w-12 px-3 py-3">#</th>
                  <th className="px-3 py-3">X</th>
                  <th className="px-3 py-3">Y</th>
                  <th className="w-14 px-2 py-3 text-right">
                    <span className="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/90">
                {rows.map((row, index) => (
                  <tr key={row.id} className="transition-colors duration-150 hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-500 tabular-nums">{index + 1}</td>
                    <td className="px-2 py-2 sm:px-3">
                      <input
                        type="text"
                        inputMode="decimal"
                        aria-label={`Row ${index + 1} X value`}
                        className={`${inputClass} min-w-0 rounded-lg px-2.5 tabular-nums`}
                        value={row.x}
                        onChange={(e) => updateRow(row.id, "x", e.target.value)}
                        placeholder="X"
                      />
                    </td>
                    <td className="px-2 py-2 sm:px-3">
                      <input
                        type="text"
                        inputMode="decimal"
                        aria-label={`Row ${index + 1} Y value`}
                        className={`${inputClass} min-w-0 rounded-lg px-2.5 tabular-nums`}
                        value={row.y}
                        onChange={(e) => updateRow(row.id, "y", e.target.value)}
                        placeholder="Y"
                      />
                    </td>
                    <td className="px-2 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        disabled={rows.length <= 2}
                        aria-label={`Remove row ${index + 1}`}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors duration-150 hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            Valid pairs so far: <strong className="font-semibold tabular-nums">{parsed.points.length}</strong>
          </p>
        </Card>

        {parsed.errors.length > 0 && (
          <Notice tone="error" title="Please fix these rows before results can be calculated">
            <ul className="list-disc space-y-0.5 pl-5">
              {parsed.errors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </Notice>
        )}

        {parsed.errors.length === 0 && parsed.points.length === 0 && (
          <EmptyState title="No data yet">
            Enter your X and Y values above, or press “Load sample data” to see how the calculator
            works.
          </EmptyState>
        )}

        {outcome && !outcome.ok && (
          <Notice tone="error" title="Cannot calculate the regression">
            {outcome.message}
          </Notice>
        )}

        {result && correlation && (
          <>
            <Card
              title="2. Results"
              subtitle="Rounded to 4 decimal places for display."
              className="border-slate-200/90 shadow-[0_12px_28px_rgba(15,23,42,0.045)]"
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
                <Stat label="Valid pairs (n)" value={String(result.n)} />
                <Stat label="Mean of X (x̄)" value={fmt(result.meanX)} />
                <Stat label="Mean of Y (ȳ)" value={fmt(result.meanY)} />
                <Stat label="Slope (B)" value={fmt(result.slope)} />
                <Stat label="Y-intercept (A)" value={fmt(result.intercept)} />
                <Stat label="Correlation (r)" value={result.r === null ? "Not defined" : fmt(result.r)} />
              </div>

              <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4 sm:p-5">
                <p className="text-xs font-medium text-indigo-700">
                  Regression equation
                </p>
                <p className="mt-2 wrap-break-word text-xl font-semibold tracking-tight text-indigo-800 tabular-nums sm:text-2xl">
                  {formatEquation(result.intercept, result.slope)}
                </p>
                <p className="mt-3 text-sm leading-6 text-indigo-800">
                  For every 1-unit increase in X, the predicted Y changes by {fmt(result.slope)} units.
                  When X = 0, the predicted Y is {fmt(result.intercept)}.
                </p>
              </div>

              <div className="mt-5">
                {prediction?.state === "empty" && (
                  <p className="text-sm text-slate-500">Enter an X value to see the predicted Y.</p>
                )}
                {result.r === null ? (
                  <Notice tone="warning" title="Correlation cannot be calculated">
                    {correlation.summary}
                  </Notice>
                ) : (
                  <Notice tone="info" title={`Correlation: ${correlation.strength}, ${correlation.direction}`}>
                    {correlation.summary} Correlation describes how closely the points follow a straight
                    line; it does not prove that X causes Y.
                  </Notice>
                )}
              </div>

              <details className="group mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-sm sm:p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-2 py-2 font-semibold text-slate-800 marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
                  Show the calculation steps
                  <ChevronDown className="h-4 w-4 shrink-0 text-indigo-600 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="mt-3 space-y-2.5 text-slate-700">
                  <p className="wrap-break-word rounded-xl border border-slate-200/80 bg-white px-3 py-3 text-left leading-6 tabular-nums sm:px-4">Σ(x − x̄)(y − ȳ) = {fmt(result.sxy)}</p>
                  <p className="wrap-break-word rounded-xl border border-slate-200/80 bg-white px-3 py-3 text-left leading-6 tabular-nums sm:px-4">Σ(x − x̄)² = {fmt(result.sxx)}</p>
                  <p className="wrap-break-word rounded-xl border border-slate-200/80 bg-white px-3 py-3 text-left leading-6 tabular-nums sm:px-4">Σ(y − ȳ)² = {fmt(result.syy)}</p>
                  <p className="wrap-break-word rounded-xl border border-slate-200/80 bg-white px-3 py-3 text-left leading-6 tabular-nums sm:px-4">
                    B = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)² = {fmt(result.sxy)} / {fmt(result.sxx)} ={" "}
                    <strong className="font-semibold text-indigo-700">{fmt(result.slope)}</strong>
                  </p>
                  <p className="wrap-break-word rounded-xl border border-slate-200/80 bg-white px-3 py-3 text-left leading-6 tabular-nums sm:px-4">
                    A = ȳ − B·x̄ = {fmt(result.meanY)} − {fmtParen(result.slope)}({fmt(result.meanX)}) ={" "}
                    <strong className="font-semibold text-indigo-700">{fmt(result.intercept)}</strong>
                  </p>
                  {result.r !== null ? (
                    <p className="wrap-break-word rounded-xl border border-slate-200/80 bg-white px-3 py-3 text-left leading-6 tabular-nums sm:px-4">
                      r = Σ(x − x̄)(y − ȳ) / √[Σ(x − x̄)² · Σ(y − ȳ)²] = {fmt(result.sxy)} / √[
                      {fmt(result.sxx)} × {fmt(result.syy)}] = <strong className="font-semibold text-indigo-700">{fmt(result.r)}</strong>
                    </p>
                  ) : (
                    <p className="wrap-break-word rounded-xl border border-slate-200/80 bg-white px-3 py-3 text-left leading-6 tabular-nums sm:px-4">r: not defined (see the warning above).</p>
                  )}
                </div>
              </details>
            </Card>

            <Card
              title="3. Scatter plot and regression line"
              className="border-slate-200/90 shadow-[0_12px_28px_rgba(15,23,42,0.045)]"
            >
              <RegressionChart
                points={parsed.points}
                slope={result.slope}
                intercept={result.intercept}
                minX={result.minX}
                maxX={result.maxX}
                prediction={predictedPoint}
              />
            </Card>

            <Card
              title="4. Predict Y from X"
              subtitle="Enter an X value to use in the regression equation."
              className="border-slate-200/90 shadow-[0_12px_28px_rgba(15,23,42,0.045)]"
            >
              <div className="max-w-xs">
                <Field label="X value" htmlFor="predict-x">
                  <input
                    id="predict-x"
                    type="text"
                    inputMode="decimal"
                    className={inputClass}
                    value={predictX}
                    onChange={(e) => setPredictX(e.target.value)}
                    placeholder="e.g. 12"
                  />
                </Field>
              </div>

              <div className="mt-4">
                {prediction?.state === "empty" && (
                  <p className="text-sm text-slate-500">Enter an X value to see the predicted Y.</p>
                )}
                {prediction?.state === "invalid" && (
                  <Notice tone="error">Enter a valid number for X.</Notice>
                )}
                {prediction?.state === "ok" && (
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm leading-6 text-slate-700">
                      <p>ŷ = A + Bx</p>
                      <p className="mt-1">
                        ŷ = {fmt(result.intercept)} + {fmtParen(result.slope)}({fmt(prediction.x)})
                      </p>
                      <p className="mt-2 text-sm font-semibold tabular-nums text-slate-900">
                        Predicted Y = {fmt(prediction.y)}
                      </p>
                    </div>
                    {prediction.extrapolated && (
                      <Notice tone="warning" title="Extrapolation">
                        This X value is outside the range of your data ({fmt(result.minX)} to{" "}
                        {fmt(result.maxX)}). Predictions outside the data range may be unreliable.
                      </Notice>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
