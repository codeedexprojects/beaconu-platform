/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@beaconu/types",
    "@beaconu/validation",
    "@beaconu/utils",
  ],
  images: {
    // College profile media (logos, covers, gallery, accolades) is entered
    // as freeform URLs by college-admin — the source host isn't knowable
    // ahead of time, so this can't be a fixed allowlist.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

module.exports = nextConfig;
