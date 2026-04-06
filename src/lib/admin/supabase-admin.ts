/**
 * Admin-only Supabase client (service role)
 *
 * SECURITY: This file must NEVER be imported from client components.
 * Uses SUPABASE_SERVICE_ROLE_KEY — never expose via NEXT_PUBLIC_.
 */

import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Admin credentials missing');
  return createClient(url, key, { auth: { persistSession: false } });
}
