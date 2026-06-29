/**
 * Custom Zod v4-compatible resolver for react-hook-form.
 *
 * `@hookform/resolvers/zod` v3 checks `error instanceof z.ZodError` using its
 * own bundled Zod v3 class.  When the app runs Zod v4, the `instanceof` fails
 * and the validation error is thrown as an unhandled promise rejection instead
 * of being mapped to form-field errors.
 *
 * This resolver uses `safeParse` (never throws) and manually walks the Zod
 * error issues array, so it works with both Zod v3 and v4.  A try-catch guard
 * is included because some Zod v4 format validators (`.uuid()`, `.regex()`)
 * have been observed to throw even from `safeParse`.
 */
import type { FieldErrors, FieldValues, Resolver } from "react-hook-form";
import { z } from "zod";

function setNestedFieldError(
  fieldErrors: Record<string, unknown>,
  path: (string | number)[],
  error: { type: string; message: string },
): void {
  if (path.length === 0) return;

  let current = fieldErrors;
  for (let i = 0; i < path.length - 1; i++) {
    const key = String(path[i]);
    const existing = current[key];
    if (
      existing === undefined ||
      existing === null ||
      typeof existing !== "object" ||
      ("type" in existing && "message" in existing)
    ) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  const lastKey = String(path[path.length - 1]);
  if (!(lastKey in current)) {
    current[lastKey] = error;
  }
}

function mapZodErrorToFieldErrors<TFieldValues extends FieldValues>(
  error: z.ZodError,
): FieldErrors<TFieldValues> {
  const fieldErrors = {} as FieldErrors<TFieldValues>;

  for (const issue of error.issues ?? (error as any).errors ?? []) {
    const path = issue.path as (string | number)[];
    if (path.length === 0) continue;

    setNestedFieldError(fieldErrors as Record<string, unknown>, path, {
      type: issue.code ?? "validation",
      message: issue.message,
    });
  }

  return fieldErrors;
}

export function zodResolver<T extends z.ZodTypeAny>(
  schema: T,
): Resolver<z.output<T> extends FieldValues ? z.output<T> : FieldValues> {
  type TResolverValues =
    z.output<T> extends FieldValues ? z.output<T> : FieldValues;

  const resolver: Resolver<TResolverValues> = async (values) => {
    try {
      const result = schema.safeParse(values);

      if (result.success) {
        return {
          values: result.data as TResolverValues,
          errors: {},
        };
      }

      return {
        values: {} as Record<string, never>,
        errors: mapZodErrorToFieldErrors<TResolverValues>(result.error),
      };
    } catch (thrown: unknown) {
      // Zod v4 format validators (.uuid(), .regex(), .email() etc.) can throw
      // even from safeParse.  Catch and map them to field errors.
      if (thrown instanceof z.ZodError) {
        return {
          values: {} as Record<string, never>,
          errors: mapZodErrorToFieldErrors<TResolverValues>(thrown),
        };
      }

      // Duck-type check for ZodError-like objects (cross-version instanceof
      // can fail when multiple copies of zod are installed).
      if (
        thrown &&
        typeof thrown === "object" &&
        "issues" in thrown &&
        Array.isArray((thrown as any).issues)
      ) {
        return {
          values: {} as Record<string, never>,
          errors: mapZodErrorToFieldErrors<TResolverValues>(
            thrown as z.ZodError,
          ),
        };
      }

      throw thrown;
    }
  };

  return resolver;
}
