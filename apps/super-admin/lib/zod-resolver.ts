import type { FieldValues, Resolver } from "react-hook-form";
import type { ZodTypeAny } from "zod";

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
