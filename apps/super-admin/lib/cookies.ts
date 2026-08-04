import { ADMIN_TOKEN_KEY } from "./constants";

export function setAdminTokenCookie(token: string) {
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${ADMIN_TOKEN_KEY}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearAdminTokenCookie() {
  document.cookie = `${ADMIN_TOKEN_KEY}=; path=/; max-age=0`;
}
