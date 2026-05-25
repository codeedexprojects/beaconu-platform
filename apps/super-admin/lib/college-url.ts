/**
 * Build college portal URLs from a slug.
 *
 * Local dev:
 *   Public  → http://{slug}.localhost:3001/college/{slug}
 *   Admin   → http://{slug}.admin.localhost:3002/{slug}
 *
 * Production:
 *   Public  → https://{slug}.beaconuedx.com/college/{slug}
 *   Admin   → https://{slug}.admin.beaconuedx.com/{slug}
 *
 * The local dev base is read from NEXT_PUBLIC_COLLEGE_BASE_URL
 * (fallback: "http://localhost:3002").
 */

const PROD_DOMAIN = "beaconuedx.com";

export function getCollegeLink(slug: string, port?: string): string {
  if (typeof window === "undefined") return "";

  const hostname = window.location.hostname;
  const isLocal =
    hostname.includes("localhost") || hostname.includes("127.0.0.1");

  const isPublicPort = port === "3001";
  const isAdminPort = !port || port === "3002";

  if (isLocal) {
    const envBase =
      process.env.NEXT_PUBLIC_COLLEGE_BASE_URL ?? "http://localhost:3002";

    const resolvedPort = port ?? "3002";

    if (isPublicPort) {
      // Public portal: http://{slug}.localhost:3001/college/{slug}
      return `http://${slug}.localhost:${resolvedPort}/college/${slug}`;
    }

    // Admin portal: http://{slug}.admin.localhost:3002/{slug}
    try {
      const url = new URL(envBase);
      const p = url.port || resolvedPort;
      return `${url.protocol}//${slug}.admin.localhost:${p}/${slug}`;
    } catch {
      return `http://${slug}.admin.localhost:${resolvedPort}/${slug}`;
    }
  }

  // ── Production ──
  const baseDomain = (() => {
    const parts = hostname.split(".");
    if (parts.length >= 2) return parts.slice(-2).join(".");
    return PROD_DOMAIN;
  })();

  if (isPublicPort) {
    // Public portal: https://{slug}.{baseDomain}/college/{slug}
    return `https://${slug}.${baseDomain}/college/${slug}`;
  }

  // Admin portal: https://{slug}.admin.{baseDomain}/{slug}
  return `https://${slug}.admin.${baseDomain}/${slug}`;
}
