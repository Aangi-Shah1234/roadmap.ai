import { NextResponse } from "next/server";
import { db, ensureDatabaseReady } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await ensureDatabaseReady();
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    const hashedPassword = await bcrypt.hash(password, 10);

    const isOwnerOrAdmin =
      role === "admin" ||
      email.toLowerCase().trim() === "aangi3shah@gmail.com" ||
      email.toLowerCase().trim() === "alexa@gmail.com" ||
      email.toLowerCase().trim().includes("admin");

    const effectiveRole: "admin" | "learner" = isOwnerOrAdmin ? "admin" : "learner";

    if (existingUser.length > 0) {
      const userRole = isOwnerOrAdmin ? "admin" : (existingUser[0].role as "admin" | "learner");
      await db
        .update(users)
        .set({
          name: name.trim() || existingUser[0].name,
          password: hashedPassword,
          role: userRole,
        })
        .where(eq(users.id, existingUser[0].id));

      await setSessionCookie({
        userId: existingUser[0].id,
        email: existingUser[0].email,
        name: name.trim() || existingUser[0].name,
        role: userRole,
      });

      return NextResponse.json({
        success: true,
        user: {
          id: existingUser[0].id,
          name: name.trim() || existingUser[0].name,
          email: existingUser[0].email,
          role: userRole,
        },
      });
    }

    const userId = crypto.randomUUID();

    await db.insert(users).values({
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: effectiveRole,
      createdAt: new Date(),
    });

    await setSessionCookie({
      userId,
      email: email.toLowerCase().trim(),
      name: name.trim(),
      role: effectiveRole,
    });

    return NextResponse.json({
      success: true,
      user: { id: userId, name, email, role: effectiveRole },
    });
  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to register" },
      { status: 500 }
    );
  }
}
