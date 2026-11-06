import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { validateRegistration } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  // The server checks everything again, even though the form already did.
  const parsed = validateRegistration(body as Record<string, unknown>);
  if (!parsed.ok) {
    return NextResponse.json(
      { message: "Please correct the highlighted fields.", errors: parsed.errors },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;
  const duplicate = {
    message: "An account with this email already exists.",
    errors: { email: "An account with this email already exists." },
  };

  try {
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) return NextResponse.json(duplicate, { status: 409 });

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true },
    });

    return NextResponse.json({ message: "Account created. Please log in." }, { status: 201 });
  } catch (error) {
    // Two people registering the same email at the same moment: the unique index catches it.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(duplicate, { status: 409 });
    }
    console.error("Registration failed:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}