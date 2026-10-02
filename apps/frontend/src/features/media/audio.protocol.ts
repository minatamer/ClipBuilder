import { z } from "zod";
import { PUBLIC_LIMITS, uuidV4Schema } from "@clipbuilder/contracts";
import { AUDIO_LIFETIME, AUDIO_PROFILES } from "./audio.profile";

export const audioProfileSchema = z.enum(["opus-webm", "pcm-wav-reference"]);
export const audioRequestSchema = z
  .object({
    jobId: uuidV4Schema,
    action: z.literal("extract-audio"),
    file: z
      .instanceof(Blob)
      .refine(
        (file) => file.size > 0 && file.size <= PUBLIC_LIMITS.maxSourceBytes,
      ),
    sourceDurationMs: z
      .number()
      .int()
      .min(PUBLIC_LIMITS.minSourceSeconds * 1000)
      .max(PUBLIC_LIMITS.maxSourceSeconds * 1000),
    profile: audioProfileSchema,
  })
  .strict();

const time = z
  .number()
  .finite()
  .min(0)
  .max(PUBLIC_LIMITS.maxSourceSeconds * 1000 + AUDIO_LIFETIME.codecPaddingMs);
export const extractedAudioSchema = z
  .object({
    profile: audioProfileSchema,
    file: z.instanceof(Blob),
    sourceDurationMs: z
      .number()
      .int()
      .min(PUBLIC_LIMITS.minSourceSeconds * 1000)
      .max(PUBLIC_LIMITS.maxSourceSeconds * 1000),
    sourceFirstSampleMs: time,
    sourceLastSampleMs: time,
    presentationDurationMs: time,
    decodedFirstSampleMs: time,
    decodedLastSampleMs: time,
    decodedSampleRate: z.union([z.literal(16_000), z.literal(48_000)]),
    bytes: z.number().int().positive(),
  })
  .strict()
  .superRefine((value, context) => {
    const profile = AUDIO_PROFILES[value.profile];
    if (
      value.file.size !== value.bytes ||
      value.file.type !== profile.contentType ||
      value.bytes > profile.maxBytes ||
      value.sourceFirstSampleMs >= value.sourceLastSampleMs ||
      Math.abs(value.sourceLastSampleMs - value.sourceDurationMs) >
        AUDIO_LIFETIME.codecPaddingMs ||
      Math.abs(value.presentationDurationMs - value.sourceDurationMs) >
        AUDIO_LIFETIME.codecPaddingMs ||
      value.decodedFirstSampleMs > AUDIO_LIFETIME.codecPaddingMs ||
      Math.abs(value.decodedLastSampleMs - value.sourceDurationMs) >
        AUDIO_LIFETIME.codecPaddingMs ||
      (value.profile === "pcm-wav-reference" &&
        value.decodedSampleRate !== 16_000)
    )
      context.addIssue({
        code: "custom",
        message: "Invalid local audio evidence.",
      });
  });

export const audioProgressSchema = z
  .object({
    phase: z.enum(["encoding", "validating"]),
    processedMs: z
      .number()
      .finite()
      .min(0)
      .max(PUBLIC_LIMITS.maxSourceSeconds * 1000),
    bytes: z
      .number()
      .int()
      .min(0)
      .max(AUDIO_PROFILES["pcm-wav-reference"].maxBytes),
  })
  .strict();

export const audioMessageSchema = z.discriminatedUnion("type", [
  z
    .object({
      jobId: uuidV4Schema,
      type: z.literal("audio-progress"),
      progress: audioProgressSchema,
    })
    .strict(),
  z
    .object({
      jobId: uuidV4Schema,
      type: z.literal("result"),
      result: z.object({ audio: extractedAudioSchema }).strict(),
    })
    .strict(),
  z
    .object({
      jobId: uuidV4Schema,
      type: z.literal("failed"),
      code: z.enum([
        "unavailable",
        "unsupported",
        "limits",
        "storage",
        "busy",
        "missing",
        "canceled",
        "expired",
        "corrupt",
      ]),
    })
    .strict(),
  z.object({ jobId: uuidV4Schema, type: z.literal("stopped") }).strict(),
]);
