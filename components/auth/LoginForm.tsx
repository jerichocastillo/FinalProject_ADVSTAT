"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Field, inputClass, Notice, primaryButton } from "@/components/ui";
import AuthShell from "./AuthShell";
import PasswordInput from "./PasswordInput";

export default function LoginForm({
  callbackUrl,
  justRegistered,
}: {
  callbackUrl: string;
  justRegistered: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (email.trim() === "" || password === "") {
      setError("Enter your email address and password.");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      router.replace(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Log in" subtitle="Welcome back. Log in to use the statistical tools.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {justRegistered && !error && (
          <Notice tone="info" title="Account created">
            You can now log in with your email and password.
          </Notice>
        )}
        {error && <Notice tone="error">{error}</Notice>}

        <Field label="Email address" htmlFor="email">
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Password" htmlFor="password">
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            placeholder="Your password"
          />
        </Field>

        <button type="submit" className={`${primaryButton} w-full`} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Logging in…
            </>
          ) : (
            "Log in"
          )}
        </button>

        <p className="text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Register
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}