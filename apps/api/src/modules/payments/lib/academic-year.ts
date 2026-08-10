export function normalizeAcademicYear(value: string): string {
  const parts = value.match(/\d+/g) ?? [];
  if (parts.length === 0) return value.trim();
  const start = (parts[0] ?? "").slice(-4).padStart(4, "0");
  const end = parts[1] ? parts[1].slice(-2).padStart(2, "0") : "";
  return end ? `${start}-${end}` : start;
}
