import { createClient } from '@supabase/supabase-js';

// Admin client with service role key - bypasses RLS
// Use only in server-side code after authentication check
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
