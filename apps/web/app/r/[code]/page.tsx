import type { Metadata } from "next";
import { headers } from "next/headers";
import { validateInviteCode } from "@/lib/services/invite.server";

// Referral share link fallback, shown only when the app is not installed.
// iOS has no Install Referrer equivalent, hence the code shown for manual entry.

export const dynamic = "force-dynamic";

// Not NEXT_PUBLIC_*: those are inlined at build time; these are server-only
// and read per request so a URL change needs no rebuild.
function storeUrls() {
  return {
    play: process.env.PLAY_STORE_URL,
    appStore: process.env.APP_STORE_URL,
  };
}

export const metadata: Metadata = {
  title: "You've been invited to BeaconU",
  description:
    "Join BeaconU to explore colleges, apply, and track your admission — all in one app.",
  robots: { index: false, follow: false },
};

/** Carries the code through the Play Store install. */
function playStoreUrlWithReferrer(
  playStoreUrl: string | undefined,
  code: string,
): string | null {
  if (!playStoreUrl) return null;
  try {
    const url = new URL(playStoreUrl);
    url.searchParams.set(
      "referrer",
      `utm_source=beaconu&utm_medium=invite&ref=${code}`,
    );
    return url.toString();
  } catch {
    return playStoreUrl;
  }
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const userAgent = (await headers()).get("user-agent") ?? "";
  const isAndroid = /android/i.test(userAgent);
  const isIos = /iphone|ipad|ipod/i.test(userAgent);

  const isValid = await validateInviteCode(code);
  const { play, appStore } = storeUrls();
  const playUrl = playStoreUrlWithReferrer(play, code);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        {isValid ? (
          <>
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
              You&apos;ve been invited
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-gray-900">
              Join BeaconU
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Explore colleges, apply, and track your admission in one place.
              Install the app and enter this code when you sign up.
            </p>

            <div className="mt-6 rounded-xl bg-gray-50 p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Your invite code
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tracking-[0.2em] text-gray-900">
                {code}
              </p>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-gray-900">
              This invite link isn&apos;t valid
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              The code may have expired or been typed incorrectly. You can still
              install BeaconU and get started without one.
            </p>
          </>
        )}

        <div className="mt-8 space-y-3">
          {/* Both always shown — UA sniffing is a hint, not a guarantee. */}
          {(!isIos || isAndroid) && playUrl && (
            <a
              href={playUrl}
              className="block w-full rounded-xl bg-gray-900 px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Get it on Google Play
            </a>
          )}
          {(!isAndroid || isIos) && appStore && (
            <a
              href={appStore}
              className="block w-full rounded-xl border border-gray-300 px-5 py-3 text-center text-sm font-medium text-gray-900 transition hover:bg-gray-50"
            >
              Download on the App Store
            </a>
          )}
          {!playUrl && !appStore && (
            <p className="text-center text-sm text-gray-500">
              The BeaconU app is coming soon.
            </p>
          )}
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-gray-500">
        Already have the app? Open it and enter your code during sign up.
      </p>
    </main>
  );
}
