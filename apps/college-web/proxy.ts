import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { extractCollegeSlugFromHost } from "@/lib/host-routing";
import { REFERRAL_CODE_KEY } from "@/lib/constants";

export function proxy(request: NextRequest) {
  const subdomain = extractCollegeSlugFromHost(request.headers.get("host"));

  const response = NextResponse.next();
  if (subdomain) {
    response.headers.set("x-college-subdomain", subdomain);
  }

  // Last-touch referral capture — only overwrites the cookie when a new
  // ?ref= is actually present in the URL, so cookie churn before a real
  // referral link is harmless.
  const ref = request.nextUrl.searchParams.get("ref");
  if (ref) {
    response.cookies.set(REFERRAL_CODE_KEY, ref, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
