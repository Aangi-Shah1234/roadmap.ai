import { NextResponse } from "next/server";
import { db } from "@/db";
import { topics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { milestoneId, title, description, resources, order } = await req.json();

    if (!milestoneId || !title) {
      return NextResponse.json(
        { error: "Milestone ID and title are required" },
        { status: 400 }
      );
    }

    const newId = crypto.randomUUID();
    await db.insert(topics).values({
      id: newId,
      milestoneId,
      title: title.trim(),
      description: description?.trim() || "",
      resources: typeof resources === "string" ? resources : JSON.stringify(resources || []),
      order: Number(order) || 1,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, topicId: newId });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create topic" },
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
      return NextResponse.json({ error: "Topic ID required" }, { status: 400 });
    }

    await db.delete(topics).where(eq(topics.id, id));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete topic" },
      { status: 403 }
    );
  }
}
