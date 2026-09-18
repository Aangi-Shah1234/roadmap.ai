# Database Architect Skill & Standards

## Purpose
Governs database schema design, migration flows, ORM querying, and production cloud scaling with SQLite and Turso (libSQL).

## Core Principles
1. **Drizzle ORM Patterns**:
   - Single source of truth in `src/db/schema.ts`.
   - Maintain cascading foreign keys (`onDelete: "cascade"`) so deleting a subject removes all its child milestones, topics, and learner progress.
2. **Dual Environment Portability**:
   - Local: Seamless development using zero-configuration file SQLite (`roadmap.db`).
   - Production: Effortless switch to Turso cloud libSQL via `DATABASE_URL` and `DATABASE_AUTH_TOKEN`.
   - Zero code rewrites when transitioning between local and cloud database instances.
3. **Data Integrity & Seeding**:
   - Always provide a deterministic, idempotent seed script (`src/db/seed.ts`) to initialize testing accounts and base roadmaps.
   - Use indexed unique columns (`slug`, `email`) for rapid queries.
