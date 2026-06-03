import { api } from "../api";

export interface PresignResponse {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}

export interface VerifyResponse {
  verified: boolean;
  permanentUrl: string;
  viewUrl: string;
}

export const uploadService = {
  presign: (mimeType: string, fileSizeBytes: number, context: string) =>
    api.post<PresignResponse>("/api/v1/admin/uploads/presign", {
      mimeType,
      fileSizeBytes,
      context,
    }),

  putToS3: async (uploadUrl: string, file: File): Promise<void> => {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
    });
    if (!res.ok) throw new Error(`S3 upload failed: ${res.status}`);
  },

  verify: (key: string) =>
    api.post<VerifyResponse>("/api/v1/admin/uploads/verify", { key }),
};
