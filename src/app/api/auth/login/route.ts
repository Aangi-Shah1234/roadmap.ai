import { NextResponse } from "next/server";
import { db, ensureDatabaseReady } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await ensureDatabaseReady();
    const { email, password, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Determine role: if logged in via Admin tab or user email is owner/admin
    const isOwnerOrAdminEmail =
      user.email.toLowerCase() === "aangi3shah@gmail.com" ||
      user.email.toLowerCase().includes("admin") ||
      user.role === "admin";

    const effectiveRole: "admin" | "learner" =
      role === "admin" || isOwnerOrAdminEmail ? "admin" : "learner";

    if (user.role !== effectiveRole) {
      await db
        .update(users)
        .set({ role: effectiveRole })
        .where(eq(users.id, user.id));
    }

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: effectiveRole,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: effectiveRole,
      },
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to log in" },
      { status: 500 }
    );
  }
}
