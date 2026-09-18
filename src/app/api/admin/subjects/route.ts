import { NextResponse } from "next/server";
import { db } from "@/db";
import { subjects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { title, slug, description, icon, category } = await req.json();

    if (!title || !slug || !description) {
      return NextResponse.json(
        { error: "Title, slug, and description are required" },
        { status: 400 }
      );
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");

    const existing = await db
      .select()
      .from(subjects)
      .where(eq(subjects.slug, cleanSlug))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "A track with this slug already exists" },
        { status: 400 }
      );
    }

    const newId = crypto.randomUUID();
    await db.insert(subjects).values({
      id: newId,
      title: title.trim(),
      slug: cleanSlug,
      description: description.trim(),
      icon: icon || "Terminal",
      category: category || "Engineering",
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      subject: { id: newId, title, slug: cleanSlug },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create subject" },
      { status: 403 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Subject ID required" }, { status: 400 });
    }

    await db.delete(subjects).where(eq(subjects.id, id));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete subject" },
      { status: 403 }
    );
  }
}
