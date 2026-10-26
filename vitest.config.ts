import { defineConfig } from "vitest/config";

export default defineConfig({
  envDir: false,
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    setupFiles: ["test/no-network.setup.ts"],
    testTimeout: 15_000,
  },
});
