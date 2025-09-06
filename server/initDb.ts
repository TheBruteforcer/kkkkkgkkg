import { supabase } from './supabaseStorage';

// Database initialization script
export async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    // Create default grades if they don't exist
    const { data: existingGrades } = await supabase
      .from('grades')
      .select('*');

    if (!existingGrades || existingGrades.length === 0) {
      const defaultGrades = [
        { name: 'الصف الأول الإعدادي', code: 'grade-1', description: 'الصف الأول الإعدادي' },
        { name: 'الصف الثاني الإعدادي', code: 'grade-2', description: 'الصف الثاني الإعدادي' },
        { name: 'الصف الثالث الإعدادي', code: 'grade-3', description: 'الصف الثالث الإعدادي' },
      ];

      for (const grade of defaultGrades) {
        await supabase.from('grades').insert(grade);
        console.log(`Created grade: ${grade.name}`);
      }
    }

    // Create default groups if they don't exist
    const { data: existingGroups } = await supabase
      .from('groups')
      .select('*');

    if (!existingGroups || existingGroups.length === 0) {
      const defaultGroups = [
        { name: 'المجموعة أ', code: 'group-a', description: 'المجموعة أ' },
        { name: 'المجموعة ب', code: 'group-b', description: 'المجموعة ب' },
        { name: 'المجموعة ج', code: 'group-c', description: 'المجموعة ج' },
      ];

      for (const group of defaultGroups) {
        await supabase.from('groups').insert(group);
        console.log(`Created group: ${group.name}`);
      }
    }

    // Create default admin user if it doesn't exist
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@example.com')
      .single();

    if (!existingAdmin) {
      await supabase.from('users').insert({
        name: 'مدير النظام',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Created default admin user: admin@example.com / admin123');
    }

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Run initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase().catch(console.error);
}
