import { NextResponse } from "next/server";
import { db } from "@/db";
import { milestones } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { subjectId, title, description, order, level } = await req.json();

    if (!subjectId || !title) {
      return NextResponse.json(
        { error: "Subject ID and title are required" },
        { status: 400 }
      );
    }

    const newId = crypto.randomUUID();
    await db.insert(milestones).values({
      id: newId,
      subjectId,
      title: title.trim(),
      description: description?.trim() || "",
      order: Number(order) || 1,
      level: level || "Beginner",
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, milestoneId: newId });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create milestone" },
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
      return NextResponse.json({ error: "Milestone ID required" }, { status: 400 });
    }

    await db.delete(milestones).where(eq(milestones.id, id));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete milestone" },
      { status: 403 }
    );
  }
}
