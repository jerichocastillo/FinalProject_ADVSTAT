import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { safeCallbackUrl } from "@/lib/validation";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = { title: "Log in · Statistical Analysis System" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; registered?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/");

  const { callbackUrl, registered } = await searchParams;

  return <LoginForm callbackUrl={safeCallbackUrl(callbackUrl)} justRegistered={registered === "1"} />;
}