"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Info,
  LayoutDashboard,
  FlaskConical,
  LogIn,
  LogOut,
  LoaderCircle,
  TrendingUp,
  UserPlus,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";

export type SectionId = "dashboard" | "regression" | "hypothesis" | "about";

export const SECTIONS: { id: SectionId; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "regression", label: "Simple Linear Regression", icon: TrendingUp },
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
  const router = useRouter();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const logoutDialogRef = useRef<HTMLDialogElement>(null);
  const signOutInProgressRef = useRef(false);

  useEffect(() => {
    const dialog = logoutDialogRef.current;
    if (logoutDialogOpen && dialog && !dialog.open) {
      dialog.showModal();
    }
  }, [logoutDialogOpen]);

  async function handleSignOut() {
    if (signOutInProgressRef.current) return;

    signOutInProgressRef.current = true;
    setIsSigningOut(true);
    setLogoutError(null);

    try {
      await signOut({ redirect: false, callbackUrl: "/login" });
      router.replace("/login");
    } catch (error) {
      console.error("Sign out failed:", error);
      setLogoutError("We couldn't log you out. Please try again.");
      signOutInProgressRef.current = false;
      setIsSigningOut(false);
    }
  }

  return (
    <>
      {/* Dark overlay behind the drawer on small screens */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/20 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-80 shrink-0 flex-col border-r border-slate-200 bg-white shadow-[8px_0_24px_rgba(15,23,42,0.04)] lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Main navigation"
      >
        <div className="flex items-start justify-between gap-2 border-b border-slate-200 px-5 py-5">
          <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-[9px] font-bold tracking-[-0.08em] text-white shadow-[0_10px_20px_rgba(79,70,229,0.18)]">
              ADVSTAT
            </div>
            <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-600">
                Advanced Statistics
              </p>
              <h1 className="mt-1 text-base font-semibold leading-5 text-slate-900">
                Statistical Analysis System
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors duration-150 hover:bg-slate-50 lg:hidden"
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
                className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 shadow-[inset_0_0_0_1px_rgba(79,70,229,0.08)]"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    isActive ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                </span>
                <span className="min-w-0 flex-1 whitespace-nowrap">{label}</span>
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    isActive ? "bg-indigo-600" : "bg-transparent"
                  }`}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </nav>

        {/* Account section */}
        <div className="border-t border-slate-200 p-3">
          {user ? (
            <div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm">
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
                onClick={() => {
                  setLogoutError(null);
                  setLogoutDialogOpen(true);
                }}
                className="mt-2 flex min-h-11 w-full items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-left text-sm font-medium text-rose-700 transition-all duration-200 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-800"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Log out</span>
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Link
                href="/login"
                className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900"
              >
                <LogIn className="h-4 w-4 shrink-0" />
                <span>Log in</span>
              </Link>
              <Link
                href="/register"
                className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900"
              >
                <UserPlus className="h-4 w-4 shrink-0" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>

      </aside>

      {logoutDialogOpen && (
        <dialog
          ref={logoutDialogRef}
          aria-labelledby="logout-dialog-title"
          aria-describedby="logout-dialog-description"
          aria-modal="true"
          className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-2xl backdrop:bg-slate-900/60 sm:p-7"
          onCancel={(event) => {
            if (isSigningOut) event.preventDefault();
          }}
          onClose={() => setLogoutDialogOpen(false)}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 id="logout-dialog-title" className="mt-5 text-lg font-semibold text-slate-800">
            Are you sure you want to log out?
          </h2>
          <p id="logout-dialog-description" className="mt-2 text-sm leading-6 text-slate-500">
            You will need to log in again to access your account and use the statistical tools.
          </p>

          {logoutError && (
            <p role="alert" className="mt-4 text-sm text-rose-700">
              {logoutError}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              autoFocus
              disabled={isSigningOut}
              onClick={() => setLogoutDialogOpen(false)}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSigningOut}
              onClick={handleSignOut}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSigningOut && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {isSigningOut ? "Logging out…" : "Log out"}
            </button>
          </div>
        </dialog>
      )}
    </>
  );
}