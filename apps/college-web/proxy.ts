import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COLLEGE_TOKEN_KEY } from "@/lib/constants";

// Routes that don't need authentication (landing pages)
const PUBLIC_PATHS = ["/", "/courses", "/campuses", "/login"];

// Routes that are strictly for student dashboard
const PROTECTED_PATHS = ["/dashboard", "/profile", "/settings"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COLLEGE_TOKEN_KEY)?.value;
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Extract subdomain (e.g., amity-noida.beaconu.com -> amity-noida)
  // Support localhost testing (e.g., amity-noida.localhost:3001)
  let subdomain = null;
  const isLocalhost = hostname.includes("localhost");

  if (isLocalhost) {
    const parts = hostname.split(".");
    if (parts.length > 1 && parts[0] !== "localhost") {
      subdomain = parts[0];
    }
  } else {
    // Production logic
    const parts = hostname.split(".");
    if (parts.length >= 3) {
      subdomain = parts[0];
    }
  }

  // Subdomain-based routing: keep the clean URL in browser
  // Backend will use the Host header to identify the college
  // No rewriting needed anymore - URL stays as anupam.localhost:3001/
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
