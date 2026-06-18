type PrismaErrorMeta = {
  field_name?: string;
};

export default function getPrismaErrorMessage(
  code: string,
  meta?: PrismaErrorMeta,
): string {
  const map: Record<string, string> = {
    P2002: "This record already exists.",
    P2025: "Record not found.",
    P2014: "Invalid relation.",
  };

  if (code === "P2003") {
    const field = (meta?.field_name ?? "").toLowerCase();

    if (
      field.includes("universitytypeid") ||
      field.includes("university_type_id")
    ) {
      return "Selected university type does not exist.";
    }

    if (field.includes("stream") || field.includes("discipline")) {
      return "Selected academic offering does not exist.";
    }

    return "Related record not found.";
  }

  return map[code] ?? "A database error occurred.";
}
