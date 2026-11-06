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
import { ChartLoading } from "./ui";
import { useMounted } from "./useMounted";

interface NormalDistributionChartProps {
  zStat: number;
  /** Critical value(s) from the same calculation that makes the decision */
  criticalValues: number[];
  tail: Tail;
  alpha: number;
}

interface CurvePoint {
  z: number;
  density: number;
  rejection: number | null;
}

export default function NormalDistributionChart({
  zStat,
  criticalValues,
  tail,
  alpha,
}: NormalDistributionChartProps) {
  const mounted = useMounted();

  const { data, lo, hi, ticks } = useMemo(() => {
    const lo = Math.min(-4, Math.floor(zStat) - 1);
    const hi = Math.max(4, Math.ceil(zStat) + 1);

    // The shaded region begins exactly at the critical value(s).
    const leftCut = tail === "right" ? null : criticalValues[0];
    const rightCut = tail === "left" ? null : criticalValues[criticalValues.length - 1];

    const xs = new Set<number>();
    const step = (hi - lo) > 12 ? 0.1 : 0.05;
    for (let z = lo; z <= hi + 1e-9; z += step) xs.add(Number(z.toFixed(4)));
    criticalValues.forEach((c) => xs.add(c));

    const data: CurvePoint[] = Array.from(xs)
      .sort((a, b) => a - b)
      .map((z) => {
        const density = normalPdf(z);
        const inLeft = leftCut !== null && z <= leftCut + 1e-9;
        const inRight = rightCut !== null && z >= rightCut - 1e-9;
        return { z, density, rejection: inLeft || inRight ? density : null };
      });

    const ticks: number[] = [];
    for (let t = Math.ceil(lo); t <= Math.floor(hi); t++) ticks.push(t);
    return { data, lo, hi, ticks };
  }, [zStat, criticalValues, tail]);

  if (!mounted) return <ChartLoading height={340} />;

  const criticalLabel = criticalValues.map((c) => fmt(c, 4)).join(" and ");

  return (
    <div>
      <p className="mb-2 text-center text-sm font-semibold text-slate-800">
        Standard normal curve (α = {alpha}, {tail === "two" ? "two-tailed" : tail === "left" ? "left-tailed" : "right-tailed"})
      </p>
      <div role="img" aria-label="Standard normal curve with the rejection region shaded and the test statistic marked" className="h-85 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 24, right: 24, bottom: 30, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="z"
              type="number"
              domain={[lo, hi]}
              ticks={ticks}
              tick={{ fontSize: 12 }}
              allowDataOverflow
              label={{ value: "z", position: "insideBottom", offset: -16, fontSize: 12 }}
            />
            <YAxis
              domain={[0, 0.45]}
              tick={{ fontSize: 12 }}
              tickFormatter={(v: number) => fmt(v, 2)}
              width={48}
              label={{ value: "Density", angle: -90, position: "insideLeft", offset: 4, fontSize: 12, style: { textAnchor: "middle" } }}
            />
            <Tooltip
              formatter={(value) => (typeof value === "number" ? fmt(value, 4) : String(value))}
              labelFormatter={(label) => `z = ${fmt(Number(label), 3)}`}
            />
            <Area
              type="monotone"
              dataKey="density"
              name="Standard normal curve"
              stroke="#334155"
              strokeWidth={2}
              fill="#e2e8f0"
              fillOpacity={0.5}
              dot={false}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="rejection"
              name="Rejection region"
              stroke="none"
              fill="#e11d48"
              fillOpacity={0.55}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
            {criticalValues.map((c) => (
              <ReferenceLine
                key={c}
                x={c}
                stroke="#e11d48"
                strokeDasharray="5 4"
                strokeWidth={1.5}
                label={{ value: `z = ${fmt(c, 4)}`, position: "top", fill: "#be123c", fontSize: 11 }}
              />
            ))}
            <ReferenceLine
              x={zStat}
              stroke="#4f46e5"
              strokeWidth={2.5}
              label={{ value: `z* = ${fmt(zStat, 3)}`, position: "insideTopRight", fill: "#4338ca", fontSize: 11 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Simple legend that always matches what is drawn */}
      <ul className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-slate-600">
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-5 bg-slate-700" /> Standard normal curve
        </li>
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-rose-600/60" /> Rejection region
        </li>
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-0 w-5 border-t-2 border-dashed border-rose-600" /> Critical value ({criticalLabel})
        </li>
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-5 bg-indigo-600" /> Test statistic (z* = {fmt(zStat, 3)})
        </li>
      </ul>
    </div>
  );
}
