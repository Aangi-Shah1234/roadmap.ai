import { NextResponse } from "next/server";
import { db } from "@/db";
import { subjects, milestones, topics, userProgress } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser();

    const [subject] = await db
      .select()
      .from(subjects)
      .where(eq(subjects.slug, slug))
      .limit(1);

    if (!subject) {
      return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
    }

    const subjectMilestones = await db
      .select()
      .from(milestones)
      .where(eq(milestones.subjectId, subject.id))
      .orderBy(asc(milestones.order));

    let completedTopicIds: string[] = [];
    if (user) {
      const progress = await db
        .select()
        .from(userProgress)
        .where(eq(userProgress.userId, user.userId));
      completedTopicIds = progress
        .filter((p) => p.completed === 1)
        .map((p) => p.topicId);
    }

    const enrichedMilestones = await Promise.all(
      subjectMilestones.map(async (m) => {
        const milestoneTopics = await db
          .select()
          .from(topics)
          .where(eq(topics.milestoneId, m.id))
          .orderBy(asc(topics.order));

        const parsedTopics = milestoneTopics.map((t) => ({
          ...t,
          resources: t.resources ? JSON.parse(t.resources) : [],
          isCompleted: completedTopicIds.includes(t.id),
        }));

        const isMilestoneCompleted =
          parsedTopics.length > 0 &&
          parsedTopics.every((t) => completedTopicIds.includes(t.id));

        return {
          ...m,
          topics: parsedTopics,
          isCompleted: isMilestoneCompleted,
        };
      })
    );

    const allTopics = enrichedMilestones.flatMap((m) => m.topics);
    const totalTopics = allTopics.length;
    const completedCount = allTopics.filter((t) => t.isCompleted).length;
    const progressPercent =
      totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

    return NextResponse.json({
      subject,
      milestones: enrichedMilestones,
      completedTopicIds,
      stats: {
        totalMilestones: enrichedMilestones.length,
        totalTopics,
        completedCount,
        progressPercent,
      },
      currentUser: user,
    });
  } catch (err: any) {
    console.error("Roadmap detail error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch roadmap" },
      { status: 500 }
    );
  }
}
