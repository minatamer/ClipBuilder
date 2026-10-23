import {
  ownerPickedFileResultSchema,
  ownerPickedDraftRequestSchema,
  type OwnerPickedFileResult,
} from "../../../packages/contracts/local/drafts.ts";
import type { OwnerWorkspace } from "../../../packages/contracts/local/index.ts";

type Match = { id: string; clipId: string | null };
type Reopen = (id: string, signal: AbortSignal) => Promise<OwnerWorkspace>;
type VideoPorts = {
  create: () => Promise<string>;
  receive: (
    id: string,
    signal: AbortSignal,
  ) => Promise<{ fingerprint: string; bytes: number }>;
  match: (
    file: { fingerprint: string; bytes: number },
    signal: AbortSignal,
  ) => Promise<Match | null>;
  reopen: Reopen;
  inspect: (id: string, signal: AbortSignal) => Promise<OwnerWorkspace>;
  discard: (id: string) => Promise<void>;
};

/** A byte match restores existing work; it never falls through to reprocessing. */
export async function openLocalVideo(
  ports: VideoPorts,
  signal: AbortSignal,
): Promise<OwnerPickedFileResult> {
  signal.throwIfAborted();
  const id = await ports.create();
  let adopted = false;
  let discarded = false;
  try {
    const file = await ports.receive(id, signal);
    signal.throwIfAborted();
    const match = await ports.match(file, signal);
    signal.throwIfAborted();
    if (match) {
      await ports.discard(id);
      discarded = true;
      const workspace = await ports.reopen(match.id, signal);
      return ownerPickedFileResultSchema.parse({
        kind: "draft",
        workspace,
        clipId: match.clipId,
      });
    }
    const workspace = await ports.inspect(id, signal);
    adopted = true;
    return ownerPickedFileResultSchema.parse({
      kind: "video",
      workspace,
      clipId: null,
    });
  } finally {
    if (!adopted && !discarded) await ports.discard(id);
  }
}

export async function openLocalDraft(
  input: unknown,
  ports: {
    match: (input: unknown, signal: AbortSignal) => Promise<Match>;
    reopen: Reopen;
  },
  signal: AbortSignal,
): Promise<OwnerPickedFileResult> {
  const request = ownerPickedDraftRequestSchema.parse(input);
  signal.throwIfAborted();
  const match = await ports.match(request, signal);
  signal.throwIfAborted();
  const workspace = await ports.reopen(match.id, signal);
  return ownerPickedFileResultSchema.parse({
    kind: "draft",
    workspace,
    clipId: match.clipId,
  });
}
