import { afterEach, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createOwnerHost } from "../apps/backend/local/server.ts";
import { fakeOwnerAnalysis } from "../apps/backend/local/fake-analysis.ts";
import { fakeOwnerClipPreparation } from "../apps/backend/local/fake-clips.ts";
import { createLocalCodexAi } from "../apps/backend/local/codex-ai.ts";
import { hookTitlePlanner } from "../apps/backend/local/hook-title-planner.ts";
import { WorkspaceFiles } from "../apps/backend/local/workspace-files.ts";
import { withIndependentOwnerHook } from "../packages/contracts/local/hook-content.ts";
import { compileOwnerOverlay } from "../packages/contracts/local/edit-overlay.ts";
import { ownerOverlayFrame } from "../packages/composition/local/overlay-frame.ts";
import { ownerClipListSchema } from "../packages/contracts/local/clips.ts";
import { ownerAnalysisSchema } from "../packages/contracts/local/selection.ts";
import { ownerWorkspaceSchema } from "../packages/contracts/local/index.ts";
import {
  ownerHookTitleResultSchema,
  OWNER_HOOK_TITLE_SETTLE_MS,
} from "../packages/contracts/local/hook-title.ts";
import {
  initialOwnerEdit,
  ownerEditOperations,
} from "../apps/frontend/src/features/local-editing/editor-state.ts";
import {
  HookTitleRequests,
  acceptHookTitle,
  hookTitleFingerprint,
} from "../apps/frontend/src/features/local-editing/hook-title-request.ts";
import { independentHookFixture } from "./owner-hook-fixture.ts";
import { listenOwner, ownerRequest } from "./owner-http.ts";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const authored = {
  texts: [
    {
      title: "Why a difficult start could be your advantage",
      startFrame: 0,
      endFrame: 90,
      wordIds: [],
      hookStyle: "myth-bust",
      emphasis: [
        {
          text: "difficult start",
          occurrence: 0,
          style: { color: "#FF3B30", fontWeight: 900 },
        },
      ],
    },
  ],
};
const hook = { startFrame: 30, endFrame: 90 };

it("uses the chosen excerpt and full payoff in one title-only Codex request, with no media pass", async () => {
  const clip = independentHookFixture();
  const infer = vi.fn(async (request: { prompt: string }) => {
    const input = JSON.parse(
      request.prompt.slice(request.prompt.lastIndexOf("\n") + 1),
    );
    expect(input.selectedHook).toEqual(hook);
    expect(input.hookWords.map((word: { text: string }) => word.text)).toEqual([
      "Hook",
      "After",
    ]);
    expect(input.clipWords).toEqual(clip.base!.words);
    expect(request.prompt).toContain("manually selected");
    expect(request.prompt).toContain("#FF3B30");
    return authored;
  });
  const media = vi.fn();
  const provider = createLocalCodexAi({
    files: new WorkspaceFiles("unused-synthetic"),
    media,
    infer,
  });
  try {
    const title = await provider.clipPreparation!.hookTitle!(
      { words: clip.base!.words, frames: 120, hook },
      new AbortController().signal,
    );
    expect(title?.text).toBe(authored.texts[0]!.title);
    expect(title?.spans?.[0]).toMatchObject({ style: { color: "#FF3B30" } });
    expect(title?.endFrame).toBe(60);
    expect(infer).toHaveBeenCalledTimes(1);
    expect(media).toHaveBeenCalledTimes(0);
  } finally {
    await provider.close!(new AbortController().signal);
  }
});

it("debounces choices, reuses a settled result, suppresses stale replies and never retries a failure itself", async () => {
  vi.useFakeTimers();
  const clip = independentHookFixture();
  const title = await hookTitlePlanner(async () => authored)(
    { words: clip.base!.words, frames: 120, hook },
    new AbortController().signal,
  );
  const result = ownerHookTitleResultSchema.parse({
    clipId: clip.id,
    expectedRevision: 0,
    sourceRevision: 0,
    hook,
    title,
  });
  const transport = vi
    .fn<typeof fetch>()
    .mockResolvedValue(new Response(JSON.stringify(result)));
  const publish = vi.fn(),
    apply = vi.fn();
  const requests = new HookTitleRequests(publish, transport);
  const input = {
    workspaceId: randomUUID(),
    clipId: clip.id,
    revision: 0,
    sourceRevision: 0,
    hook,
    apply,
  };
  expect(transport).toHaveBeenCalledTimes(0);
  requests.select({ ...input, hook: { startFrame: 0, endFrame: 60 } });
  requests.select(input);
  await vi.advanceTimersByTimeAsync(OWNER_HOOK_TITLE_SETTLE_MS);
  expect(transport).toHaveBeenCalledTimes(1);
  expect(apply).toHaveBeenCalledTimes(1);
  requests.select(input);
  expect(transport).toHaveBeenCalledTimes(1);
  expect(apply).toHaveBeenCalledTimes(2);
  transport.mockResolvedValueOnce(new Response("{}", { status: 503 }));
  requests.select(input, true);
  await vi.advanceTimersByTimeAsync(OWNER_HOOK_TITLE_SETTLE_MS);
  await vi.advanceTimersByTimeAsync(10_000);
  expect(transport).toHaveBeenCalledTimes(2);
  expect(publish.mock.lastCall?.[0].phase).toBe("failed");
  requests.select(input);
  await vi.advanceTimersByTimeAsync(10_000);
  expect(transport).toHaveBeenCalledTimes(2);
  let finish!: (value: Response) => void;
  transport.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  requests.select(input, true);
  await vi.advanceTimersByTimeAsync(OWNER_HOOK_TITLE_SETTLE_MS);
  requests.cancel();
  finish(new Response(JSON.stringify(result)));
  await vi.advanceTimersByTimeAsync(1);
  expect(apply).toHaveBeenCalledTimes(2);
});

it.each([false, true])(
  "cancels the selected title before/after dispatch, ignores late replies and keeps the range canceled (%s)",
  async (dispatched) => {
    vi.useFakeTimers();
    const clip = independentHookFixture();
    const title = await hookTitlePlanner(async () => authored)(
      { words: clip.base!.words, frames: 120, hook },
      new AbortController().signal,
    );
    const result = ownerHookTitleResultSchema.parse({
      clipId: clip.id,
      expectedRevision: 0,
      sourceRevision: 0,
      hook,
      title,
    });
    let finish: ((value: Response) => void) | undefined;
    const transport = vi.fn<typeof fetch>(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const publish = vi.fn(),
      apply = vi.fn();
    const requests = new HookTitleRequests(publish, transport);
    const input = {
      workspaceId: randomUUID(),
      clipId: clip.id,
      revision: 0,
      sourceRevision: 0,
      hook,
      apply,
    };
    requests.select(input);
    expect(publish.mock.lastCall?.[0].phase).toBe("loading");
    if (dispatched)
      await vi.advanceTimersByTimeAsync(OWNER_HOOK_TITLE_SETTLE_MS);
    requests.cancelCurrent();
    expect(publish.mock.lastCall?.[0].phase).toBe("canceled");
    if (dispatched) {
      expect(transport.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
      finish!(new Response(JSON.stringify(result)));
    }
    await vi.advanceTimersByTimeAsync(10_000);
    expect(transport).toHaveBeenCalledTimes(dispatched ? 1 : 0);
    expect(apply).toHaveBeenCalledTimes(0);
    requests.select(input);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(publish.mock.lastCall?.[0].phase).toBe("canceled");
    expect(transport).toHaveBeenCalledTimes(dispatched ? 1 : 0);
    transport.mockResolvedValueOnce(new Response(JSON.stringify(result)));
    requests.select(input, true);
    await vi.advanceTimersByTimeAsync(OWNER_HOOK_TITLE_SETTLE_MS);
    expect(transport).toHaveBeenCalledTimes(dispatched ? 2 : 1);
    expect(apply).toHaveBeenCalledTimes(1);
    expect(publish.mock.lastCall?.[0].phase).toBe("ready");
    requests.cancel();
  },
);

it("invokes the default browser transport without binding fetch to the request controller", async () => {
  vi.useFakeTimers();
  const clip = independentHookFixture();
  const title = await hookTitlePlanner(async () => authored)(
    { words: clip.base!.words, frames: 120, hook },
    new AbortController().signal,
  );
  const transport = vi.fn(function (this: unknown) {
    expect(this).not.toBeInstanceOf(HookTitleRequests);
    return Promise.resolve(
      new Response(
        JSON.stringify({
          clipId: clip.id,
          expectedRevision: 0,
          sourceRevision: 0,
          hook,
          title,
        }),
      ),
    );
  });
  vi.stubGlobal("fetch", transport);
  const apply = vi.fn(),
    requests = new HookTitleRequests(vi.fn());
  requests.select({
    workspaceId: randomUUID(),
    clipId: clip.id,
    revision: 0,
    sourceRevision: 0,
    hook,
    apply,
  });
  await vi.advanceTimersByTimeAsync(OWNER_HOOK_TITLE_SETTLE_MS);
  expect(transport).toHaveBeenCalledTimes(1);
  expect(apply).toHaveBeenCalledTimes(1);
  requests.cancel();
});

it("preserves concurrent title typing and all body content, and rejects replies for another range/revision", async () => {
  const clip = independentHookFixture();
  const document = withIndependentOwnerHook(
    clip.base!,
    initialOwnerEdit(clip),
    clip.assets,
    [],
    hook,
  );
  const title = await hookTitlePlanner(async () => authored)(
    { words: clip.base!.words, frames: 120, hook },
    new AbortController().signal,
  );
  const result = ownerHookTitleResultSchema.parse({
    clipId: clip.id,
    expectedRevision: 0,
    sourceRevision: 0,
    hook,
    title,
  });
  const fingerprint = hookTitleFingerprint(document);
  const accepted = acceptHookTitle(document, result, fingerprint);
  expect(accepted.texts).toEqual(document.texts);
  expect(accepted.hookContent!.edits.visuals).toEqual(
    document.hookContent!.edits.visuals,
  );
  expect(accepted.hookContent!.edits.texts![0]!.spans![0]!.style.color).toBe(
    "#FF3B30",
  );
  const typed = structuredClone(accepted);
  typed.hookContent!.edits.texts![0]!.text = "My own title";
  expect(acceptHookTitle(typed, result, fingerprint)).toBe(typed);
  expect(
    acceptHookTitle({ ...document, revision: 1 }, result, fingerprint).revision,
  ).toBe(1);
  const moved = { ...document, hook: { startFrame: 0, endFrame: 60 } };
  expect(acceptHookTitle(moved, result, fingerprint)).toBe(moved);
});

it("carries a manually chosen Hook and styled title through real host HTTP and Apply without extra planning/render calls", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-hook-title-http-"));
  let files!: WorkspaceFiles;
  const infer = vi.fn(async () => authored),
    plan = vi.fn(fakeOwnerClipPreparation.plan);
  const title = hookTitlePlanner(infer);
  const media = vi.fn(
    async (
      job: Parameters<Parameters<typeof createOwnerHost>[0]["media"]>[0],
    ) => {
      if (job.operation === "inspect")
        return {
          operation: "inspect" as const,
          source: {
            fingerprint: "a".repeat(64),
            bytes: 4,
            durationMs: 12000,
            width: 320,
            height: 180,
            fps: 30,
          },
        };
      if (job.operation !== "clip-preview")
        throw Error("unexpected_synthetic_job");
      const frames = job.cut.endFrame - job.cut.startFrame,
        bytes = Buffer.from("synthetic-preview");
      await writeFile(
        await files.clipSource(job.workspaceId, job.clipId),
        bytes,
      );
      return {
        operation: "clip-preview" as const,
        frames,
        bytes: bytes.length,
        durationMs: Math.round((frames * 1000) / 30),
      };
    },
  );
  const host = createOwnerHost({
    root,
    port: 0,
    token: "synthetic-token",
    media,
    providers(current) {
      files = current;
      return {
        analysis: fakeOwnerAnalysis,
        localAi: {
          aiProvider: "codex",
          aiSetup: "ready",
          captionProvider: "local-speech",
        },
        captionTranscription: async (_workspace, selected) =>
          structuredClone(
            selected.base!.words.map((word, index, all) => ({
              ...word,
              speakerId: index < Math.ceil(all.length / 2) ? "spk_0" : "spk_1",
            })),
          ),
        clipPreparation: {
          ...fakeOwnerClipPreparation,
          plan,
          hookTitle: title,
        },
      };
    },
  });
  const port = await listenOwner(host.server),
    auth = { Authorization: "Bearer synthetic-token" },
    json = { ...auth, "Content-Type": "application/json" };
  const post = (path: string, body: unknown) =>
    ownerRequest(port, path, {
      method: "POST",
      headers: json,
      body: JSON.stringify(body),
    });
  try {
    const source = await ownerRequest(port, "/api/source", {
      method: "POST",
      headers: { ...auth, "Content-Type": "video/mp4" },
      body: "fake",
    });
    expect(source.status).toBe(200);
    const workspace = ownerWorkspaceSchema.parse(
        JSON.parse(source.body.toString()),
      ),
      endpoint = `/api/workspace/${workspace.id}`;
    const analyzed = await post(`${endpoint}/analysis`, {
      sourceRevision: 0,
      policyRevision: 1,
      ranges: [{ id: randomUUID(), startMs: 0, endMs: 4000 }],
      manualOnly: true,
      aiDuration: { minMs: 10000, maxMs: 10000 },
    });
    expect(analyzed.status).toBe(200);
    const analysis = ownerAnalysisSchema.parse(
      JSON.parse(analyzed.body.toString()),
    );
    const submitted = await post(`${endpoint}/clips`, {
      operationId: randomUUID(),
      analysisId: analysis.id,
      sourceRevision: 0,
      policyRevision: 1,
      momentIds: [analysis.manual[0]!.id],
    });
    expect(submitted.status).toBe(202);
    let list = ownerClipListSchema.parse(JSON.parse(submitted.body.toString()));
    for (let n = 0; list.active && n < 100; n++) {
      await new Promise((resolve) => setTimeout(resolve, 10));
      list = ownerClipListSchema.parse(
        JSON.parse(
          (
            await ownerRequest(port, `${endpoint}/clips`, { headers: auth })
          ).body.toString(),
        ),
      );
    }
    expect(list.active).toBe(false);
    const clip = list.clips[0]!;
    expect(clip.state).toBe("review-ready");
    const calls = {
      plan: plan.mock.calls.length,
      media: media.mock.calls.length,
    };
    const request = {
      operationId: randomUUID(),
      expectedRevision: clip.revision,
      sourceRevision: 0,
      hook,
    };
    const response = await post(
      `${endpoint}/clips/${clip.id}/hook-title`,
      request,
    );
    expect(response.status).toBe(200);
    const result = ownerHookTitleResultSchema.parse(
      JSON.parse(response.body.toString()),
    );
    expect(
      (await post(`${endpoint}/clips/${clip.id}/hook-title`, request)).body,
    ).toEqual(response.body);
    expect(
      (
        await post(`${endpoint}/clips/${clip.id}/hook-title`, {
          ...request,
          operationId: randomUUID(),
          expectedRevision: clip.revision + 1,
        })
      ).status,
    ).not.toBe(200);
    expect(infer).toHaveBeenCalledTimes(1);
    expect(plan).toHaveBeenCalledTimes(calls.plan);
    expect(media).toHaveBeenCalledTimes(calls.media);
    const original = initialOwnerEdit(clip),
      draft = withIndependentOwnerHook(
        clip.base!,
        original,
        clip.assets,
        [],
        hook,
      ),
      next = acceptHookTitle(draft, result, hookTitleFingerprint(draft));
    const saved = await post(`${endpoint}/clips/${clip.id}/edit`, {
      operationId: randomUUID(),
      baseHash: clip.baseHash,
      expectedRevision: clip.revision,
      operations: ownerEditOperations(original, next, clip),
    });
    expect(saved.status).toBe(200);
    const updated = ownerClipListSchema.parse(JSON.parse(saved.body.toString()))
      .clips[0]!;
    const overlay = compileOwnerOverlay(
      updated.base!,
      updated.edit!,
      updated.assets,
      [],
    );
    expect(overlay.hookContent!.texts![0]!.spans![0]!.style.color).toBe(
      "#FF3B30",
    );
    expect(updated.hookTitleAttempts).toBe(1);
    expect(updated.revision).toBe(clip.revision + 1);
    const captioned = await post(`${endpoint}/clips/${clip.id}/captions`, {
      operationId: randomUUID(),
      expectedRevision: updated.revision,
    });
    expect(captioned.status).toBe(200);
    const withCaptions = ownerClipListSchema.parse(
      JSON.parse(captioned.body.toString()),
    ).clips[0]!;
    const captionOverlay = compileOwnerOverlay(
      withCaptions.base!,
      withCaptions.edit!,
      withCaptions.assets,
      [],
    );
    expect(captionOverlay.hookContent!.captions.length).toBeGreaterThan(0);
    expect(captionOverlay.hookContent!.texts![0]!.spans![0]!.style.color).toBe(
      "#FF3B30",
    );
    expect(
      new Set(
        captionOverlay.captionSpeakers!.assignments.map(
          (word) => word.speakerId,
        ),
      ),
    ).toEqual(new Set(["spk_0", "spk_1"]));
    const speakerFrames = captionOverlay.captions.map(
      (caption) =>
        ownerOverlayFrame(
          captionOverlay,
          45 + Math.ceil((caption.startMs * 30) / 1000),
        ).colors,
    );
    const speakerHighlights = new Set(
      speakerFrames.map((frame) => frame?.highlight),
    );
    expect(speakerHighlights.has("#74b9ff")).toBe(true);
    expect(speakerHighlights.has("#ffb86c")).toBe(true);
    expect(
      speakerFrames
        .filter((frame) => frame !== undefined)
        .every((frame) => frame.color === captionOverlay.captionStyle?.color),
    ).toBe(true);
    expect(media).toHaveBeenCalledTimes(calls.media);
    expect(infer).toHaveBeenCalledTimes(1);
  } finally {
    await host.close();
    await rm(root, { recursive: true, force: true });
  }
});
