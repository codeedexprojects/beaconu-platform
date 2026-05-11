import { randomBytes } from "crypto";

const PREFIXES = {
  application: "APP",
  transaction: "TXN",
  receipt: "RCP",
  document: "DOC",
  referral: "REF",
  session: "SES",
} as const;

export type IdPrefix = keyof typeof PREFIXES;

export function generateId(prefix: IdPrefix): string {
  const year = new Date().getFullYear();
  const random = randomBytes(3).readUIntBE(0, 3) % 100000;
  const seq = random.toString().padStart(5, "0");
  return `${PREFIXES[prefix]}-${year}-${seq}`;
}
