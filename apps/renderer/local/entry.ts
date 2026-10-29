import {
  ownerDiagnosticRecordSchema,
  describeOwnerDiagnosticError,
} from "../../../packages/contracts/local/diagnostics.ts";
import { readFile } from "node:fs/promises";
import { z } from "zod";
import { createOwnerWorker } from "./server.ts";

async function main() {
  if (
    process.env.FAKE_MODE !== "true" ||
    process.env.PAID_DEMO_ENABLED !== "false"
  )
    throw new Error("owner_fake_mode_required");
  const file = process.env.CLIPBUILDER_LOCAL_STATE;
  if (!file) throw new Error("owner_state_missing");
  const state = z
    .object({
      root: z.string().min(1),
      workerToken: z.string().length(64),
      tools: z.object({
        ffmpeg: z.string().min(1),
        ffprobe: z.string().min(1),
      }),
      speech: z
        .object({
          executable: z.string().min(1),
          model: z.string().min(1),
          directory: z.string().min(1),
          speakers: z
            .object({
              executable: z.string().min(1),
              segmentation: z.string().min(1),
              embedding: z.string().min(1),
              directory: z.string().min(1),
            })
            .strict()
            .optional(),
        })
        .optional(),
      overlayBundle: z.string().min(1),
      chromium: z.string().min(1),
    })
    .parse(JSON.parse(await readFile(file, "utf8")));
  const worker = createOwnerWorker({
    diagnostic: (line) => process.stderr.write(line + "\n"),
    root: state.root,
    token: state.workerToken,
    tools: state.tools,
    ...(state.speech ? { speech: state.speech } : {}),
    overlayBundle: state.overlayBundle,
    chromium: state.chromium,
  });
  worker.server.listen(4200, "127.0.0.1");
  let stopping: Promise<void> | undefined;
  const close = () => {
    stopping ??= worker
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
  worker.server.once("error", () => {
    process.stderr.write("owner_worker_unavailable\n");
    process.exitCode = 1;
    void close();
  });
}
void main().catch((error: unknown) => {
  process.stderr.write(
    JSON.stringify(
      ownerDiagnosticRecordSchema.parse({
        event: "local_diagnostic",
        service: "worker",
        at: new Date().toISOString(),
        operation: "startup",
        outcome: "failed",
        elapsedMs: 0,
        error: describeOwnerDiagnosticError(error),
      }),
    ) + "\n",
  );
  process.stderr.write("owner_worker_unavailable\n");
  process.exitCode = 1;
  if (process.connected) process.disconnect();
});
