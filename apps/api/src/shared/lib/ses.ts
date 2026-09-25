import { SESv2Client } from "@aws-sdk/client-sesv2";
import { env } from "@/shared/config/env";

let _sesClient: SESv2Client | null = null;

function resolveRegion(): string | undefined {
  return env.SES_REGION || env.AWS_REGION || undefined;
}

export function isSesReady(): boolean {
  return !!(env.SES_FROM_EMAIL && resolveRegion());
}

export function getSesClient(): SESv2Client {
  if (!isSesReady()) {
    throw new Error(
      "SES is not configured. Set SES_FROM_EMAIL and SES_REGION (or AWS_REGION).",
    );
  }
  if (!_sesClient) {
    const hasStaticCredentials =
      !!env.AWS_ACCESS_KEY_ID && !!env.AWS_SECRET_ACCESS_KEY;
    _sesClient = new SESv2Client({
      region: resolveRegion(),
      maxAttempts: 3,
      // Only pass explicit keys when both are present; otherwise the SDK's
      // default provider chain (IAM role, SSO, profile) is used.
      ...(hasStaticCredentials && {
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
      }),
    });
  }
  return _sesClient;
}
