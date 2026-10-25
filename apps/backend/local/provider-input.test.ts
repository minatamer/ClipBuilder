import { afterEach, beforeEach, expect, it } from "vitest";
import { createHash, randomUUID } from "node:crypto";
import { link, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { WorkspaceFiles } from "./workspace-files.ts";
import { OWNER_PROVIDER_MEDIA } from "../../../packages/contracts/local/index.ts";

let root: string, files: WorkspaceFiles, id: string;
const bytes = Buffer.from("synthetic prepared provider input");
const receipt = {
  bytes: bytes.length,
  durationMs: 1000,
  digest: createHash("sha256").update(bytes).digest("hex"),
};
const signal = () => new AbortController().signal;
beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "clipbuilder-owner-provider-input-"));
  files = new WorkspaceFiles(root);
  id = await files.create();
});
afterEach(async () => {
  await files.close();
  expect(await readdir(root)).toEqual([]);
  await rm(root, { recursive: true, force: true });
});

it("reads only a receipt-matching fixed audio/video input and removes its owned copy", async () => {
  const clipId = randomUUID();
  for (const request of [
    { kind: "audio" as const },
    { kind: "audio" as const, clipId },
    { kind: "video" as const, clipId },
  ]) {
    const path =
      request.kind === "audio"
        ? await files.providerAudio(id, request.clipId)
        : await files.providerVideo(id, clipId);
    await writeFile(path, bytes);
    const blob = await files.readProviderInput(id, request, receipt, signal());
    expect(blob.type).toBe(
      request.kind === "audio" ? "audio/m4a" : "video/mp4",
    );
    expect(Buffer.from(await blob.arrayBuffer())).toEqual(bytes);
    await files.removeProviderInput(id, request);
  }
  expect(await readdir(join(root, id))).toEqual([]);
});

it("rejects changed bytes, oversize receipts, unknown workspaces and aborted reads before transfer", async () => {
  await writeFile(await files.providerAudio(id), bytes);
  await expect(
    files.readProviderInput(
      id,
      { kind: "audio" },
      {
        ...receipt,
        digest: "0".repeat(64),
      },
      signal(),
    ),
  ).rejects.toThrow("provider_input_rejected");
  await expect(
    files.readProviderInput(
      id,
      { kind: "audio" },
      {
        ...receipt,
        bytes: OWNER_PROVIDER_MEDIA.bytes + 1,
      },
      signal(),
    ),
  ).rejects.toThrow("provider_input_rejected");
  await expect(
    files.readProviderInput(randomUUID(), { kind: "audio" }, receipt, signal()),
  ).rejects.toThrow("workspace_missing");
  await expect(
    files.readProviderInput(
      id,
      { kind: "audio" },
      receipt,
      AbortSignal.abort(),
    ),
  ).rejects.toThrow();
});

it("rejects a hard-linked provider input without modifying either linked file", async () => {
  const path = await files.providerAudio(id);
  await writeFile(path, bytes);
  await link(path, join(root, id, "alias.m4a"));
  await expect(
    files.readProviderInput(id, { kind: "audio" }, receipt, signal()),
  ).rejects.toThrow("provider_input_rejected");
});
