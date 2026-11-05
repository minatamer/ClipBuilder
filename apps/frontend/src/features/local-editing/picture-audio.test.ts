import { expect, it } from "vitest";
import type { OwnerAudioCue } from "../../../../../packages/contracts/local/audio.ts";
import { pictureLinkedAudio } from "./picture-audio.ts";

it.each(["builtin", "upload"] as const)(
  "links %s audio to the selected picture without mutating its other occurrence",
  (kind) => {
    const cue: OwnerAudioCue = {
      id: "cue",
      source:
        kind === "builtin" ? { kind, id: "discord" } : { kind, id: "asset" },
      placement: "video",
      startFrame: 0,
      endFrame: 120,
      offsetFrame: 10,
      volume: 27,
      loop: true,
    };
    const saved = structuredClone(cue);
    const linked = pictureLinkedAudio(
      cue,
      { id: "picture", startFrame: 80, endFrame: 90 },
      90,
      kind === "builtin" ? 15 : 45,
    );
    expect(linked).toMatchObject({
      source: cue.source,
      volume: 27,
      visualId: "picture",
      placement: "clip",
      startFrame: 80,
      endFrame: 90,
      offsetFrame: 0,
      loop: false,
    });
    expect(cue).toEqual(saved);
    const moved = pictureLinkedAudio(
      linked,
      { id: "picture", startFrame: 30, endFrame: 60 },
      120,
      15,
    );
    expect(moved.startFrame).toBe(30);
    expect(moved.endFrame).toBe(45);
    expect(cue).toEqual(saved);
  },
);
