import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Optimize barrel exports to prevent traversing entire package trees
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@reduxjs/toolkit",
      "motion",
      "cmdk",
    ],
  },
  eslint: {
    // Prevent ESLint warnings or errors from blocking production deployment builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
