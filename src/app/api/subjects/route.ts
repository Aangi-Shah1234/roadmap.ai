import { NextResponse } from "next/server";
import { db, ensureDatabaseReady } from "@/db";
import { users, subjects, milestones, topics, userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser, getCookieProgress } from "@/lib/auth";

export async function GET() {
  try {
    await ensureDatabaseReady();
    const user = await getCurrentUser();
    const allSubjects = await db.select().from(subjects);

    const completedSet = new Set<string>();
    if (user) {
      const [dbUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, user.email.toLowerCase().trim()))
        .limit(1);
      const effectiveUserId = dbUser ? dbUser.id : user.userId;

      const userCompleted = await db
        .select()
        .from(userProgress)
        .where(eq(userProgress.userId, effectiveUserId));

      for (const p of userCompleted) {
        if (p.completed === 1) completedSet.add(p.topicId);
      }

      const cookieProgress = await getCookieProgress(user.email);
      for (const addedId of cookieProgress.added) {
        completedSet.add(addedId);
      }
      for (const removedId of cookieProgress.removed) {
        completedSet.delete(removedId);
      }
    }

    const enrichedSubjects = await Promise.all(
      allSubjects.map(async (subj) => {
        const subjectMilestones = await db
          .select()
          .from(milestones)
          .where(eq(milestones.subjectId, subj.id));

        const milestoneIds = subjectMilestones.map((m) => m.id);

        let totalTopicsCount = 0;
        let completedTopicsCount = 0;
        let subjectTopicIds: string[] = [];
        let subjectCompletedTopicIds: string[] = [];

        if (milestoneIds.length > 0) {
          const allSubjectTopics = await Promise.all(
            milestoneIds.map((mId) =>
              db.select().from(topics).where(eq(topics.milestoneId, mId))
            )
          );
          const flatTopics = allSubjectTopics.flat();
          totalTopicsCount = flatTopics.length;
          subjectTopicIds = flatTopics.map((t) => t.id);

          if (user) {
            subjectCompletedTopicIds = flatTopics
              .filter((t) => completedSet.has(t.id))
              .map((t) => t.id);
            completedTopicsCount = subjectCompletedTopicIds.length;
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
          topicIds: subjectTopicIds,
          completedTopicIds: subjectCompletedTopicIds,
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
