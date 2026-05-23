import { extractCollegeSlugFromHost } from "./host-routing";

const RESERVED_ROOT_ROUTES = new Set([
  "login",
  "setup-account",
  "setup",
  "_next",
  "api",
]);

function getCollegeSlugFromHost(host?: string): string | null {
  return extractCollegeSlugFromHost(host);
}

function getCollegeSlugFromPathOnly(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const [firstSegment] = segments;
  if (!RESERVED_ROOT_ROUTES.has(firstSegment)) {
    return firstSegment;
  }

  return null;
}

export function getCollegeSlugFromPath(
  pathname: string,
  host?: string,
): string | null {
  const hostSlug = getCollegeSlugFromHost(host);
  if (hostSlug) return hostSlug;

  return getCollegeSlugFromPathOnly(pathname);
}

export function getCollegeSlugFromLocation(
  pathname: string,
  host?: string,
): string | null {
  return getCollegeSlugFromPath(pathname, host);
}

export function isCollegeRouteMismatch(
  pathname: string,
  host?: string,
): boolean {
  const hostSlug = getCollegeSlugFromHost(host);
  const pathSlug = getCollegeSlugFromPathOnly(pathname);

  if (!hostSlug || !pathSlug) return false;
  return hostSlug !== pathSlug;
}

export function getPortalPath(slug: string | null, path: string): string {
  if (!slug) return path;
  return `/${slug}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getPublicPortalUrl(
  slug: string | null,
  path: string = "/",
): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const pathSuffix = normalizedPath === "/" ? "" : normalizedPath;

  if (!slug) {
    const baseUrl =
      process.env.NEXT_PUBLIC_COLLEGE_WEB_URL ?? "http://localhost:3001";
    const url = new URL(baseUrl);
    url.pathname = normalizedPath;
    return url.toString();
  }

  // If NEXT_PUBLIC_COLLEGE_WEB_URL is explicitly set, use it
  const envUrl = process.env.NEXT_PUBLIC_COLLEGE_WEB_URL;
  if (envUrl) {
    if (envUrl.includes("localhost")) {
      const port = envUrl.split(":")[2] || "3001";
      return `http://${slug}.localhost:${port}/college/${slug}${pathSuffix}`;
    }
    const url = new URL(envUrl);
    return `${url.protocol}//${slug}.${url.hostname}/college/${slug}${pathSuffix}`;
  }

  // Fallback: detect from current window location
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const isLocal =
      hostname.includes("localhost") || hostname.includes("127.0.0.1");
    if (isLocal) {
      return `http://${slug}.localhost:3001/college/${slug}${pathSuffix}`;
    }
    // Production: derive base domain (e.g. admin.beaconuedx.com → beaconuedx.com)
    const parts = hostname.split(".");
    const baseDomain =
      parts.length >= 2 ? parts.slice(-2).join(".") : "beaconuedx.com";
    return `https://${slug}.${baseDomain}/college/${slug}${pathSuffix}`;
  }

  // SSR fallback
  return `http://${slug}.localhost:3001/college/${slug}${pathSuffix}`;
}
