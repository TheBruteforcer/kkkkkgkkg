import { type User, type InsertUser, type Material, type InsertMaterial, type Quiz, type InsertQuiz, type QuizAttempt, type InsertQuizAttempt, type Grade, type InsertGrade, type Group, type InsertGroup } from "@shared/schema";
import { randomUUID } from "crypto";

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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private materials: Map<string, Material>;
  private quizzes: Map<string, Quiz>;
  private quizAttempts: Map<string, QuizAttempt>;
  private grades: Map<string, Grade>;
  private groups: Map<string, Group>;

  constructor() {
    this.users = new Map();
    this.materials = new Map();
    this.quizzes = new Map();
    this.quizAttempts = new Map();
    this.grades = new Map();
    this.groups = new Map();
    
    // Create admin user
    const adminId = randomUUID();
    this.users.set(adminId, {
      id: adminId,
      name: "مستر محمد السيد",
      email: "admin@example.com",
      password: "admin123", // In production, this should be hashed
      role: "admin",
      grade: null,
      group: null,
      createdAt: new Date(),
    });

    // Create default grades
    this.createDefaultGrades();
    
    // Create default groups
    this.createDefaultGroups();
  }

  private createDefaultGrades() {
    const defaultGrades = [
      { name: "الصف الأول الإعدادي", code: "grade-1", description: "الصف الأول الإعدادي" },
      { name: "الصف الثاني الإعدادي", code: "grade-2", description: "الصف الثاني الإعدادي" },
      { name: "الصف الثالث الإعدادي", code: "grade-3", description: "الصف الثالث الإعدادي" },
    ];

    defaultGrades.forEach(grade => {
      const id = randomUUID();
      this.grades.set(id, {
        ...grade,
        id,
        isActive: true,
        createdAt: new Date()
      });
    });
  }

  private createDefaultGroups() {
    const defaultGroups = [
      { name: "المجموعة أ", code: "group-a", description: "المجموعة الأولى" },
      { name: "المجموعة ب", code: "group-b", description: "المجموعة الثانية" },
      { name: "المجموعة ج", code: "group-c", description: "المجموعة الثالثة" },
    ];

    defaultGroups.forEach(group => {
      const id = randomUUID();
      this.groups.set(id, {
        ...group,
        id,
        isActive: true,
        createdAt: new Date()
      });
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      role: insertUser.role || "student",
      grade: insertUser.grade || null,
      group: insertUser.group || null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Material operations
  async getMaterials(grade?: string, group?: string): Promise<Material[]> {
    let materials = Array.from(this.materials.values());
    
    if (grade) {
      materials = materials.filter(m => m.grade === grade);
    }
    if (group) {
      materials = materials.filter(m => m.group === group);
    }
    
    return materials.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getMaterial(id: string): Promise<Material | undefined> {
    return this.materials.get(id);
  }

  async createMaterial(insertMaterial: InsertMaterial): Promise<Material> {
    const id = randomUUID();
    const material: Material = {
      ...insertMaterial,
      id,
      createdAt: new Date(),
      description: insertMaterial.description || null
    };
    this.materials.set(id, material);
    return material;
  }

  async updateMaterial(id: string, updates: Partial<Material>): Promise<Material | undefined> {
    const material = this.materials.get(id);
    if (!material) return undefined;
    
    const updatedMaterial = { ...material, ...updates };
    this.materials.set(id, updatedMaterial);
    return updatedMaterial;
  }

  async deleteMaterial(id: string): Promise<boolean> {
    return this.materials.delete(id);
  }

  // Quiz operations
  async getQuizzes(grade?: string, group?: string): Promise<Quiz[]> {
    let quizzes = Array.from(this.quizzes.values());
    
    if (grade) {
      quizzes = quizzes.filter(q => q.grade === grade);
    }
    if (group) {
      quizzes = quizzes.filter(q => q.group === group);
    }
    
    return quizzes.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }

  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    const id = randomUUID();
    const quiz: Quiz = {
      ...insertQuiz,
      id,
      createdAt: new Date(),
      description: insertQuiz.description || null,
      maxAttempts: insertQuiz.maxAttempts || null,
      isActive: insertQuiz.isActive !== undefined ? insertQuiz.isActive : null
    };
    this.quizzes.set(id, quiz);
    return quiz;
  }

  async updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz | undefined> {
    const quiz = this.quizzes.get(id);
    if (!quiz) return undefined;
    
    const updatedQuiz = { ...quiz, ...updates };
    this.quizzes.set(id, updatedQuiz);
    return updatedQuiz;
  }

  async deleteQuiz(id: string): Promise<boolean> {
    return this.quizzes.delete(id);
  }

  // Quiz attempt operations
  async getQuizAttempts(userId: string, quizId?: string): Promise<QuizAttempt[]> {
    let attempts = Array.from(this.quizAttempts.values()).filter(a => a.userId === userId);
    
    if (quizId) {
      attempts = attempts.filter(a => a.quizId === quizId);
    }
    
    return attempts.sort((a, b) => b.startedAt!.getTime() - a.startedAt!.getTime());
  }

  async getQuizAttempt(id: string): Promise<QuizAttempt | undefined> {
    return this.quizAttempts.get(id);
  }

  async createQuizAttempt(insertAttempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const id = randomUUID();
    const attempt: QuizAttempt = {
      ...insertAttempt,
      id,
      startedAt: new Date(),
      completedAt: null,
      score: insertAttempt.score || null
    };
    this.quizAttempts.set(id, attempt);
    return attempt;
  }

  async updateQuizAttempt(id: string, updates: Partial<QuizAttempt>): Promise<QuizAttempt | undefined> {
    const attempt = this.quizAttempts.get(id);
    if (!attempt) return undefined;
    
    const updatedAttempt = { ...attempt, ...updates };
    this.quizAttempts.set(id, updatedAttempt);
    return updatedAttempt;
  }

  async getQuizStats(quizId: string): Promise<{
    totalAttempts: number;
    averageScore: number;
    completionRate: number;
    topScores: { userId: string; userName: string; score: number }[];
  }> {
    const attempts = Array.from(this.quizAttempts.values()).filter(a => a.quizId === quizId);
    const completedAttempts = attempts.filter(a => a.completedAt && a.score !== null);
    
    const totalAttempts = attempts.length;
    const averageScore = completedAttempts.length > 0 
      ? completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length
      : 0;
    const completionRate = totalAttempts > 0 ? (completedAttempts.length / totalAttempts) * 100 : 0;
    
    const topScores = completedAttempts
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 10)
      .map(a => {
        const user = this.users.get(a.userId);
        return {
          userId: a.userId,
          userName: user?.name || "Unknown",
          score: a.score || 0,
        };
      });

    return {
      totalAttempts,
      averageScore,
      completionRate,
      topScores,
    };
  }

  // Grade operations
  async getGrades(): Promise<Grade[]> {
    return Array.from(this.grades.values()).sort((a, b) => 
      a.createdAt!.getTime() - b.createdAt!.getTime()
    );
  }

  async getGrade(id: string): Promise<Grade | undefined> {
    return this.grades.get(id);
  }

  async createGrade(insertGrade: InsertGrade): Promise<Grade> {
    const id = randomUUID();
    const grade: Grade = {
      ...insertGrade,
      id,
      createdAt: new Date(),
      description: insertGrade.description || null,
      isActive: insertGrade.isActive !== undefined ? insertGrade.isActive : null
    };
    this.grades.set(id, grade);
    return grade;
  }

  async updateGrade(id: string, updates: Partial<Grade>): Promise<Grade | undefined> {
    const grade = this.grades.get(id);
    if (!grade) return undefined;
    
    const updatedGrade = { ...grade, ...updates };
    this.grades.set(id, updatedGrade);
    return updatedGrade;
  }

  async deleteGrade(id: string): Promise<boolean> {
    return this.grades.delete(id);
  }

  // Group operations
  async getGroups(): Promise<Group[]> {
    return Array.from(this.groups.values()).sort((a, b) => 
      a.createdAt!.getTime() - b.createdAt!.getTime()
    );
  }

  async getGroup(id: string): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    const id = randomUUID();
    const group: Group = {
      ...insertGroup,
      id,
      createdAt: new Date(),
      description: insertGroup.description || null,
      isActive: insertGroup.isActive !== undefined ? insertGroup.isActive : null
    };
    this.groups.set(id, group);
    return group;
  }

  async updateGroup(id: string, updates: Partial<Group>): Promise<Group | undefined> {
    const group = this.groups.get(id);
    if (!group) return undefined;
    
    const updatedGroup = { ...group, ...updates };
    this.groups.set(id, updatedGroup);
    return updatedGroup;
  }

  async deleteGroup(id: string): Promise<boolean> {
    return this.groups.delete(id);
  }
}

export const storage = new MemStorage();
