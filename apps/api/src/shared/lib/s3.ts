import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '@/shared/config/env'

export const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
})

export async function generateUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 300,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(s3Client, command, { expiresIn })
}

export async function generateDownloadUrl(
  key: string,
  expiresIn = 3600,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
  })
  return getSignedUrl(s3Client, command, { expiresIn })
}
