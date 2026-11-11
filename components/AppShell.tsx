"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar, { type SectionId, SECTIONS, type AccountUser } from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import RegressionCalculator from "@/components/RegressionCalculator";
import HypothesisTesting from "@/components/HypothesisTesting";
import About from "@/components/About";

export default function AppShell({ user }: { user: AccountUser }) {
  const [section, setSection] = useState<SectionId>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  const current = SECTIONS.find((s) => s.id === section);

  function navigate(id: SectionId) {
    setSection(id);
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="min-h-screen bg-transparent lg:flex">
      <Sidebar
        active={section}
        onNavigate={navigate}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200/80 bg-white/85 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors duration-150 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="truncate text-sm font-semibold text-slate-900">
            {current?.label}
          </span>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-10">
          <div hidden={section !== "dashboard"}>
            <Dashboard onNavigate={navigate} />
          </div>
          <div hidden={section !== "regression"}>
            <RegressionCalculator />
          </div>
          <div hidden={section !== "hypothesis"}>
            <HypothesisTesting />
          </div>
          <div hidden={section !== "about"}>
            <About />
          </div>
        </main>
      </div>
    </div>
  );
}