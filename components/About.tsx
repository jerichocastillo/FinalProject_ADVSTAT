import type { ReactNode } from "react";
import {
  BookOpen,
  FlaskConical,
  Info,
  Lightbulb,
  Mail,
  TrendingUp,
  UserRound,
} from "lucide-react";

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Info;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.045)] sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

const methodCardClass =
  "rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5";
const detailItemClass =
  "flex min-w-0 items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4";

export default function About() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <header className="mb-8 border-b border-slate-200/80 pb-6 sm:mb-9 sm:pb-7">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          About
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:mt-3 sm:text-base sm:leading-7">
          What this system is, who it is for, and what it can do.
        </p>
      </header>

      <div className="space-y-5 sm:space-y-6">
        <SectionCard title="What Is This System?" icon={Info}>
          <p className="text-sm leading-7 text-slate-600 sm:text-base">
            The Statistical Analysis System is a web-based tool that helps students perform
            statistical calculations, interpret the results, and view graphs through a simple,
            organized interface.
          </p>
        </SectionCard>

        <SectionCard title="Supported Statistical Methods" icon={BookOpen}>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            <div className={`${methodCardClass} border-indigo-100 bg-indigo-50/50`}>
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100">
                  <TrendingUp className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="pt-1 text-sm font-semibold leading-5 text-slate-900">
                  Simple Linear Regression and Correlation
                </h3>
              </div>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600 marker:text-indigo-400">
                <li>Least-squares slope (B) and intercept (A)</li>
                <li>Regression equation ŷ = A + Bx</li>
                <li>Pearson correlation coefficient (r) and its strength</li>
                <li>Prediction of Y for a given X</li>
                <li>Scatter plot with the fitted line</li>
              </ul>
            </div>
            <div className={`${methodCardClass} border-blue-100 bg-blue-50/50`}>
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm ring-1 ring-blue-100">
                  <FlaskConical className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="pt-1 text-sm font-semibold leading-5 text-slate-900">
                  Hypothesis Testing
                </h3>
              </div>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600 marker:text-indigo-400">
                <li>One-sample and two-sample Z-tests (σ known)</li>
                <li>One-sample and two-sample t-tests (σ unknown)</li>
                <li>Left-, right-, and two-tailed tests at α = 0.10, 0.05, 0.01</li>
                <li>Critical values, rejection region, and decision</li>
                <li>Normal or t-distribution curve with the rejection region shaded</li>
              </ul>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Good To Know" icon={Lightbulb}>
          <ul className="grid gap-3 sm:gap-4">
            <li className={detailItemClass}>
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" aria-hidden="true" />
              <span className="text-sm leading-6 text-slate-600">
                The Z-test needs known population standard deviation(s) and a random sample. The lesson
                uses it for samples of size 30 or more.
              </span>
            </li>
            <li className={detailItemClass}>
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" aria-hidden="true" />
              <span className="text-sm leading-6 text-slate-600">
                The t-test is used when the population standard deviation is unknown, especially for
                small samples. It assumes the population is approximately normal.
              </span>
            </li>
            <li className={detailItemClass}>
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" aria-hidden="true" />
              <span className="text-sm leading-6 text-slate-600">
                A correlation shows that two variables move together. It does not prove that one
                causes the other.
              </span>
            </li>
          </ul>
        </SectionCard>

        <SectionCard title="Developer Information" icon={UserRound}>
          <dl className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <div className={detailItemClass}>
              <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" aria-hidden="true" />
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">Jericho M. Castillo</dd>
              </div>
            </div>
            <div className={detailItemClass}>
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" aria-hidden="true" />
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Program / Section
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">BSIT - 3B</dd>
              </div>
            </div>
            <div className={detailItemClass}>
              <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" aria-hidden="true" />
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Course
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">Advanced Statistics</dd>
              </div>
            </div>
            <div className={detailItemClass}>
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" aria-hidden="true" />
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </dt>
                <dd className="mt-1 break-all text-sm font-medium text-slate-800">
                  s2024101612@firstasia.edu.ph
                </dd>
              </div>
            </div>
          </dl>
        </SectionCard>
      </div>
    </div>
  );
}
