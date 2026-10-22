import { defineConfig } from "vitest/config";
export default defineConfig({
  envDir: false,
  test: {
    environment: "node",
    include: ["test/owner-native.proof.ts"],
    setupFiles: ["test/no-network.setup.ts"],
  },
});
