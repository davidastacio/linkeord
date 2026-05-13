import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cswnnopcsftiscuevlpw.supabase.co";
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_eBfrlW1y7v0MB3I1iwjRoQ_UqyMJP4M";

const supabase = createClient(rawUrl, rawKey);

async function checkProfiles() {
  console.log("Checking if profiles table exists...");
  const { data, error } = await supabase.from("profiles").select("*").limit(1);
  if (error) {
    console.error("Error or missing table:", error.message);
  } else {
    console.log("Profiles table EXISTS! Data:", data);
  }
}

checkProfiles();
