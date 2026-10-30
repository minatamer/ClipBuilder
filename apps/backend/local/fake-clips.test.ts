import { expect, it } from "vitest";
import { fakeOwnerClipPreparation } from "./fake-clips.ts";
import type { OwnerClipPorts } from "./clip-batch.ts";

const request = (
  frames: number,
): Parameters<NonNullable<OwnerClipPorts["hookSuggestion"]>>[0] => ({
  clipId: crypto.randomUUID(),
  workspace: {
    id: crypto.randomUUID(),
    revision: 0,
    mode: "synthetic-ai",
    source: {
      fingerprint: "a".repeat(64),
      bytes: 100,
      durationMs: 60000,
      width: 320,
      height: 180,
      fps: 30,
    },
  },
  moment: {
    id: crypto.randomUUID(),
    processingIdentity: "b".repeat(64),
    rangeIds: [],
    evidence: null,
    cut: { startFrame: 0, endFrame: frames },
    cues: [],
  },
});

it("simulates only later sound-length hooks, with no advice for clips lacking a useful later window", () => {
  for (const frames of [30, 300, 389])
    expect(
      fakeOwnerClipPreparation.hookSuggestion!(request(frames)),
    ).toBeUndefined();
  for (const frames of [390, 450, 600, 1800]) {
    for (let index = 0; index < 10; index++) {
      const suggestion = fakeOwnerClipPreparation.hookSuggestion!(
        request(frames),
      )!;
      expect(suggestion.startFrame).toBeGreaterThanOrEqual(300);
      expect(suggestion.endFrame).toBeLessThanOrEqual(frames);
      expect(suggestion.endFrame - suggestion.startFrame).toBe(
        Math.min(frames - 300, 159),
      );
    }
  }
});
