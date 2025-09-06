import { type User, type InsertUser, type Material, type InsertMaterial, type Quiz, type InsertQuiz, type QuizAttempt, type InsertQuizAttempt, type Grade, type InsertGrade, type Group, type InsertGroup } from "@shared/schema";
import { randomUUID } from "crypto";
import { SupabaseStorage } from "./supabaseStorage";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Material operations
  getMaterials(grade?: string, group?: string): Promise<Material[]>;
  getMaterial(id: string): Promise<Material | undefined>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  updateMaterial(id: string, updates: Partial<Material>): Promise<Material | undefined>;
  deleteMaterial(id: string): Promise<boolean>;

  // Quiz operations
  getQuizzes(grade?: string, group?: string): Promise<Quiz[]>;
  getQuiz(id: string): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz | undefined>;
  deleteQuiz(id: string): Promise<boolean>;

  // Quiz attempt operations
  getQuizAttempts(userId: string, quizId?: string): Promise<QuizAttempt[]>;
  getQuizAttempt(id: string): Promise<QuizAttempt | undefined>;
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  updateQuizAttempt(id: string, updates: Partial<QuizAttempt>): Promise<QuizAttempt | undefined>;
  getQuizStats(quizId: string): Promise<{
    totalAttempts: number;
    averageScore: number;
    completionRate: number;
    topScores: { userId: string; userName: string; score: number }[];
  }>;

  // Grade operations
  getGrades(): Promise<Grade[]>;
  getGrade(id: string): Promise<Grade | undefined>;
  createGrade(grade: InsertGrade): Promise<Grade>;
  updateGrade(id: string, updates: Partial<Grade>): Promise<Grade | undefined>;
  deleteGrade(id: string): Promise<boolean>;

  // Group operations
  getGroups(): Promise<Group[]>;
  getGroup(id: string): Promise<Group | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: string, updates: Partial<Group>): Promise<Group | undefined>;
  deleteGroup(id: string): Promise<boolean>;

  // Additional admin operations
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<boolean>;
  deleteQuizAttempt(id: string): Promise<boolean>;
}

export const storage = new SupabaseStorage();
