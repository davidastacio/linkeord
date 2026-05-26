import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  console.log("Auth Callback triggered. Code present:", !!code);

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    console.log("Exchanging code for session...");
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Exchange error:", exchangeError.message);
      return NextResponse.redirect(`${origin}/login?error=auth_failed&reason=exchange_error`);
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("User fetch error:", userError?.message || "No user found");
      return NextResponse.redirect(`${origin}/login?error=auth_failed&reason=user_not_found`);
    }

    console.log("User authenticated:", user.email);

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Profile fetch error:", profileError.message);
    }

    if (!profile) {
      console.log("Creating new profile for user...");
      const { error: insertError } = await supabase.from("profiles").insert([
        {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0],
          role: "emprendedor",
          approved: false,
        }
      ]);

      if (insertError) {
        console.error("Profile insert error:", insertError.message);
        // We still redirect to dashboard, maybe RLS is blocking but user is auth
      }
    }

    let target = next;
    if (next === "/dashboard") {
      if (profile?.role === "admin") {
        target = "/admin";
      } else if (profile?.role === "proveedor") {
        target = "/provider";
      } else if (profile?.role === "delivery") {
        target = "/delivery";
      } else {
        target = "/dashboard";
      }
    } else {
      if (profile?.role === "admin" && !next.startsWith("/admin")) {
        target = "/admin";
      } else if (profile?.role === "proveedor" && !next.startsWith("/provider")) {
        target = "/provider";
      } else if (profile?.role === "delivery" && !next.startsWith("/delivery")) {
        target = "/delivery";
      }
    }

    const redirectUrl = `${origin}${target}`;
    console.log("Redirecting to:", redirectUrl);
    return NextResponse.redirect(redirectUrl);
  }

  console.warn("No code found in callback URL");
  return NextResponse.redirect(`${origin}/login?error=auth_failed&reason=no_code`);
}
