import { createHash, randomUUID } from "node:crypto";
import { mkdtemp, rm, writeFile, link } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { WorkspaceFiles } from "./workspace-files.ts";

let root: string | undefined;
afterEach(async () => {
  if (root) await rm(root, { recursive: true, force: true });
  root = undefined;
});
it("binds local AI artifacts to owned workspaces, exact bytes, digest and kind, refusing linked files", async () => {
  root = await mkdtemp(join(tmpdir(), "clipbuilder-codex-artifact-test-"));
  const files = new WorkspaceFiles(root),
    workspace = await files.create(),
    jobId = randomUUID();
  const path = await files.codexInput(workspace, jobId),
    bytes = Buffer.from(JSON.stringify({ kind: "speech", words: [] }));
  await writeFile(path, bytes);
  const receipt = {
    operation: "codex-input" as const,
    jobId,
    kind: "speech" as const,
    bytes: bytes.length,
    digest: createHash("sha256").update(bytes).digest("hex"),
  };
  expect(
    await files.readCodexInput(workspace, receipt, AbortSignal.timeout(1000)),
  ).toEqual({ kind: "speech", words: [] });
  for (const invalid of [
    { ...receipt, bytes: bytes.length - 1 },
    { ...receipt, digest: "0".repeat(64) },
    { ...receipt, kind: "frames" as const },
  ])
    await expect(
      files.readCodexInput(workspace, invalid, AbortSignal.timeout(1000)),
    ).rejects.toThrow("codex_input_invalid");
  await expect(
    files.readCodexInput(randomUUID(), receipt, AbortSignal.timeout(1000)),
  ).rejects.toThrow("workspace_missing");
  await link(path, join(root, "synthetic-hardlink"));
  await expect(
    files.readCodexInput(workspace, receipt, AbortSignal.timeout(1000)),
  ).rejects.toThrow("codex_input_invalid");
});
