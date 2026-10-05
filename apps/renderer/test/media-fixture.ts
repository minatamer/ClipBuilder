import { MediaSessions } from "../src/expiry/media-sessions.js";
import { UploadCapabilityCipher } from "../src/expiry/upload-capability.js";
import { MediaOperations } from "../src/media/media-operations.js";
import { MemoryMediaStore } from "./memory-store.js";
import type { MediaPipeline } from "../src/media/node-pipeline.js";
import { inspectedSourceSchema } from "@clipbuilder/contracts";
export const binding = {
  sessionId: "ses_" + "a".repeat(22),
  sourceRevision: "rev_" + "b".repeat(22),
  fingerprint: "a".repeat(64),
};
export const nonce = "00000000-0000-4000-8000-000000000001";
export function mediaFixture(
  pipeline?: MediaPipeline,
  removeScratch?: (directory: string) => Promise<void>,
  now: () => number = () => 1_000_000,
) {
  const store = new MemoryMediaStore();
  const sessions = new MediaSessions(
    store,
    new UploadCapabilityCipher(Buffer.alloc(32, 7)),
    now,
  );
  const calls = { inspect: 0, audio: 0, proxy: 0, render: 0 };
  const operations = new MediaOperations(
    sessions,
    pipeline ?? {
      async inspect() {
        calls.inspect++;
        return inspectedSourceSchema.parse({
          fingerprint: binding.fingerprint,
          bytes: 1024,
          width: 320,
          height: 180,
          durationMs: 15_000,
          audioStartMs: 0,
        });
      },
      async audio() {
        calls.audio++;
      },
      async proxy() {
        calls.proxy++;
      },
      async render() {
        calls.render++;
      },
    },
    now,
    removeScratch,
  );
  async function admit(sessionBinding = binding) {
    const response = await sessions.admit({
      binding: sessionBinding,
      bytes: 1024,
      contentType: "video/mp4",
      rightsAcknowledged: true,
      dataTransferAcknowledged: true,
    });
    const record = await store.getIntent(sessionBinding.sessionId);
    store.objects.set(sessionBinding.sessionId, [
      { artifactId: record!.intent.sourceId, generation: "12", bytes: 1024 },
    ]);
    return response;
  }
  return { store, sessions, operations, calls, admit };
}
