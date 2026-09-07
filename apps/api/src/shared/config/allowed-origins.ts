import { env } from "@/shared/config/env";

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

/** The one origin-allowlist rule for this backend — shared by the REST
 * CORS middleware (`app.ts`) and the chat Socket.IO server
 * (`modules/chat/lib/socket-server.ts`) so a WebSocket connection can never
 * be held to a looser origin policy than an HTTP request. */
export function isRequestOriginAllowed(origin: string | undefined): boolean {
  if (env.NODE_ENV === "development") return true;
  if (!origin) return true;
  return isAllowedProductionOrigin(origin);
}

/** `cors`-package-shaped origin callback (the same shape Socket.IO's own
 * `cors.origin` option expects), for call sites that want the raw
 * (origin, callback) form instead of a boolean check. */
export function corsOriginCallback(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
): void {
  if (isRequestOriginAllowed(origin)) {
    callback(null, true);
    return;
  }
  callback(new Error("Not allowed by CORS"));
}
