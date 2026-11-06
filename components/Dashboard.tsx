"use client";

import { ArrowRight, FlaskConical, TrendingUp } from "lucide-react";
import type { SectionId } from "./Sidebar";
import { Notice, PageHeader, primaryButton } from "./ui";

export default function Dashboard({ onNavigate }: { onNavigate: (id: SectionId) => void }) {
  const tools: {
    id: SectionId;
    title: string;
    description: string;
    points: string[];
    icon: typeof TrendingUp;
  }[] = [
    {
      id: "regression",
      title: "Simple Linear Regression and Correlation",
      description:
        "Enter paired X and Y values to find the least-squares line, the correlation coefficient r, and predictions.",
      points: ["Slope, intercept, and equation", "Pearson r with strength and direction", "Scatter plot with fitted line"],
      icon: TrendingUp,
    },
    {
      id: "hypothesis",
      title: "Hypothesis Testing",
      description:
        "Run a one-sample or two-sample Z-test, see the critical values, and read a plain-language decision.",
      points: ["Left, right, and two-tailed tests", "α = 0.10, 0.05, or 0.01", "Normal curve with rejection region"],
      icon: FlaskConical,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Statistical Analysis System"
        description="Perform statistical calculations, interpret the results, and view the graphs, all in one simple place."
      />

      <div className="mb-6">
        <Notice tone="info" title="For educational use">
          This system is intended for educational statistical calculations. It follows the
          formulas taught in class so that you can check your own work and understand each step.
        </Notice>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {tools.map(({ id, title, description, points, icon: Icon }) => (
          <article
            key={id}
            className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-slate-600">{description}</p>
            <ul className="mt-3 space-y-1 text-sm text-slate-500">
              {points.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="text-indigo-500">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 pt-1">
              <button type="button" className={primaryButton} onClick={() => onNavigate(id)}>
                Open tool <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
