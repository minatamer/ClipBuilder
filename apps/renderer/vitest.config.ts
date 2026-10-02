import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
export default defineConfig({
  resolve: {
    alias: {
      "@clipbuilder/contracts": fileURLToPath(
        new URL("../../packages/contracts/src/index.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    setupFiles: [
      fileURLToPath(new URL("../../test/no-network.setup.ts", import.meta.url)),
    ],
  },
});
