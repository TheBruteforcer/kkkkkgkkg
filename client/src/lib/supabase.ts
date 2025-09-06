import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ummtbgcqyrerenzbhshx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtbXRiZ2NxeXJlcmVuemJoc2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMjc3NzYsImV4cCI6MjA3MjcwMzc3Nn0.azkJ1IyoREbZIKqO7kFk0Lb0zKwB8OTpx5iAjNlMVbA';

export const supabase = createClient(supabaseUrl, supabaseKey);
