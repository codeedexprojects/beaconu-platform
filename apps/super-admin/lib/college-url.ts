/**
 * Build a college subdomain URL from slug + optional port.
 *
 * In local dev the base origin comes from NEXT_PUBLIC_COLLEGE_BASE_URL
 * (fallback: "http://localhost:3002").
 *
 * In production the domain is derived from the current hostname
 * (fallback: "beaconuedx.com").
 */
export function getCollegeLink(slug: string, port?: string): string {
  if (typeof window === "undefined") return "";

  const hostname = window.location.hostname;
  const isLocal =
    hostname.includes("localhost") || hostname.includes("127.0.0.1");

  if (isLocal) {
    // e.g. NEXT_PUBLIC_COLLEGE_BASE_URL=http://localhost:3002
    const envBase =
      process.env.NEXT_PUBLIC_COLLEGE_BASE_URL ?? "http://localhost:3002";

    // If a port override is provided, swap it into the base URL
    if (port) {
      try {
        const url = new URL(envBase);
        url.port = port;
        return `${url.protocol}//${slug}.${url.hostname}:${url.port}`;
      } catch {
        return `http://${slug}.localhost:${port}`;
      }
    }

    try {
      const url = new URL(envBase);
      const portPart = url.port ? `:${url.port}` : "";
      return `${url.protocol}//${slug}.${url.hostname}${portPart}`;
    } catch {
      return `http://${slug}.localhost:3002`;
    }
  }

  // Production: derive base domain from current hostname
  const parts = hostname.split(".");
  if (parts.length >= 2) {
    const baseDomain = parts.slice(-2).join(".");
    return `https://${slug}.${baseDomain}`;
  }

  return `https://${slug}.beaconuedx.com`;
}
