import type { ReactNode } from "react";
import { Card } from "@/components/ui";

export default function AuthShell({
  title,
  subtitle,
  brandLabel = "Educational tool",
  children,
}: {
  title: string;
  subtitle: string;
  brandLabel?: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col bg-slate-50 px-4 py-8 sm:py-10">
      <div className="my-auto w-full max-w-md self-center">
        <div className="mb-7 text-center sm:mb-8">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-[9px] font-bold tracking-[-0.08em] text-white shadow-[0_10px_20px_rgba(79,70,229,0.18)]">
            ADVSTAT
          </div>
          <p className="block w-full text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-600">
            {brandLabel}
          </p>
          <h1 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900">
            Statistical Analysis System
          </h1>
        </div>
        <Card className="rounded-2xl border-slate-200/90 p-5 shadow-[0_20px_48px_rgba(15,23,42,0.075)] sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
          <div className="mt-6 sm:mt-7">{children}</div>
        </Card>
      </div>
    </main>
  );
}