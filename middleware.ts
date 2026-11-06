import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (token) return NextResponse.next();

  // Private API routes answer with 401 instead of redirecting.
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  const { pathname, search } = request.nextUrl;
  if (pathname !== "/") loginUrl.searchParams.set("callbackUrl", pathname + search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Everything is protected EXCEPT: NextAuth's own routes, registration, the login/register pages, and static files.
  matcher: ["/((?!api/auth|api/register|login|register|_next/|favicon\\.ico).*)"],
};