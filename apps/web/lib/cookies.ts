import { BLOG_TOKEN_KEY } from "./constants";

export function setBlogTokenCookie(token: string) {
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `${BLOG_TOKEN_KEY}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearBlogTokenCookie() {
  document.cookie = `${BLOG_TOKEN_KEY}=; path=/; max-age=0`;
}
