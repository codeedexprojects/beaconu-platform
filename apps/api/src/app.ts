import express, { Express } from "express";

import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { requestId } from "@/shared/middleware/request-id";
import { errorHandler } from "@/shared/middleware/error-handler";
import { NotFoundError } from "@/shared/errors";
import { corsOriginCallback } from "@/shared/config/allowed-origins";
import apiRouter from "@/routes/index";

const app: Express = express();

app.use(helmet());
app.use(
  cors({
    origin: corsOriginCallback,
    credentials: true,
  }),
);
app.use(compression());
app.use(
  express.json({
    limit: "10mb",
    verify: (req, _res, buf) => {
      (req as express.Request).rawBody = buf;
    },
  }),
);
app.use(cookieParser());
app.use(requestId);
app.use(morgan("combined"));

app.use(apiRouter);

app.use((_req, _res, next) => {
  next(new NotFoundError("Route not found"));
});

app.use(errorHandler);

export default app;
