import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Ensure postgres driver is treated as external on the server
  serverExternalPackages: ["postgres"],
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
  // Turbopack configuration
  turbopack: {},
  // Provide fallbacks for Node.js modules if required in client bundles
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        perf_hooks: false,
      };
    }
    return config;
  },
};

export default nextConfig;
