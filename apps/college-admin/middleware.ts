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

export function middleware(request: NextRequest) {
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
  const collegeSlug =
    firstSegment && !RESERVED_ROOT_ROUTES.has(firstSegment)
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

  if (segments[1] === "login") {
    nextUrl.pathname = "/login";
    return NextResponse.rewrite(nextUrl);
  }

  if (segments[1] === "setup-account") {
    nextUrl.pathname = "/setup-account";
    return NextResponse.rewrite(nextUrl);
  }

  if (segments[1] === "setup") {
    nextUrl.pathname = `/${segments.slice(1).join("/")}`;
    return NextResponse.rewrite(nextUrl);
  }

  const ACTIVE_CONSOLE_ROUTES = new Set([
    "roles",
    "staff",
    "hostels",
    "commute",
    "settings",
  ]);

  if (ACTIVE_CONSOLE_ROUTES.has(segments[1])) {
    nextUrl.pathname = `/${segments.slice(1).join("/")}`;
    return NextResponse.rewrite(nextUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
