import { ownerPickedFileResultSchema } from "../../../../../packages/contracts/local/drafts.ts";
import { HOSTED_EDITING_POLICY } from "../../../../../packages/contracts/local/hosted-editing.ts";
import { z } from "zod";
export type HostedUploadProgress = {
  phase: "uploading" | "inspecting";
  received: number;
  total: number;
};
/** Chunking stays below hosted HTTP request limits; never retries or calls AI. */
export async function uploadHostedVideo(
  file: File,
  signal: AbortSignal,
  transport: typeof fetch = fetch,
  onProgress?: (value: HostedUploadProgress) => void,
) {
  const initialized = await transport("/api/local/upload", {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bytes: file.size }),
  });
  if (!initialized.ok) throw new Error("upload_unavailable");
  const upload = z
    .object({
      uploadId: z.uuid(),
      chunkBytes: z.literal(HOSTED_EDITING_POLICY.chunkBytes),
    })
    .strict()
    .parse(await initialized.json());
  let index = 0;
  onProgress?.({ phase: "uploading", received: 0, total: file.size });
  for (let offset = 0; offset < file.size; offset += upload.chunkBytes) {
    signal.throwIfAborted();
    const response = await transport(
      `/api/local/upload/${upload.uploadId}/${index++}`,
      {
        method: "PUT",
        signal,
        headers: { "Content-Type": "application/octet-stream" },
        body: file.slice(offset, offset + upload.chunkBytes),
      },
    );
    if (!response.ok) throw new Error("upload_unavailable");
    await response.body?.cancel();
    onProgress?.({
      phase: "uploading",
      received: Math.min(file.size, offset + upload.chunkBytes),
      total: file.size,
    });
  }
  onProgress?.({ phase: "inspecting", received: file.size, total: file.size });
  const opened = await transport("/api/local/open/video", {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uploadId: upload.uploadId }),
  });
  if (!opened.ok) throw new Error("upload_unavailable");
  return ownerPickedFileResultSchema.parse(await opened.json());
}
