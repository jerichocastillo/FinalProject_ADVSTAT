export type FieldName = "name" | "email" | "password" | "confirmPassword";
export type FieldErrors = Partial<Record<FieldName, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Emails are stored in lowercase so "A@x.com" and "a@x.com" are the same account. */
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function validateEmail(email: string): string | null {
  if (email === "") return "Email address is required.";
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) return "Enter a valid email address.";
  return null;
}

export function validatePassword(password: string): string | null {
  if (password === "") return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  // bcrypt only uses the first 72 bytes of a password.
  if (new TextEncoder().encode(password).length > 72) {
    return "Password is too long (72 bytes maximum).";
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "Password must contain at least one letter and one number.";
  }
  return null;
}

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export type RegistrationResult =
  | { ok: true; data: { name: string; email: string; password: string } }
  | { ok: false; errors: FieldErrors };

/** Validates the registration form. Used by the form (instant feedback) and by the server (the real check). */
export function validateRegistration(input: Record<string, unknown>): RegistrationResult {
  const name = asText(input.name).trim().replace(/\s+/g, " ");
  const email = normalizeEmail(asText(input.email));
  const password = asText(input.password);
  const confirmPassword = asText(input.confirmPassword);

  const errors: FieldErrors = {};

  if (name === "") errors.name = "Full name is required.";
  else if (name.length < 2) errors.name = "Full name must be at least 2 characters.";
  else if (name.length > 80) errors.name = "Full name must be 80 characters or fewer.";

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;

  if (confirmPassword === "") errors.confirmPassword = "Please confirm your password.";
  else if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { name, email, password } };
}

/** Only allows redirects to pages inside this app (blocks "https://evil.com" and "//evil.com"). */
export function safeCallbackUrl(value: string | undefined): string {
  if (value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")) {
    return value;
  }
  return "/";
}