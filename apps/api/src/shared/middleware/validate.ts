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
      // In Express 5, req.query is a prototype-level getter that re-parses
      // the raw URL on every access (never cached) — mutating its return
      // value is a no-op for later reads. Define an own property on this
      // request instance to shadow the getter with the validated data.
      Object.defineProperty(req, "query", {
        value: result.data,
        writable: true,
        enumerable: true,
        configurable: true,
      });
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
