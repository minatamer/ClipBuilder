import { bundle } from "@remotion/bundler";
import { resolve } from "node:path";
await bundle({
  entryPoint: resolve("src/composition/root.tsx"),
  outDir: resolve("bundle"),
  enableCaching: false,
});
