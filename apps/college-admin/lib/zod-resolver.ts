/**
 * Custom zodResolver compatible with Zod v4.
 *
 * @hookform/resolvers v3 checks `Array.isArray(error.errors)` to detect a
 * ZodError, but Zod v4 stores issues in `.issues` and the `.errors` getter
 * may not satisfy that check.  This wrapper catches any ZodError (v3 or v4)
 * and converts it into the `{ errors, values }` shape react-hook-form expects.
 */
import type {
  FieldErrors,
  FieldValues,
  ResolverOptions,
  ResolverResult,
} from "react-hook-form";
import type { ZodSchema } from "zod";

function parseZodIssuesToFieldErrors(
  issues: Array<{ path: (string | number)[]; message: string; code: string }>,
): Record<string, { message: string; type: string }> {
  const errors: Record<string, { message: string; type: string }> = {};
  for (const issue of issues) {
    const path = issue.path.join(".");
    if (!errors[path]) {
      errors[path] = { message: issue.message, type: issue.code };
    }
  }
  return errors;
}

function setNestedError(
  target: Record<string, any>,
  path: string,
  error: { message: string; type: string },
) {
  const keys = path.split(".");
  let current = target;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = error;
}

export function zodResolver<T extends FieldValues>(schema: ZodSchema) {
  return async (
    values: T,
    _context: any,
    options: ResolverOptions<T>,
  ): Promise<ResolverResult<T>> => {
    try {
      const result = await schema.parseAsync(values);
      return { values: result as T, errors: {} as FieldErrors<T> };
    } catch (error: any) {
      // Zod v4 uses .issues, Zod v3 uses .errors — handle both
      const issues: Array<{
        path: (string | number)[];
        message: string;
        code: string;
      }> = error?.issues ?? error?.errors ?? [];

      if (issues.length === 0) {
        // Not a ZodError — rethrow
        throw error;
      }

      const flatErrors = parseZodIssuesToFieldErrors(issues);
      const nestedErrors: Record<string, any> = {};
      for (const [path, err] of Object.entries(flatErrors)) {
        setNestedError(nestedErrors, path, err);
      }

      return {
        values: {} as T,
        errors: nestedErrors as FieldErrors<T>,
      };
    }
  };
}
