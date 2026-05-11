import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy";

if (typeof window !== "undefined" && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn("⚠️ Advertencia: NEXT_PUBLIC_SUPABASE_URL no esta definida.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
