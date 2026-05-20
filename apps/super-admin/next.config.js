/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@beaconu/types",
    "@beaconu/utils",
    "@beaconu/validation",
  ],
};

module.exports = nextConfig;
