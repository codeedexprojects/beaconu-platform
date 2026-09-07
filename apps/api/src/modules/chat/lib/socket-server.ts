import type { Server as HttpServer } from "http";
import type { Redis } from "ioredis";
import { Server, Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { getRedisClient } from "@/shared/lib/redis";
import { verifyAccessToken } from "@/shared/middleware/authenticate";
import { corsOriginCallback } from "@/shared/config/allowed-origins";
import { logger } from "@/shared/lib/logger";
import type { UserType } from "@/modules/auth/auth.types";

let io: Server | null = null;
// The Redis adapter's pub/sub pair — separate connections from the main
// getRedisClient() singleton (which disconnectRedis() already handles), so
// shutdown has to close these explicitly too. See closeChatSocketServer().
let adapterPubClient: Redis | null = null;
let adapterSubClient: Redis | null = null;

function personalRoom(userType: UserType, userId: string): string {
  return `${userType}:${userId}`;
}

// No per-user/per-connection throttling exists anywhere else in this
// codebase yet, so chat — the first WebSocket surface — has to guard
// itself: one JWT reused in a loop could otherwise open unbounded parallel
// connections and exhaust server memory/file descriptors.
const MAX_SOCKETS_PER_USER = 5;

/** Boots the Socket.IO server on the same HTTP server Express listens on.
 * Every authenticated socket joins one personal room keyed by its own
 * userType+userId — a new chat message is emitted directly to the
 * recipient's personal room, so no per-conversation room bookkeeping is
 * needed (see Plan AH, Design Decision #5). */
export function initChatSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: corsOriginCallback, credentials: true },
  });

  // apps/api/CLAUDE.md's anti-patterns list rules out "pub/sub inside
  // monolith" — that rule targets using Redis pub/sub as a business-logic
  // event bus to decouple services from each other, which this is not.
  // This is Socket.IO's own documented mechanism for letting a WebSocket
  // event reach a client connected to a *different* instance of this same
  // process behind a load balancer — infra-level transport plumbing for a
  // single feature, not a new inter-service messaging pattern. Confirmed
  // as an accepted, deliberate exception when this module was planned.
  adapterPubClient = getRedisClient().duplicate();
  adapterSubClient = getRedisClient().duplicate();
  // .duplicate() does NOT carry over the original client's error handling —
  // ioredis clients are EventEmitters, and an 'error' event with zero
  // listeners is an uncaught exception that crashes the whole process, not
  // just chat. Every ioredis client this codebase creates needs its own
  // listener; getRedisClient() already does this for the main client.
  for (const client of [adapterPubClient, adapterSubClient]) {
    client.on("error", (error) => {
      logger.error({ error }, "Chat Redis adapter connection error");
    });
  }
  io.adapter(createAdapter(adapterPubClient, adapterSubClient));

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      next(new Error("Missing auth token"));
      return;
    }
    verifyAccessToken(token)
      .then((payload) => {
        if (
          payload.userType !== "student" &&
          payload.userType !== "blink_ambassador"
        ) {
          next(new Error("Unsupported user type for chat"));
          return;
        }
        socket.data.userId = payload.userId;
        socket.data.userType = payload.userType;
        next();
      })
      .catch(() => next(new Error("Invalid or expired token")));
  });

  io.on("connection", (socket: Socket) => {
    const { userId, userType } = socket.data as {
      userId: string;
      userType: UserType;
    };
    const room = personalRoom(userType, userId);

    void Promise.resolve(socket.join(room)).then(async () => {
      // Checked via the adapter (allSockets), not a local Map, so this cap
      // holds even once this server runs as more than one instance behind
      // the Redis adapter — a local-only count would undercount connections
      // sitting on other instances.
      const members = await io!.in(room).allSockets();
      if (members.size > MAX_SOCKETS_PER_USER) {
        logger.warn(
          { userId, userType, activeConnections: members.size },
          "Chat socket connection cap exceeded — disconnecting newest connection",
        );
        socket.disconnect(true);
        return;
      }
      logger.info({ userId, userType }, "Chat socket connected");
    });

    socket.on("disconnect", () => {
      logger.info({ userId, userType }, "Chat socket disconnected");
    });
  });

  return io;
}

export function getChatIO(): Server | null {
  return io;
}

/** Forcibly disconnects every connected chat socket. Call this BEFORE
 * `httpServer.close()` during graceful shutdown — `httpServer.close()`'s
 * callback only fires once every open connection has drained, and
 * Socket.IO's connections are long-lived by design, so without this the
 * server hangs past the platform's shutdown grace period and gets
 * SIGKILLed instead of exiting cleanly.
 *
 * Deliberately does NOT call `io.close()` — that would also close the
 * shared httpServer itself (Socket.IO closes the server it was attached
 * to), which is `httpServer.close()`'s job here, not this function's. */
export function disconnectAllChatSockets(): void {
  io?.disconnectSockets(true);
}

/** Quits the Redis adapter's duplicated pub/sub connections — separate
 * from the single getRedisClient() singleton that `disconnectRedis()`
 * already handles, so shutdown has to close these explicitly too or they
 * leak on every restart. */
export async function quitChatRedisAdapter(): Promise<void> {
  // allSettled, not all — one client's quit() rejecting (e.g. it already
  // errored out) must not stop the other from being quit and both refs from
  // being cleared; a partial failure here shouldn't cascade into skipping
  // the rest of the shutdown chain in server.ts.
  const results = await Promise.allSettled(
    [adapterPubClient, adapterSubClient].map((client) => client?.quit()),
  );
  adapterPubClient = null;
  adapterSubClient = null;
  for (const result of results) {
    if (result.status === "rejected") {
      logger.error(
        { error: result.reason },
        "Failed to quit a chat Redis adapter connection",
      );
    }
  }
}

/** Best-effort — a disconnected recipient simply doesn't get the live
 * update and sees the message on their next REST fetch instead. */
export function emitChatMessage(
  recipientType: UserType,
  recipientId: string,
  payload: unknown,
): void {
  if (!io) return;
  io.to(personalRoom(recipientType, recipientId)).emit("chat:message", payload);
}
