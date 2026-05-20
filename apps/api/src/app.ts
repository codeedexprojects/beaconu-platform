import express, { Express } from "express";

import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { requestId } from "@/shared/middleware/request-id";
import { errorHandler } from "@/shared/middleware/error-handler";
import { NotFoundError } from "@/shared/errors";
import { env } from "@/shared/config/env";
import apiRouter from "@/routes/index";

const app: Express = express();

const STATIC_ALLOWED_ORIGINS = new Set([
  "https://beaconu-platform-ls9p.vercel.app",
]);

const BEACONU_VERCEL_ORIGIN_REGEX =
  /^https:\/\/beaconu-platform(?:-[a-z0-9-]+)?\.vercel\.app$/i;

function isAllowedProductionOrigin(origin: string): boolean {
  return (
    STATIC_ALLOWED_ORIGINS.has(origin) ||
    BEACONU_VERCEL_ORIGIN_REGEX.test(origin)
  );
}

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (env.NODE_ENV === "development") {
        callback(null, true);
        return;
      }

      if (!origin) {
        callback(null, true);
        return;
      }

      if (isAllowedProductionOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(requestId);
app.use(morgan("combined"));

app.use(apiRouter);

app.use((_req, _res, next) => {
  next(new NotFoundError("Route not found"));
});

app.use(errorHandler);

export default app;
