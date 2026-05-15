import type { FieldValues, Resolver } from "react-hook-form";
import type { ZodTypeAny } from "zod";

// Zod v4 uses `.issues` not `.errors` — @hookform/resolvers@3.x only checks `.errors`
// so it re-throws ZodError instead of converting it to field errors. This resolver
// uses safeParse to avoid that entirely.
export function zodResolver<T extends FieldValues>(
  schema: ZodTypeAny,
): Resolver<T> {
  return async (values) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data as T, errors: {} as Record<string, never> };
    }
    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const path = (issue.path as (string | number)[]).join(".");
      if (!errors[path]) {
        errors[path] = { type: String(issue.code), message: issue.message };
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { values: {} as Record<string, never>, errors: errors as any };
  };
}
