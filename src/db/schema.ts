import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "learner"] }).notNull().default("learner"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const subjects = sqliteTable("subjects", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon").notNull().default("Terminal"),
  category: text("category").notNull().default("Engineering"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const milestones = sqliteTable("milestones", {
  id: text("id").primaryKey(),
  subjectId: text("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  level: text("level", { enum: ["Beginner", "Intermediate", "Advanced"] }).notNull().default("Beginner"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const topics = sqliteTable("topics", {
  id: text("id").primaryKey(),
  milestoneId: text("milestone_id").notNull().references(() => milestones.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  resources: text("resources"), // JSON string: [{ title: string, url: string, type: string }]
  order: integer("order").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const userProgress = sqliteTable("user_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  topicId: text("topic_id").notNull().references(() => topics.id, { onDelete: "cascade" }),
  completed: integer("completed").notNull().default(1),
  completedAt: integer("completed_at", { mode: "timestamp" }).notNull(),
});

export type User = typeof users.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type Milestone = typeof milestones.$inferSelect;
export type Topic = typeof topics.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
