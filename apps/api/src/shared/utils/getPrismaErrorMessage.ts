export default function getPrismaErrorMessage(code: string): string {
  const map: Record<string, string> = {
    P2002: "This record already exists.",
    P2025: "Record not found.",
    P2003: "Related record not found.",
    P2014: "Invalid relation.",
  };
  return map[code] ?? "A database error occurred.";
}
