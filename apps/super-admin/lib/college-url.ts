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
      const isAdminPort = port === "3002";

      try {
        const url = new URL(envBase);
        url.port = port;
        const localBaseHostname = isAdminPort
          ? "admin.localhost"
          : url.hostname;
        return `${url.protocol}//${slug}.${localBaseHostname}:${url.port}`;
      } catch {
        return isAdminPort
          ? `http://${slug}.admin.localhost:${port}`
          : `http://${slug}.localhost:${port}`;
      }
    }

    try {
      const url = new URL(envBase);
      const portPart = url.port ? `:${url.port}` : "";
      const isDefaultAdminLocal =
        url.hostname === "localhost" && (!url.port || url.port === "3002");
      const localBaseHostname = isDefaultAdminLocal
        ? "admin.localhost"
        : url.hostname;

      return `${url.protocol}//${slug}.${localBaseHostname}${portPart}`;
    } catch {
      return `http://${slug}.admin.localhost:3002`;
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
