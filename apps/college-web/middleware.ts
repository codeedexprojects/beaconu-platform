import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COLLEGE_TOKEN_KEY } from "@/lib/constants";

const PUBLIC_PATHS = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COLLEGE_TOKEN_KEY)?.value;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Authenticated student hitting /login → send to dashboard
  if (isPublic && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Unauthenticated student hitting a protected route → send to login
  if (!isPublic && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
