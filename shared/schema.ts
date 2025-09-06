import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"), // student, admin
  grade: text("grade"), // grade-1, grade-2, grade-3
  group: text("group"), // group-a, group-b, group-c
  createdAt: timestamp("created_at").defaultNow(),
});

export const materials = pgTable("materials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // whiteboard, video, document
  url: text("url").notNull(),
  grade: text("grade").notNull(),
  group: text("group").notNull(),
  subject: text("subject").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  grade: text("grade").notNull(),
  group: text("group").notNull(),
  subject: text("subject").notNull(),
  duration: integer("duration").notNull(), // in minutes
  maxAttempts: integer("max_attempts").default(1),
  deadline: timestamp("deadline").notNull(),
  isActive: boolean("is_active").default(true),
  questions: jsonb("questions").notNull(), // array of question objects
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  quizId: varchar("quiz_id").notNull().references(() => quizzes.id),
  answers: jsonb("answers").notNull(), // object with questionId: answer
  score: integer("score"),
  totalQuestions: integer("total_questions").notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  attemptNumber: integer("attempt_number").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertMaterialSchema = createInsertSchema(materials).omit({
  id: true,
  createdAt: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
});

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({
  id: true,
  startedAt: true,
});

export const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  grade: z.string().min(1, "يرجى اختيار المرحلة الدراسية"),
  group: z.string().min(1, "يرجى اختيار المجموعة"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Material = typeof materials.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
