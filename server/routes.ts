import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, registerSchema, insertMaterialSchema, insertQuizSchema, insertQuizAttemptSchema, insertGradeSchema, insertGroupSchema } from "@shared/schema";
import type { User, Grade, Group } from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId: string;
    adminVerified?: boolean;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }
    next();
  };

  const requireAdmin = async (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح لك بالوصول" });
    }
    
    // Additional security check for admin actions
    if (!req.session.adminVerified) {
      return res.status(403).json({ message: "يجب تأكيد هوية المدير" });
    }
    
    req.user = user;
    next();
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      console.log("Registration attempt with data:", req.body);
      const userData = registerSchema.parse(req.body);
      console.log("Parsed data:", userData);
      
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "البريد الإلكتروني مستخدم من قبل" });
      }

      const user = await storage.createUser(userData);
      req.session.userId = user.id;
      
      // Auto-verify admin if registering with admin role
      if (user.role === "admin") {
        req.session.adminVerified = true;
      }
      
      res.json({ 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          grade: user.grade,
          group: user.group 
        } 
      });
    } catch (error) {
      console.error("Registration validation error:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
      res.status(400).json({ message: "بيانات غير صحيحة" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      }

      req.session.userId = user.id;
      
      // Auto-verify admin if logging in with admin credentials
      if (user.role === "admin") {
        req.session.adminVerified = true;
      }
      
      res.json({ 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          grade: user.grade,
          group: user.group 
        } 
      });
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صحيحة" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "تم تسجيل الخروج بنجاح" });
    });
  });

  // Admin verification endpoint
  app.post("/api/admin/verify", requireAuth, async (req, res) => {
    try {
      const { password } = req.body;
      const user = await storage.getUser(req.session.userId!);
      
      if (!user || user.role !== "admin" || user.password !== password) {
        return res.status(401).json({ message: "كلمة مرور المدير غير صحيحة" });
      }
      
      req.session.adminVerified = true;
      res.json({ message: "تم تأكيد هوية المدير بنجاح" });
    } catch (error) {
      res.status(400).json({ message: "خطأ في البيانات" });
    }
  });

  // Get comprehensive admin stats
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const materials = await storage.getMaterials();
      const quizzes = await storage.getQuizzes();
      
      // Get all quiz attempts for statistics
      const allAttempts: any[] = [];
      for (const quiz of quizzes) {
        const stats = await storage.getQuizStats(quiz.id);
        allAttempts.push(...Array(stats.totalAttempts).fill(null).map((_, i) => ({
          quizId: quiz.id,
          score: stats.averageScore,
          completedAt: new Date().toISOString()
        })));
      }
      
      const totalStudents = users.filter((u: any) => u.role === "student").length;
      const totalMaterials = materials.length;
      const activeQuizzes = quizzes.filter((q: any) => q.isActive && new Date(q.deadline) > new Date()).length;
      const completedAttempts = allAttempts.filter((a: any) => a.completedAt).length;
      const averageScore = completedAttempts.length > 0 
        ? allAttempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / completedAttempts.length 
        : 0;
      
      // Material breakdown
      const whiteboardImages = materials.filter((m: any) => m.type === "whiteboard").length;
      const videos = materials.filter((m: any) => m.type === "video").length;
      const documents = materials.filter((m: any) => m.type === "document").length;
      
      // Recent activity (last 5)
      const recentMaterials = materials.slice(0, 5);
      const recentQuizzes = quizzes.slice(0, 5);
      const recentAttempts = allAttempts.slice(0, 10);
      
      // Grade and group analysis
      const gradeDistribution: Record<string, number> = {};
      const groupDistribution: Record<string, number> = {};
      users.filter((u: any) => u.role === "student").forEach((user: any) => {
        if (user.grade) gradeDistribution[user.grade] = (gradeDistribution[user.grade] || 0) + 1;
        if (user.group) groupDistribution[user.group] = (groupDistribution[user.group] || 0) + 1;
      });
      
      res.json({
        stats: {
          totalStudents,
          totalMaterials,
          activeQuizzes,
          completedAttempts,
          averageScore: Math.round(averageScore * 100) / 100,
          materialBreakdown: {
            whiteboard: whiteboardImages,
            video: videos,
            document: documents
          },
          gradeDistribution,
          groupDistribution
        },
        recentActivity: {
          materials: recentMaterials,
          quizzes: recentQuizzes,
          attempts: recentAttempts
        }
      });
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الإحصائيات" });
    }
  });

  // Get all users for admin management
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response for security
      const safeUsers = users.map(({ password, ...user }: any) => user);
      res.json({ users: safeUsers });
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب المستخدمين" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "غير مسجل الدخول" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }
    
    res.json({ 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        grade: user.grade,
        group: user.group 
      } 
    });
  });

  // Materials routes
  app.get("/api/materials", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      let materials;
      if (user.role === "admin") {
        materials = await storage.getMaterials();
      } else {
        materials = await storage.getMaterials(user.grade || undefined, user.group || undefined);
      }
      
      res.json({ materials });
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.post("/api/materials", requireAdmin, async (req, res) => {
    try {
      const materialData = insertMaterialSchema.parse(req.body);
      const material = await storage.createMaterial(materialData);
      res.json({ material });
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صحيحة" });
    }
  });

  app.put("/api/materials/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const material = await storage.updateMaterial(id, updates);
      
      if (!material) {
        return res.status(404).json({ message: "المادة غير موجودة" });
      }
      
      res.json({ material });
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صحيحة" });
    }
  });

  app.delete("/api/materials/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteMaterial(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "المادة غير موجودة" });
      }
      
      res.json({ message: "تم حذف المادة بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Quiz routes
  app.get("/api/quizzes", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      let quizzes;
      if (user.role === "admin") {
        quizzes = await storage.getQuizzes();
      } else {
        quizzes = await storage.getQuizzes(user.grade || undefined, user.group || undefined);
      }
      
      res.json({ quizzes });
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.get("/api/quizzes/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const quiz = await storage.getQuiz(id);
      
      if (!quiz) {
        return res.status(404).json({ message: "الاختبار غير موجود" });
      }
      
      res.json({ quiz });
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.post("/api/quizzes", requireAdmin, async (req, res) => {
    try {
      const quizData = insertQuizSchema.parse(req.body);
      const quiz = await storage.createQuiz(quizData);
      res.json({ quiz });
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صحيحة" });
    }
  });

  app.put("/api/quizzes/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const quiz = await storage.updateQuiz(id, updates);
      
      if (!quiz) {
        return res.status(404).json({ message: "الاختبار غير موجود" });
      }
      
      res.json({ quiz });
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صحيحة" });
    }
  });

  app.delete("/api/quizzes/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteQuiz(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "الاختبار غير موجود" });
      }
      
      res.json({ message: "تم حذف الاختبار بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.get("/api/quizzes/:id/stats", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const stats = await storage.getQuizStats(id);
      res.json({ stats });
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Quiz attempt routes
  app.get("/api/quiz-attempts", requireAuth, async (req, res) => {
    try {
      const { quizId } = req.query;
      const attempts = await storage.getQuizAttempts(
        req.session.userId!, 
        quizId as string | undefined
      );
      res.json({ attempts });
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.post("/api/quiz-attempts", requireAuth, async (req, res) => {
    try {
      const attemptData = insertQuizAttemptSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });
      
      const attempt = await storage.createQuizAttempt(attemptData);
      res.json({ attempt });
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صحيحة" });
    }
  });

  app.put("/api/quiz-attempts/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const existingAttempt = await storage.getQuizAttempt(id);
      if (!existingAttempt || existingAttempt.userId !== req.session.userId) {
        return res.status(404).json({ message: "المحاولة غير موجودة" });
      }
      
      const attempt = await storage.updateQuizAttempt(id, updates);
      res.json({ attempt });
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صحيحة" });
    }
  });

  // Grades routes
  app.get("/api/grades", requireAdmin, async (req, res) => {
    try {
      const grades = await storage.getGrades();
      res.json({ grades });
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب المراحل الدراسية" });
    }
  });

  app.post("/api/grades", requireAdmin, async (req, res) => {
    try {
      const gradeData = insertGradeSchema.parse(req.body);
      const grade = await storage.createGrade(gradeData);
      res.json({ grade });
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صحيحة" });
    }
  });

  app.put("/api/grades/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const grade = await storage.updateGrade(id, updates);
      if (!grade) {
        return res.status(404).json({ message: "المرحلة الدراسية غير موجودة" });
      }
      res.json({ grade });
    } catch (error) {
      res.status(400).json({ message: "خطأ في تحديث المرحلة الدراسية" });
    }
  });

  app.delete("/api/grades/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteGrade(id);
      if (!success) {
        return res.status(404).json({ message: "المرحلة الدراسية غير موجودة" });
      }
      res.json({ message: "تم حذف المرحلة الدراسية بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف المرحلة الدراسية" });
    }
  });

  // Groups routes
  app.get("/api/groups", requireAdmin, async (req, res) => {
    try {
      const groups = await storage.getGroups();
      res.json({ groups });
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب المجموعات" });
    }
  });

  app.post("/api/groups", requireAdmin, async (req, res) => {
    try {
      const groupData = insertGroupSchema.parse(req.body);
      const group = await storage.createGroup(groupData);
      res.json({ group });
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صحيحة" });
    }
  });

  app.put("/api/groups/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const group = await storage.updateGroup(id, updates);
      if (!group) {
        return res.status(404).json({ message: "المجموعة غير موجودة" });
      }
      res.json({ group });
    } catch (error) {
      res.status(400).json({ message: "خطأ في تحديث المجموعة" });
    }
  });

  app.delete("/api/groups/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteGroup(id);
      if (!success) {
        return res.status(404).json({ message: "المجموعة غير موجودة" });
      }
      res.json({ message: "تم حذف المجموعة بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف المجموعة" });
    }
  });

  // User update endpoint
  app.put("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const user = await storage.updateUser(id, updates);
      
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      
      // Remove password from response for security
      const { password, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صحيحة" });
    }
  });

  // Delete user endpoint
  app.delete("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      res.json({ message: "تم حذف المستخدم بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف المستخدم" });
    }
  });

  // Delete quiz attempt endpoint
  app.delete("/api/quiz-attempts/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if the attempt belongs to the current user
      const attempt = await storage.getQuizAttempt(id);
      if (!attempt || attempt.userId !== req.session.userId) {
        return res.status(404).json({ message: "المحاولة غير موجودة" });
      }
      
      const success = await storage.deleteQuizAttempt(id);
      if (!success) {
        return res.status(404).json({ message: "المحاولة غير موجودة" });
      }
      
      res.json({ message: "تم حذف المحاولة بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف المحاولة" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
