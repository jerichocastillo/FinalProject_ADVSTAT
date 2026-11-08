"use client";

import { ArrowRight, FlaskConical, Info, TrendingUp } from "lucide-react";
import type { SectionId } from "./Sidebar";
import { Card, primaryButton } from "./ui";

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
      title: "Simple Linear Regression",
      description:
        "Enter paired X and Y values to find the least-squares line, the correlation coefficient r, and predictions.",
      points: ["Slope, intercept, and equation", "Pearson r with strength and direction", "Scatter plot with fitted line"],
      icon: TrendingUp,
    },
    {
      id: "hypothesis",
      title: "Hypothesis Testing",
      description:
        "Run a Z-test or a t-test (one-sample or two-sample), see the critical values, and read a plain-language decision.",
      points: ["Z-test and t-test", "Left, right, and two-tailed, at α = 0.10, 0.05, or 0.01", "Distribution curve with rejection region"],
      icon: FlaskConical,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl min-w-0">
      <header className="mb-7 border-b border-slate-200/80 pb-6 sm:mb-8 sm:pb-7">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Statistical Analysis System
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:mt-3 sm:text-base sm:leading-7">
          Perform statistical calculations, interpret the results, and view the graphs, all in one simple place.
        </p>
      </header>

      <div className="mb-7 rounded-2xl border border-indigo-200/90 bg-indigo-50/80 p-4 shadow-sm sm:mb-8 sm:p-5">
        <div className="flex items-start gap-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-white text-indigo-600 shadow-sm">
            <Info className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="pt-1 text-sm leading-6 text-indigo-950">
            Simple Linear Regression is a statistical method used to determine the relationship between two variables and predict outcomes based on their relationship. Hypothesis Testing is a statistical method used to evaluate claims about a population by analyzing sample data and determining whether there is sufficient evidence to support or reject a hypothesis.
          </p>
        </div>
      </div>

      <div className="grid items-stretch gap-5 md:grid-cols-2 md:gap-6">
        {tools.map(({ id, title, description, points, icon: Icon }) => (
          <Card
            key={id}
            className="group flex h-full flex-col border-slate-200/90 p-5 shadow-[0_10px_26px_rgba(15,23,42,0.045)] transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_16px_32px_rgba(15,23,42,0.075)] sm:p-6"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">{title}</h2>
            <p className="mt-2.5 text-sm leading-6 text-slate-600">{description}</p>
            <ul className="mt-4 flex-1 space-y-3 text-sm leading-6 text-slate-600">
              {points.map((p) => (
                <li key={p} className="flex min-w-0 items-start gap-2.5 text-left">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-slate-100 pt-5">
              <button
                type="button"
                className={`${primaryButton} min-w-36 justify-between`}
                onClick={() => onNavigate(id)}
              >
                Open tool <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}