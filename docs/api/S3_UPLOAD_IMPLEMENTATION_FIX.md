# S3 Presigned URL Fix — Complete Implementation Guide

## Problem

Frontend is storing **presigned upload URLs with query parameters** in the database instead of permanent public URLs. This causes:

- URLs expire after 5 minutes
- Database contains exposed AWS credentials in query params (security risk)
- Broken links when accessing stored URLs later

**Example of incorrect storage:**

```
https://beaconu-bucket.s3.ap-south-1.amazonaws.com/college/CLG-3/college-overview/accolades-0/file.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=...
```

**Example of correct storage:**

```
https://beaconu-bucket.s3.ap-south-1.amazonaws.com/college/CLG-3/college-overview/accolades-0/file.jpg
```

---

## Solution Architecture

### Upload Flow (3 Steps)

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: PRESIGN — Get upload URL (5 min expiry)                │
├─────────────────────────────────────────────────────────────────┤
│ Frontend → POST /api/v1/{module}/uploads/presign               │
│ Backend returns: { uploadUrl, key, expiresIn }                 │
│ Frontend stores: { uploadUrl, key }                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: UPLOAD — PUT file directly to S3                       │
├─────────────────────────────────────────────────────────────────┤
│ Frontend → PUT {uploadUrl}  (with file body)                   │
│ S3 stores file at {key}                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: VERIFY — Get permanent URL                             │
├─────────────────────────────────────────────────────────────────┤
│ Frontend → POST /api/v1/{module}/uploads/verify                │
│ Body: { key: "college/CLG-3/..." }                             │
│ Backend returns: { verified: true, permanentUrl, viewUrl }     │
│ Frontend stores: ONLY {permanentUrl} in form/DB                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Backend Code Changes

### 1. Upload Service (Core Logic)

**File:** `apps/api/src/modules/upload/upload.service.ts`

```typescript
import { randomUUID } from "crypto";
import {
  generateUploadUrl,
  generateDownloadUrl,
  objectExists,
  permanentUrl,
} from "@/shared/lib/s3";
import { NotFoundError } from "@/shared/errors";
import { logger } from "@/shared/lib/logger";
import {
  MIME_TO_EXT,
  PRESIGN_EXPIRY_SECONDS,
  VIEW_URL_EXPIRY_SECONDS,
} from "./upload.constants";
import type { AllowedMimeType } from "./upload.constants";
import type { PresignResponse, VerifyResponse } from "./upload.types";

export class UploadService {
  /**
   * Build S3 key from entity type, ID, and context
   * Example: college/CLG-123/registration/logo/uuid.jpg
   */
  static buildKey(
    entityType: string,
    entityId: string,
    context: string,
    mimeType: AllowedMimeType,
  ): string {
    const ext = MIME_TO_EXT[mimeType];
    return `${entityType}/${entityId}/${context}/${randomUUID()}.${ext}`;
  }

  /**
   * Step 1: Generate presigned PUT URL for upload
   * Returns uploadUrl (5-min expiry) and key (to pass to verify)
   */
  static async presign(
    key: string,
    mimeType: string,
  ): Promise<PresignResponse> {
    const uploadUrl = await generateUploadUrl(
      key,
      mimeType,
      PRESIGN_EXPIRY_SECONDS,
    );
    logger.info({
      action: "UPLOAD_PRESIGNED",
      module: "upload",
      key,
      mimeType,
    });
    return { uploadUrl, key, expiresIn: PRESIGN_EXPIRY_SECONDS };
  }

  /**
   * Step 3: Verify upload and return permanent URL
   * Do NOT return presigned URL here
   */
  static async verify(key: string): Promise<VerifyResponse> {
    const exists = await objectExists(key);
    if (!exists) {
      throw new NotFoundError(
        "File not found in storage. Please upload first.",
      );
    }

    // Generate view URL (can be used for immediate preview)
    const viewUrl = await generateDownloadUrl(key, VIEW_URL_EXPIRY_SECONDS);

    // Return PERMANENT URL without query parameters
    const permanentUrl_ = permanentUrl(key);

    logger.info({
      action: "UPLOAD_VERIFIED",
      module: "upload",
      key,
      permanentUrl: permanentUrl_,
    });

    return { verified: true, permanentUrl: permanentUrl_, viewUrl };
  }
}
```

### 2. Upload Types

**File:** `apps/api/src/modules/upload/upload.types.ts`

```typescript
/**
 * Response from presign endpoint
 * Frontend uses: uploadUrl (for direct S3 PUT)
 * Frontend passes to verify: key
 */
export interface PresignResponse {
  uploadUrl: string; // Presigned PUT URL (5-min expiry)
  key: string; // S3 object key (pass to verify endpoint)
  expiresIn: number; // 300 (seconds)
}

/**
 * Response from verify endpoint
 * Frontend should ONLY store in DB: permanentUrl
 */
export interface VerifyResponse {
  verified: true;
  permanentUrl: string; // Permanent URL without query params - STORE THIS
  viewUrl: string; // Temporary signed URL for preview - do NOT store
}
```

### 3. S3 Library Functions

**File:** `apps/api/src/shared/lib/s3.ts`

```typescript
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/shared/config/env";

export const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Generate presigned PUT URL for uploading to S3
 * Expires in 5 minutes (300 seconds)
 */
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
  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Generate presigned GET URL for downloading/viewing from S3
 * Expires in 1 hour (3600 seconds)
 */
export async function generateDownloadUrl(
  key: string,
  expiresIn = 3600,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Check if object exists in S3
 */
export async function objectExists(key: string): Promise<boolean> {
  try {
    await s3Client.send(
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

/**
 * Generate PERMANENT public S3 URL (without query parameters)
 * This is what should be stored in the database
 */
export function permanentUrl(key: string): string {
  return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
}
```

---

## Frontend Code Changes

### 1. Upload Utility (Core Logic)

**File:** `apps/college-admin/lib/services/colleges.service.ts`

```typescript
/**
 * Step 1: Get presigned URL from backend
 */
async function presignCollegeAdminUpload(input: {
  mimeType: string;
  fileSizeBytes: number;
  context: string;
}): Promise<{ uploadUrl: string; key: string; expiresIn: number }> {
  return api.post("/api/v1/college-admin/uploads/presign", input);
}

/**
 * Step 3: Verify upload and get permanent URL
 */
async function verifyCollegeAdminUpload(
  key: string,
): Promise<{ verified: boolean; permanentUrl: string; viewUrl: string }> {
  return api.post("/api/v1/college-admin/uploads/verify", { key });
}

/**
 * Full upload flow: presign → upload → verify
 * Returns ONLY the permanent URL to save in DB
 */
export async function uploadCollegeAdminFile(
  file: File,
  context: string,
): Promise<string> {
  if (!file.type) {
    throw new Error("Selected file has no MIME type");
  }

  // Step 1: Get presigned upload URL
  const presigned = await presignCollegeAdminUpload({
    mimeType: file.type,
    fileSizeBytes: file.size,
    context,
  });

  // Step 2: Upload file directly to S3 using presigned URL
  let uploadResponse: Response;
  try {
    uploadResponse = await fetch(presigned.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Upload blocked by S3 CORS. Configure bucket CORS for college-admin origin.",
      );
    }
    throw error;
  }

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload file (HTTP ${uploadResponse.status})`);
  }

  // Step 3: Verify upload and get PERMANENT URL
  const verified = await verifyCollegeAdminUpload(presigned.key);

  // IMPORTANT: Return and store ONLY the permanent URL
  return verified.permanentUrl;
}
```

### 2. College Profile Form (Usage in College Admin)

**File:** `apps/college-admin/app/(dashboard)/setup/profile/page.tsx`

```typescript
const handleImageUpload = async (
  file: File | null,
  fieldPath: string,
  context: string,
) => {
  if (!file) return;

  try {
    setUploadingField(fieldPath);

    // This function handles presign → upload → verify internally
    // and returns ONLY the permanent URL
    const permanentUrl = await uploadCollegeAdminFile(file, context);

    // Save permanent URL to form state (will be saved to DB)
    setValue(fieldPath as any, permanentUrl, {
      shouldDirty: true,
    });

    toast.success("File uploaded to S3");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    toast.error(message);
  } finally {
    setUploadingField(null);
  }
};
```

### 3. Student Avatar Upload

**File:** `apps/web/app/(auth)/account-picture/page.tsx`

```typescript
import { uploadStudentAvatar } from "@/lib/services/uploads.service";

export default function AccountPicturePage(): React.JSX.Element {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleContinue() {
    if (!fileRef.current?.files?.[0]) {
      router.replace("/home");
      return;
    }

    try {
      setUploading(true);
      const file = fileRef.current.files[0];

      // Upload and get permanent URL
      const avatarUrl = await uploadStudentAvatar(file);

      // Save permanent URL to profile
      await updateStudentProfile({ avatarUrl });

      router.replace("/home");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col">
      {/* ... JSX ... */}
    </div>
  );
}
```

---

## Module-Specific Implementations

### Module 1: College Admin Profile (Logo, Cover Image, Accolades)

**Routes:** `POST /api/v1/college-admin/uploads/presign`, `POST /api/v1/college-admin/uploads/verify`

**Contexts:**

- `registration/logo`
- `registration/cover`
- `college_overview/accolades/{index}`
- `college_overview/amenities/{index}`
- `college_overview/campus_reels/{index}`

**Usage:**

```typescript
// Logo upload
handleImageUpload(file, "logoUrl", "registration/logo");
// Context becomes: college/CLG-123/registration/logo/uuid.jpg

// Accolades upload
handleImageUpload(
  file,
  `profileSections.college_overview.accolades.${idx}.image`,
  `college_overview/accolades/${idx}`,
);
// Context becomes: college/CLG-123/college_overview/accolades/0/uuid.jpg
```

### Module 2: Student Avatar

**Routes:** `POST /api/v1/student/uploads/avatar/presign`, `POST /api/v1/student/uploads/avatar/verify`

**Context:**

- `avatars`

### Module 3: Counsellor Avatar

**Routes:** `POST /api/v1/counsellor/uploads/avatar/presign`, `POST /api/v1/counsellor/uploads/avatar/verify`

**Context:**

- `avatars`

### Module 4: Blink Portal (Hostel, Events, etc.)

**Routes:** `POST /api/v1/blink/uploads/presign`, `POST /api/v1/blink/uploads/verify`

**Contexts:**

- `hostels/{hostelId}/images`
- `events/{eventId}/images`
- `notifications/{notifId}/banner`

---

## Database Schema Update (Migration)

For any existing records storing presigned URLs, run a cleanup query:

```sql
-- Example: Remove query parameters from logoUrl in colleges table
UPDATE colleges
SET logo_url = SUBSTRING(logo_url, 1, POSITION('?' IN logo_url) - 1)
WHERE logo_url LIKE '%X-Amz%';

-- Example: Remove query parameters from cover_image_url
UPDATE colleges
SET cover_image_url = SUBSTRING(cover_image_url, 1, POSITION('?' IN cover_image_url) - 1)
WHERE cover_image_url LIKE '%X-Amz%';

-- Example: For profile sections JSON (college_overview.accolades)
-- This requires more complex JSON manipulation depending on your DB (PostgreSQL/MySQL)
```

---

## Testing Checklist

- [ ] **Presign endpoint** returns `uploadUrl` and `key`
- [ ] **Upload to S3** succeeds using `uploadUrl`
- [ ] **Verify endpoint** checks file exists in S3
- [ ] **Verify endpoint** returns `permanentUrl` WITHOUT query parameters
- [ ] **Frontend stores** ONLY `permanentUrl` in DB/form state
- [ ] **Presigned URL expires** after 5 minutes (verify by waiting or testing with old URLs)
- [ ] **Permanent URL remains accessible** indefinitely (via public bucket policy)
- [ ] **All modules** (college-admin, student, counsellor, blink) use same flow
- [ ] **No query parameters** in any URL stored in database
- [ ] **Existing data** cleaned up (presigned URLs removed from DB)

---

## Security Checklist

- [ ] Presigned URLs have 5-minute expiry (not indefinite)
- [ ] Verify endpoint checks key belongs to authenticated user/college
- [ ] S3 bucket CORS allows origin but restricts to PUT/GET/HEAD
- [ ] Database never stores AWS credentials (in query params)
- [ ] ViewUrl (temporary) used only for immediate preview, never stored
- [ ] Permanent URL computed server-side (`permanentUrl()` function)

---

## Rollout Steps

1. **Deploy backend changes** (upload service, S3 lib updates)
2. **Test presign → upload → verify flow** in staging
3. **Deploy frontend changes** (upload utilities, form handlers)
4. **Run database cleanup script** (remove X-Amz query params from existing URLs)
5. **Monitor for upload failures** (CORS errors, S3 permission issues)
6. **Verify stored URLs** are permanent (no query parameters)
