import { defineConfig } from "vitest/config";

export default defineConfig({
  envDir: false,
  test: {
    environment: "node",
    include: [
      "apps/*/local/**/*.test.{ts,tsx}",
      "apps/frontend/src/features/local-editing/**/*.test.{ts,tsx}",
      "packages/*/local/**/*.test.{ts,tsx}",
      "test/owner-*.test.ts",
    ],
    setupFiles: ["test/no-network.setup.ts"],
    testTimeout: 15_000,
  },
});
