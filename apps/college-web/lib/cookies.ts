import { STUDENT_TOKEN_KEY } from "./constants";

export function setStudentTokenCookie(token: string) {
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${STUDENT_TOKEN_KEY}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearStudentTokenCookie() {
  document.cookie = `${STUDENT_TOKEN_KEY}=; path=/; max-age=0`;
}
