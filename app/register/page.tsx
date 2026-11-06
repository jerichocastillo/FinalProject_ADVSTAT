import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = { title: "Register · Statistical Analysis System" };

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/");

  return <RegisterForm />;
}