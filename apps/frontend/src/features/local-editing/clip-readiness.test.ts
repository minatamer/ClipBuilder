import { expect, it } from "vitest";
import {
  ownerClipSchema,
  type OwnerClip,
} from "../../../../../packages/contracts/local/clips.ts";
import { isLocalClipEditable } from "./clip-readiness.ts";

function completedClip(mode: OwnerClip["mode"]): OwnerClip {
  return ownerClipSchema.parse({
    id: crypto.randomUUID(),
    momentId: crypto.randomUUID(),
    analysisId: crypto.randomUUID(),
    mode,
    sourceRevision: 0,
    revision: 1,
    assemblyRevision: 0,
    baseHash: "a".repeat(64),
    state: "ready",
    assets: [],
    calls: { plan: 1, image: 0, render: 1 },
    error: null,
    outputs: [
      {
        id: "b".repeat(64),
        revision: 1,
        editRevision: 0,
        frames: 90,
        bytes: 1000,
      },
    ],
    base: {
      version: 1,
      analysisId: crypto.randomUUID(),
      momentId: crypto.randomUUID(),
      sourceRevision: 0,
      fingerprint: "c".repeat(64),
      processingIdentity: "d".repeat(64),
      cut: { startFrame: 0, endFrame: 90 },
      words: [],
      overlay: { version: 1, frames: 90, captions: [], visuals: [] },
    },
  });
}

it.each(["synthetic-ai", "provider-ai"] as const)(
  "gates every lifecycle state in %s even when old media is retained",
  (mode) => {
    const clip = completedClip(mode);
    for (const state of ownerClipSchema.shape.state.options) {
      expect(isLocalClipEditable({ ...clip, state }), state).toBe(
        state === "review-ready" ||
          state === "ready" ||
          state === "validated-revision",
      );
    }
    expect(clip.outputs).toHaveLength(1);
    expect(clip.calls).toEqual({ plan: 1, image: 0, render: 1 });
  },
);

it("requires both prepared data and a completed output before revealing edits", () => {
  const clip = completedClip("synthetic-ai");
  for (const state of ["ready", "validated-revision"] as const) {
    expect(isLocalClipEditable({ ...clip, state, base: null })).toBe(false);
    expect(isLocalClipEditable({ ...clip, state, outputs: [] })).toBe(false);
  }
});

it.each(["synthetic-ai", "provider-ai"] as const)(
  "opens a measured preview with no export in %s, retaining active/failure gates",
  (mode) => {
    const clip = {
      ...completedClip(mode),
      outputs: [],
      preview: { frames: 90, bytes: 1000 },
    };
    for (const state of ownerClipSchema.shape.state.options) {
      expect(isLocalClipEditable({ ...clip, state }), state).toBe(
        ["review-ready", "ready", "validated-revision"].includes(state),
      );
    }
    expect(
      isLocalClipEditable({
        ...clip,
        state: "review-ready",
        preview: undefined,
      }),
    ).toBe(false);
    expect(
      isLocalClipEditable({
        ...clip,
        state: "review-ready",
        preview: { frames: 89, bytes: 1000 },
      }),
    ).toBe(false);
  },
);
