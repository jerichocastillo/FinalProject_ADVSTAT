import type { ReactNode } from "react";

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Educational tool
          </p>
          <h1 className="mt-1 text-xl font-bold text-slate-900">Statistical Analysis System</h1>
        </div>
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </section>
      </div>
    </main>
  );
}