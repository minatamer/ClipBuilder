import { expect, it } from "vitest";
import { Readable } from "node:stream";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { HostedUpload } from "./hosted-upload.ts";
import { WorkspaceFiles } from "./workspace-files.ts";
import { HOSTED_EDITING_POLICY } from "../../../packages/contracts/local/hosted-editing.ts";
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
