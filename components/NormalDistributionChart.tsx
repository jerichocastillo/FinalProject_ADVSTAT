"use client";

import { useMemo } from "react";
import {
  Area,
  ComposedChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmt } from "@/lib/format";
import { normalPdf, type Tail } from "@/lib/hypothesis-testing";
import { tPdf } from "@/lib/t-distribution";
import { ChartLoading } from "./ui";
import { useMounted } from "./useMounted";

interface DistributionChartProps {
  /** The calculated test statistic (z or t) */
  statistic: number;
  /** "z" draws the standard normal curve, "t" draws Student's t-distribution */
  symbol: "z" | "t";
  /** Degrees of freedom (needed when symbol is "t") */
  df: number | null;
  /** Critical value(s) from the same calculation that makes the decision */
  criticalValues: number[];
  tail: Tail;
  alpha: number;
}

interface CurvePoint {
  x: number;
  density: number;
  rejection: number | null;
}

const TAIL_NAMES: Record<Tail, string> = {
  left: "left-tailed",
  right: "right-tailed",
  two: "two-tailed",
};

export default function NormalDistributionChart({
  statistic,
  symbol,
  df,
  criticalValues,
  tail,
  alpha,
}: DistributionChartProps) {
  const mounted = useMounted();
  const useT = symbol === "t" && df !== null;

  const { data, lo, hi, ticks } = useMemo(() => {
    const smallestCritical = Math.min(...criticalValues);
    const largestCritical = Math.max(...criticalValues);
    const lo = Math.min(-4, Math.floor(statistic) - 1, Math.floor(smallestCritical) - 1);
    const hi = Math.max(4, Math.ceil(statistic) + 1, Math.ceil(largestCritical) + 1);

    const density = (x: number) => (useT ? tPdf(x, df as number) : normalPdf(x));

    // The shaded region begins exactly at the critical value(s).
    const leftCut = tail === "right" ? null : criticalValues[0];
    const rightCut = tail === "left" ? null : criticalValues[criticalValues.length - 1];

    const xs = new Set<number>();
    const step = Math.max(0.05, (hi - lo) / 300);
    for (let x = lo; x <= hi + 1e-9; x += step) xs.add(Number(x.toFixed(4)));
    criticalValues.forEach((c) => xs.add(c));

    const data: CurvePoint[] = Array.from(xs)
      .sort((a, b) => a - b)
      .map((x) => {
        const d = density(x);
        const inLeft = leftCut !== null && x <= leftCut + 1e-9;
        const inRight = rightCut !== null && x >= rightCut - 1e-9;
        return { x, density: d, rejection: inLeft || inRight ? d : null };
      });

    const tickStep = Math.max(1, Math.ceil((hi - lo) / 12));
    const ticks: number[] = [];
    for (let t = Math.ceil(lo / tickStep) * tickStep; t <= hi; t += tickStep) ticks.push(t);
    return { data, lo, hi, ticks };
  }, [statistic, criticalValues, tail, useT, df]);

  if (!mounted) return <ChartLoading height={340} />;

  const criticalLabel = criticalValues.map((c) => fmt(c, 4)).join(" and ");
  const curveName = useT
    ? `Student's t-distribution (df = ${fmt(df as number, 2)})`
    : "Standard normal curve";

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3 sm:p-4">
      <p className="mb-3 text-center text-sm font-semibold leading-5 text-slate-800">
        {curveName} · α = {alpha}, {TAIL_NAMES[tail]}
      </p>
      <div
        role="img"
        aria-label={`${curveName} with the rejection region shaded and the test statistic marked`}
        className="h-[300px] w-full min-w-0 sm:h-[360px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 24, right: 20, bottom: 30, left: 4 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
            <XAxis
              dataKey="x"
              type="number"
              domain={[lo, hi]}
              ticks={ticks}
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={{ stroke: "#cbd5e1" }}
              tickLine={{ stroke: "#cbd5e1" }}
              allowDataOverflow
              label={{ value: symbol, position: "insideBottom", offset: -16, fontSize: 12, fill: "#64748b" }}
            />
            <YAxis
              domain={[0, 0.45]}
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={{ stroke: "#cbd5e1" }}
              tickLine={{ stroke: "#cbd5e1" }}
              tickFormatter={(v: number) => fmt(v, 2)}
              width={48}
              label={{
                value: "Density",
                angle: -90,
                position: "insideLeft",
                offset: 4,
                fontSize: 12,
                fill: "#64748b",
                style: { textAnchor: "middle" },
              }}
            />
            <Tooltip
              formatter={(value) => (typeof value === "number" ? fmt(value, 4) : String(value))}
              labelFormatter={(label) => `${symbol} = ${fmt(Number(label), 3)}`}
              contentStyle={{
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="density"
              name={curveName}
              stroke="#4f46e5"
              strokeWidth={2.5}
              fill="#eef2ff"
              fillOpacity={0.85}
              dot={false}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="rejection"
              name="Rejection region"
              stroke="none"
              fill="#4f46e5"
              fillOpacity={0.35}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
            {criticalValues.map((c) => (
              <ReferenceLine
                key={c}
                x={c}
                stroke="#ef4444"
                strokeDasharray="5 4"
                strokeWidth={1.5}
                label={{
                  value: `${symbol} = ${fmt(c, 4)}`,
                  position: "top",
                  fill: "#b91c1c",
                  fontSize: 12,
                }}
              />
            ))}
            <ReferenceLine
              x={statistic}
              stroke="#4f46e5"
              strokeWidth={2.5}
              label={{
                value: `${symbol}* = ${fmt(statistic, 3)}`,
                position: "insideTopRight",
                fill: "#4f46e5",
                fontSize: 12,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Simple legend that always matches what is drawn */}
      <ul className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs leading-5 text-slate-600">
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-5 bg-indigo-600" /> {curveName}
        </li>
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-indigo-500/35" /> Rejection region
        </li>
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-0 w-5 border-t-2 border-dashed border-red-500" /> Critical value ({criticalLabel})
        </li>
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-5 bg-indigo-600" /> Test statistic ({symbol}* = {fmt(statistic, 3)})
        </li>
      </ul>
    </div>
  );
}