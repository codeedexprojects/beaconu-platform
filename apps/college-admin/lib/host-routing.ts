const RESERVED_HOST_LABELS = new Set(["www", "admin"]);

/**
 * Extracts college slug from host across localhost, legacy wildcard,
 * and namespaced wildcard domains.
 *
 * Supported:
 * - slug.localhost:3002
 * - slug.beaconuedx.com
 * - slug.admin.beaconuedx.com
 */
export function extractCollegeSlugFromHost(
  host?: string | null,
): string | null {
  if (!host) return null;

  const hostname = host.split(":")[0].toLowerCase();
  const parts = hostname.split(".").filter(Boolean);

  if (parts.length === 0) return null;

  if (hostname.includes("localhost")) {
    if (parts.length > 1 && parts[0] !== "localhost") {
      return parts[0] ?? null;
    }
    return null;
  }

  // namespaced pattern: slug.admin.beaconuedx.com
  if (parts.length >= 4) {
    return parts[0] ?? null;
  }

  // legacy pattern: slug.beaconuedx.com
  if (parts.length === 3) {
    const candidate = parts[0];
    return RESERVED_HOST_LABELS.has(candidate) ? null : candidate;
  }

  return null;
}
