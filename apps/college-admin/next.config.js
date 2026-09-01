/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["admin.localhost", "*.admin.localhost"],
  transpilePackages: [
    "@beaconu/types",
    "@beaconu/validation",
    "@beaconu/utils",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.cloudinary.com" },
    ],
  },
};

module.exports = nextConfig;
