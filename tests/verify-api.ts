import { db } from "../src/db";
import { users, subjects, milestones, topics, userProgress } from "../src/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function runTests() {
  console.log("🧪 Starting Automated Test Suite for Roadmap AI...\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // Test 1: Verify pre-seeded users exist
    const allUsers = await db.select().from(users);
    assert(allUsers.length >= 2, "Database contains pre-seeded users");

    const admin = allUsers.find((u) => u.role === "admin");
    assert(admin !== undefined && admin.email === "admin@roadmap.ai", "Admin user exists (admin@roadmap.ai)");

    const learner = allUsers.find((u) => u.role === "learner");
    assert(learner !== undefined && learner.email === "learner@roadmap.ai", "Learner user exists (learner@roadmap.ai)");

    // Test 2: Verify password hashing & auth check
    if (admin) {
      const isValidAdminPass = await bcrypt.compare("AdminPassword123!", admin.password);
      assert(isValidAdminPass, "Admin password hash verification succeeds");

      const isWrongPass = await bcrypt.compare("WrongPassword", admin.password);
      assert(!isWrongPass, "Admin rejects incorrect password");
    }

    // Test 3: Verify Subjects & Tracks
    const allSubjects = await db.select().from(subjects);
    assert(allSubjects.length >= 2, "Both DevOps and Cloud tracks exist");

    const devops = allSubjects.find((s) => s.slug === "devops");
    assert(devops !== undefined, "DevOps track slug is 'devops'");

    const cloud = allSubjects.find((s) => s.slug === "cloud");
    assert(cloud !== undefined, "Cloud track slug is 'cloud'");

    // Test 4: Verify Milestones under DevOps
    if (devops) {
      const devopsMilestones = await db
        .select()
        .from(milestones)
        .where(eq(milestones.subjectId, devops.id));

      assert(
        devopsMilestones.length === 7,
        `DevOps track has all 7 sequential milestones (found ${devopsMilestones.length})`
      );

      const milestoneTitles = devopsMilestones.map((m) => m.title);
      assert(
        milestoneTitles.some((t) => t.includes("Linux")),
        "Milestone contains Linux & OS Fundamentals"
      );
      assert(
        milestoneTitles.some((t) => t.includes("Docker")),
        "Milestone contains Containerization (Docker)"
      );
      assert(
        milestoneTitles.some((t) => t.includes("Kubernetes")),
        "Milestone contains Container Orchestration (Kubernetes)"
      );
      assert(
        milestoneTitles.some((t) => t.includes("Terraform")),
        "Milestone contains Infrastructure as Code (Terraform)"
      );
    }

    // Test 5: Verify Topics and Curated Resources
    const allTopics = await db.select().from(topics);
    assert(allTopics.length >= 10, `Topics seeded successfully (found ${allTopics.length})`);

    const topicsWithResources = allTopics.filter((t) => {
      try {
        const parsed = JSON.parse(t.resources || "[]");
        return Array.isArray(parsed) && parsed.length > 0;
      } catch {
        return false;
      }
    });
    assert(
      topicsWithResources.length > 0,
      `Curated resources (docs/tutorials) attached to topics (found ${topicsWithResources.length})`
    );

    // Test 6: Verify User Progress Tracking
    if (learner) {
      const progress = await db
        .select()
        .from(userProgress)
        .where(eq(userProgress.userId, learner.id));

      assert(progress.length >= 1, "Learner progress recorded and queryable");
    }

    console.log(`\n========================================`);
    console.log(`🎉 Test Suite Results: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution failed with error:", err);
    process.exit(1);
  }
}

runTests();
