import { BLOG_TOKEN_KEY, STUDENT_TOKEN_KEY } from "./constants";

const MAX_AGE = 60 * 60 * 24 * 7;

export function setBlogTokenCookie(token: string) {
  document.cookie = `${BLOG_TOKEN_KEY}=${token}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
}

export function clearBlogTokenCookie() {
  document.cookie = `${BLOG_TOKEN_KEY}=; path=/; max-age=0`;
}

export function setStudentTokenCookie(token: string) {
  document.cookie = `${STUDENT_TOKEN_KEY}=${token}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
}

export function clearStudentTokenCookie() {
  document.cookie = `${STUDENT_TOKEN_KEY}=; path=/; max-age=0`;
}
