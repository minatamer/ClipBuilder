import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: [
      fileURLToPath(new URL("../../test/no-network.setup.ts", import.meta.url)),
    ],
  },
});
