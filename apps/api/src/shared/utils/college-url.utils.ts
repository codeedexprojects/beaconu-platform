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

/// Share link for a student's app-invite referral code.
///
/// Unlike buildCollegeReferralUrl (a college-web page read in a browser, where
/// a cookie can carry the code), this link's job is to survive an app install:
/// it opens the app via App Links / Universal Links when installed, and falls
/// back to a web landing page that redirects to the store otherwise. Both
/// require /.well-known/assetlinks.json and apple-app-site-association to be
/// served from this host — until they are, the link still works as a plain
/// web page showing the code for manual entry.
export function buildAppReferralUrl(code: string): string {
  let base =
    process.env.APP_SHARE_URL ?? process.env.WEB_URL ?? "http://localhost:3000";
  if (!base.startsWith("http://") && !base.startsWith("https://")) {
    base = `https://${base}`;
  }
  const url = new URL(base);
  url.pathname = `/r/${code}`;
  return url.toString();
}

export function buildCollegeReferralUrl(slug: string, code: string): string {
  let base = process.env.COLLEGE_WEB_URL ?? "http://localhost:3001";
  if (!base.startsWith("http://") && !base.startsWith("https://")) {
    base = `https://${base}`;
  }
  const url = new URL(base);
  const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  url.hostname = isLocal ? `${slug}.localhost` : `${slug}.${url.hostname}`;
  // The actual college landing page lives at /college/{slug}, not the bare
  // root — root ("/") is a generic placeholder, not this college's page.
  url.pathname = `/college/${slug}`;
  url.searchParams.set("ref", code);
  return url.toString();
}
