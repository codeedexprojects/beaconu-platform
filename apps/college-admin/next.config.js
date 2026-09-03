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
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

module.exports = nextConfig;
