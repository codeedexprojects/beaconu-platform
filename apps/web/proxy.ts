import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BLOG_TOKEN_KEY } from "@/lib/constants";

const PROTECTED_PREFIXES = ["/my"];

const AUTH_PATHS = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(BLOG_TOKEN_KEY)?.value;

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  const isAuthPage = AUTH_PATHS.includes(pathname);

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login/register
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/my/blogs", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
