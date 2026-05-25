export const MIME_TO_EXT = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
} as const;

export type AllowedMimeType = keyof typeof MIME_TO_EXT;
export const ALLOWED_MIME_TYPES = Object.keys(MIME_TO_EXT) as AllowedMimeType[];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const PRESIGN_EXPIRY_SECONDS = 300; // 5 min
export const VIEW_URL_EXPIRY_SECONDS = 3600; // 1 hr
