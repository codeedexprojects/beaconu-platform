import { COLLEGE_ADMIN_TOKEN_KEY } from "./constants";

export function setCollegeTokenCookie(token: string) {
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `${COLLEGE_ADMIN_TOKEN_KEY}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearCollegeTokenCookie() {
  document.cookie = `${COLLEGE_ADMIN_TOKEN_KEY}=; path=/; max-age=0`;
}
