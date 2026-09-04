import { UserType } from "@/modules/auth/auth.types";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      userId?: string;
      userType?: UserType;
      sessionId?: string;
      collegeId?: string;
      roleId?: string;
      permissions?: string[];
      counsellorType?: "academic" | "mindcare";
      rawBody?: Buffer;
    }
  }
}

export {};
