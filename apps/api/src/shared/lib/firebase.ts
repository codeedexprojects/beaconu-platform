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
    const privateKey = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");

    // Extract project ID embedded in the service account email for cross-checking.
    // Format: firebase-adminsdk-xxxxx@<project-id>.iam.gserviceaccount.com
    const emailProjectId =
      env.FIREBASE_CLIENT_EMAIL.split("@")[1]?.split(".")[0] ?? "unknown";
    const keyLooksValid =
      privateKey.includes("-----BEGIN PRIVATE KEY-----") &&
      privateKey.includes("-----END PRIVATE KEY-----");

    logger.info({
      action: "FIREBASE_CREDENTIAL_CHECK",
      module: "firebase",
      envProjectId: env.FIREBASE_PROJECT_ID,
      emailProjectId,
      projectIdsMatch: env.FIREBASE_PROJECT_ID === emailProjectId,
      privateKeyValid: keyLooksValid,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
    });

    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey,
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
