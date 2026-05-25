/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["admin.localhost", "*.admin.localhost"],
  transpilePackages: [
    "@beaconu/types",
    "@beaconu/validation",
    "@beaconu/utils",
  ],
};

module.exports = nextConfig;
