import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/shared/config/env";

let _s3Client: S3Client | null = null;

export function isS3Ready(): boolean {
  return !!(
    env.AWS_REGION &&
    env.AWS_ACCESS_KEY_ID &&
    env.AWS_SECRET_ACCESS_KEY &&
    env.AWS_S3_BUCKET
  );
}

function getS3Client(): S3Client {
  if (!isS3Ready()) {
    throw new Error(
      "S3 is not configured. Set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET.",
    );
  }
  if (!_s3Client) {
    _s3Client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }
  return _s3Client;
}

export const s3Client = new Proxy({} as S3Client, {
  get: (_, prop) => getS3Client()[prop as keyof S3Client],
});

export async function generateUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 300,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(getS3Client(), command, { expiresIn });
}

export async function generateDownloadUrl(
  key: string,
  expiresIn = 3600,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
  });
  return getSignedUrl(getS3Client(), command, { expiresIn });
}

export async function objectExists(key: string): Promise<boolean> {
  try {
    await getS3Client().send(
      new HeadObjectCommand({ Bucket: env.AWS_S3_BUCKET, Key: key }),
    );

    return true;
  } catch (err: unknown) {
    const status = (err as { $metadata?: { httpStatusCode?: number } })
      ?.$metadata?.httpStatusCode;
    if (status === 404) return false;
    throw err;
  }
}

export async function deleteObject(key: string): Promise<void> {
  await getS3Client().send(
    new DeleteObjectCommand({ Bucket: env.AWS_S3_BUCKET, Key: key }),
  );
}

export function permanentUrl(key: string): string {
  return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
}
