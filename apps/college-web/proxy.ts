import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { extractCollegeSlugFromHost } from "@/lib/host-routing";

export function proxy(request: NextRequest) {
  const subdomain = extractCollegeSlugFromHost(request.headers.get("host"));

  const response = NextResponse.next();
  if (subdomain) {
    response.headers.set("x-college-subdomain", subdomain);
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
