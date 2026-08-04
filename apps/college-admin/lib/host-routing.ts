const RESERVED_HOST_LABELS = new Set(["www", "admin"]);

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

  if (parts.length >= 4) {
    return parts[0] ?? null;
  }

  if (parts.length === 3) {
    const candidate = parts[0];
    return RESERVED_HOST_LABELS.has(candidate) ? null : candidate;
  }

  return null;
}
