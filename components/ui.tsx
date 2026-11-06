import type { ReactNode } from "react";
import { AlertTriangle, Info, XCircle } from "lucide-react";

/** Shared Tailwind class for text boxes and selects. */
export const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

export const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-50";

export const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50";

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">{description}</p>
    </div>
  );
}

export function Card({
  title,
  subtitle,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 wrap-break-word text-lg font-semibold text-slate-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

const noticeStyles = {
  error: {
    box: "border-red-200 bg-red-50 text-red-800",
    icon: XCircle,
  },
  warning: {
    box: "border-amber-200 bg-amber-50 text-amber-900",
    icon: AlertTriangle,
  },
  info: {
    box: "border-sky-200 bg-sky-50 text-sky-900",
    icon: Info,
  },
} as const;

export function Notice({
  tone,
  title,
  children,
}: {
  tone: keyof typeof noticeStyles;
  title?: string;
  children: ReactNode;
}) {
  const { box, icon: Icon } = noticeStyles[tone];
  return (
    <div role={tone === "error" ? "alert" : undefined} className={`flex gap-3 rounded-lg border p-3 text-sm ${box}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        <div className={title ? "mt-1" : ""}>{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <p className="text-base font-semibold text-slate-800">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{children}</p>
    </div>
  );
}

/** Placeholder shown while a chart waits to load in the browser. */
export function ChartLoading({ height = 320 }: { height?: number }) {
  return (
    <div
      className="flex animate-pulse items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500"
      style={{ height }}
    >
      Loading chart…
    </div>
  );
}
