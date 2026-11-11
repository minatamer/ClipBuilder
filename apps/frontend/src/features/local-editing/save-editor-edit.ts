import type { OwnerEditRequest } from "../../../../../packages/contracts/local/editor.ts";
import { CollectionPageUnavailable, readOwnerClips } from "./collection-pages";

class TransientSaveFailure extends Error {}
export class EditorSaveRejected extends Error {
  constructor() {
    super("edit_save_rejected");
  }
}
const transientStatus = (status: number) =>
  [408, 500, 502, 503, 504].includes(status);

function pause(milliseconds: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    signal.throwIfAborted();
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, milliseconds);
    signal.addEventListener("abort", abort, { once: true });
  });
}

/** Manual edits only: replay one idempotent operation, never generation/render work. */
export async function saveEditorEdit(
  workspaceId: string,
  clipId: string,
  body: OwnerEditRequest,
  signal: AbortSignal,
  request: typeof fetch = fetch,
) {
  const encoded = JSON.stringify(body);
  for (let attempt = 0; attempt < 3; attempt++) {
    signal.throwIfAborted();
    try {
      const response = await request(
        `/api/local/workspace/${workspaceId}/clips/${clipId}/edit`,
        {
          method: "POST",
          signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
          headers: { "Content-Type": "application/json" },
          body: encoded,
        },
      );
      if (!response.ok) {
        // Release the streaming proxy slot even when its error body is unused.
        await response.body?.cancel().catch(() => {});
        if (response.status === 409) return null;
        // Validation, authorization, expiry and conflicts need deliberate action.
        if (transientStatus(response.status))
          throw new TransientSaveFailure("edit_save_unavailable");
        throw new EditorSaveRejected();
      }
      return await readOwnerClips(response, workspaceId, signal, request);
    } catch (failure) {
      signal.throwIfAborted();
      const transient =
        failure instanceof TransientSaveFailure ||
        (failure instanceof CollectionPageUnavailable &&
          transientStatus(failure.status)) ||
        failure instanceof TypeError ||
        (failure instanceof DOMException &&
          ["TimeoutError", "NetworkError"].includes(failure.name));
      if (!transient || attempt === 2) throw failure;
    }
    await pause(1000 * 2 ** attempt, signal);
  }
  throw Error("edit_save_unavailable");
}
