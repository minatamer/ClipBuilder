import { z } from "zod";
import {
  ASSEMBLY_LIMITS,
  FIXED_COMPOSITION_POLICY,
  CONTEXTUAL_PICTURE_POLICY,
  contextualPicturePlanSchema,
  contextualPictureAssetSchema,
  compositionManifestV3Schema,
  type CompositionManifestV3,
  type ContextualPicture,
  type ContextualPicturePlan,
  type ContextualPictureAsset,
  type TranscriptWord,
  type SelectedAssemblyResult,
} from "@clipbuilder/contracts";
import type { AnalysisDiagnostics } from "../analysis/analysis.diagnostics.js";
import type { ContextualPictureSource } from "./commons-pictures.js";
import type { SpeakerPlanContext } from "./speaker-focus.js";

export async function compileContextualPictures(
  raw: unknown,
  context: SpeakerPlanContext,
  manifest: CompositionManifestV3,
  source: ContextualPictureSource | undefined,
  signal: AbortSignal,
  diagnostics: AnalysisDiagnostics,
  fallback?: { source: ContextualPictureSource; reserve: () => void },
) {
  const record = z.record(z.string(), z.unknown()).safeParse(raw);
  const plans =
    record.success && Array.isArray(record.data.pictures)
      ? record.data.pictures.slice(0, CONTEXTUAL_PICTURE_POLICY.maxPictures)
      : [];
  const pictures: ContextualPicture[] = [];
  const pictureNotes: NonNullable<SelectedAssemblyResult["pictureNotes"]> = [];
  const prepared: {
    plan: ContextualPicturePlan;
    words: TranscriptWord[];
    anchor: TranscriptWord;
    startMs: number;
    endMs: number;
    retimed: boolean;
  }[] = [];
  let searches = 0,
    validated = 0,
    retimed = 0,
    generations = 0;
  for (const rawPlan of plans) {
    try {
      signal.throwIfAborted();
      const plan = contextualPicturePlanSchema.parse(rawPlan);
      const first = context.words.findIndex(
        (word) => word.id === plan.subject.startWordId,
      );
      const last = context.words.findIndex(
        (word) => word.id === plan.subject.endWordId,
      );
      const proposedAnchor = context.words.find(
        (word) => word.id === plan.anchorWordId,
      );
      if (
        !proposedAnchor ||
        first < 0 ||
        last < first ||
        last - first + 1 > CONTEXTUAL_PICTURE_POLICY.maxSupportingPhraseWords
      )
        throw new Error("invalid-picture-evidence");
      const words = context.words.slice(first, last + 1);
      const earliest = words.reduce((firstWord, word) =>
        word.startMs < firstWord.startMs ? word : firstWord,
      );
      // Phrase evidence may begin before Gemini's chosen anchor. Move the
      // visual to an actual supplied word. The full phrase establishes relevance;
      // a bounded display window need only cover a grounded excerpt of it.
      const anchor =
        earliest.startMs < proposedAnchor.startMs ? earliest : proposedAnchor;
      const startMs = anchor.startMs - context.range.startMs,
        phraseEndMs =
          Math.max(...words.map((word) => word.endMs)) - context.range.startMs,
        durationMs = Math.min(
          ASSEMBLY_LIMITS.maxVisualCueMilliseconds,
          Math.max(plan.durationMs, phraseEndMs - startMs),
        ),
        endMs = Math.min(
          startMs + durationMs,
          context.range.endMs - context.range.startMs,
        );
      if (
        startMs < FIXED_COMPOSITION_POLICY.openingBeatMs ||
        endMs - startMs < CONTEXTUAL_PICTURE_POLICY.minDurationMs
      )
        throw new Error("invalid-picture-evidence");
      prepared.push({
        plan,
        words,
        anchor,
        startMs,
        endMs,
        retimed:
          anchor.id !== proposedAnchor.id ||
          endMs - startMs !== plan.durationMs,
      });
    } catch (error) {
      signal.throwIfAborted();
      diagnostics.critique("assembly_pictures", error);
    }
  }
  prepared.sort((a, b) => a.startMs - b.startMs);
  for (const candidate of prepared) {
    try {
      signal.throwIfAborted();
      const { plan, words, anchor, startMs } = candidate;
      const next = prepared.find((other) => other.startMs > startMs);
      // Give a neighboring idea a clean cut without sacrificing readability.
      // Close anchors never shorten an image below the two-second minimum.
      const endMs =
        next &&
        next.startMs - startMs >= CONTEXTUAL_PICTURE_POLICY.minDurationMs &&
        words[0]!.endMs - context.range.startMs <= next.startMs
          ? Math.min(candidate.endMs, next.startMs)
          : candidate.endMs;
      const subjectWords: TranscriptWord[] = [];
      for (const word of words) {
        if (
          word.startMs - context.range.startMs < startMs ||
          word.endMs - context.range.startMs > endMs
        )
          break;
        subjectWords.push(word);
        if (subjectWords.length === CONTEXTUAL_PICTURE_POLICY.maxSubjectWords)
          break;
      }
      const windows = [
        ...manifest.cards,
        ...pictures,
        { startMs, endMs, asset: null },
      ].sort((a, b) => a.startMs - b.startMs);
      if (
        endMs - startMs < CONTEXTUAL_PICTURE_POLICY.minDurationMs ||
        windows.length > ASSEMBLY_LIMITS.maxVisualCues ||
        !subjectWords.length ||
        windows.some((item, index) => {
          const previous = windows[index - 1];
          const adjacentPictures =
            previous && "asset" in previous && "asset" in item;
          return (
            previous &&
            item.startMs <
              previous.endMs +
                (adjacentPictures
                  ? 0
                  : FIXED_COMPOSITION_POLICY.cardSeparationMs)
          );
        }) ||
        windows.reduce((sum, item) => sum + item.endMs - item.startMs, 0) *
          100 >
          (context.range.endMs - context.range.startMs) *
            ASSEMBLY_LIMITS.maxVisualCoveragePercent
      )
        throw new Error("invalid-picture-evidence");
      validated++;
      if (candidate.retimed || endMs !== candidate.endMs) retimed++;
      const request = { kind: plan.kind, brief: plan.brief };
      let asset: ContextualPictureAsset | null | undefined;
      const duplicate = (asset: ContextualPictureAsset) =>
        pictures.some(
          (picture) =>
            (picture.asset.repository === "wikimedia-commons" &&
              asset.repository === "wikimedia-commons" &&
              picture.asset.pageId === asset.pageId) ||
            picture.asset.sha256 === asset.sha256,
        );
      if (source) {
        searches++;
        try {
          asset = await diagnostics.step("assembly_pictures", () =>
            source.find(request, signal),
          );
          if (asset) {
            asset = contextualPictureAssetSchema.parse(asset);
            if (duplicate(asset)) {
              diagnostics.critique(
                "assembly_pictures",
                new Error("duplicate_contextual_picture"),
              );
              asset = null;
            }
          }
        } catch (error) {
          signal.throwIfAborted();
          diagnostics.critique("assembly_pictures", error);
          asset = null;
        }
      }
      signal.throwIfAborted();
      if (
        !asset &&
        fallback &&
        generations < ASSEMBLY_LIMITS.maxGeneratedImageCalls
      ) {
        fallback.reserve();
        generations++;
        asset = await diagnostics.step("assembly_picture_generation", () =>
          fallback.source.find(request, signal),
        );
        signal.throwIfAborted();
      }
      if (!asset) throw new Error("contextual_picture_unavailable");
      if (duplicate(asset)) throw new Error("duplicate_contextual_picture");
      const picture = {
        startMs,
        endMs,
        anchorWordId: anchor.id,
        // Sign the contiguous grounded excerpt covered by this display window.
        subjectWordIds: subjectWords.map((word) => word.id),
        asset,
      };
      compositionManifestV3Schema.parse({
        ...manifest,
        pictures: [...pictures, picture],
      });
      pictures.push(picture);
      pictureNotes.push({ anchorWordId: anchor.id, scene: plan.brief.scene });
    } catch (error) {
      signal.throwIfAborted();
      diagnostics.critique("assembly_pictures", error);
    }
  }
  diagnostics.assembly("assembly_pictures", {
    plannedPictures: plans.length,
    validatedPictures: validated,
    retimedPicturePlans: retimed,
    pictures: pictures.length,
    pictureSearches: searches,
    pictureGenerationCalls: generations,
    generatedPictures: pictures.filter(
      (picture) => picture.asset.repository === "google-gemini",
    ).length,
    retrievedPictures: pictures.filter(
      (picture) => picture.asset.repository === "wikimedia-commons",
    ).length,
    pictureBytes: pictures.reduce(
      (sum, picture) =>
        sum + Buffer.from(picture.asset.dataUri.slice(23), "base64").length,
      0,
    ),
  });
  if (pictures.length < CONTEXTUAL_PICTURE_POLICY.minPictures)
    diagnostics.critique(
      "assembly_pictures",
      new Error("contextual_picture_target_unmet"),
    );
  if (!pictures.length) {
    diagnostics.critique(
      "assembly_pictures",
      new Error("grounded_visual_unavailable"),
    );
    return { manifest, pictureNotes };
  }
  return {
    manifest: compositionManifestV3Schema.parse({ ...manifest, pictures }),
    pictureNotes,
  };
}
