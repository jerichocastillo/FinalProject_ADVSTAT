import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { normalizeEmail, validateEmail } from "@/lib/validation";

// Used so that "unknown email" takes about as long as "wrong password".
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password-1", 12);

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 }, // 7 days
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = normalizeEmail(typeof credentials?.email === "string" ? credentials.email : "");
        const password = typeof credentials?.password === "string" ? credentials.password : "";

        if (validateEmail(email) !== null || password === "") return null;

        try {
          const user = await prisma.user.findUnique({ where: { email } });
          const hash = user?.password ?? DUMMY_HASH;
          const passwordMatches = await bcrypt.compare(password, hash);

          if (!user || !passwordMatches) return null;

          // Only these fields ever go into the session. The password hash never does.
          return { id: user.id, name: user.name, email: user.email };
        } catch (error) {
          console.error("Login lookup failed:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string | null | undefined;
        session.user.email = token.email as string | null | undefined;
      }
      return session;
    },
  },
};