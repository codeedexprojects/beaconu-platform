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
      if (thrown instanceof z.ZodError) {
        return {
          values: {} as Record<string, never>,
          errors: mapZodErrorToFieldErrors<TResolverValues>(thrown),
        };
      }

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
