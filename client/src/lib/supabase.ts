import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL'; // TODO: Replace with your Supabase URL
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // TODO: Replace with your Supabase anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
