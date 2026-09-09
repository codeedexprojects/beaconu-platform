import { NextResponse } from "next/server";

// Android App Links verification. Fingerprints must include BOTH the Play App
// Signing and upload certificates (Play Console > App integrity > App signing).
// Android caches verification, so a wrong file is worse than a missing one.

export const dynamic = "force-dynamic";

export function GET() {
  const packageName = process.env.ANDROID_PACKAGE_NAME;
  const fingerprints = (process.env.ANDROID_SHA256_FINGERPRINTS ?? "")
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);

  // 404 rather than serve a wrong file — links fall back to the web page.
  if (!packageName || fingerprints.length === 0) {
    return new NextResponse("Not configured", { status: 404 });
  }

  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: packageName,
          sha256_cert_fingerprints: fingerprints,
        },
      },
    ],
    { headers: { "Cache-Control": "public, max-age=300" } },
  );
}
