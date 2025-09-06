import { createClient } from '@supabase/supabase-js';
import type { User, InsertUser } from "@shared/schema";
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

  // ... باقي الدوال سيتم إضافتها لاحقاً (المواد، الكويزات، المحاولات، الدرجات، المجموعات)
}
