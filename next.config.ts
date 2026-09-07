import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // Prevent ESLint warnings or errors from blocking production deployment builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
