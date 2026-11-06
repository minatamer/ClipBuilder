import {
  OWNER_HOOK_TITLE_LIMIT,
  OWNER_HOOK_TITLE_SETTLE_MS,
  ownerHookTitleResultSchema,
  type OwnerHookTitleResult,
} from "../../../../../packages/contracts/local/hook-title.ts";
import { OWNER_TEXT_LIMITS } from "../../../../../packages/contracts/local/text-layers.ts";
import type { OwnerHook } from "../../../../../packages/contracts/local/hook.ts";
import type { OwnerEditDocument } from "../../../../../packages/contracts/local/editor.ts";

export type HookTitleState = {
  key: string;
  phase: "loading" | "ready" | "failed";
  result?: OwnerHookTitleResult;
};
export const hookTitleKey = (revision: number, hook: OwnerHook) =>
  `${revision}:${hook.startFrame}:${hook.endFrame}`;
export const hookTitleFingerprint = (document: OwnerEditDocument) =>
  JSON.stringify(
    document.hookContent?.edits.texts?.filter(
      (layer) => layer.role === "opening-title",
    ) ?? [],
  );

/** Only the selected Hook's opening title changes. Late replies cannot overwrite typing. */
export function acceptHookTitle(
  document: OwnerEditDocument,
  result: OwnerHookTitleResult,
  fingerprint: string,
  force = false,
): OwnerEditDocument {
  if (
    !result.title ||
    document.clipId !== result.clipId ||
    document.revision !== result.expectedRevision ||
    !document.hookContent ||
    JSON.stringify(document.hook) !== JSON.stringify(result.hook) ||
    (!force && hookTitleFingerprint(document) !== fingerprint)
  )
    return document;
  const others = (document.hookContent.edits.texts ?? []).filter(
    (layer) => layer.role !== "opening-title",
  );
  if (others.length >= OWNER_TEXT_LIMITS.layers) return document;
  return {
    ...document,
    hookContent: {
      ...document.hookContent,
      edits: {
        ...document.hookContent.edits,
        texts: [result.title, ...others],
      },
    },
  };
}

/** Event-driven: mounting/restoring never dispatches inference. One attempt per settled range. */
export class HookTitleRequests {
  private timer: ReturnType<typeof setTimeout> | undefined;
  private controller: AbortController | undefined;
  private readonly cache = new Map<string, HookTitleState>();
  constructor(
    private readonly publish: (state: HookTitleState | null) => void,
    private readonly transport: typeof fetch = (input, init) =>
      fetch(input, init),
  ) {}
  cancel() {
    clearTimeout(this.timer);
    this.timer = undefined;
    this.controller?.abort();
    this.controller = undefined;
  }
  select(
    input: {
      workspaceId: string;
      clipId: string;
      revision: number;
      sourceRevision: number;
      hook: OwnerHook;
      apply: (result: OwnerHookTitleResult) => void;
    },
    retry = false,
  ) {
    this.cancel();
    const key = hookTitleKey(input.revision, input.hook);
    const cacheKey = `${input.workspaceId}:${input.clipId}:${key}`;
    const cached = this.cache.get(cacheKey);
    if (cached && !retry) {
      this.publish(cached);
      if (cached.result) input.apply(cached.result);
      return;
    }
    const controller = new AbortController();
    this.controller = controller;
    this.publish({ key, phase: "loading" });
    this.timer = setTimeout(() => {
      this.timer = undefined;
      const attempt = async () => {
        try {
          const response = await this.transport(
            `/api/local/workspace/${input.workspaceId}/clips/${input.clipId}/hook-title`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                operationId: crypto.randomUUID(),
                expectedRevision: input.revision,
                sourceRevision: input.sourceRevision,
                hook: input.hook,
              }),
              signal: controller.signal,
            },
          );
          if (!response.ok) throw Error("title_unavailable");
          const result = ownerHookTitleResultSchema.parse(
            await response.json(),
          );
          if (
            result.clipId !== input.clipId ||
            result.expectedRevision !== input.revision ||
            result.sourceRevision !== input.sourceRevision ||
            JSON.stringify(result.hook) !== JSON.stringify(input.hook)
          )
            throw Error("stale_title");
          if (controller.signal.aborted || this.controller !== controller)
            return;
          const state: HookTitleState = {
            key,
            phase: result.title ? "ready" : "failed",
            ...(result.title ? { result } : {}),
          };
          this.remember(cacheKey, state);
          this.publish(state);
          if (result.title) input.apply(result);
        } catch {
          if (controller.signal.aborted || this.controller !== controller)
            return;
          const state: HookTitleState = { key, phase: "failed" };
          this.remember(cacheKey, state);
          this.publish(state);
        } finally {
          if (this.controller === controller) this.controller = undefined;
        }
      };
      void attempt();
    }, OWNER_HOOK_TITLE_SETTLE_MS);
  }
  private remember(key: string, state: HookTitleState) {
    if (this.cache.size >= OWNER_HOOK_TITLE_LIMIT)
      this.cache.delete(this.cache.keys().next().value!);
    this.cache.set(key, state);
  }
}
