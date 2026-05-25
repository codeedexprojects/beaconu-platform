import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COLLEGE_TOKEN_KEY } from "@/lib/constants";
import { extractCollegeSlugFromHost } from "@/lib/host-routing";

// Routes that don't need authentication (landing pages)
const PUBLIC_PATHS = ["/", "/courses", "/campuses", "/login"];

// Routes that are strictly for student dashboard
const PROTECTED_PATHS = ["/dashboard", "/profile", "/settings"];

export function proxy(request: NextRequest) {
  const token = request.cookies.get(COLLEGE_TOKEN_KEY)?.value;
  const subdomain = extractCollegeSlugFromHost(request.headers.get("host"));

  void token;
  void subdomain;

  // Subdomain-based routing: keep the clean URL in browser
  // Backend will use the Host header to identify the college
  // No rewriting needed anymore - URL stays as slug.localhost:3001/
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
