import { AppError } from "./app-error";
import { ErrorCode } from "../responses/error-codes";

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    const normalizedResource = resource.trim();
    const message = /not found$/i.test(normalizedResource)
      ? normalizedResource
      : `${normalizedResource} not found`;

    super(message, 404, ErrorCode.NOT_FOUND);
  }
}
