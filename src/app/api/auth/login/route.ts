import { NextResponse } from "next/server";
import { db, ensureDatabaseReady } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { setSessionCookie } from "@/lib/auth";

import crypto from "crypto";

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

    const cleanEmail = email.toLowerCase().trim();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, cleanEmail))
      .limit(1);

    const isCoreAdminEmail =
      cleanEmail === "alexa@gmail.com" ||
      cleanEmail === "aangi3shah@gmail.com" ||
      cleanEmail === "admin@roadmap.ai";

    if (!user) {
      // Auto-provision known admins or any admin login using master password
      if (isCoreAdminEmail || (role === "admin" && password === "AdminPassword123!")) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newId = crypto.randomUUID();
        const userName =
          cleanEmail === "alexa@gmail.com"
            ? "Alexa"
            : cleanEmail === "aangi3shah@gmail.com"
            ? "Aangi Shah"
            : "Admin User";

        await db.insert(users).values({
          id: newId,
          name: userName,
          email: cleanEmail,
          password: hashedPassword,
          role: "admin",
          createdAt: new Date(),
        });

        await setSessionCookie({
          userId: newId,
          email: cleanEmail,
          name: userName,
          role: "admin",
        });

        return NextResponse.json({
          success: true,
          user: {
            id: newId,
            name: userName,
            email: cleanEmail,
            role: "admin",
          },
        });
      }

      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    let isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      // Master password fallback for core admins
      if (isCoreAdminEmail && password === "AdminPassword123!") {
        const newHash = await bcrypt.hash("AdminPassword123!", 10);
        await db
          .update(users)
          .set({ password: newHash, role: "admin" })
          .where(eq(users.id, user.id));
        isValid = true;
      } else {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }
    }

    // Determine role: if logged in via Admin tab or user email is owner/admin
    const isOwnerOrAdminEmail =
      user.email.toLowerCase() === "aangi3shah@gmail.com" ||
      user.email.toLowerCase() === "alexa@gmail.com" ||
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
