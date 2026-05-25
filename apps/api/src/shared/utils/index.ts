import bcrypt from "bcryptjs";

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export class CryptoUtils {
  private static readonly SALT_ROUNDS = 12;

  static async hash(data: string): Promise<string> {
    return bcrypt.hash(data, this.SALT_ROUNDS);
  }

  static async compare(data: string, hash: string): Promise<boolean> {
    return bcrypt.compare(data, hash);
  }
}

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
