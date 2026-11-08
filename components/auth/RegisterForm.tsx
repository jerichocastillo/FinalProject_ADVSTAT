"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Field, inputClass, Notice, primaryButton } from "@/components/ui";
import { validateRegistration, type FieldErrors } from "@/lib/validation";
import AuthShell from "./AuthShell";
import PasswordInput from "./PasswordInput";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-xs text-rose-700">
      {message}
    </p>
  );
}

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const check = validateRegistration({ name, email, password, confirmPassword });
    if (!check.ok) {
      setFieldErrors(check.errors);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });
      const data: { message?: string; errors?: FieldErrors } = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        setFieldErrors(data.errors ?? {});
        setFormError(data.message ?? "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/login?registered=1");
    } catch {
      setFormError("Could not reach the server. Check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create an account"
      subtitle="Register to use the statistical tools."
      brandLabel="Advanced Statistics"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError && <Notice tone="error">{formError}</Notice>}

        <Field label="Full name" htmlFor="name">
          <input
            id="name"
            type="text"
            autoComplete="name"
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Juan Dela Cruz"
            aria-invalid={fieldErrors.name ? true : undefined}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
          />
          <FieldError id="name-error" message={fieldErrors.name} />
        </Field>

        <Field label="Email address" htmlFor="email">
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
          />
          <FieldError id="email-error" message={fieldErrors.email} />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          hint="At least 8 characters, with at least one letter and one number."
        >
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            invalid={!!fieldErrors.password}
            describedBy={fieldErrors.password ? "password-error" : undefined}
          />
          <FieldError id="password-error" message={fieldErrors.password} />
        </Field>

        <Field label="Confirm password" htmlFor="confirmPassword">
          <PasswordInput
            id="confirmPassword"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            invalid={!!fieldErrors.confirmPassword}
            describedBy={fieldErrors.confirmPassword ? "confirm-error" : undefined}
          />
          <FieldError id="confirm-error" message={fieldErrors.confirmPassword} />
        </Field>

        <button type="submit" className={`${primaryButton} w-full`} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4" /> Creating account…
            </>
          ) : (
            "Register"
          )}
        </button>

        <p className="border-t border-slate-100 pt-4 text-center text-sm text-slate-700">
          Already have an account?{" "}
          <Link
            href="/login"
            className="rounded-lg font-medium text-indigo-600 transition-colors duration-150 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          >
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}