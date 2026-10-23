import { expect, it, vi } from "vitest";
import { openLocalDraft, openLocalVideo } from "./open-local-file.ts";

const id = () => crypto.randomUUID();
const fingerprint = "a".repeat(64);
function fixture() {
  const workspace = {
    id: id(),
    mode: "synthetic-ai" as const,
    revision: 0,
    source: {
      fingerprint,
      bytes: 4,
      durationMs: 1000,
      width: 320,
      height: 180,
      fps: 30,
    },
  };
  const staging = id(),
    draft = id(),
    clip = id();
  const ports = {
    create: vi.fn(async () => staging),
    receive: vi.fn(async () => ({ fingerprint, bytes: 4 })),
    match: vi.fn(async (): Promise<{ id: string; clipId: string } | null> => ({
      id: draft,
      clipId: clip,
    })),
    reopen: vi.fn(async () => workspace),
    inspect: vi.fn(async () => workspace),
    discard: vi.fn(async () => {}),
  };
  return { workspace, staging, draft, clip, ports };
}
it("reopens matching work after removing upload scratch, with zero native inspection", async () => {
  const { ports, workspace, draft, clip, staging } = fixture();
  const result = await openLocalVideo(ports, AbortSignal.timeout(5000));
  expect(result).toEqual({ kind: "draft", workspace, clipId: clip });
  expect(ports.receive).toHaveBeenCalledTimes(1);
  expect(ports.match).toHaveBeenCalledTimes(1);
  expect(ports.discard).toHaveBeenCalledExactlyOnceWith(staging);
  expect(ports.reopen).toHaveBeenCalledExactlyOnceWith(
    draft,
    expect.any(AbortSignal),
  );
  expect(ports.inspect).toHaveBeenCalledTimes(0);
  expect(ports.discard.mock.invocationCallOrder[0]).toBeLessThan(
    ports.reopen.mock.invocationCallOrder[0]!,
  );
});
it("uses ordinary intake only for a genuinely unmatched file", async () => {
  const { ports, workspace } = fixture();
  ports.match.mockResolvedValue(null);
  expect(await openLocalVideo(ports, AbortSignal.timeout(5000))).toEqual({
    kind: "video",
    workspace,
    clipId: null,
  });
  expect(ports.inspect).toHaveBeenCalledTimes(1);
  expect(ports.reopen).toHaveBeenCalledTimes(0);
  expect(ports.discard).toHaveBeenCalledTimes(0);
});
it("does not regenerate a damaged match and drains interrupted intake", async () => {
  const { ports } = fixture();
  ports.reopen.mockRejectedValue(new Error("draft_damaged"));
  await expect(
    openLocalVideo(ports, AbortSignal.timeout(5000)),
  ).rejects.toThrow("draft_damaged");
  expect(ports.inspect).toHaveBeenCalledTimes(0);
  expect(ports.discard).toHaveBeenCalledTimes(1);
  const canceled = fixture(),
    controller = new AbortController();
  canceled.ports.receive.mockImplementation(async () => {
    controller.abort();
    return { fingerprint, bytes: 4 };
  });
  await expect(
    openLocalVideo(canceled.ports, controller.signal),
  ).rejects.toThrow();
  expect(canceled.ports.match).toHaveBeenCalledTimes(0);
  expect(canceled.ports.inspect).toHaveBeenCalledTimes(0);
  expect(canceled.ports.discard).toHaveBeenCalledTimes(1);
});
it("opens a validated registered draft and rejects arbitrary supplied paths", async () => {
  const { ports, draft, workspace, clip } = fixture();
  const draftPorts = {
    match: vi.fn(async () => ({ id: draft, clipId: clip })),
    reopen: ports.reopen,
  };
  expect(
    await openLocalDraft(
      { id: draft, sourceFingerprint: fingerprint },
      draftPorts,
      AbortSignal.timeout(5000),
    ),
  ).toEqual({ kind: "draft", workspace, clipId: clip });
  expect(ports.receive).toHaveBeenCalledTimes(0);
  expect(ports.inspect).toHaveBeenCalledTimes(0);
  await expect(
    openLocalDraft(
      { id: draft, sourceFingerprint: fingerprint, path: "C:/outside" },
      draftPorts,
      AbortSignal.timeout(5000),
    ),
  ).rejects.toThrow();
  expect(ports.reopen).toHaveBeenCalledTimes(1);
  expect(draftPorts.match).toHaveBeenCalledTimes(1);
});
