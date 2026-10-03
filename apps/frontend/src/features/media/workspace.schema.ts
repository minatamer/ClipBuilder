import { z } from "zod";
import {
  analysisBundleSchema,
  candidateIdSchema,
  assemblyBundleSchema,
  localArtifactReferenceSchema,
  mediaDescriptorSchema,
  sha256DigestSchema,
  sessionIdSchema,
  uuidV4Schema,
  LOCAL_WORKSPACE_LIMITS,
  groundedAnalysisResultSchema,
  hasSameMediaIdentity,
} from "@clipbuilder/contracts";

// Separate from media/result deletion; contains no session, capability or content.
export const remoteCleanupObligationSchema = z
  .object({
    version: z.literal(1),
    allowMissingSession: z.boolean(),
    status: z.enum(["pending", "confirmed"]).default("pending"),
  })
  .strict();
export type RemoteCleanupObligation = z.infer<
  typeof remoteCleanupObligationSchema
>;

export const workspaceRecordSchema = z
  .object({
    version: z.literal(1),
    sessionId: sessionIdSchema,
    epoch: uuidV4Schema,
    admittedAtMs: z.number().int().nonnegative(),
    expiresAtMs: z.number().int().positive(),
    status: z.enum(["pending", "ready", "clearing"]),
    artifacts: z
      .array(localArtifactReferenceSchema)
      .max(LOCAL_WORKSPACE_LIMITS.maxArtifacts),
    source: z
      .object({
        artifact: localArtifactReferenceSchema,
        media: mediaDescriptorSchema,
        fingerprint: sha256DigestSchema,
      })
      .strict()
      .nullable(),
    analysis: analysisBundleSchema.nullable(),
    assembly: assemblyBundleSchema.nullable(),
    selectedId: candidateIdSchema.nullable(),
    cloudAnalysis: z
      .object({
        status: z.enum(["pending", "uncertain", "complete"]),
        cleanupRequired: z.boolean().default(true),
        result: groundedAnalysisResultSchema.nullable(),
      })
      .strict()
      .nullable()
      .default(null),
  })
  .strict()
  .superRefine((record, context) => {
    const issue = () =>
      context.addIssue({
        code: "custom",
        message: "Invalid local workspace evidence.",
      });
    if (
      record.expiresAtMs !==
      record.admittedAtMs + LOCAL_WORKSPACE_LIMITS.ttlMs
    )
      issue();
    if (
      new Set(record.artifacts.map((a) => a.artifactId)).size !==
      record.artifacts.length
    )
      issue();
    if (record.status === "ready" && record.source === null) issue();
    if (
      record.source &&
      (!record.artifacts.some(
        (a) =>
          a.artifactId === record.source?.artifact.artifactId &&
          a.sourceRevision === record.source.artifact.sourceRevision &&
          a.bytes === record.source.artifact.bytes,
      ) ||
        record.source.media.sourceRevision !==
          record.source.artifact.sourceRevision ||
        record.source.media.bytes !== record.source.artifact.bytes)
    )
      issue();
    if (
      record.analysis &&
      (!record.source ||
        !(record.cloudAnalysis
          ? hasSameMediaIdentity(record.analysis.media, record.source.media)
          : JSON.stringify(record.analysis.media) ===
            JSON.stringify(record.source.media)))
    )
      issue();
    if (record.cloudAnalysis?.status === "complete") {
      const result = record.cloudAnalysis.result;
      if (
        !result ||
        !record.source ||
        JSON.stringify(result.analysis) !== JSON.stringify(record.analysis) ||
        result.binding.fingerprint !== record.source.fingerprint ||
        result.binding.sourceRevision !== record.source.media.sourceRevision
      )
        issue();
    } else if (
      record.cloudAnalysis?.result !== null &&
      record.cloudAnalysis !== null
    )
      issue();
    if (
      record.selectedId &&
      !record.analysis?.candidates.some((c) => c.id === record.selectedId)
    )
      issue();
    const candidate = record.analysis?.candidates.find(
      (item) => item.id === record.selectedId,
    );
    if (
      record.assembly &&
      (!record.analysis ||
        record.assembly.analysisRevision !== record.analysis.revision ||
        record.assembly.compositionManifest.baseCandidateId !==
          record.selectedId ||
        record.assembly.selectedStartWordId !== candidate?.startWordId ||
        record.assembly.selectedEndWordId !== candidate?.endWordId)
    )
      issue();
    if (
      record.status !== "ready" &&
      (record.source ||
        record.analysis ||
        record.assembly ||
        record.selectedId ||
        record.cloudAnalysis)
    )
      issue();
  });

export type WorkspaceRecord = z.infer<typeof workspaceRecordSchema>;

export function parseWorkspaceRecord(value: unknown): WorkspaceRecord {
  const parsed = workspaceRecordSchema.parse(value);
  if (
    new TextEncoder().encode(JSON.stringify(parsed)).byteLength >
    LOCAL_WORKSPACE_LIMITS.maxJournalBytes
  )
    throw new Error("workspace-record-too-large");
  return parsed;
}

export function cleanupRecord(record: WorkspaceRecord): WorkspaceRecord {
  return {
    ...record,
    status: "clearing",
    source: null,
    analysis: null,
    assembly: null,
    selectedId: null,
    cloudAnalysis: null,
  };
}
