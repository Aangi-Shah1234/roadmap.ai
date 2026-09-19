import { NextResponse } from "next/server";
import { db, ensureDatabaseReady } from "@/db";
import { subjects, milestones, topics, userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    await ensureDatabaseReady();
    const user = await getCurrentUser();
    const allSubjects = await db.select().from(subjects);

    const enrichedSubjects = await Promise.all(
      allSubjects.map(async (subj) => {
        const subjectMilestones = await db
          .select()
          .from(milestones)
          .where(eq(milestones.subjectId, subj.id));

        const milestoneIds = subjectMilestones.map((m) => m.id);

        let totalTopicsCount = 0;
        let completedTopicsCount = 0;

        if (milestoneIds.length > 0) {
          const allSubjectTopics = await Promise.all(
            milestoneIds.map((mId) =>
              db.select().from(topics).where(eq(topics.milestoneId, mId))
            )
          );
          const flatTopics = allSubjectTopics.flat();
          totalTopicsCount = flatTopics.length;

          if (user) {
            const topicIds = flatTopics.map((t) => t.id);
            if (topicIds.length > 0) {
              const userCompleted = await db
                .select()
                .from(userProgress)
                .where(eq(userProgress.userId, user.userId));
              
              completedTopicsCount = userCompleted.filter(
                (p) => topicIds.includes(p.topicId) && p.completed === 1
              ).length;
            }
          }
        }

        const progressPercent =
          totalTopicsCount > 0
            ? Math.round((completedTopicsCount / totalTopicsCount) * 100)
            : 0;

        return {
          ...subj,
          milestonesCount: subjectMilestones.length,
          topicsCount: totalTopicsCount,
          completedCount: completedTopicsCount,
          progressPercent,
        };
      })
    );

    return NextResponse.json({ subjects: enrichedSubjects });
  } catch (err: any) {
    console.error("Subjects fetch error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}
