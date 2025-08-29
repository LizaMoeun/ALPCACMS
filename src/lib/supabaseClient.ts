import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Create Supabase client only in the browser to avoid calling createClient during
// Next.js server prerender/build steps where NEXT_PUBLIC_SUPABASE_URL may be missing.
// Client code (React client components) can import `supabase` safely.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase: SupabaseClient | null =
  typeof window !== "undefined" && supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

// Note: code that uses `supabase` must run in the browser (client components).
// If you need a server-side Supabase client, create it on demand using server-side
// environment variables (e.g., using a different helper that uses SERVICE_ROLE key).
