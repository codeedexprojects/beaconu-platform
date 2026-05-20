const RESERVED_ROOT_ROUTES = new Set([
  "login",
  "setup-account",
  "setup",
  "_next",
  "api",
]);

function getCollegeSlugFromHost(host?: string): string | null {
  if (!host) return null;

  const hostname = host.split(":")[0];
  const hostSegments = hostname.split(".").filter(Boolean);

  if (hostSegments.length === 0) return null;
  if (hostSegments[0] === "localhost") return null;

  if (hostname.includes("localhost")) {
    return hostSegments[0] ?? null;
  }

  if (hostSegments.length >= 3) {
    return hostSegments[0] ?? null;
  }

  return null;
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
  const baseUrl =
    process.env.NEXT_PUBLIC_COLLEGE_WEB_URL ?? "http://localhost:3001";

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!slug) {
    const url = new URL(baseUrl);
    url.pathname = normalizedPath;
    return url.toString();
  }

  // For localhost, format as http://slug.localhost:port/path
  if (baseUrl.includes("localhost")) {
    const port = baseUrl.split(":")[2] || "3001";
    return `http://${slug}.localhost:${port}${normalizedPath === "/" ? "" : normalizedPath}`;
  }

  // For production, format as https://slug.domain/path
  const url = new URL(baseUrl);
  const hostname = url.hostname;
  return `${url.protocol}//${slug}.${hostname}${normalizedPath === "/" ? "" : normalizedPath}`;
}
