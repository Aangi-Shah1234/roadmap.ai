import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const defaultDbPath = process.env.VERCEL ? "file:/tmp/roadmap.db" : "file:roadmap.db";
const url =
  process.env.DATABASE_URL ||
  process.env.TURSO_DATABASE_URL ||
  process.env.TURSO_URL ||
  process.env.STORAGE_URL ||
  defaultDbPath;

const authToken =
  process.env.DATABASE_AUTH_TOKEN ||
  process.env.TURSO_AUTH_TOKEN ||
  process.env.STORAGE_AUTH_TOKEN;

const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });
export { client };

let initPromise: Promise<void> | null = null;

export async function ensureDatabaseReady() {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        await client.execute(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'learner',
            created_at INTEGER NOT NULL
          );
        `);
        await client.execute(`
          CREATE TABLE IF NOT EXISTS subjects (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            description TEXT NOT NULL,
            icon TEXT NOT NULL DEFAULT 'Terminal',
            category TEXT NOT NULL DEFAULT 'Engineering',
            created_at INTEGER NOT NULL
          );
        `);
        await client.execute(`
          CREATE TABLE IF NOT EXISTS milestones (
            id TEXT PRIMARY KEY,
            subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            "order" INTEGER NOT NULL,
            level TEXT NOT NULL DEFAULT 'Beginner',
            created_at INTEGER NOT NULL
          );
        `);
        await client.execute(`
          CREATE TABLE IF NOT EXISTS topics (
            id TEXT PRIMARY KEY,
            milestone_id TEXT NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            resources TEXT,
            "order" INTEGER NOT NULL,
            created_at INTEGER NOT NULL
          );
        `);
        await client.execute(`
          CREATE TABLE IF NOT EXISTS user_progress (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
            completed INTEGER NOT NULL DEFAULT 1,
            completed_at INTEGER NOT NULL
          );
        `);

        // Check if database has content
        const check = await client.execute("SELECT count(*) as cnt FROM subjects;");
        const count = Number(check.rows[0]?.cnt || 0);
        if (count === 0) {
          const { seed } = await import("./seed");
          await seed(false);
        }
      } catch (err) {
        console.error("Auto-init database error:", err);
      }
    })();
  }
  return initPromise;
}

