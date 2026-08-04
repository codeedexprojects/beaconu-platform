export const MIME_TO_EXT = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/wav": "wav",
} as const;

export type AllowedMimeType = keyof typeof MIME_TO_EXT;
export const ALLOWED_MIME_TYPES = Object.keys(MIME_TO_EXT) as AllowedMimeType[];

export const IMAGE_MIME_TYPES: AllowedMimeType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

export const VIDEO_MIME_TYPES: AllowedMimeType[] = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export const AUDIO_MIME_TYPES: AllowedMimeType[] = [
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024;
export const PRESIGN_EXPIRY_SECONDS = 300;
export const VIDEO_PRESIGN_EXPIRY_SECONDS = 900;
export const VIEW_URL_EXPIRY_SECONDS = 3600;
