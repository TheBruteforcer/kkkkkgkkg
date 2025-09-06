import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, registerSchema, insertMaterialSchema, insertQuizSchema, insertQuizAttemptSchema, insertGradeSchema, insertGroupSchema } from "@shared/schema";
import type { User, Grade, Group } from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId: string;
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
    
    req.user = user;
    next();
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "البريد الإلكتروني مستخدم من قبل" });
      }

      const user = await storage.createUser(userData);
      req.session.userId = user.id;
      
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

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      }

      req.session.userId = user.id;
      
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

  const httpServer = createServer(app);
  return httpServer;
}
