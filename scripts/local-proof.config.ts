import { defineConfig } from "vitest/config";
export default defineConfig({
  envDir: false,
  test: {
    environment: "node",
    fileParallelism: false,
    include: [
      "test/owner-*.proof.ts",
      "test/local-*.proof.ts",
      "apps/renderer/local/*.proof.ts",
    ],
    setupFiles: ["test/no-network.setup.ts"],
  },
});
