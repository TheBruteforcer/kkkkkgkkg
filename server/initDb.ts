import { supabase } from './supabaseStorage';

// Database initialization script
export async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    // Create default grades if they don't exist
    const { data: existingGrades, error: gradesError } = await supabase
      .from('grades')
      .select('*');

    if (gradesError) {
      console.error('Error fetching grades:', gradesError);
      throw gradesError;
    }

    console.log(`Found ${existingGrades?.length || 0} existing grades`);
    
    if (!existingGrades || existingGrades.length === 0) {
      const defaultGrades = [
        { name: 'الصف الأول الإعدادي', code: 'grade-1', description: 'الصف الأول الإعدادي' },
        { name: 'الصف الثاني الإعدادي', code: 'grade-2', description: 'الصف الثاني الإعدادي' },
        { name: 'الصف الثالث الإعدادي', code: 'grade-3', description: 'الصف الثالث الإعدادي' },
      ];

      for (const grade of defaultGrades) {
        const { error } = await supabase.from('grades').insert(grade);
        if (error) {
          console.error(`Error creating grade ${grade.name}:`, error);
          throw error;
        }
        console.log(`Created grade: ${grade.name}`);
      }
    }

    // Create default groups if they don't exist
    const { data: existingGroups, error: groupsError } = await supabase
      .from('groups')
      .select('*');

    if (groupsError) {
      console.error('Error fetching groups:', groupsError);
      throw groupsError;
    }

    console.log(`Found ${existingGroups?.length || 0} existing groups`);

    if (!existingGroups || existingGroups.length === 0) {
      const defaultGroups = [
        { name: 'المجموعة أ', code: 'group-a', description: 'المجموعة أ' },
        { name: 'المجموعة ب', code: 'group-b', description: 'المجموعة ب' },
        { name: 'المجموعة ج', code: 'group-c', description: 'المجموعة ج' },
      ];

      for (const group of defaultGroups) {
        const { error } = await supabase.from('groups').insert(group);
        if (error) {
          console.error(`Error creating group ${group.name}:`, error);
          throw error;
        }
        console.log(`Created group: ${group.name}`);
      }
    }

    // Create default admin user if it doesn't exist
    const { data: existingAdmin, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@example.com')
      .single();

    if (adminError && adminError.code !== 'PGRST116') { // PGRST116 means no rows returned
      console.error('Error fetching admin user:', adminError);
      throw adminError;
    }

    console.log(`Admin user exists: ${!!existingAdmin}`);

    if (!existingAdmin) {
      const { error } = await supabase.from('users').insert({
        name: 'مدير النظام',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      
      if (error) {
        console.error('Error creating admin user:', error);
        throw error;
      }
      
      console.log('Created default admin user: admin@example.com / admin123');
    } else {
      console.log('Admin user already exists');
    }

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Run initialization
initializeDatabase().catch(console.error);
