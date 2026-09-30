import { z } from "zod";

import { sha256DigestSchema } from "./boundary-primitives.schema.js";
import { compositionManifestSchema } from "./composition-manifest.schema.js";
import { ASSEMBLY_LIMITS, OWNER_VALIDATION_LIMITS } from "./constants.js";
import {
  assemblyIdSchema,
  faceTrackIdSchema,
  focusSegmentIdSchema,
  manifestIdSchema,
  revisionIdSchema,
  shotIdSchema,
  wordIdSchema,
} from "./ids.schema.js";
import { visualAssetSchema, visualPlanSchema } from "./visual-plan.schema.js";

export const shotSegmentSchema = z
  .object({
    id: shotIdSchema,
    startMs: z.number().int().min(0),
    endMs: z.number().int().min(1),
    cutIn: z.enum(["source-start", "hard-cut", "adaptive-cut"]),
  })
  .strict()
  .refine((shot) => shot.startMs < shot.endMs, {
    message: "Shot start must precede its end.",
    path: ["endMs"],
  });

export const faceTrackSampleSchema = z
  .object({
    atMs: z.number().int().min(0),
    x: z.number().finite().min(0).max(1),
    y: z.number().finite().min(0).max(1),
    width: z.number().finite().gt(0).max(1),
    height: z.number().finite().gt(0).max(1),
    speakingProbability: z.number().finite().min(0).max(1),
  })
  .strict()
  .superRefine((sample, context) => {
    if (sample.x + sample.width > 1 || sample.y + sample.height > 1) {
      context.addIssue({
        code: "custom",
        message: "Face sample bounds must remain inside the normalized frame.",
      });
    }
  });

export const faceTrackSchema = z
  .object({
    id: faceTrackIdSchema,
    shotId: shotIdSchema,
    startMs: z.number().int().min(0),
    endMs: z.number().int().min(1),
    samples: z.array(faceTrackSampleSchema).min(1).max(4_000),
  })
  .strict()
  .superRefine((track, context) => {
    if (track.startMs >= track.endMs) {
      context.addIssue({
        code: "custom",
        message: "Face track start must precede its end.",
        path: ["endMs"],
      });
    }
    let previousSample = -1;
    track.samples.forEach((sample, index) => {
      if (
        sample.atMs < track.startMs ||
        sample.atMs > track.endMs ||
        sample.atMs < previousSample
      ) {
        context.addIssue({
          code: "custom",
          message: "Face samples must be ordered inside the track range.",
          path: ["samples", index, "atMs"],
        });
      }
      previousSample = sample.atMs;
    });
  });

export const speakerFocusSegmentSchema = z
  .object({
    id: focusSegmentIdSchema,
    shotId: shotIdSchema,
    startWordId: wordIdSchema,
    endWordId: wordIdSchema,
    faceTrackId: faceTrackIdSchema,
    cropCenterX: z.number().finite().min(0).max(1),
    cropCenterY: z.number().finite().min(0).max(1),
    transition: z.enum(["cut", "ease", "hold"]),
  })
  .strict()
  .refine((focus) => focus.startWordId !== focus.endWordId, {
    message: "Focus segment must contain more than one word boundary.",
    path: ["endWordId"],
  });

export const speakerFocusTrackSchema = z
  .object({
    version: z.literal(1),
    revision: revisionIdSchema,
    shots: z.array(shotSegmentSchema).min(1).max(240),
    faceTracks: z.array(faceTrackSchema).max(960),
    focus: z.array(speakerFocusSegmentSchema).min(1).max(1_000),
    detectorConfigId: z.string().min(1).max(80),
  })
  .strict()
  .superRefine((track, context) => {
    const shotById = new Map(track.shots.map((shot) => [shot.id, shot]));
    const faceTrackById = new Map(
      track.faceTracks.map((faceTrack) => [faceTrack.id, faceTrack]),
    );

    if (shotById.size !== track.shots.length) {
      context.addIssue({
        code: "custom",
        message: "Shot identifiers must be unique.",
        path: ["shots"],
      });
    }
    if (faceTrackById.size !== track.faceTracks.length) {
      context.addIssue({
        code: "custom",
        message: "Face-track identifiers must be unique.",
        path: ["faceTracks"],
      });
    }

    let previousShotEnd = -1;
    track.shots.forEach((shot, index) => {
      if (shot.startMs < previousShotEnd) {
        context.addIssue({
          code: "custom",
          message: "Shots must be ordered and non-overlapping.",
          path: ["shots", index],
        });
      }
      if (shot.endMs > OWNER_VALIDATION_LIMITS.maxSourceSeconds * 1_000) {
        context.addIssue({
          code: "custom",
          message: "Shot exceeds the maximum supported source duration.",
          path: ["shots", index, "endMs"],
        });
      }
      previousShotEnd = shot.endMs;
    });

    const facesPerShot = new Map<string, number>();
    track.faceTracks.forEach((faceTrack, index) => {
      const shot = shotById.get(faceTrack.shotId);
      if (
        shot === undefined ||
        faceTrack.startMs < shot.startMs ||
        faceTrack.endMs > shot.endMs
      ) {
        context.addIssue({
          code: "custom",
          message: "Face track must remain inside one existing shot.",
          path: ["faceTracks", index],
        });
      }
      const count = (facesPerShot.get(faceTrack.shotId) ?? 0) + 1;
      facesPerShot.set(faceTrack.shotId, count);
      if (count > ASSEMBLY_LIMITS.maxFaceTracksPerShot) {
        context.addIssue({
          code: "custom",
          message: "A shot contains too many face tracks.",
          path: ["faceTracks", index],
        });
      }
    });

    const focusIds = new Set<string>();
    track.focus.forEach((focus, index) => {
      if (focusIds.has(focus.id)) {
        context.addIssue({
          code: "custom",
          message: "Focus identifiers must be unique.",
          path: ["focus", index, "id"],
        });
      }
      focusIds.add(focus.id);

      const faceTrack = faceTrackById.get(focus.faceTrackId);
      if (
        !shotById.has(focus.shotId) ||
        faceTrack === undefined ||
        faceTrack.shotId !== focus.shotId
      ) {
        context.addIssue({
          code: "custom",
          message: "Focus segment references an invalid shot-local face track.",
          path: ["focus", index],
        });
      }
    });
  });

export const assemblyBundleSchema = z
  .object({
    version: z.literal(1),
    assemblyId: assemblyIdSchema,
    revision: revisionIdSchema,
    analysisRevision: revisionIdSchema,
    selectedStartWordId: wordIdSchema,
    selectedEndWordId: wordIdSchema,
    speakerFocus: speakerFocusTrackSchema,
    visualPlan: visualPlanSchema,
    assets: z.array(visualAssetSchema).max(ASSEMBLY_LIMITS.maxVisualCues),
    manifestId: manifestIdSchema,
    manifestHash: sha256DigestSchema,
    compositionManifest: compositionManifestSchema,
  })
  .strict()
  .superRefine((bundle, context) => {
    if (bundle.selectedStartWordId === bundle.selectedEndWordId) {
      context.addIssue({
        code: "custom",
        message: "Assembly selection must contain more than one word boundary.",
        path: ["selectedEndWordId"],
      });
    }

    if (
      bundle.compositionManifest.analysisRevision !== bundle.analysisRevision
    ) {
      context.addIssue({
        code: "custom",
        message: "Manifest and assembly analysis revisions must match.",
        path: ["compositionManifest", "analysisRevision"],
      });
    }

    if (bundle.compositionManifest.assemblyRevision !== bundle.revision) {
      context.addIssue({
        code: "custom",
        message: "Manifest and assembly revisions must match.",
        path: ["compositionManifest", "assemblyRevision"],
      });
    }

    if (
      bundle.compositionManifest.range.startWordId !==
        bundle.selectedStartWordId ||
      bundle.compositionManifest.range.endWordId !== bundle.selectedEndWordId
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Composition manifest range must match the assembly selection.",
        path: ["compositionManifest", "range"],
      });
    }

    if (
      bundle.compositionManifest.visuals.planRevision !==
      bundle.visualPlan.revision
    ) {
      context.addIssue({
        code: "custom",
        message: "Manifest and visual-plan revisions must match.",
        path: ["compositionManifest", "visuals", "planRevision"],
      });
    }

    const assetByRequest = new Map(
      bundle.assets.map((asset) => [asset.requestId, asset]),
    );
    const assetIds = bundle.assets.map((asset) => asset.id);
    const assetRequestIds = bundle.assets.map((asset) => asset.requestId);
    if (
      new Set(assetIds).size !== assetIds.length ||
      new Set(assetRequestIds).size !== assetRequestIds.length
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Assembly assets must have distinct asset and request identifiers.",
        path: ["assets"],
      });
    }
    bundle.visualPlan.requests.forEach((request, index) => {
      if (!assetByRequest.has(request.id)) {
        context.addIssue({
          code: "custom",
          message: "Every visual request must have one validated asset.",
          path: ["visualPlan", "requests", index],
        });
      }
    });

    if (
      bundle.assets.some((asset) =>
        bundle.visualPlan.requests.every(
          (request) => request.id !== asset.requestId,
        ),
      )
    ) {
      context.addIssue({
        code: "custom",
        message: "Assembly assets must belong to the validated visual plan.",
        path: ["assets"],
      });
    }

    const knownAssetIds = new Set(assetIds);
    if (
      bundle.compositionManifest.visuals.cues.some(
        (cue) => !knownAssetIds.has(cue.assetId),
      )
    ) {
      context.addIssue({
        code: "custom",
        message: "Manifest visual cues must reference assembly assets.",
        path: ["compositionManifest", "visuals", "cues"],
      });
    }
  });

export type ShotSegmentV1 = z.infer<typeof shotSegmentSchema>;
export type FaceTrackV1 = z.infer<typeof faceTrackSchema>;
export type SpeakerFocusSegmentV1 = z.infer<typeof speakerFocusSegmentSchema>;
export type SpeakerFocusTrackV1 = z.infer<typeof speakerFocusTrackSchema>;
export type AssemblyBundleV1 = z.infer<typeof assemblyBundleSchema>;
