import { z } from "zod";
import {
  operationIdSchema,
  uuidV4Schema,
  requestIdSchema,
} from "./ids.schema.js";
import { errorCodeSchema } from "./errors.schema.js";
import { OWNER_VALIDATION_LIMITS } from "./constants.js";

export const BROWSER_DIAGNOSTIC_LIMITS = {
  requestBytes: 8192,
  requestsPerMinute: 512,
  timeoutMs: 5000,
} as const;
const counter = z.number().int().min(0).max(1_000_000);
export const BROWSER_CONSOLE_LEVELS = [
  "debug",
  "info",
  "log",
  "warn",
  "error",
  "trace",
] as const;
export const browserErrorDigestSchema = z.string().regex(/^[0-9]{1,20}$/);
export const editorDiagnosticStateSchema = z
  .object({
    traceId: uuidV4Schema,
    section: z.enum([
      "home",
      "captions",
      "text",
      "filters",
      "pictures",
      "focus",
      "hook",
    ]),
    occurrence: z.enum(["hook", "body"]),
    action: z.enum([
      "opened",
      "edit",
      "tab",
      "selection",
      "apply",
      "discard",
      "closed",
    ]),
    revision: counter,
    commits: counter,
    readyReports: counter,
    activityReports: counter,
    selectionReports: counter,
    previewSubscriptions: counter,
    previewReleases: counter,
    previewEvents: counter,
    captures: counter,
    abortedCaptures: counter,
    seeks: counter,
    previewSignal: z.enum([
      "none",
      "subscribe",
      "dispose",
      "frame",
      "media-ready",
      "capture",
      "capture-aborted",
      "seek",
    ]),
    edits: counter,
    applies: counter,
    discards: counter,
    tabChanges: counter,
    dirty: z.boolean(),
    pending: z.boolean(),
    previewReady: z.boolean(),
    hasHook: z.boolean(),
  })
  .strict();
export type EditorDiagnosticState = z.infer<typeof editorDiagnosticStateSchema>;
export const BROWSER_REACT_COMPONENTS = [
  "ClipEditor",
  "FocusEditor",
  "FocusPreviewControls",
  "CameraMotionEditor",
  "HeadMotionEditor",
  "PreviewTextEditor",
  "OwnerClipBatchPanel",
  "LocalEditingExperience",
  "OwnerAudioPreview",
  "CameraPreviewVideo",
  "Player",
  "Html5Video",
  "Html5Audio",
] as const;
export const browserConsoleDiagnosticSchema = z
  .object({
    kind: z.literal("browser-console"),
    level: z.enum(BROWSER_CONSOLE_LEVELS),
    source: z.enum([
      "console",
      "error-event",
      "unhandled-rejection",
      "worker-error",
    ]),
    argumentCount: z.number().int().min(0).max(1000),
    errorClass: z
      .enum([
        "Error",
        "TypeError",
        "SyntaxError",
        "RangeError",
        "ReferenceError",
        "AbortError",
        "TimeoutError",
      ])
      .optional(),
    digest: browserErrorDigestSchema.optional(),
    reactIssue: z
      .enum(["maximum-update-depth", "too-many-renders", "uncached-snapshot"])
      .optional(),
    components: z
      .array(z.enum(BROWSER_REACT_COMPONENTS))
      .max(BROWSER_REACT_COMPONENTS.length)
      .optional(),
    editor: editorDiagnosticStateSchema.optional(),
  })
  .strict();
export const cloudUploadDiagnosticSchema = z
  .object({
    operationId: operationIdSchema.optional(),
    stage: z.enum(["request", "complete", "failed"]),
    chunk: counter,
    request: z.enum(["chunk", "status"]),
    durationMs: z.number().int().min(0).max(86_400_000),
    status: z.number().int().min(0).max(599),
    statusQueries: counter,
    resends: counter,
    confirmedBytes: z
      .number()
      .int()
      .min(0)
      .max(OWNER_VALIDATION_LIMITS.maxSourceBytes),
    totalBytes: z
      .number()
      .int()
      .min(0)
      .max(OWNER_VALIDATION_LIMITS.maxSourceBytes),
    reason: z
      .enum([
        "invalid-input",
        "expired",
        "aborted",
        "timeout",
        "transport",
        "http",
        "acknowledgement",
        "metadata",
        "body-limit",
        "stalled",
      ])
      .nullable(),
  })
  .strict();
export type CloudUploadDiagnostic = z.infer<typeof cloudUploadDiagnosticSchema>;
export const previewDiagnosticSchema = z
  .object({
    traceId: uuidV4Schema,
    event: z.enum([
      "started",
      "buffering",
      "resumed",
      "ended",
      "failed",
      "closed",
    ]),
    captions: counter,
    cards: counter,
    matched: counter,
    held: counter,
    wide: counter,
    samples: z.number().int().min(0).max(10000),
    bufferingEvents: counter,
    automaticSeeks: counter,
    userSeeks: counter,
    backwardsMediaJumps: counter,
    shownVisuals: counter,
    maxDriftMs: z.number().int().min(0).max(60000),
    elapsedMs: z.number().int().min(0).max(120000),
  })
  .strict();
export type PreviewDiagnostic = z.infer<typeof previewDiagnosticSchema>;
// Client reports are untrusted counters/codes, never exception text or media.
export const browserDiagnosticSchema = z.discriminatedUnion("kind", [
  browserConsoleDiagnosticSchema,
  z
    .object({
      kind: z.literal("editor-lifecycle"),
      event: z.enum([
        "opened",
        "preview-ready",
        "applied",
        "discarded",
        "render-burst",
        "closed",
      ]),
      state: editorDiagnosticStateSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("cloud-upload"),
      record: cloudUploadDiagnosticSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("clip-preview"),
      record: previewDiagnosticSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("view-failed"),
      digest: browserErrorDigestSchema.optional(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("cleanup-failed"),
      resource: z.enum(["stopper", "object-url", "consumers"]),
    })
    .strict(),
  z
    .object({
      kind: z.literal("workflow-failed"),
      code: errorCodeSchema,
      sourceRequestId: requestIdSchema.optional(),
    })
    .strict(),
]);
export type BrowserDiagnostic = z.infer<typeof browserDiagnosticSchema>;
