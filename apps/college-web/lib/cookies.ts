import { STUDENT_TOKEN_KEY, REFERRAL_CODE_KEY } from "./constants";

export function setStudentTokenCookie(token: string) {
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${STUDENT_TOKEN_KEY}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearStudentTokenCookie() {
  document.cookie = `${STUDENT_TOKEN_KEY}=; path=/; max-age=0`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getReferralCodeCookie(): string | null {
  return getCookie(REFERRAL_CODE_KEY);
}
