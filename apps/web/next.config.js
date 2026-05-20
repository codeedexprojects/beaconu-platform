/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@beaconu/types",
    "@beaconu/validation",
    "@beaconu/utils",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "**.unsplash.com" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
