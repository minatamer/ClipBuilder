import { expect, it, vi } from "vitest";
import { Readable } from "node:stream";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { HostedUpload } from "./hosted-upload.ts";
import { WorkspaceFiles } from "./workspace-files.ts";
import { HOSTED_EDITING_POLICY } from "../../../packages/contracts/local/hosted-editing.ts";
const failure = vi.hoisted(() => ({ remove: false }));
vi.mock("node:fs/promises", async (original) => {
  const fs = await original<typeof import("node:fs/promises")>();
  return {
    ...fs,
    rm: async (...args: Parameters<typeof fs.rm>) => {
      if (failure.remove) {
        failure.remove = false;
        throw Object.assign(new Error("synthetic_remove_failure"), {
          code: "EBUSY",
        });
      }
      return fs.rm(...args);
    },
  };
});

it("retains staged upload ownership after removal fails so an explicit cleanup retry removes the same bytes", async () => {
  const root = await mkdtemp(
    join(tmpdir(), "clipbuilder-hosted-discard-test-"),
  );
  const upload = new HostedUpload(root, 100);
  try {
    await upload.start(
      Object.assign(Readable.from([Buffer.from('{"bytes":9}')]), {
        headers: { "content-type": "application/json" },
      }),
    );
    const before = await readdir(root);
    expect(before).toHaveLength(1);
    failure.remove = true;
    await expect(upload.discard()).rejects.toThrow("synthetic_remove_failure");
    expect(await readdir(root)).toEqual(before);
    await upload.discard();
    expect(await readdir(root)).toEqual([]);
  } finally {
    failure.remove = false;
    await upload.discard();
    await rm(root, { recursive: true, force: true });
  }
});

it("retains failed final-directory cleanup without deleting an already admitted source", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-hosted-finish-test-"));
  const upload = new HostedUpload(root, 100),
    files = new WorkspaceFiles(root);
  const body = (data: Buffer, type: string) =>
    Object.assign(Readable.from([data]), {
      headers: { "content-type": type, "content-length": String(data.length) },
    });
  try {
    const { uploadId } = await upload.start(
      body(Buffer.from('{"bytes":3}'), "application/json"),
    );
    await upload.chunk(
      uploadId,
      0,
      body(Buffer.from("abc"), "application/octet-stream"),
    );
    const workspace = await files.create(),
      source = await files.file(workspace, "source.mp4");
    failure.remove = true;
    await expect(
      upload.finish(uploadId, files, workspace, new AbortController().signal),
    ).rejects.toThrow("synthetic_remove_failure");
    expect(await readFile(source, "utf8")).toBe("abc");
    expect(
      (await readdir(root)).filter((name) => name.startsWith("upload-")),
    ).toHaveLength(1);
    await upload.discard();
    expect(
      (await readdir(root)).filter((name) => name.startsWith("upload-")),
    ).toEqual([]);
    expect(await readFile(source, "utf8")).toBe("abc");
  } finally {
    failure.remove = false;
    await upload.discard();
    await files.close();
    await rm(root, { recursive: true, force: true });
  }
});

it("joins ordered chunks exactly, rejects replay/out-of-order bytes and confines the completed source", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-hosted-chunks-test-")),
    upload = new HostedUpload(root, 20 * 1024 ** 2),
    files = new WorkspaceFiles(root);
  const data = Buffer.alloc(HOSTED_EDITING_POLICY.chunkBytes + 17, 65);
  data[data.length - 1] = 66;
  const body = (bytes: Buffer, type = "application/octet-stream") =>
    Object.assign(Readable.from([bytes]), {
      headers: { "content-type": type, "content-length": String(bytes.length) },
    });
  try {
    const { uploadId } = await upload.start(
      body(
        Buffer.from(JSON.stringify({ bytes: data.length })),
        "application/json",
      ),
    );
    await expect(
      upload.chunk(
        uploadId,
        1,
        body(data.subarray(HOSTED_EDITING_POLICY.chunkBytes)),
      ),
    ).rejects.toThrow("upload_chunk_invalid");
    await upload.chunk(
      uploadId,
      0,
      body(data.subarray(0, HOSTED_EDITING_POLICY.chunkBytes)),
    );
    await expect(
      upload.chunk(uploadId, 0, body(Buffer.from("replay"))),
    ).rejects.toThrow("upload_chunk_invalid");
    await upload.chunk(
      uploadId,
      1,
      body(data.subarray(HOSTED_EDITING_POLICY.chunkBytes)),
    );
    const workspace = await files.create();
    const result = await upload.finish(
      uploadId,
      files,
      workspace,
      new AbortController().signal,
    );
    expect(result).toEqual({
      bytes: data.length,
      fingerprint: createHash("sha256").update(data).digest("hex"),
    });
    expect(
      (await readFile(await files.file(workspace, "source.mp4"))).equals(data),
    ).toBe(true);
  } finally {
    await upload.discard();
    await files.close();
    expect(await readdir(root)).toEqual([]);
    await rm(root, { recursive: true, force: true });
  }
});
