/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@beaconu/types", "@beaconu/utils"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
  transpilePackages: [
    "@beaconu/types",
    "@beaconu/utils",
    "@beaconu/validation",
  ],
};

module.exports = nextConfig;
