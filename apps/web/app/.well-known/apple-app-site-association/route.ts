import { NextResponse } from "next/server";

// iOS Universal Links. A Route Handler, not a static file: the path has no
// .json extension but must still return Content-Type: application/json, which
// public/ would serve as octet-stream and silently fail validation.

export const dynamic = "force-dynamic";

export function GET() {
  const teamId = process.env.IOS_TEAM_ID;
  const bundleId = process.env.IOS_BUNDLE_ID;

  // Absent beats wrong — links fall back to the web page.
  if (!teamId || !bundleId) {
    return new NextResponse("Not configured", { status: 404 });
  }

  const appId = `${teamId}.${bundleId}`;

  return new NextResponse(
    JSON.stringify({
      applinks: {
        // `apps` must be present and empty for older iOS versions.
        apps: [],
        details: [
          {
            appIDs: [appId],
            components: [{ "/": "/r/*", comment: "Referral invite links" }],
          },
        ],
      },
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      },
    },
  );
}
