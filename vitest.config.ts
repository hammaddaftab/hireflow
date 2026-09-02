import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "**/__tests__/**",
        "src/test/**",
        "**/*.d.ts",
        "src/types/**",
        "src/app/layout.tsx",
        ".next/**",
        ".agents/**",
        "scripts/**",
        "node_modules/**",
        "next.config.ts",
        "postcss.config.mjs",
        "tailwind.config.ts",
      ],
      thresholds: {
        lines: 90,
        functions: 75,
        branches: 75,
        statements: 90,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
