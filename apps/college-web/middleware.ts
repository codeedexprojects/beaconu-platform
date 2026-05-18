import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COLLEGE_TOKEN_KEY } from "@/lib/constants";

// Routes that don't need authentication (landing pages)
const PUBLIC_PATHS = ["/", "/courses", "/campuses", "/login"];

// Routes that are strictly for student dashboard
const PROTECTED_PATHS = ["/dashboard", "/profile", "/settings"];

export function middleware(request: NextRequest) {
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

  // Handle subdomain rewriting
  if (subdomain && subdomain !== "www") {
    url.pathname = `/college/${subdomain}${url.pathname}`;
    // We rewrite instead of redirecting so the URL remains clean in the browser
    return NextResponse.rewrite(url);
  }

  // If no subdomain, we might want to redirect to main beaconu site or show a generic error
  // For now, just continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
