import { z } from "zod";
import {
  OWNER_BATCH_POLICY,
  ownerClipPlanSchema,
} from "../../../packages/contracts/local/clips.ts";
import {
  contextualPictureBriefSchema,
  CONTEXTUAL_PICTURE_POLICY,
} from "../../../packages/contracts/src/contextual-picture.schema.ts";
import { OWNER_FPS } from "../../../packages/contracts/local/policy.ts";
import type { OwnerWord } from "../../../packages/contracts/local/selection.ts";
import type { LocalDiagnostics } from "./diagnostics.ts";

export function critiqueOwnerVisualCue(
  cue: z.infer<typeof ownerClipPlanSchema>[number],
  words: readonly OwnerWord[],
  frames: number,
  diagnostics: LocalDiagnostics,
) {
  if (
    cue.startFrame < 0 ||
    cue.endFrame <= cue.startFrame ||
    cue.endFrame > frames ||
    !Number.isInteger(cue.startFrame) ||
    !Number.isInteger(cue.endFrame)
  )
    diagnostics.critique("visual_validate", "gemini_clock_converted");
  const byId = new Map(words.map((word) => [word.id, word]));
  if (
    !cue.evidenceWordIds.length ||
    new Set(cue.evidenceWordIds).size !== cue.evidenceWordIds.length ||
    cue.evidenceWordIds.some((id) => {
      const word = byId.get(id);
      return (
        !word ||
        word.endMs * OWNER_FPS <= cue.startFrame * 1000 ||
        word.startMs * OWNER_FPS >= cue.endFrame * 1000
      );
    })
  )
    diagnostics.critique("visual_validate", "gemini_evidence_critique");
}

/** Decode usable optional art; editorial checks cannot reject the paid clip. */
export function decodeOwnerVisualPlan(
  value: unknown,
  diagnostics: LocalDiagnostics,
) {
  const envelope = z
    .object({ pictures: z.array(z.unknown()) })
    .safeParse(value);
  const received = Array.isArray(value)
    ? value
    : envelope.success
      ? envelope.data.pictures
      : [];
  if (!envelope.success && !Array.isArray(value))
    diagnostics.critique("visual_validate", "gemini_output_unusable");
  if (received.length > OWNER_BATCH_POLICY.imageAttemptsPerClip)
    diagnostics.critique("visual_validate");
  return received
    .slice(0, OWNER_BATCH_POLICY.imageAttemptsPerClip)
    .flatMap((item) => {
      const fields = z
        .object({
          startFrame: z.number().finite(),
          endFrame: z.number().finite(),
          brief: z.unknown(),
          evidenceWordIds: z
            .array(z.string().max(64))
            .max(CONTEXTUAL_PICTURE_POLICY.maxSupportingPhraseWords)
            .catch([]),
        })
        .safeParse(item);
      if (!fields.success) {
        diagnostics.critique("visual_validate", "gemini_output_unusable");
        return [];
      }
      let brief = contextualPictureBriefSchema.safeParse(fields.data.brief);
      if (!brief.success) {
        diagnostics.critique("visual_validate");
        const raw = z
          .object({ scene: z.string().min(1) })
          .safeParse(fields.data.brief);
        if (!raw.success) return [];
        const scene = raw.data.scene
          .normalize("NFC")
          .replace(/[\p{Cc}\u202a-\u202e\u2066-\u2069]/gu, " ")
          .trim()
          .slice(0, 180);
        const query = scene
          .replace(/[^\p{L}\p{N} -]/gu, " ")
          .trim()
          .slice(0, 100);
        brief = contextualPictureBriefSchema.safeParse({
          scene,
          searchQuery: query.length >= 2 ? query : "illustration",
          requiredTerms: [
            query
              .split(/\s+/u)
              .find((term) => term.length >= 2)
              ?.slice(0, 30) ?? "illustration",
          ],
          avoidTerms: [],
        });
      }
      if (!brief.success) return [];
      return [
        {
          startFrame: fields.data.startFrame,
          endFrame: fields.data.endFrame,
          brief: brief.data,
          evidenceWordIds: fields.data.evidenceWordIds,
        },
      ];
    });
}

/** Physical composition clock conversion, independent of editorial critique. */
export function ownerVisualClock(
  cue: { startFrame: number; endFrame: number },
  frames: number,
) {
  const startFrame = Math.max(
    0,
    Math.min(frames - 1, Math.round(Math.min(cue.startFrame, cue.endFrame))),
  );
  const endFrame = Math.max(
    startFrame + 1,
    Math.min(frames, Math.round(Math.max(cue.startFrame, cue.endFrame))),
  );
  return { startFrame, endFrame };
}
