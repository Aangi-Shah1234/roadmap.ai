import { NextResponse } from "next/server";
import { db } from "@/db";
import { userProgress } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to track progress" },
        { status: 401 }
      );
    }

    const { topicId, completed } = await req.json();

    if (!topicId) {
      return NextResponse.json(
        { error: "Topic ID is required" },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, user.userId),
          eq(userProgress.topicId, topicId)
        )
      )
      .limit(1);

    const isDone = completed ? 1 : 0;

    if (existing.length > 0) {
      if (isDone === 0) {
        await db
          .delete(userProgress)
          .where(
            and(
              eq(userProgress.userId, user.userId),
              eq(userProgress.topicId, topicId)
            )
          );
      } else {
        await db
          .update(userProgress)
          .set({ completed: 1, completedAt: new Date() })
          .where(
            and(
              eq(userProgress.userId, user.userId),
              eq(userProgress.topicId, topicId)
            )
          );
      }
    } else if (isDone === 1) {
      await db.insert(userProgress).values({
        id: crypto.randomUUID(),
        userId: user.userId,
        topicId,
        completed: 1,
        completedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      topicId,
      isCompleted: isDone === 1,
    });
  } catch (err: any) {
    console.error("Progress update error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update progress" },
      { status: 500 }
    );
  }
}
