import { z } from "zod";

import { MEDIA_LIMITS, OWNER_VALIDATION_LIMITS } from "./constants.js";
import {
  mediaIdSchema,
  revisionIdSchema,
  localArtifactIdSchema,
} from "./ids.schema.js";

export const mediaContainerSchema = z.enum(["mp4", "webm"]);
export const videoCodecSchema = z.enum(["h264", "vp8", "vp9"]);
export const audioCodecSchema = z.enum(["aac", "opus", "vorbis"]);
export const mediaOrientationSchema = z.enum([
  "landscape",
  "portrait",
  "square",
]);

export const mediaDescriptorSchema = z
  .object({
    mediaId: mediaIdSchema,
    sourceRevision: revisionIdSchema,
    container: mediaContainerSchema,
    videoCodec: videoCodecSchema,
    audioCodec: audioCodecSchema,
    durationMs: z
      .number()
      .int()
      .min(OWNER_VALIDATION_LIMITS.minSourceSeconds * 1_000)
      .max(OWNER_VALIDATION_LIMITS.maxSourceSeconds * 1_000),
    width: z.number().int().min(1).max(MEDIA_LIMITS.maxVideoWidth),
    height: z.number().int().min(1).max(MEDIA_LIMITS.maxVideoHeight),
    averageFrameRate: z
      .number()
      .finite()
      .min(MEDIA_LIMITS.minFrameRate)
      .max(MEDIA_LIMITS.maxFrameRate),
    rotationDegrees: z.union([
      z.literal(0),
      z.literal(90),
      z.literal(180),
      z.literal(270),
    ]),
    hasAudio: z.literal(true),
    bytes: z.number().int().min(1).max(OWNER_VALIDATION_LIMITS.maxSourceBytes),
    orientation: mediaOrientationSchema,
  })
  .strict()
  .superRefine((media, context) => {
    if (media.width * media.height > MEDIA_LIMITS.maxFramePixels) {
      context.addIssue({
        code: "custom",
        message: "Decoded frame dimensions exceed the pixel limit.",
        path: ["width"],
      });
    }

    const swapsAxes =
      media.rotationDegrees === 90 || media.rotationDegrees === 270;
    const displayWidth = swapsAxes ? media.height : media.width;
    const displayHeight = swapsAxes ? media.width : media.height;
    const expectedOrientation =
      displayWidth === displayHeight
        ? "square"
        : displayWidth > displayHeight
          ? "landscape"
          : "portrait";

    if (media.orientation !== expectedOrientation) {
      context.addIssue({
        code: "custom",
        message: "Orientation does not match the normalized dimensions.",
        path: ["orientation"],
      });
    }
  });

export type MediaDescriptor = z.infer<typeof mediaDescriptorSchema>;

// Duration and frame rate are measurements, not source identity. Browser packet
// sampling and authoritative decoder inspection may produce different values.
export function hasSameMediaIdentity(
  left: MediaDescriptor,
  right: MediaDescriptor,
): boolean {
  return (
    JSON.stringify({ ...left, durationMs: 0, averageFrameRate: 0 }) ===
    JSON.stringify({ ...right, durationMs: 0, averageFrameRate: 0 })
  );
}

export const localArtifactReferenceSchema = z
  .object({
    artifactId: localArtifactIdSchema,
    sourceRevision: revisionIdSchema,
    bytes: z
      .number()
      .int()
      .positive()
      .max(OWNER_VALIDATION_LIMITS.maxSourceBytes),
  })
  .strict();

export type LocalArtifactReference = z.infer<
  typeof localArtifactReferenceSchema
>;
