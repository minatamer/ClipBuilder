import {
  analysisIdSchema,
  assemblyIdSchema,
  candidateIdSchema,
  EDIT_LIMITS,
  editManifestSchema,
  offsetDateTimeSchema,
  operationIdSchema,
  proposalIdSchema,
  renderIdSchema,
  revisionIdSchema,
  sessionIdSchema,
  type EditManifestV1,
  wordIdSchema,
} from "@clipbuilder/contracts";
import { z } from "zod";

import type { ClippingSessionState, ProposalDiffField } from "./session.types";

export const SESSION_PROJECTION_KEY = "clipbuilder.session.v1";
export const SESSION_PROJECTION_VERSION = 1 as const;
export const MAX_SESSION_PROJECTION_BYTES = 256 * 1024;
export const MAX_PROJECTION_AGE_MS = 30 * 60 * 1_000;

const STAGES = [
  "intake",
  "local-inspection",
  "upload-authorizing",
  "uploading",
  "media-inspecting",
  "analysis-confirmation",
  "analyzing",
  "analysis-failed",
  "no-candidates",
  "candidates",
  "assembling",
  "assembly-failed",
  "editor",
  "render-confirmation",
  "rendering",
  "render-failed",
  "result",
  "cleanup-partial",
] as const;

export type PersistedStageHint = (typeof STAGES)[number];

export type PersistedOperationReference = { operationId: string };

export type ClippingSessionProjectionV1 = {
  version: 1;
  savedAt: string;
  expiresAt: string;
  session: {
    sessionId: string;
    mode: "sample" | "upload";
  };
  stageHint: PersistedStageHint;
  analysis: { analysisId: string; revision: string } | null;
  selection: {
    candidateId: string;
    startWordId: string;
    endWordId: string;
  } | null;
  assembly: { assemblyId: string; revision: string } | null;
  operation: PersistedOperationReference | null;
  editor: {
    assemblyReference: { assemblyId: string; revision: string };
    manifest: EditManifestV1;
    past: EditManifestV1[];
    future: EditManifestV1[];
    proposal: {
      proposalId: string;
      baseRevision: number;
      changedFields: ProposalDiffField[];
    } | null;
    playback: {
      currentTimeMs: number;
      panel: "transcript" | "captions" | "visuals";
    };
  } | null;
  result: { renderId: string; outputAvailable: true } | null;
};

export type SessionStoragePort = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

export type ProjectionReadResult =
  | { status: "empty" }
  | { status: "valid"; projection: ClippingSessionProjectionV1 }
  | {
      status: "corrupt" | "oversized" | "unknown-version" | "expired";
    };

const persistedOperationSchema = z
  .object({ operationId: operationIdSchema })
  .strict();

const projectionEditorSchema = z
  .object({
    assemblyReference: z
      .object({ assemblyId: assemblyIdSchema, revision: revisionIdSchema })
      .strict(),
    manifest: editManifestSchema,
    past: z.array(editManifestSchema).max(EDIT_LIMITS.maxHistoryRevisions),
    future: z.array(editManifestSchema).max(EDIT_LIMITS.maxHistoryRevisions),
    proposal: z
      .object({
        proposalId: proposalIdSchema,
        baseRevision: z.number().int().min(0),
        changedFields: z
          .array(
            z.enum(["range", "duration", "captions", "headline", "visuals"]),
          )
          .max(10),
      })
      .strict()
      .nullable(),
    playback: z
      .object({
        currentTimeMs: z.number().int().min(0),
        panel: z.enum(["transcript", "captions", "visuals"]),
      })
      .strict(),
  })
  .strict();

export const clippingSessionProjectionV1Schema = z
  .object({
    version: z.literal(SESSION_PROJECTION_VERSION),
    savedAt: offsetDateTimeSchema,
    expiresAt: offsetDateTimeSchema,
    session: z
      .object({
        sessionId: sessionIdSchema,
        mode: z.enum(["sample", "upload"]),
      })
      .strict(),
    stageHint: z.enum(STAGES),
    analysis: z
      .object({ analysisId: analysisIdSchema, revision: revisionIdSchema })
      .strict()
      .nullable(),
    selection: z
      .object({
        candidateId: z.union([candidateIdSchema, z.literal("manual")]),
        startWordId: wordIdSchema,
        endWordId: wordIdSchema,
      })
      .strict()
      .refine((selection) => selection.startWordId !== selection.endWordId, {
        path: ["endWordId"],
        message: "Selection range must be nonempty.",
      })
      .nullable(),
    assembly: z
      .object({ assemblyId: assemblyIdSchema, revision: revisionIdSchema })
      .strict()
      .nullable(),
    operation: persistedOperationSchema.nullable(),
    editor: projectionEditorSchema.nullable(),
    result: z
      .object({
        renderId: renderIdSchema,
        outputAvailable: z.literal(true),
      })
      .strict()
      .nullable(),
  })
  .strict()
  .superRefine((projection, context) => {
    if (containsForbiddenProjectionValue(projection)) {
      context.addIssue({
        code: "custom",
        message: "Projection contains a forbidden runtime or capability value.",
      });
    }
  });

const exactKeys = (value: Record<string, unknown>, keys: string[]) =>
  Object.keys(value).length === keys.length &&
  keys.every((key) => Object.hasOwn(value, key));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isOpaqueId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 64 &&
    /^[a-z]+_[A-Za-z0-9_-]{1,58}$/u.test(value)
  );
}

function isWordId(value: unknown): value is string {
  return typeof value === "string" && /^w_\d{6}$/u.test(value);
}

const FORBIDDEN_KEYS = new Set([
  "blob",
  "cookie",
  "controller",
  "error",
  "filename",
  "grant",
  "listener",
  "media",
  "provider",
  "stack",
  "timer",
  "token",
  "track",
  "transcript",
  "url",
]);

export function containsForbiddenProjectionValue(value: unknown): boolean {
  if (typeof value === "string") {
    return /(?:https?:\/\/|blob:|data:|bearer\s)/iu.test(value);
  }
  if (Array.isArray(value)) {
    return value.some(containsForbiddenProjectionValue);
  }
  if (!isRecord(value)) return false;
  return Object.entries(value).some(
    ([key, nested]) =>
      FORBIDDEN_KEYS.has(key.toLowerCase()) ||
      containsForbiddenProjectionValue(nested),
  );
}

function parseIdentity(value: unknown) {
  if (
    !isRecord(value) ||
    !exactKeys(value, ["sessionId", "mode"]) ||
    !isOpaqueId(value.sessionId) ||
    (value.mode !== "sample" && value.mode !== "upload")
  ) {
    return null;
  }
  return { sessionId: value.sessionId, mode: value.mode } as const;
}

function parseAnalysis(value: unknown) {
  if (value === null) return null;
  if (
    !isRecord(value) ||
    !exactKeys(value, ["analysisId", "revision"]) ||
    !isOpaqueId(value.analysisId) ||
    !isOpaqueId(value.revision)
  ) {
    return undefined;
  }
  return { analysisId: value.analysisId, revision: value.revision };
}

function parseSelection(value: unknown) {
  if (value === null) return null;
  if (
    !isRecord(value) ||
    !exactKeys(value, ["candidateId", "startWordId", "endWordId"]) ||
    !(value.candidateId === "manual" || isOpaqueId(value.candidateId)) ||
    !isWordId(value.startWordId) ||
    !isWordId(value.endWordId) ||
    value.startWordId === value.endWordId
  ) {
    return undefined;
  }
  return {
    candidateId: value.candidateId,
    startWordId: value.startWordId,
    endWordId: value.endWordId,
  };
}

function parseAssembly(value: unknown) {
  if (value === null) return null;
  if (
    !isRecord(value) ||
    !exactKeys(value, ["assemblyId", "revision"]) ||
    !isOpaqueId(value.assemblyId) ||
    !isOpaqueId(value.revision)
  ) {
    return undefined;
  }
  return { assemblyId: value.assemblyId, revision: value.revision };
}

function parseEditor(
  value: unknown,
): ClippingSessionProjectionV1["editor"] | undefined {
  if (value === null) return null;
  if (
    !isRecord(value) ||
    !exactKeys(value, [
      "assemblyReference",
      "manifest",
      "past",
      "future",
      "proposal",
      "playback",
    ]) ||
    !Array.isArray(value.past) ||
    !Array.isArray(value.future) ||
    value.past.length > EDIT_LIMITS.maxHistoryRevisions ||
    value.future.length > EDIT_LIMITS.maxHistoryRevisions
  ) {
    return undefined;
  }
  const assemblyReference = parseAssembly(value.assemblyReference);
  if (assemblyReference === null || assemblyReference === undefined) {
    return undefined;
  }
  const manifest = editManifestSchema.safeParse(value.manifest);
  const past = value.past.map((item) => editManifestSchema.safeParse(item));
  const future = value.future.map((item) => editManifestSchema.safeParse(item));
  if (
    !manifest.success ||
    past.some((item) => !item.success) ||
    future.some((item) => !item.success)
  ) {
    return undefined;
  }

  let proposal: NonNullable<ClippingSessionProjectionV1["editor"]>["proposal"];
  if (value.proposal === null) {
    proposal = null;
  } else if (
    isRecord(value.proposal) &&
    exactKeys(value.proposal, [
      "proposalId",
      "baseRevision",
      "changedFields",
    ]) &&
    isOpaqueId(value.proposal.proposalId) &&
    Number.isInteger(value.proposal.baseRevision) &&
    Number(value.proposal.baseRevision) >= 0 &&
    Array.isArray(value.proposal.changedFields) &&
    value.proposal.changedFields.length <= 10 &&
    value.proposal.changedFields.every((field) =>
      ["range", "duration", "captions", "headline", "visuals"].includes(
        String(field),
      ),
    )
  ) {
    proposal = {
      proposalId: value.proposal.proposalId,
      baseRevision: Number(value.proposal.baseRevision),
      changedFields: value.proposal.changedFields as ProposalDiffField[],
    };
  } else {
    return undefined;
  }

  if (
    !isRecord(value.playback) ||
    !exactKeys(value.playback, ["currentTimeMs", "panel"]) ||
    !Number.isInteger(value.playback.currentTimeMs) ||
    Number(value.playback.currentTimeMs) < 0 ||
    !["transcript", "captions", "visuals"].includes(
      String(value.playback.panel),
    )
  ) {
    return undefined;
  }

  return {
    assemblyReference,
    manifest: manifest.data,
    past: past.map((item) => item.data as EditManifestV1),
    future: future.map((item) => item.data as EditManifestV1),
    proposal,
    playback: {
      currentTimeMs: Number(value.playback.currentTimeMs),
      panel: value.playback.panel as "transcript" | "captions" | "visuals",
    },
  };
}

function parseOperation(
  value: unknown,
): PersistedOperationReference | null | undefined {
  if (value === null) return null;
  if (
    !isRecord(value) ||
    !exactKeys(value, ["operationId"]) ||
    !isOpaqueId(value.operationId)
  ) {
    return undefined;
  }
  return { operationId: value.operationId };
}

function parseResult(value: unknown) {
  if (value === null) return null;
  if (
    !isRecord(value) ||
    !exactKeys(value, ["renderId", "outputAvailable"]) ||
    !isOpaqueId(value.renderId) ||
    value.outputAvailable !== true
  ) {
    return undefined;
  }
  return { renderId: value.renderId, outputAvailable: true as const };
}

export function parseSessionProjection(
  value: unknown,
): ClippingSessionProjectionV1 | null {
  if (
    !isRecord(value) ||
    !exactKeys(value, [
      "version",
      "savedAt",
      "expiresAt",
      "session",
      "stageHint",
      "analysis",
      "selection",
      "assembly",
      "operation",
      "editor",
      "result",
    ]) ||
    value.version !== SESSION_PROJECTION_VERSION ||
    !isIsoDate(value.savedAt) ||
    !isIsoDate(value.expiresAt) ||
    !STAGES.includes(value.stageHint as PersistedStageHint) ||
    containsForbiddenProjectionValue(value)
  ) {
    return null;
  }

  const session = parseIdentity(value.session);
  const analysis = parseAnalysis(value.analysis);
  const selection = parseSelection(value.selection);
  const assembly = parseAssembly(value.assembly);
  const editor = parseEditor(value.editor);
  const result = parseResult(value.result);
  const operation = parseOperation(value.operation);

  if (
    session === null ||
    analysis === undefined ||
    selection === undefined ||
    assembly === undefined ||
    editor === undefined ||
    result === undefined ||
    operation === undefined
  ) {
    return null;
  }

  const projection: ClippingSessionProjectionV1 = {
    version: 1,
    savedAt: value.savedAt,
    expiresAt: value.expiresAt,
    session,
    stageHint: value.stageHint as PersistedStageHint,
    analysis,
    selection,
    assembly,
    operation,
    editor,
    result,
  };
  const validated = clippingSessionProjectionV1Schema.safeParse(projection);
  return validated.success ? validated.data : null;
}

function identityFromState(state: ClippingSessionState) {
  return "identity" in state ? state.identity : null;
}

function analysisFromState(state: ClippingSessionState) {
  if ("analysis" in state) return state.analysis;
  if ("lastKnown" in state && "analysis" in state.lastKnown) {
    return state.lastKnown.analysis;
  }
  return null;
}

function editorFromState(state: ClippingSessionState) {
  if ("editor" in state) return state.editor;
  if ("lastKnown" in state && "editor" in state.lastKnown) {
    return state.lastKnown.editor;
  }
  return null;
}

export function projectSessionState(
  state: ClippingSessionState,
  now: Date,
): ClippingSessionProjectionV1 | null {
  const identity = identityFromState(state);
  if (
    identity === null ||
    state.stage === "clearing" ||
    state.stage === "fatal" ||
    state.stage === "expired"
  ) {
    return null;
  }

  const analysis = analysisFromState(state);
  const editor = editorFromState(state);
  const selection =
    state.stage === "assembling"
      ? {
          candidateId: state.lastKnown.selectedId,
          startWordId: state.lastKnown.startWordId,
          endWordId: state.lastKnown.endWordId,
        }
      : editor === null
        ? null
        : {
            candidateId: editor.manifest.baseCandidateId,
            startWordId: editor.manifest.range.startWordId,
            endWordId: editor.manifest.range.endWordId,
          };
  const assemblyBundle =
    "assembly" in state
      ? state.assembly
      : "lastKnown" in state && "assembly" in state.lastKnown
        ? state.lastKnown.assembly
        : null;
  const operation =
    "operation" in state ? { operationId: state.operation.operationId } : null;

  const projection: ClippingSessionProjectionV1 = {
    version: 1,
    savedAt: now.toISOString(),
    expiresAt: identity.expiresAt,
    session: { sessionId: identity.sessionId, mode: identity.mode },
    stageHint: state.stage as PersistedStageHint,
    analysis:
      analysis === null
        ? null
        : { analysisId: analysis.analysisId, revision: analysis.revision },
    selection,
    assembly:
      assemblyBundle === null
        ? editor === null
          ? null
          : {
              assemblyId: editor.assemblyReference.assemblyId,
              revision: editor.assemblyReference.revision,
            }
        : {
            assemblyId: assemblyBundle.assemblyId,
            revision: assemblyBundle.revision,
          },
    operation,
    editor:
      editor === null
        ? null
        : {
            assemblyReference: editor.assemblyReference,
            manifest: editor.manifest,
            past: editor.past.slice(-EDIT_LIMITS.maxHistoryRevisions),
            future: editor.future.slice(0, EDIT_LIMITS.maxHistoryRevisions),
            proposal:
              editor.proposal.status === "succeeded"
                ? {
                    proposalId: editor.proposal.proposal.proposalId,
                    baseRevision: editor.proposal.proposal.baseRevision,
                    changedFields: editor.proposal.changedFields,
                  }
                : null,
            playback: {
              currentTimeMs: editor.playback.currentTimeMs,
              panel: editor.playback.panel,
            },
          },
    result:
      state.stage === "result"
        ? {
            renderId: state.result.renderId,
            outputAvailable: true,
          }
        : null,
  };

  return containsForbiddenProjectionValue(projection) ? null : projection;
}

export function serializeSessionProjection(
  projection: ClippingSessionProjectionV1,
): string {
  const serialized = JSON.stringify(projection);
  if (
    new TextEncoder().encode(serialized).byteLength >
    MAX_SESSION_PROJECTION_BYTES
  ) {
    throw new Error("Session projection exceeds the storage limit.");
  }
  if (!clippingSessionProjectionV1Schema.safeParse(projection).success) {
    throw new Error("Session projection is not valid.");
  }
  return serialized;
}

export function readSessionProjection(
  storage: SessionStoragePort,
  now: Date,
): ProjectionReadResult {
  const serialized = storage.getItem(SESSION_PROJECTION_KEY);
  if (serialized === null) return { status: "empty" };
  if (
    new TextEncoder().encode(serialized).byteLength >
    MAX_SESSION_PROJECTION_BYTES
  ) {
    return { status: "oversized" };
  }

  let value: unknown;
  try {
    value = JSON.parse(serialized);
  } catch {
    return { status: "corrupt" };
  }
  if (isRecord(value) && value.version !== SESSION_PROJECTION_VERSION) {
    return { status: "unknown-version" };
  }
  const projection = parseSessionProjection(value);
  if (projection === null) return { status: "corrupt" };
  if (Date.parse(projection.expiresAt) <= now.getTime()) {
    return { status: "expired" };
  }
  return { status: "valid", projection };
}

export function writeSessionProjection(
  storage: SessionStoragePort,
  projection: ClippingSessionProjectionV1,
): void {
  storage.setItem(
    SESSION_PROJECTION_KEY,
    serializeSessionProjection(projection),
  );
}

export function clearSessionProjection(storage: SessionStoragePort): void {
  storage.removeItem(SESSION_PROJECTION_KEY);
}

export function shouldClearSessionProjectionForState(
  state: ClippingSessionState,
): boolean {
  return (
    state.stage === "clearing" ||
    state.stage === "expired" ||
    (state.stage === "fatal" && !state.failure.retryable)
  );
}
