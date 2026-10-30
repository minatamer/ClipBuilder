import { OWNER_FPS } from "../../../packages/contracts/local/policy.ts";
import { createHash } from "node:crypto";
import type { OwnerClipPorts } from "./clip-batch.ts";
import { compileAutomaticOwnerFocus } from "../../../packages/contracts/local/focus.ts";
import { OWNER_AI_HOOK_POLICY } from "../../../packages/contracts/local/hook-sounds.ts";

export const fakeOwnerClipPreparation: Pick<
  OwnerClipPorts,
  "mode" | "plan" | "image" | "focus" | "hookSuggestion"
> = {
  mode: "synthetic-ai",
  hookSuggestion({ clipId, moment }) {
    const frames = moment.cut.endFrame - moment.cut.startFrame,
      first = OWNER_AI_HOOK_POLICY.earliestStartFrame,
      available = frames - first;
    if (available < OWNER_AI_HOOK_POLICY.minimumPreferredFrames)
      return undefined;
    const length = Math.min(available, OWNER_AI_HOOK_POLICY.preferredFrames),
      seed = createHash("sha256").update(clipId).digest().readUInt32BE(0),
      startFrame = first + (seed % (available - length + 1));
    return { startFrame, endFrame: startFrame + length };
  },
  focus({ workspace, moment }) {
    const frames = moment.cut.endFrame - moment.cut.startFrame;
    const mid = Math.floor(frames / 2);
    return compileAutomaticOwnerFocus(
      {
        people: [
          {
            id: "person_1",
            observations: [
              {
                startFrame: 0,
                endFrame: frames,
                box: { x: 0.15, y: 0.1, width: 0.2, height: 0.5 },
              },
            ],
          },
          {
            id: "person_2",
            observations: [
              {
                startFrame: 0,
                endFrame: frames,
                box: { x: 0.65, y: 0.1, width: 0.2, height: 0.5 },
              },
            ],
          },
        ],
        decisions: [
          {
            startFrame: mid,
            endFrame: frames,
            personId: "person_2",
            speakerId: "spk_1",
            confidence: 0.95,
            evidenceWordIds: moment.cues
              .filter(
                (w) =>
                  w.speakerId === "spk_1" && w.endMs > (mid * 1000) / OWNER_FPS,
              )
              .slice(0, 8)
              .map((w) => w.id),
            shotStart: false,
          },
        ],
      },
      workspace.source,
      frames,
      moment.cues,
    ).focus;
  },
  async plan(_request, signal) {
    signal.throwIfAborted();
    return [];
  },
  async image(_request, signal) {
    signal.throwIfAborted();
    throw new Error("synthetic_picture_generation_disabled");
  },
};
