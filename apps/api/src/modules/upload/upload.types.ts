export interface PresignResponse {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}

export interface VerifyResponse {
  verified: true;
  permanentUrl: string;
  viewUrl: string;
}
