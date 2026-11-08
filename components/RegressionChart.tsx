"use client";

import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Point } from "@/lib/regression";
import { ChartLoading } from "./ui";
import { useMounted } from "./useMounted";

interface RegressionChartProps {
  points: Point[];
  slope: number;
  intercept: number;
  minX: number;
  maxX: number;
  /** Optional predicted point shown on the line */
  prediction: Point | null;
}

export default function RegressionChart({
  points,
  slope,
  intercept,
  minX,
  maxX,
  prediction,
}: RegressionChartProps) {
  const mounted = useMounted();
  if (!mounted) return <ChartLoading height={360} />;

  // The fitted line is drawn from the smallest to the largest X value (ŷ = A + Bx).
  const linePoints: Point[] = [
    { x: minX, y: intercept + slope * minX },
    { x: maxX, y: intercept + slope * maxX },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3 sm:p-4">
      <p className="mb-3 text-center text-sm font-semibold leading-5 text-slate-800">
        Scatter plot of Y versus X with the fitted regression line
      </p>
      <div role="img" aria-label="Scatter plot of the entered data with the regression line" className="h-[320px] w-full min-w-0 sm:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 36, left: 4 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
            <XAxis
              type="number"
              dataKey="x"
              name="X"
              domain={["auto", "auto"]}
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={{ stroke: "#cbd5e1" }}
              tickLine={{ stroke: "#cbd5e1" }}
              label={{ value: "X (independent variable)", position: "insideBottom", offset: -22, fontSize: 12, fill: "#64748b" }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Y"
              domain={["auto", "auto"]}
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={{ stroke: "#cbd5e1" }}
              tickLine={{ stroke: "#cbd5e1" }}
              width={48}
              label={{ value: "Y (dependent variable)", angle: -90, position: "insideLeft", offset: 4, fontSize: 12, fill: "#64748b", style: { textAnchor: "middle" } }}
            />
            <Tooltip
              cursor={{ stroke: "#818cf8", strokeDasharray: "3 3" }}
              contentStyle={{
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
                fontSize: 12,
              }}
            />
            <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: 12, color: "#475569" }} />
            <Scatter
              name="Data points"
              data={points}
              fill="#4f46e5"
              isAnimationActive={false}
            />
            <Scatter
              name="Regression line"
              data={linePoints}
              fill="#4f46e5"
              stroke="#4f46e5"
              line={{ stroke: "#4f46e5", strokeWidth: 2.5 }}
              lineType="joint"
              legendType="line"
              shape={() => <g />}
              isAnimationActive={false}
            />
            {prediction && (
              <Scatter
                name="Predicted value"
                data={[prediction]}
                fill="#4f46e5"
                shape="diamond"
                isAnimationActive={false}
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
