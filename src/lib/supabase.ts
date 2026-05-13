import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy";

let supabaseUrl = rawUrl.trim();
const supabaseAnonKey = rawKey.trim();

if (!supabaseUrl.startsWith("http")) {
  supabaseUrl = "https://dummy.supabase.co";
}

// For client-side, we use createBrowserClient which handles cookies for PKCE
export const supabase = 
  typeof window !== "undefined"
    ? createBrowserClient(supabaseUrl, supabaseAnonKey)
    : createClient(supabaseUrl, supabaseAnonKey);
