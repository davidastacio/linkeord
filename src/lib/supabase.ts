import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy";

let supabaseUrl = rawUrl.trim();
const supabaseAnonKey = rawKey.trim();

if (!supabaseUrl.startsWith("http")) {
  supabaseUrl = "https://dummy.supabase.co";
}

if (typeof window !== "undefined" && supabaseUrl === "https://dummy.supabase.co") {
  console.warn("⚠️ Advertencia: Supabase URL invalida o no definida. Usando fallback.");
}

let client;
try {
  client = createClient(supabaseUrl, supabaseAnonKey);
} catch (e) {
  console.error("Error inicializando Supabase. Fallback activado.", e);
  client = createClient("https://dummy.supabase.co", "dummy");
}

export const supabase = client;
