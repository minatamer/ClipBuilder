import { expect, it, vi } from "vitest";
import { openPickedFile } from "./open-local-file.ts";
import { OWNER_DRAFT_DOCUMENT_BYTES } from "../../../../../packages/contracts/local/drafts.ts";

const id = crypto.randomUUID(),
  fingerprint = "a".repeat(64);
const result = {
  kind: "draft",
  clipId: null,
  workspace: {
    id,
    revision: 0,
    mode: "synthetic-ai",
    source: {
      fingerprint,
      bytes: 4,
      durationMs: 1000,
      width: 320,
      height: 180,
      fps: 30,
    },
  },
};
it("uses the same picker to reopen draft identity without forwarding supplied paths or media", async () => {
  const transport = vi
    .fn<typeof fetch>()
    .mockResolvedValue(Response.json(result));
  const file = new File(
    [
      JSON.stringify({
        version: 1,
        id,
        source: { digest: fingerprint },
        path: "C:/untrusted",
        snapshot: { untrusted: true },
      }),
    ],
    "draft.json",
  );
  expect(
    await openPickedFile(file, AbortSignal.timeout(5000), transport),
  ).toEqual(result);
  expect(transport).toHaveBeenCalledTimes(1);
  const [url, options] = transport.mock.calls[0]!;
  expect(url).toBe("/api/local/open/draft");
  expect(JSON.parse(String(options?.body))).toEqual({
    id,
    sourceFingerprint: fingerprint,
  });
});
it("streams a chosen video as the file object for byte-based matching", async () => {
  const transport = vi
    .fn<typeof fetch>()
    .mockResolvedValue(Response.json({ ...result, kind: "video" }));
  const file = new File(["synthetic"], "anything.mp4", { type: "video/mp4" });
  await openPickedFile(file, AbortSignal.timeout(5000), transport);
  expect(transport).toHaveBeenCalledExactlyOnceWith(
    "/api/local/open/video",
    expect.objectContaining({ body: file, method: "POST" }),
  );
});
it("rejects malformed, oversized and canceled draft choices without a request", async () => {
  const transport = vi.fn<typeof fetch>();
  await expect(
    openPickedFile(
      new File(["{}"], "draft.json"),
      AbortSignal.timeout(5000),
      transport,
    ),
  ).rejects.toThrow();
  const large = new File(["tiny"], "draft.json");
  Object.defineProperty(large, "size", {
    value: OWNER_DRAFT_DOCUMENT_BYTES + 1,
  });
  await expect(
    openPickedFile(large, AbortSignal.timeout(5000), transport),
  ).rejects.toThrow("picked_file_large");
  await expect(
    openPickedFile(
      new File(["{}"], "draft.json"),
      AbortSignal.abort(),
      transport,
    ),
  ).rejects.toThrow();
  expect(transport).toHaveBeenCalledTimes(0);
});
it("keeps unavailable or invalid saved material as an error without a processing fallback", async () => {
  const transport = vi
    .fn<typeof fetch>()
    .mockResolvedValue(new Response(null, { status: 400 }));
  await expect(
    openPickedFile(
      new File(["synthetic"], "clip.mp4"),
      AbortSignal.timeout(5000),
      transport,
    ),
  ).rejects.toThrow("picked_file_unavailable");
  expect(transport).toHaveBeenCalledTimes(1);
});
