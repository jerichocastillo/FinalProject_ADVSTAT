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
    <div>
      <p className="mb-2 text-center text-sm font-semibold text-slate-800">
        Scatter plot of Y versus X with the fitted regression line
      </p>
      <div role="img" aria-label="Scatter plot of the entered data with the regression line" className="h-90 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 24, bottom: 36, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              dataKey="x"
              name="X"
              domain={["auto", "auto"]}
              tick={{ fontSize: 12 }}
              label={{ value: "X (independent variable)", position: "insideBottom", offset: -22, fontSize: 12 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Y"
              domain={["auto", "auto"]}
              tick={{ fontSize: 12 }}
              width={56}
              label={{ value: "Y (dependent variable)", angle: -90, position: "insideLeft", offset: 4, fontSize: 12, style: { textAnchor: "middle" } }}
            />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Legend verticalAlign="top" height={30} />
            <Scatter
              name="Data points"
              data={points}
              fill="#4f46e5"
              isAnimationActive={false}
            />
            <Scatter
              name="Regression line"
              data={linePoints}
              fill="#e11d48"
              stroke="#e11d48"
              line={{ stroke: "#e11d48", strokeWidth: 2 }}
              lineType="joint"
              legendType="line"
              shape={() => <g />}
              isAnimationActive={false}
            />
            {prediction && (
              <Scatter
                name="Predicted value"
                data={[prediction]}
                fill="#f59e0b"
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
