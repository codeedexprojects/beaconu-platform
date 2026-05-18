import { prisma } from "@beaconu/db";

/**
 * Convert a human-readable name to a URL-safe slug.
 * e.g. "IIT Delhi" → "iit-delhi"
 *      "Amity University (Noida)" → "amity-university-noida"
 */
export function toSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars except spaces and hyphens
    .replace(/\s+/g, "-") // spaces → hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-|-$/g, ""); // trim leading/trailing hyphens
}

/**
 * Generate a college code from name.
 * e.g. "IIT Delhi" → "IITD", "Amity University Noida" → "AUN"
 */
export function toCollegeCode(name: string): string {
  const words = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 6);
  }

  return words
    .map((w) => w[0])
    .join("")
    .slice(0, 8);
}

/**
 * Ensure a slug is unique in the colleges table.
 * If taken, appends -2, -3, etc. until a free slug is found.
 */
export async function ensureUniqueCollegeSlug(base: string): Promise<string> {
  const existing = await prisma.college.findUnique({ where: { slug: base } });
  if (!existing) return base;

  let counter = 2;
  while (true) {
    const candidate = `${base}-${counter}`;
    const taken = await prisma.college.findUnique({
      where: { slug: candidate },
    });
    if (!taken) return candidate;
    counter++;
  }
}

/**
 * Ensure a college code is unique.
 * If taken, appends 2, 3, etc.
 */
export async function ensureUniqueCollegeCode(base: string): Promise<string> {
  const existing = await prisma.college.findUnique({ where: { code: base } });
  if (!existing) return base;

  let counter = 2;
  while (true) {
    const candidate = `${base}${counter}`;
    const taken = await prisma.college.findUnique({
      where: { code: candidate },
    });
    if (!taken) return candidate;
    counter++;
  }
}
