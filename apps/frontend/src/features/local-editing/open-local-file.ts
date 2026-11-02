import { OWNER_LIMITS } from "../../../../../packages/contracts/local/policy.ts";
import type { OwnerCapacity } from "../../../../../packages/contracts/local/capacity.ts";
import {
  OWNER_DRAFT_DOCUMENT_BYTES,
  ownerPickedDraftFileSchema,
  ownerPickedDraftRequestSchema,
  ownerPickedFileResultSchema,
} from "../../../../../packages/contracts/local/drafts.ts";

/** Reads only an explicitly selected file; no browser filename becomes a server path. */
export async function openPickedFile(
  file: File,
  signal: AbortSignal,
  transport: typeof fetch = fetch,
  capacity?: Pick<OwnerCapacity, "sourceBytes">,
) {
  signal.throwIfAborted();
  if (!Number.isSafeInteger(file.size) || file.size < 1)
    throw new Error("picked_file_invalid");
  const draft = file.name.toLowerCase().endsWith(".json");
  const maximum = draft
    ? OWNER_DRAFT_DOCUMENT_BYTES
    : capacity?.sourceBytes === undefined
      ? OWNER_LIMITS.sourceBytes
      : capacity.sourceBytes;
  if (maximum !== null && file.size > maximum)
    throw new Error("picked_file_large");
  let body: BodyInit = file;
  if (draft) {
    const reference = ownerPickedDraftFileSchema.parse(
      JSON.parse(await file.text()),
    );
    signal.throwIfAborted();
    body = JSON.stringify(
      ownerPickedDraftRequestSchema.parse({
        id: reference.id,
        sourceFingerprint: reference.source.digest,
      }),
    );
  }
  const response = await transport(
    `/api/local/open/${draft ? "draft" : "video"}`,
    {
      method: "POST",
      signal,
      headers: { "Content-Type": draft ? "application/json" : "video/mp4" },
      body,
    },
  );
  if (!response.ok)
    throw new Error(
      response.status === 507
        ? "picked_file_capacity"
        : "picked_file_unavailable",
    );
  const result = ownerPickedFileResultSchema.parse(await response.json());
  signal.throwIfAborted();
  return result;
}
