import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { extractCollegeSlugFromHost } from "@/lib/host-routing";

const RESERVED_ROOT_ROUTES = new Set([
  "login",
  "setup-account",
  "setup",
  "api",
  "_next",
]);

const ACTIVE_CONSOLE_ROUTES = new Set([
  "roles",
  "staff",
  "hostels",
  "commute",
  "settings",
  "ambassadors",
  "campus-visits",
  "documents",
  "anti-ragging",
  "application-forms",
  "applications",
  "assessments",
  "interviews",
  "libraries",
  "media-kit",
  "notices",
  "quotas",
  "scholarships",
  "students",
  "support",
  "seat-cancellations",
]);

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const hostSlug = extractCollegeSlugFromHost(request.headers.get("host"));

  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  const segments = path.split("/").filter(Boolean);
  const firstSegment = segments[0];
  const isConsoleRoute =
    firstSegment && ACTIVE_CONSOLE_ROUTES.has(firstSegment);
  const collegeSlug =
    firstSegment && !RESERVED_ROOT_ROUTES.has(firstSegment) && !isConsoleRoute
      ? firstSegment
      : null;

  if (hostSlug && collegeSlug && hostSlug !== collegeSlug) {
    const nextUrl = request.nextUrl.clone();
    const tail = segments.slice(1);
    nextUrl.pathname = `/${hostSlug}${tail.length ? `/${tail.join("/")}` : ""}`;
    return NextResponse.redirect(nextUrl);
  }

  if (!collegeSlug) {
    return NextResponse.next();
  }

  const nextUrl = request.nextUrl.clone();

  if (segments.length === 1) {
    nextUrl.pathname = "/";
    return NextResponse.rewrite(nextUrl);
  }

  nextUrl.pathname = `/${segments.slice(1).join("/")}`;
  return NextResponse.rewrite(nextUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
