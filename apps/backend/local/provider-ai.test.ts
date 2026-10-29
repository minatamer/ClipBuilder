import { LocalDiagnostics } from "./diagnostics.ts";
import { createHash, randomUUID } from "node:crypto";
import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { createOwnerProviderAi } from "./provider-ai.ts";
import { analyzeOwner } from "./analysis.ts";
import { ownerSelectionPolicy } from "./selection-policy.ts";
import { normalizeCandidateSelection } from "../src/analysis/analysis.provider-shape.ts";
import { normalizeTranscription } from "../src/analysis/transcribe.normalization.ts";
import {
  GeminiAnalysisProvider,
  type GeminiTransport,
} from "../src/analysis/gemini.adapter.ts";
import { GENERATED_PICTURE_MODEL } from "../../../packages/contracts/src/contextual-picture.schema.ts";
import type {
  OwnerMediaJob,
  OwnerWorkspace,
} from "../../../packages/contracts/local/index.ts";
import type { OwnerMoment } from "../../../packages/contracts/local/selection.ts";
import type { GeminiPictureGenerator } from "../src/assembly/gemini-pictures.ts";

// All provider-shaped adapters below are synthetic injected doubles, with no SDK,
// API key, source file, cloud resource or external request.
const policy = { minMs: 10_133, maxMs: 11_877 };
const instructions = ownerSelectionPolicy(policy);
const annotations = [
  ["Coral", "0.111s", "0.711s"],
  ["reefs.", "0.812s", "1.411s"],
  ["Restoration", "10.117s", "10.511s"],
  ["helps.", "10.612s", "11.411s"],
];
const interaction = (values = annotations) => ({
  steps: [
    {
      type: "model_output",
      content: [
        {
          annotations: values.map(([text, start_offset, end_offset]) => ({
            type: "word_info",
            text,
            start_offset,
            end_offset,
            speaker: "synthetic-voice",
          })),
        },
      ],
    },
  ],
});
const words = normalizeTranscription(interaction()).words;
const proposal = {
  startWordId: "w_000003",
  endWordId: "w_000004",
  titleWordIds: ["w_000003"],
  hookWordIds: ["w_000003", "w_000004"],
  evidence: [
    { signal: "immediate-hook", wordIds: ["w_000003"] },
    { signal: "clear-payoff", wordIds: ["w_000004"] },
  ],
  caveats: [],
};
const cue = {
  startFrame: 0,
  endFrame: 60,
  evidenceWordIds: ["w_000001", "w_000002"],
  brief: {
    scene: "A restored coral reef supporting sea life",
    searchQuery: "restored coral reef",
    requiredTerms: ["coral", "reef"],
    avoidTerms: ["logos"],
  },
};
it.each([
  { startFrame: 60, endFrame: 150 },
  null,
  { startFrame: "bad", endFrame: 150 },
])(
  "retains optional Hook advice from the single planning request without adding image or inference work (%j)",
  async (suggestion) => {
    const f = fixture(),
      request = { workspace: f.workspace, clipId: f.clipId, moment: f.moment };
    f.transport.generate.mockResolvedValue({
      finished: true,
      text: JSON.stringify({
        pictures: [cue],
        focus: { people: [], decisions: [] },
        hookSuggestion: suggestion,
      }),
    });
    expect(await f.ports.clipPreparation.plan(request, f.signal)).toEqual([
      cue,
    ]);
    expect(f.ports.clipPreparation.hookSuggestion?.(request)).toEqual(
      suggestion && typeof suggestion.startFrame === "number"
        ? suggestion
        : undefined,
    );
    expect(f.transport.generate).toHaveBeenCalledTimes(1);
    expect(f.transport.generate.mock.calls[0]![2].policy).toContain(
      "never activate a hook",
    );
    expect(f.pictures.find).not.toHaveBeenCalled();
    await f.ports.close(f.signal);
  },
);

it.each([
  "A grounded clip headline",
  "A headline ".repeat(20),
  null,
  { bad: true },
])(
  "ignores unsolicited title data without rejecting usable pictures/focus or adding a request (%j)",
  async (title) => {
    const f = fixture();
    f.transport.generate.mockResolvedValue({
      finished: true,
      text: JSON.stringify({
        title,
        pictures: [cue],
        focus: { people: [], decisions: [] },
      }),
    });
    const request = {
      workspace: f.workspace,
      clipId: f.clipId,
      moment: f.moment,
    };
    expect(await f.ports.clipPreparation.plan(request, f.signal)).toEqual([
      cue,
    ]);
    expect(f.transport.generate).toHaveBeenCalledTimes(1);
    expect(f.transport.transcribe).toHaveBeenCalledTimes(0);
    expect(f.pictures.find).toHaveBeenCalledTimes(0);
    expect(f.transport.generate.mock.calls[0]![2].policy).toContain(
      "TEXT: zero to three optional",
    );
    expect(
      z.toJSONSchema(f.transport.generate.mock.calls[0]![2].schema, {
        io: "input",
      }),
    ).not.toHaveProperty("properties.title");
    expect(() =>
      z.toJSONSchema(f.transport.generate.mock.calls[0]![2].schema, {
        io: "input",
      }),
    ).not.toThrow();
    await f.ports.close(f.signal);
  },
);

it("decodes optional timed text from the existing Gemini planning call without an extra provider request", async () => {
  const f = fixture(),
    request = { workspace: f.workspace, clipId: f.clipId, moment: f.moment };
  f.transport.generate.mockResolvedValue({
    finished: true,
    text: JSON.stringify({
      pictures: [cue],
      texts: [
        {
          startFrame: 0,
          endFrame: 60,
          wordIds: words.slice(0, 2).map((word) => word.id),
        },
        { wordIds: ["w_999999"] },
      ],
      focus: { people: [], decisions: [] },
    }),
  });
  expect(await f.ports.clipPreparation.plan(request, f.signal)).toEqual([cue]);
  expect(f.ports.clipPreparation.texts!(request)).toMatchObject([
    { text: "Coral reefs.", startFrame: 0, endFrame: 60 },
  ]);
  expect(f.transport.generate).toHaveBeenCalledTimes(1);
  expect(f.pictures.find).not.toHaveBeenCalled();
  await f.ports.close(f.signal);
});

it("retains anonymous camera observations from the existing single video request while malformed focus leaves usable pictures intact", async () => {
  const f = fixture();
  f.transport.generate.mockResolvedValue({
    finished: true,
    text: JSON.stringify({
      pictures: [cue],
      focus: {
        people: [
          {
            id: "person_1",
            observations: [
              {
                startFrame: 0,
                endFrame: 9000,
                box: { x: 0.1, y: 0.1, width: 0.2, height: 0.4 },
              },
            ],
          },
          {
            id: "person_2",
            observations: [
              {
                startFrame: 0,
                endFrame: 9000,
                box: { x: 0.6, y: 0.1, width: 0.2, height: 0.4 },
              },
              null,
            ],
          },
        ],
        decisions: [
          {
            startFrame: 0,
            endFrame: 90,
            personId: "person_2",
            speakerId: words[0]!.speakerId,
            confidence: 0.95,
            evidenceWordIds: words.slice(0, 2).map((w) => w.id),
            shotStart: false,
          },
        ],
      },
    }),
  });
  expect(
    await f.ports.clipPreparation.plan(
      { workspace: f.workspace, clipId: f.clipId, moment: f.moment },
      f.signal,
    ),
  ).toEqual([cue]);
  const focus = f.ports.clipPreparation.focus!({
    workspace: f.workspace,
    clipId: f.clipId,
    moment: f.moment,
  });
  expect(focus.people).toHaveLength(2);
  expect(focus.shots[0]?.personId).toBe("person_2");
  focus.people.length = 0;
  expect(
    f.ports.clipPreparation.focus!({
      workspace: f.workspace,
      clipId: f.clipId,
      moment: f.moment,
    }).people,
  ).toHaveLength(2);
  expect(f.transport.generate).toHaveBeenCalledTimes(1);
  expect(f.media).toHaveBeenCalledTimes(1);
  await f.ports.close(f.signal);
});
function fixture(diagnostics?: LocalDiagnostics) {
  const workspace: OwnerWorkspace = {
    id: randomUUID(),
    revision: 3,
    mode: "provider-ai",
    source: {
      fingerprint: "a".repeat(64),
      bytes: 10_000,
      durationMs: 3_600_000,
      width: 1920,
      height: 1080,
      fps: 29.97,
    },
  };
  const moment: OwnerMoment = {
    id: randomUUID(),
    processingIdentity: "b".repeat(64),
    rangeIds: [randomUUID()],
    evidence: null,
    cut: { startFrame: 0, endFrame: 9000 },
    cues: structuredClone(words),
  };
  const clipId = randomUUID();
  const transport = {
    upload: vi.fn(async (name: string, input: Blob) => ({
      name,
      mimeType: input.type,
      state: "ACTIVE",
      uri: `https://generativelanguage.googleapis.com/v1beta/${name}`,
    })),
    get: vi.fn(async () => {
      throw new Error("unexpected_poll");
    }),
    transcribe: vi.fn(async () => interaction()),
    generate: vi.fn<GeminiTransport["generate"]>(async () => ({
      text: JSON.stringify({ pictures: [cue] }),
      finished: true,
    })),
    candidates: vi.fn<GeminiTransport["candidates"]>(async () => ({
      text: JSON.stringify({
        candidates: Array.from({ length: 14 }, () => proposal),
      }),
      finished: true,
    })),
    delete: vi.fn<GeminiTransport["delete"]>(async () => {}),
  } satisfies GeminiTransport;
  const files = {
    readProviderInput: vi.fn(
      async (_id, request) =>
        new Blob(["synthetic-provider-proxy"], {
          type: request.kind === "audio" ? "audio/m4a" : "video/mp4",
        }),
    ),
    removeProviderInput: vi.fn(async () => {}),
  } satisfies Parameters<typeof createOwnerProviderAi>[0]["files"];
  const media = vi.fn(async (job: OwnerMediaJob) => {
    if (
      job.operation !== "prepare-owner-audio" &&
      job.operation !== "prepare-owner-video"
    )
      throw new Error("unexpected_native_operation");
    return {
      operation: job.operation,
      bytes: 24,
      digest: "c".repeat(64),
      durationMs:
        job.operation === "prepare-owner-audio"
          ? workspace.source.durationMs
          : Math.round(((job.cut.endFrame - job.cut.startFrame) * 1000) / 30),
    };
  });
  const pictures = {
    find: vi.fn<GeminiPictureGenerator["find"]>(async () => {
      throw new Error("unexpected_picture_work");
    }),
  };
  const ports = createOwnerProviderAi({
    files,
    media,
    transport,
    pictures,
    ...(diagnostics ? { diagnostics } : {}),
  });
  return {
    workspace,
    moment,
    clipId,
    transport,
    files,
    media,
    pictures,
    ports,
    signal: new AbortController().signal,
  };
}

describe("dormant owner provider ports with synthetic transports", () => {
  it("rejects malformed manual exclusions before contacting the injected transport", async () => {
    const f = fixture();
    for (const cuts of [
      [{ startFrame: 30, endFrame: 29 }],
      [{ startFrame: -1, endFrame: 30 }],
      Array.from({ length: 11 }, () => ({ startFrame: 0, endFrame: 30 })),
    ]) {
      await expect(
        f.ports.analysis.select(words, policy, f.signal, instructions, 4, cuts),
      ).rejects.toThrow();
    }
    expect(f.transport.candidates).not.toHaveBeenCalled();
    expect(f.transport.upload).not.toHaveBeenCalled();
    await f.ports.close(f.signal);
  });
  it.each([5, 10])(
    "binds requested count %i to the real provider prompt and response ceiling using injected transport",
    async (count) => {
      const f = fixture();
      f.transport.candidates.mockResolvedValue({
        text: JSON.stringify({
          candidates: Array.from({ length: 10 + count }, () => proposal),
        }),
        finished: true,
      });
      const instructions = ownerSelectionPolicy(policy, count);
      expect(
        await f.ports.analysis.select(
          words,
          policy,
          f.signal,
          instructions,
          count,
        ),
      ).toHaveLength(10 + count);
      expect(f.transport.candidates).toHaveBeenCalledExactlyOnceWith(
        JSON.stringify({ words }),
        expect.any(AbortSignal),
        instructions,
      );
      expect(instructions).toContain(
        `owner requests ${count} independent final AI moments`,
      );
      expect(f.transport.upload).not.toHaveBeenCalled();
      await f.ports.close(f.signal);
    },
  );
  it("is inert and preserves complete-source words, custom ranges and fourteen proposals", async () => {
    const f = fixture();
    expect(f.media).not.toHaveBeenCalled();
    expect(f.transport.upload).not.toHaveBeenCalled();
    expect(f.pictures.find).not.toHaveBeenCalled();
    const result = await analyzeOwner(
      f.workspace,
      {
        sourceRevision: 3,
        policyRevision: 7,
        aiDuration: policy,
        manualOnly: false,
        ranges: [
          { id: randomUUID(), startMs: 0, endMs: 1000 },
          { id: randomUUID(), startMs: 300_000, endMs: 360_000 },
        ],
      },
      f.ports.analysis,
      f.signal,
    );
    expect(result.mode).toBe("provider-ai");
    expect(result.words).toEqual(words);
    expect(result.manual.map((item) => item.cut)).toEqual([
      { startFrame: 0, endFrame: 30 },
      { startFrame: 9000, endFrame: 10800 },
    ]);
    expect(result.suggestions).toHaveLength(4);
    expect(result.suggestions[0]!.evidence!.title).toBe("Restoration");
    expect(result.calls).toEqual({ transcription: 1, selection: 1 });
    expect(f.media).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        operation: "prepare-owner-audio",
        workspaceId: f.workspace.id,
        fingerprint: f.workspace.source.fingerprint,
      }),
      f.signal,
    );
    expect(f.transport.upload).toHaveBeenCalledTimes(1);
    expect(f.transport.transcribe).toHaveBeenCalledTimes(1);
    expect(f.transport.candidates).toHaveBeenCalledExactlyOnceWith(
      JSON.stringify({
        words,
        manualExclusions: {
          fps: 30,
          cuts: result.manual.map(({ cut }) => cut),
        },
      }),
      expect.any(AbortSignal),
      instructions,
    );
    expect(f.transport.delete).toHaveBeenCalledTimes(1);
    expect(f.files.removeProviderInput).toHaveBeenCalledExactlyOnceWith(
      f.workspace.id,
      { kind: "audio" },
    );
    expect(
      await f.ports.analysis.select(words, policy, f.signal, instructions),
    ).toHaveLength(14);
    expect(f.transport.upload).toHaveBeenCalledTimes(1);
    await f.ports.close(f.signal);
    expect(f.transport.delete).toHaveBeenCalledTimes(1);
  });

  it("plans the exact local clip and generates only its admitted contextual picture once", async () => {
    const f = fixture();
    const jpeg = await sharp({
      create: { width: 320, height: 180, channels: 3, background: "#126a72" },
    })
      .jpeg()
      .toBuffer();
    f.pictures.find.mockResolvedValue({
      repository: "google-gemini",
      model: GENERATED_PICTURE_MODEL,
      policy: "contextual-generated-v1",
      width: 320,
      height: 180,
      sha256: createHash("sha256").update(jpeg).digest("hex"),
      dataUri: `data:image/jpeg;base64,${jpeg.toString("base64")}`,
    });
    expect(
      await f.ports.clipPreparation.plan(
        { workspace: f.workspace, clipId: f.clipId, moment: f.moment },
        f.signal,
      ),
    ).toEqual([cue]);
    expect(f.media).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        operation: "prepare-owner-video",
        clipId: f.clipId,
        cut: f.moment.cut,
        fingerprint: f.workspace.source.fingerprint,
      }),
      f.signal,
    );
    const task = f.transport.generate.mock.calls[0]![2];
    expect(JSON.parse(task.prompt)).toEqual({
      frames: 9000,
      fps: 30,
      coordinateSpace: "upright-display",
      source: { width: 1920, height: 1080 },
      words,
    });
    expect(task.policy).toContain("untrusted data");
    expect(
      task.schema.safeParse({
        pictures: [cue],
        hookSuggestion: null,
        focus: { people: [], decisions: [] },
      }).success,
    ).toBe(true);
    const output = await f.ports.clipPreparation.image(
      { clipId: f.clipId, cue, words },
      f.signal,
    );
    expect(output).toEqual({ bytes: jpeg, origin: "generated" });
    expect(f.pictures.find).toHaveBeenCalledExactlyOnceWith(
      { kind: "object", brief: cue.brief },
      f.signal,
    );
    await expect(
      f.ports.clipPreparation.image({ clipId: f.clipId, cue, words }, f.signal),
    ).rejects.toThrow("owner_picture_not_admitted");
    expect(f.pictures.find).toHaveBeenCalledTimes(1);
    await f.ports.cleanupWorkspace(f.workspace.id, f.signal);
    await f.ports.close(f.signal);
    expect(f.files.removeProviderInput).toHaveBeenCalledTimes(1);
    expect(f.transport.delete).toHaveBeenCalledTimes(1);
  });

  it.each(["invented", "misaligned"])(
    "retains %s grounding as advisory and allows optional image work",
    async (kind) => {
      const f = fixture();
      f.transport.generate.mockResolvedValue({
        finished: true,
        text: JSON.stringify({
          pictures: [
            {
              ...cue,
              evidenceWordIds: [kind === "invented" ? "w_999999" : "w_000004"],
            },
          ],
        }),
      });
      const plan = await f.ports.clipPreparation.plan(
        { workspace: f.workspace, clipId: f.clipId, moment: f.moment },
        f.signal,
      );
      expect(plan).toHaveLength(1);
      f.pictures.find.mockResolvedValue(null);
      await expect(
        f.ports.clipPreparation.image(
          { clipId: f.clipId, cue: plan[0]!, words },
          f.signal,
        ),
      ).resolves.toBeNull();
      expect(f.pictures.find).toHaveBeenCalledTimes(1);
      expect(f.transport.generate).toHaveBeenCalledTimes(1);
      expect(f.transport.delete).toHaveBeenCalledTimes(1);
      expect(f.files.removeProviderInput).toHaveBeenCalledTimes(1);
      await f.ports.close(f.signal);
    },
  );

  it("retains local proxies after failed remote cleanup and retries only deletion", async () => {
    const f = fixture();
    f.transport.delete.mockRejectedValue(
      new Error("synthetic_cleanup_failure"),
    );
    await expect(
      f.ports.analysis.transcribe(f.workspace, f.signal),
    ).rejects.toMatchObject({ code: "CLEANUP_PENDING" });
    expect(f.files.removeProviderInput).not.toHaveBeenCalled();
    await expect(
      f.ports.analysis.select(words, policy, f.signal, instructions),
    ).rejects.toThrow("owner_provider_cleanup_pending");
    await expect(
      f.ports.cleanupWorkspace(f.workspace.id, f.signal),
    ).rejects.toMatchObject({ code: "CLEANUP_PENDING" });
    expect(f.files.removeProviderInput).not.toHaveBeenCalled();
    f.transport.delete.mockResolvedValue(undefined);
    await f.ports.cleanupWorkspace(f.workspace.id, f.signal);
    expect(f.transport.delete).toHaveBeenCalledTimes(3);
    expect(f.transport.transcribe).toHaveBeenCalledTimes(1);
    expect(f.transport.upload).toHaveBeenCalledTimes(1);
    expect(f.transport.candidates).not.toHaveBeenCalled();
    expect(f.files.removeProviderInput).toHaveBeenCalledExactlyOnceWith(
      f.workspace.id,
      { kind: "audio" },
    );
    await f.ports.close(f.signal);
    expect(f.transport.delete).toHaveBeenCalledTimes(3);
  });

  it("retains cleanup obligations even when generation itself also fails", async () => {
    const f = fixture();
    f.transport.transcribe.mockRejectedValue(
      new Error("synthetic_primary_failure"),
    );
    f.transport.delete.mockRejectedValue(
      new Error("synthetic_cleanup_failure"),
    );
    await expect(
      f.ports.analysis.transcribe(f.workspace, f.signal),
    ).rejects.toMatchObject({ code: "ANALYSIS_PROVIDER_FAILED" });
    expect(f.files.removeProviderInput).not.toHaveBeenCalled();
    f.transport.delete.mockResolvedValue(undefined);
    await f.ports.close(f.signal);
    expect(f.files.removeProviderInput).toHaveBeenCalledTimes(1);
    expect(f.transport.transcribe).toHaveBeenCalledTimes(1);
  });

  it("preserves a failed local removal and drains it without repeating AI", async () => {
    const f = fixture();
    f.files.removeProviderInput.mockRejectedValueOnce(
      new Error("synthetic_local_cleanup_failure"),
    );
    await expect(
      f.ports.analysis.transcribe(f.workspace, f.signal),
    ).rejects.toThrow("synthetic_local_cleanup_failure");
    await expect(
      f.ports.analysis.transcribe(f.workspace, f.signal),
    ).rejects.toThrow("owner_provider_cleanup_pending");
    expect(f.transport.upload).toHaveBeenCalledTimes(1);
    await f.ports.cleanupWorkspace(f.workspace.id, f.signal);
    expect(f.files.removeProviderInput).toHaveBeenCalledTimes(2);
    expect(f.transport.delete).toHaveBeenCalledTimes(1);
    await f.ports.close(f.signal);
  });

  it.each(["unfinished", "malformed", "wrong-shape"])(
    "retains usable %s plans without image work or retry",
    async (kind) => {
      const f = fixture();
      f.transport.generate.mockResolvedValue({
        text:
          kind === "malformed"
            ? "{"
            : JSON.stringify(
                kind === "wrong-shape"
                  ? { pictures: [cue], extra: true }
                  : { pictures: [cue] },
              ),
        finished: kind !== "unfinished",
      });
      await expect(
        f.ports.clipPreparation.plan(
          { workspace: f.workspace, clipId: f.clipId, moment: f.moment },
          f.signal,
        ),
      ).resolves.toEqual(kind === "malformed" ? [] : [cue]);
      expect(f.transport.generate).toHaveBeenCalledTimes(1);
      expect(f.transport.delete).toHaveBeenCalledTimes(1);
      expect(f.files.removeProviderInput).toHaveBeenCalledTimes(1);
      expect(f.pictures.find).not.toHaveBeenCalled();
      await f.ports.close(f.signal);
    },
  );

  it.each(["provenance", "digest"])(
    "rejects generated image %s mismatch with one attempt",
    async (kind) => {
      const f = fixture();
      await f.ports.clipPreparation.plan(
        { workspace: f.workspace, clipId: f.clipId, moment: f.moment },
        f.signal,
      );
      const raster = {
        width: 320,
        height: 180,
        sha256: "d".repeat(64),
        dataUri: "data:image/jpeg;base64,/9j/AA==",
      };
      f.pictures.find.mockResolvedValue(
        kind === "provenance"
          ? {
              ...raster,
              repository: "wikimedia-commons",
              license: "CC0",
              pageId: 1,
              title: "Synthetic source",
            }
          : {
              ...raster,
              repository: "google-gemini",
              model: GENERATED_PICTURE_MODEL,
              policy: "contextual-generated-v1",
            },
      );
      await expect(
        f.ports.clipPreparation.image(
          { clipId: f.clipId, cue, words },
          f.signal,
        ),
      ).rejects.toThrow(
        kind === "provenance"
          ? "owner_picture_provenance_rejected"
          : "owner_picture_digest_rejected",
      );
      await expect(
        f.ports.clipPreparation.image(
          { clipId: f.clipId, cue, words },
          f.signal,
        ),
      ).rejects.toThrow("owner_picture_not_admitted");
      expect(f.pictures.find).toHaveBeenCalledTimes(1);
      await f.ports.close(f.signal);
    },
  );

  it("fails before provider dispatch for mismatched modes, receipts, policy and canceled input", async () => {
    const f = fixture();
    await expect(
      f.ports.analysis.transcribe(
        { ...f.workspace, mode: "synthetic-ai" },
        f.signal,
      ),
    ).rejects.toThrow("analysis_mode_mismatch");
    await expect(
      f.ports.analysis.select(words, policy, f.signal, "untrusted_override"),
    ).rejects.toThrow("owner_selection_policy_rejected");
    await expect(
      f.ports.analysis.transcribe(f.workspace, AbortSignal.abort()),
    ).rejects.toThrow();
    expect(f.media).not.toHaveBeenCalled();
    f.media.mockResolvedValue({
      operation: "prepare-owner-audio",
      bytes: 24,
      digest: "c".repeat(64),
      durationMs: 1000,
    });
    await expect(
      f.ports.analysis.transcribe(f.workspace, f.signal),
    ).rejects.toThrow("owner_provider_input_rejected");
    expect(f.files.readProviderInput).not.toHaveBeenCalled();
    expect(f.files.removeProviderInput).toHaveBeenCalledTimes(1);
    expect(f.transport.upload).not.toHaveBeenCalled();
    expect(f.transport.candidates).not.toHaveBeenCalled();
    await f.ports.close(f.signal);
  });

  it("accepts unfinished usable owner selection while the public default remains compatible", async () => {
    const f = fixture();
    f.transport.candidates.mockResolvedValue({
      text: JSON.stringify({ candidates: [proposal] }),
      finished: false,
    });
    await expect(
      f.ports.analysis.select(words, policy, f.signal, instructions),
    ).resolves.toHaveLength(1);
    const publicProvider = new GeminiAnalysisProvider(f.transport, 1000);
    expect(await publicProvider.candidates("synthetic", f.signal)).toEqual({
      candidates: [proposal],
    });
    expect(f.transport.candidates).toHaveBeenCalledTimes(2);
    expect(f.transport.upload).not.toHaveBeenCalled();
    await f.ports.close(f.signal);
  });

  it.each(["malformed", "wrong-shape", "over-limit"])(
    "decodes %s owner selection without a retry",
    async (kind) => {
      const f = fixture();
      f.transport.candidates.mockResolvedValue({
        text:
          kind === "malformed"
            ? "{"
            : JSON.stringify(
                kind === "wrong-shape"
                  ? [proposal]
                  : { candidates: Array.from({ length: 15 }, () => proposal) },
              ),
        finished: true,
      });
      await expect(
        f.ports.analysis.select(words, policy, f.signal, instructions),
      ).resolves.toHaveLength(
        kind === "malformed" ? 0 : kind === "over-limit" ? 14 : 1,
      );
      expect(f.transport.candidates).toHaveBeenCalledTimes(1);
      expect(f.transport.upload).not.toHaveBeenCalled();
      expect(f.media).not.toHaveBeenCalled();
      await f.ports.close(f.signal);
    },
  );

  it("avoids file transfer and generation for a one-second clip without words", async () => {
    const f = fixture();
    expect(
      await f.ports.clipPreparation.plan(
        {
          workspace: f.workspace,
          clipId: f.clipId,
          moment: {
            ...f.moment,
            cut: { startFrame: 1000, endFrame: 1030 },
            cues: [],
          },
        },
        f.signal,
      ),
    ).toEqual([]);
    expect(
      await f.ports.analysis.select([], policy, f.signal, instructions),
    ).toEqual([]);
    expect(f.media).not.toHaveBeenCalled();
    expect(f.files.readProviderInput).not.toHaveBeenCalled();
    expect(f.transport.upload).not.toHaveBeenCalled();
    expect(f.transport.candidates).not.toHaveBeenCalled();
    expect(f.pictures.find).not.toHaveBeenCalled();
    await f.ports.close(f.signal);
  });

  it("keeps complete owner transcripts above the public limit and fails closed on overflow", async () => {
    const raw = interaction(
      Array.from({ length: 30_000 }, (_, i) => [
        "word",
        `${i / 10}s`,
        `${(i + 1) / 10}s`,
      ]),
    );
    expect(normalizeTranscription(raw).words).toHaveLength(12_000);
    const f = fixture();
    f.transport.transcribe.mockResolvedValue(raw);
    expect(
      await f.ports.analysis.transcribe(f.workspace, f.signal),
    ).toHaveLength(30_000);
    expect(() =>
      normalizeTranscription(
        interaction(
          Array.from({ length: 30_001 }, (_, i) => [
            "word",
            `${i / 10}s`,
            `${(i + 1) / 10}s`,
          ]),
        ),
        undefined,
        { maxWords: 30_000, rejectOverflow: true },
      ),
    ).toThrow("transcription_word_limit");
    const proposals = {
      candidates: Array.from({ length: 14 }, () => proposal),
    };
    expect(
      normalizeCandidateSelection(proposals, words).candidates,
    ).toHaveLength(4);
    expect(
      normalizeCandidateSelection(proposals, words, 14).candidates,
    ).toHaveLength(14);
    expect(() => normalizeCandidateSelection(proposals, words, 21)).toThrow(
      "candidate_policy_rejected",
    );
    expect(f.transport.transcribe).toHaveBeenCalledTimes(1);
    await f.ports.close(f.signal);
  });
});

it("records the failing Gemini stage and HTTP classification once, preserving cleanup and privacy", async () => {
  const lines: string[] = [];
  const f = fixture(new LocalDiagnostics((line) => lines.push(line)));
  const secret = "synthetic-private-provider-body-key-transcript";
  const error = Object.assign(
    new Error(
      JSON.stringify({
        error: { code: 403, status: "PERMISSION_DENIED", message: secret },
      }),
    ),
    { name: "ApiError", status: 403 },
  );
  f.transport.transcribe.mockRejectedValueOnce(error);
  await expect(
    f.ports.analysis.transcribe(f.workspace, f.signal),
  ).rejects.toThrow();
  const records = lines.map((line) => JSON.parse(line));
  expect(records).toContainEqual(
    expect.objectContaining({
      phase: "transcription_generation",
      outcome: "failed",
      upstreamHttpStatus: 403,
    }),
  );
  expect(records).toContainEqual(
    expect.objectContaining({ operation: "transcribe", outcome: "failed" }),
  );
  expect(new Set(records.map((record) => record.requestId)).size).toBe(1);
  expect(f.transport.transcribe).toHaveBeenCalledTimes(1);
  expect(f.transport.upload).toHaveBeenCalledTimes(1);
  expect(f.transport.delete).toHaveBeenCalledTimes(1);
  expect(f.files.removeProviderInput).toHaveBeenCalledTimes(1);
  expect(lines.join("\n")).not.toContain(secret);
  await f.ports.close(f.signal);
});

it("continues to selection after provider tokens with unusable timings without changing valid timings or repeating AI", async () => {
  const lines: string[] = [];
  const f = fixture(new LocalDiagnostics((line) => lines.push(line)));
  f.transport.transcribe.mockResolvedValueOnce(
    interaction([
      annotations[1]!,
      annotations[0]!,
      annotations[2]!,
      annotations[3]!,
      ["SyntheticZero", "2s", "2s"],
      ["SyntheticOutside", "4000s", "4001s"],
    ]),
  );
  const transcript = await f.ports.analysis.transcribe(f.workspace, f.signal);
  expect(transcript.map((word) => word.id)).toEqual([
    "w_000001",
    "w_000002",
    "w_000003",
    "w_000004",
    "w_000005",
    "w_000006",
  ]);
  expect(transcript.map((word) => [word.startMs, word.endMs])).toEqual([
    [812, 1411],
    [111, 711],
    [10117, 10511],
    [10612, 11411],
    [2000, 2000],
    [4000000, 4001000],
  ]);
  await f.ports.analysis.select(transcript, policy, f.signal, instructions);
  expect(f.transport.transcribe).toHaveBeenCalledTimes(1);
  expect(f.transport.candidates).toHaveBeenCalledTimes(1);
  expect(f.transport.upload).toHaveBeenCalledTimes(1);
  expect(f.transport.delete).toHaveBeenCalledTimes(1);
  expect(lines.map((line) => JSON.parse(line))).toContainEqual(
    expect.objectContaining({
      transcriptTiming: {
        returnedWords: 6,
        acceptedWords: 6,
        nonpositiveWords: 1,
        outsideMediaWords: 1,
        reorderedWords: 0,
        outOfOrderWords: 2,
      },
    }),
  );
  expect(f.transport.candidates.mock.calls[0]![0]).toContain("SyntheticZero");
  expect(f.transport.candidates.mock.calls[0]![0]).toContain(
    "SyntheticOutside",
  );
  await f.ports.close(f.signal);
});

it("transcribes only a selected cut in synthetic mode through the explicit caption port and cleans both proxies", async () => {
  const f = fixture();
  const { ownerClipSchema } =
    await import("../../../packages/contracts/local/clips.ts");
  const clip = ownerClipSchema.parse({
    id: f.clipId,
    momentId: f.moment.id,
    mode: "synthetic-ai",
    analysisId: randomUUID(),
    sourceRevision: 3,
    revision: 0,
    assemblyRevision: 0,
    baseHash: "b".repeat(64),
    state: "ready",
    base: {
      version: 1,
      analysisId: randomUUID(),
      momentId: f.moment.id,
      sourceRevision: 3,
      fingerprint: f.workspace.source.fingerprint,
      processingIdentity: f.moment.processingIdentity,
      cut: f.moment.cut,
      words: f.moment.cues,
      overlay: { version: 1, frames: 9000, captions: [], visuals: [] },
    },
    edit: null,
    assets: [],
    outputs: [],
    calls: { plan: 0, image: 0, render: 0 },
    error: null,
  });
  f.media.mockImplementationOnce(async (job) => {
    if (job.operation !== "prepare-owner-audio")
      throw new Error("unexpected_clip_input");
    return {
      operation: job.operation,
      bytes: 24,
      digest: "c".repeat(64),
      durationMs: 300000,
    };
  });
  const result = await f.ports.captionTranscription(
    { ...f.workspace, mode: "synthetic-ai" },
    clip,
    f.signal,
  );
  expect(result).toHaveLength(4);
  expect(f.media).toHaveBeenCalledTimes(1);
  expect(f.media.mock.calls[0]![0]).toMatchObject({
    operation: "prepare-owner-audio",
    clipId: f.clipId,
    cut: f.moment.cut,
  });
  expect(f.files.readProviderInput.mock.calls[0]![1]).toEqual({
    kind: "audio",
    clipId: f.clipId,
  });
  expect(f.transport.upload).toHaveBeenCalledTimes(1);
  expect(f.transport.transcribe).toHaveBeenCalledTimes(1);
  expect(f.transport.generate).toHaveBeenCalledTimes(0);
  expect(f.transport.candidates).toHaveBeenCalledTimes(0);
  expect(f.pictures.find).toHaveBeenCalledTimes(0);
  expect(f.transport.delete).toHaveBeenCalledTimes(1);
  expect(f.files.removeProviderInput).toHaveBeenCalledTimes(1);
  await expect(
    f.ports.analysis.transcribe(
      { ...f.workspace, mode: "synthetic-ai" },
      f.signal,
    ),
  ).rejects.toThrow("analysis_mode_mismatch");
  expect(f.media).toHaveBeenCalledTimes(1);
  await f.ports.close(f.signal);
});
