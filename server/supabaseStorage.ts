import { createClient } from '@supabase/supabase-js';
import type { User, InsertUser, Material, InsertMaterial, Quiz, InsertQuiz, QuizAttempt, InsertQuizAttempt, Grade, InsertGrade, Group, InsertGroup } from "@shared/schema";
import type { IStorage } from "./storage";

const supabaseUrl = 'https://ummtbgcqyrerenzbhshx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtbXRiZ2NxeXJlcmVuemJoc2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMjc3NzYsImV4cCI6MjA3MjcwMzc3Nn0.azkJ1IyoREbZIKqO7kFk0Lb0zKwB8OTpx5iAjNlMVbA';
export const supabase = createClient(supabaseUrl, supabaseKey);

export class SupabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return undefined;
    return data as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (error || !data) return undefined;
    return data as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();
    if (error || !data) throw new Error(error?.message || 'Failed to create user');
    return data as User;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error || !data) return undefined;
    return data as User;
  }

  // Material operations
  async getMaterials(grade?: string, group?: string): Promise<Material[]> {
    let query = supabase.from('materials').select('*');
    
    if (grade) {
      query = query.eq('grade', grade);
    }
    if (group) {
      query = query.eq('group', group);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return [];
    return data as Material[];
  }

  async getMaterial(id: string): Promise<Material | undefined> {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return undefined;
    return data as Material;
  }

  async createMaterial(insertMaterial: InsertMaterial): Promise<Material> {
    const { data, error } = await supabase
      .from('materials')
      .insert([insertMaterial])
      .select()
      .single();
    if (error || !data) throw new Error(error?.message || 'Failed to create material');
    return data as Material;
  }

  async updateMaterial(id: string, updates: Partial<Material>): Promise<Material | undefined> {
    const { data, error } = await supabase
      .from('materials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error || !data) return undefined;
    return data as Material;
  }

  async deleteMaterial(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id);
    return !error;
  }

  // Quiz operations
  async getQuizzes(grade?: string, group?: string): Promise<Quiz[]> {
    let query = supabase.from('quizzes').select('*');
    
    if (grade) {
      query = query.eq('grade', grade);
    }
    if (group) {
      query = query.eq('group', group);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return [];
    return data as Quiz[];
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return undefined;
    return data as Quiz;
  }

  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    // Manually map camelCase to snake_case and convert date for Supabase client
    const { maxAttempts, isActive, deadline, ...rest } = insertQuiz;
    const supabaseQuizData: any = {
      ...rest,
    };

    if (maxAttempts !== undefined) {
      supabaseQuizData.max_attempts = maxAttempts;
    }
    if (isActive !== undefined) {
      supabaseQuizData.is_active = isActive;
    }
    if (deadline) {
      supabaseQuizData.deadline = deadline.toISOString();
    }

    const { data, error } = await supabase // Use the shared client
      .from('quizzes')
      .insert([supabaseQuizData])
      .select()
      .single();
    if (error || !data) {
      throw new Error(error?.message || 'Failed to create quiz');
    }
    return data as Quiz;
  }

  async updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz | undefined> {
    const { data, error } = await supabase
      .from('quizzes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error || !data) return undefined;
    return data as Quiz;
  }

  async deleteQuiz(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);
    return !error;
  }

  // Quiz attempt operations
  async getQuizAttempts(userId: string, quizId?: string): Promise<QuizAttempt[]> {
    let query = supabase.from('quiz_attempts').select('*').eq('user_id', userId);
    
    if (quizId) {
      query = query.eq('quiz_id', quizId);
    }
    
    const { data, error } = await query.order('started_at', { ascending: false });
    if (error) return [];
    return data as QuizAttempt[];
  }

  async getQuizAttempt(id: string): Promise<QuizAttempt | undefined> {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return undefined;
    return data as QuizAttempt;
  }

  async createQuizAttempt(insertAttempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert([insertAttempt])
      .select()
      .single();
    if (error || !data) throw new Error(error?.message || 'Failed to create quiz attempt');
    return data as QuizAttempt;
  }

  async updateQuizAttempt(id: string, updates: Partial<QuizAttempt>): Promise<QuizAttempt | undefined> {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error || !data) return undefined;
    return data as QuizAttempt;
  }

  async getQuizStats(quizId: string): Promise<{
    totalAttempts: number;
    averageScore: number;
    completionRate: number;
    topScores: { userId: string; userName: string; score: number }[];
  }> {
    const { data: attempts, error } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        users:user_id (
          name
        )
      `)
      .eq('quiz_id', quizId);
    
    if (error || !attempts) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        completionRate: 0,
        topScores: []
      };
    }

    const completedAttempts = attempts.filter((a: any) => a.completed_at && a.score !== null);
    
    const totalAttempts = attempts.length;
    const averageScore = completedAttempts.length > 0 
      ? completedAttempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / completedAttempts.length
      : 0;
    const completionRate = totalAttempts > 0 ? (completedAttempts.length / totalAttempts) * 100 : 0;
    
    const topScores = completedAttempts
      .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
      .slice(0, 10)
      .map((a: any) => ({
        userId: a.user_id,
        userName: a.users?.name || "Unknown",
        score: a.score || 0,
      }));

    return {
      totalAttempts,
      averageScore,
      completionRate,
      topScores,
    };
  }

  // Grade operations
  async getGrades(): Promise<Grade[]> {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) return [];
    return data as Grade[];
  }

  async getGrade(id: string): Promise<Grade | undefined> {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return undefined;
    return data as Grade;
  }

  async createGrade(insertGrade: InsertGrade): Promise<Grade> {
    const { data, error } = await supabase
      .from('grades')
      .insert([insertGrade])
      .select()
      .single();
    if (error || !data) throw new Error(error?.message || 'Failed to create grade');
    return data as Grade;
  }

  async updateGrade(id: string, updates: Partial<Grade>): Promise<Grade | undefined> {
    const { data, error } = await supabase
      .from('grades')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error || !data) return undefined;
    return data as Grade;
  }

  async deleteGrade(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('grades')
      .delete()
      .eq('id', id);
    return !error;
  }

  // Group operations
  async getGroups(): Promise<Group[]> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) return [];
    return data as Group[];
  }

  async getGroup(id: string): Promise<Group | undefined> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return undefined;
    return data as Group;
  }

  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    const { data, error } = await supabase
      .from('groups')
      .insert([insertGroup])
      .select()
      .single();
    if (error || !data) throw new Error(error?.message || 'Failed to create group');
    return data as Group;
  }

  async updateGroup(id: string, updates: Partial<Group>): Promise<Group | undefined> {
    const { data, error } = await supabase
      .from('groups')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error || !data) return undefined;
    return data as Group;
  }

  async deleteGroup(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id);
    return !error;
  }

  // Additional methods for admin functionality
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return [];
    return data as User[];
  }

  async deleteUser(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    return !error;
  }

  // Additional methods for quiz attempts
  async deleteQuizAttempt(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('quiz_attempts')
      .delete()
      .eq('id', id);
    return !error;
  }
}
