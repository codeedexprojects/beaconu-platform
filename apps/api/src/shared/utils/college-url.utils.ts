export function buildCollegeSetupUrl(slug: string, token: string): string {
  let base = process.env.COLLEGE_ADMIN_URL ?? "http://localhost:3002";
  if (!base.startsWith("http://") && !base.startsWith("https://")) {
    base = `https://${base}`;
  }
  const url = new URL(base);
  const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  url.hostname = isLocal
    ? `${slug}.admin.localhost`
    : `${slug}.${url.hostname}`;
  url.pathname = `/${slug}/login`;
  url.searchParams.set("token", token);
  return url.toString();
}
