import { readFile } from "node:fs/promises";
import { z } from "zod";
import { assertOwnerFakeMode } from "./local-mode.ts";
import { createOwnerHost } from "./server.ts";
import { localWorkerPort } from "./worker-port.ts";
import { fakeOwnerAnalysis } from "./fake-analysis.ts";
import { fakeOwnerClipPreparation } from "./fake-clips.ts";

async function main() {
  assertOwnerFakeMode(process.env);
  const file = process.env.CLIPBUILDER_OWNER_STATE;
  if (!file) throw new Error("owner_state_missing");
  const state = z
    .object({
      root: z.string().min(1),
      ui: z.string().min(1),
      token: z.string().length(64),
      workerToken: z.string().length(64),
      storageRoot: z.string().min(1).optional(),
    })
    .parse(JSON.parse(await readFile(file, "utf8")));
  const host = createOwnerHost({
    root: state.root,
    ui: state.ui,
    token: state.token,
    ...(state.storageRoot ? { storageRoot: state.storageRoot } : {}),
    port: 4100,
    media: localWorkerPort(4200, state.workerToken),
    analysis: fakeOwnerAnalysis,
    clipPreparation: fakeOwnerClipPreparation,
    shutdown: () => {
      if (process.connected) process.send?.("stop");
      else void close();
    },
  });
  host.server.listen(4100, "127.0.0.1");
  let stopping: Promise<void> | undefined;
  const close = () => {
    stopping ??= host
      .close()
      .then(() => {
        if (process.connected) process.disconnect();
      })
      .catch(() => {
        process.stderr.write("owner_cleanup_requires_recovery\n");
        process.exitCode = 1;
        if (process.connected) process.disconnect();
      });
    return stopping;
  };
  process.once("SIGINT", () => void close());
  process.once("SIGTERM", () => void close());
  process.once("disconnect", () => void close());
  process.on("message", (message) => {
    if (message === "stop") void close();
  });
  host.server.once("error", () => {
    process.stderr.write("owner_host_unavailable\n");
    process.exitCode = 1;
    void close();
  });
}
void main().catch(() => {
  process.stderr.write("owner_host_unavailable\n");
  process.exitCode = 1;
  if (process.connected) process.disconnect();
});
