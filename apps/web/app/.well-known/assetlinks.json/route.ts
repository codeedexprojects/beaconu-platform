import { NextResponse } from "next/server";

// Android App Links verification. Fingerprints must include BOTH the Play App
// Signing and upload certificates (Play Console > App integrity > App signing).
// Android caches verification, so a wrong file is worse than a missing one.

export const dynamic = "force-dynamic";

export function GET() {
  const packageName =
    process.env.ANDROID_PACKAGE_NAME ?? "com.beaconu.launchpad";
  const fingerprints = (
    process.env.ANDROID_SHA256_FINGERPRINTS ??
    "02:68:D1:83:2F:FE:4C:60:B9:D4:EE:83:7D:4B:2A:7C:B3:29:D8:0D:C8:48:44:F0:5F:80:6A:B0:AD:8D:DA:F6"
  )
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
