import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ValidationError } from "@/shared/errors";

export function validate(
  schema: ZodSchema,
  target: "body" | "query" | "params" = "body",
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const data =
      target === "body"
        ? req.body
        : target === "query"
          ? req.query
          : req.params;

    const result = schema.safeParse(data);
    if (!result.success) {
      const message = result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join(", ");
      next(new ValidationError(message));
      return;
    }

    if (target === "body") {
      req.body = result.data;
    } else if (target === "query") {
      // In Express 5, req.query can be getter-only; mutate in place instead of reassigning.
      const query = req.query as Record<string, unknown>;
      for (const key of Object.keys(query)) {
        delete query[key];
      }
      Object.assign(query, result.data as Record<string, unknown>);
    } else {
      const params = req.params as Record<string, unknown>;
      for (const key of Object.keys(params)) {
        delete params[key];
      }
      Object.assign(params, result.data as Record<string, unknown>);
    }

    next();
  };
}
