import { z } from "zod";

function opaqueIdSchema(prefix: string) {
  return z
    .string()
    .max(64)
    .regex(
      new RegExp(`^${prefix}_[A-Za-z0-9_-]{22}$`),
      `Expected a content-free ${prefix}_ identifier.`,
    );
}

export const sessionIdSchema = opaqueIdSchema("ses");
export const uploadIdSchema = opaqueIdSchema("upl");
export const operationIdSchema = opaqueIdSchema("op");
export const mediaIdSchema = opaqueIdSchema("med");
export const localArtifactIdSchema = opaqueIdSchema("loc");
export const analysisIdSchema = opaqueIdSchema("ana");
export const candidateIdSchema = opaqueIdSchema("cand");
export const assemblyIdSchema = opaqueIdSchema("asm");
export const manifestIdSchema = opaqueIdSchema("man");
export const renderIdSchema = opaqueIdSchema("rnd");
export const revisionIdSchema = opaqueIdSchema("rev");
export const trackIdSchema = opaqueIdSchema("trk");
export const shotIdSchema = opaqueIdSchema("shot");
export const faceTrackIdSchema = opaqueIdSchema("face");
export const focusSegmentIdSchema = opaqueIdSchema("focus");
export const visualRequestIdSchema = opaqueIdSchema("vreq");
export const visualCueIdSchema = opaqueIdSchema("vcue");
export const visualAssetIdSchema = opaqueIdSchema("ast");
export const transcriptUtteranceIdSchema = z
  .string()
  .regex(/^utt_\d{6}$/u, "Expected an ordinal utterance identifier.");
export const wordIdSchema = z
  .string()
  .regex(/^w_\d{6}$/u, "Expected an ordinal transcript word identifier.");
export const speakerIdSchema = z
  .string()
  .regex(/^spk_(?:[0-9]|1[0-5])$/u, "Expected an opaque speaker-turn label.");
export const requestIdSchema = z
  .string()
  .max(64)
  .regex(/^req_[a-f0-9]{32}$/u, "Expected a content-free request identifier.");
export const uuidV4Schema = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu,
    "Expected a UUID v4 value.",
  );

export type SessionId = z.infer<typeof sessionIdSchema>;
export type OperationId = z.infer<typeof operationIdSchema>;
export type WordId = z.infer<typeof wordIdSchema>;
