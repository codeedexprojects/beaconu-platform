import * as admin from "firebase-admin";
import { env } from "@/shared/config/env";
import { logger } from "@/shared/lib/logger";

let _messaging: admin.messaging.Messaging | null = null;

if (
  env.FIREBASE_PROJECT_ID &&
  env.FIREBASE_CLIENT_EMAIL &&
  env.FIREBASE_PRIVATE_KEY
) {
  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
    _messaging = admin.messaging(app);
    logger.info({ action: "FIREBASE_INITIALIZED", module: "firebase" });
  } catch (err) {
    logger.warn({
      action: "FIREBASE_INIT_FAILED",
      module: "firebase",
      error: (err as Error).message,
    });
  }
} else {
  logger.warn({
    action: "FIREBASE_NOT_CONFIGURED",
    module: "firebase",
    message: "Push notifications will be logged only",
  });
}

export const messaging = _messaging;
export const isFirebaseReady = (): boolean => _messaging !== null;
