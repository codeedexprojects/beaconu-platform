const RESERVED_HOST_LABELS = new Set(["www"]);

/**
 * Extracts college slug from host across localhost and production domains.
 *
 * Supported:
 * - slug.localhost:3001
 * - slug.beaconu.in
 */
export function extractCollegeSlugFromHost(
  host?: string | null,
): string | null {
  if (!host) return null;

  const hostname = host.split(":")[0].toLowerCase();
  const parts = hostname.split(".").filter(Boolean);

  if (parts.length < 2) return null;

  const [slug] = parts;
  if (RESERVED_HOST_LABELS.has(slug)) return null;

  return slug;
}
