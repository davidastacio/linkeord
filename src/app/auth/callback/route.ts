import { NextResponse } from "next/server";

// Firebase Auth uses client-side popups/redirects — no server callback needed.
// This route exists only as a fallback.
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/login`);
}
