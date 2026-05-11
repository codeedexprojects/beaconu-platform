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

    if (target === "body") req.body = result.data;
    else if (target === "query") req.query = result.data as typeof req.query;
    else req.params = result.data as typeof req.params;

    next();
  };
}
