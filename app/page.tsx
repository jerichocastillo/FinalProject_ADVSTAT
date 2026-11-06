import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AppShell from "@/components/AppShell";

export default async function Home() {
  // Second layer of protection (the middleware is the first).
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <AppShell
      user={{
        name: session.user.name ?? null,
        email: session.user.email ?? null,
      }}
    />
  );
}