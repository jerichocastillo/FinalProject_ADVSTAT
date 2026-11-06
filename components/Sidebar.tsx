"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Info,
  LayoutDashboard,
  FlaskConical,
  LogIn,
  LogOut,
  TrendingUp,
  UserPlus,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";

export type SectionId = "dashboard" | "regression" | "hypothesis" | "about";

export const SECTIONS: { id: SectionId; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "regression", label: "Simple Linear Regression and Correlation", icon: TrendingUp },
  { id: "hypothesis", label: "Hypothesis Testing", icon: FlaskConical },
  { id: "about", label: "About", icon: Info },
];

export interface AccountUser {
  name: string | null;
  email: string | null;
}

interface SidebarProps {
  active: SectionId;
  onNavigate: (id: SectionId) => void;
  open: boolean;
  onClose: () => void;
  /** null means nobody is logged in */
  user: AccountUser | null;
}

export default function Sidebar({ active, onNavigate, open, onClose, user }: SidebarProps) {
  return (
    <>
      {/* Dark overlay behind the drawer on small screens */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Main navigation"
      >
        <div className="flex items-start justify-between gap-2 border-b border-slate-200 px-5 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Educational tool
            </p>
            <h1 className="mt-1 text-lg font-bold leading-tight text-slate-900">
              Statistical Analysis System
            </h1>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {SECTIONS.map(({ id, label, icon: Icon }) => {
            const isActive = id === active;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                aria-current={isActive ? "page" : undefined}
                className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Account section */}
        <div className="border-t border-slate-200 p-3">
          {user ? (
            <div>
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                  <UserRound className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {user.name || user.email}
                  </p>
                  {user.name && user.email && (
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Log out</span>
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <Link
                href="/login"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <LogIn className="h-4 w-4 shrink-0" />
                <span>Log in</span>
              </Link>
              <Link
                href="/register"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <UserPlus className="h-4 w-4 shrink-0" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>

        <p className="border-t border-slate-200 px-5 py-4 text-xs text-slate-500">
          Calculations run in your browser and are not saved.
        </p>
      </aside>
    </>
  );
}