import { defineConfig } from "vitest/config";

export default defineConfig({
  envDir: false,
  test: {
    environment: "node",
    include: [
      "apps/*/owner/**/*.test.{ts,tsx}",
      "packages/*/owner/**/*.test.{ts,tsx}",
      "test/owner-*.test.ts",
    ],
    setupFiles: ["test/no-network.setup.ts"],
    testTimeout: 15_000,
  },
});
