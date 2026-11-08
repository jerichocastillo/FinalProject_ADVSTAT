import type { ReactNode } from "react";
import { AlertTriangle, Info, XCircle } from "lucide-react";

export const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:ring-offset-0";

export const primaryButton =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(79,70,229,0.18)] transition-all duration-200 hover:bg-indigo-500 hover:shadow-[0_12px_24px_rgba(79,70,229,0.22)] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export const secondaryButton =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-7">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
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
    <section className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.03)] sm:p-5 ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="mt-1 text-sm leading-5 text-slate-500">{subtitle}</p>}
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
    <div className="min-w-0">
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs leading-5 text-slate-500">{hint}</p>}
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex min-h-28 min-w-0 flex-col rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-indigo-700">{label}</p>
      <p className="mt-3 wrap-break-word text-xl font-bold tracking-tight tabular-nums text-slate-900 sm:text-2xl">{value}</p>
      {sub && <p className="mt-1 text-xs leading-5 text-slate-500">{sub}</p>}
    </div>
  );
}

const noticeStyles = {
  error: {
    box: "border-rose-200 bg-rose-50 text-rose-700",
    icon: XCircle,
  },
  warning: {
    box: "border-amber-200 bg-amber-50 text-amber-800",
    icon: AlertTriangle,
  },
  info: {
    box: "border-indigo-200 bg-indigo-50 text-indigo-800",
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
    <div
      role={tone === "error" ? "alert" : undefined}
      className={`flex gap-3 rounded-2xl border p-4 text-sm leading-5 shadow-sm ${box}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        <div className={title ? "mt-1" : ""}>{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <p className="text-base font-semibold text-slate-900">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{children}</p>
    </div>
  );
}

export function ChartLoading({ height = 340 }: { height?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-500 shadow-sm"
      style={{ height }}
      role="status"
    >
      Loading chart…
    </div>
  );
}
