import { AsyncLocalStorage } from "node:async_hooks";
import {
  errorCodeSchema,
  requestIdSchema,
  OWNER_VALIDATION_LIMITS,
  browserDiagnosticSchema,
} from "@clipbuilder/contracts";
import { z } from "zod";
import {
  describeValidationFailure,
  validationDiagnosticSchema,
} from "./analysis.validation-diagnostics.js";
import { ApplicationError } from "../http/errorMapper.js";
import {
  candidateNormalizationDiagnosticSchema,
  type CandidateNormalizationDiagnostic,
} from "./analysis.provider-shape.js";
import {
  rendererDiagnosticSchema,
  RendererRequestFailure,
  type RendererDiagnostic,
} from "../media/renderer.diagnostics.js";
import {
  describePrivateWordTiming,
  type PrivateGeminiCapture,
  type PrivateGeminiCaptureEvent,
} from "./gemini.local-capture.js";
import {
  ReconciliationFailure,
  reconciliationDiagnosticSchema,
} from "./analysis.reconciliation-diagnostics.js";
import {
  describeGenerationRequest,
  describeGoogleRejectionBody,
  describeGoogleSdkError,
  generationRequestDiagnosticSchema,
  googleOperationSchema,
  googleRejectionSchema,
  type GoogleOperation,
} from "./gemini.diagnostics.js";

export const ANALYSIS_DIAGNOSTIC_VERSION = 2;
export const ANALYSIS_DIAGNOSTIC_RECORD_LIMIT = 256;

type AnalysisAction =
  | "upload"
  | "sample"
  | "sample-replay"
  | "sample-replay-options"
  | "retained-video"
  | "run"
  | "clear"
  | "probe"
  | "assemble"
  | "preview"
  | "render"
  | "render-result"
  | "output"
  | "download"
  | "session"
  | "grant"
  | "exit"
  | "diagnostics";
const phases = [
  "browser_diagnostic",
  "request",
  "sample_fingerprint",
  "sample_transfer",
  "sample_replay",
  "source_upload",
  "media_prepare",
  "source_validation",
  "proxy_fetch",
  "proxy_validation",
  "analysis_provider",
  "gemini_upload",
  "gemini_processing",
  "gemini_request",
  "google_http",
  "gemini_generation",
  "gemini_validation",
  "gemini_cleanup",
  "proxy_cleanup",
  "source_cleanup",
  "reconciliation",
  "analysis_result",
  "transcription_generation",
  "transcription_normalization",
  "transcript_validation",
  "candidate_generation",
  "candidate_validation",
  "candidate_normalization",
  "selected_planning",
  "assembly_validation",
  "renderer_request",
  "render_dispatch",
  "render_output_lookup",
  "render_output_validation",
  "assembly_input",
  "assembly_evidence",
  "assembly_range",
  "assembly_captions",
  "assembly_admission",
  "assembly_media_prepare",
  "assembly_source_validation",
  "assembly_proxy_fetch",
  "assembly_proxy_validation",
  "assembly_plan_parse",
  "assembly_cards",
  "assembly_pictures",
  "assembly_picture_generation",
  "assembly_focus",
  "assembly_manifest",
  "assembly_preview",
  "assembly_preview_validation",
  "assembly_result",
  "assembly_signing",
] as const;
export type AnalysisPhase = (typeof phases)[number];
const phaseMessages: Record<AnalysisPhase, string> = {
  browser_diagnostic:
    "Untrusted browser diagnostic accepted by private backend",
  request: "Backend request lifecycle",
  sample_fingerprint: "Retained sample fingerprint verification",
  sample_transfer: "Retained sample copy transfer",
  sample_replay: "Saved sample analysis reuse; no AI calls",
  source_upload: "Source media upload",
  media_prepare: "Source media inspection and analysis proxy preparation",
  source_validation: "Prepared source evidence verification",
  proxy_fetch: "Analysis proxy download",
  proxy_validation: "Analysis proxy byte and integrity verification",
  analysis_provider: "Analysis provider orchestration",
  gemini_upload: "Gemini Files upload",
  gemini_processing: "Gemini Files readiness polling",
  gemini_request: "Gemini generation request configuration",
  google_http: "Google API HTTP response or transport failure",
  gemini_generation: "Gemini selected video generation",
  gemini_validation:
    "Gemini response completion, JSON decoding and local schema parsing",
  gemini_cleanup: "Gemini Files deletion and absence confirmation",
  proxy_cleanup: "Temporary analysis proxy release",
  source_cleanup: "Temporary source cancellation and cleanup",
  reconciliation: "Candidate and transcript reconciliation",
  analysis_result: "Analysis result construction",
  transcription_generation: "Audio transcription provider request",
  transcription_normalization: "Transcription word and speaker normalization",
  transcript_validation: "Normalized transcript acceptance",
  candidate_generation: "Transcript candidate selection provider request",
  candidate_validation: "Candidate JSON decoding",
  candidate_normalization: "Candidate shape normalization",
  selected_planning:
    "Selected clip speaker framing and contextual card generation",
  assembly_validation: "Local selected plan compilation",
  renderer_request: "Private renderer request and response classification",
  render_dispatch: "Final MP4 render dispatch and response validation",
  render_output_lookup:
    "Existing final MP4 metadata lookup; no render dispatch",
  render_output_validation:
    "Final MP4 binding, metadata and expiry verification",
  assembly_input: "Selected assembly request schema parsing",
  assembly_evidence: "Signed analysis and session evidence verification",
  assembly_range: "Chosen candidate word range and bounded context resolution",
  assembly_captions: "Fixed captions compilation from chosen words",
  assembly_admission: "Assembly admission, one-use execution and completion",
  assembly_media_prepare: "Selected source window and video proxy preparation",
  assembly_source_validation:
    "Selected source dimensions, range and binding verification",
  assembly_proxy_fetch: "Selected video proxy download",
  assembly_proxy_validation:
    "Selected video proxy byte count and checksum verification",
  assembly_plan_parse: "Returned speaker and card plan schema parsing",
  assembly_cards: "Contextual card word evidence and safety compilation",
  assembly_pictures: "Grounded contextual picture retrieval and validation",
  assembly_picture_generation:
    "Missing contextual picture generation and raster validation",
  assembly_focus: "Speaker evidence and framing track compilation",
  assembly_manifest: "Fixed composition manifest validation and hashing",
  assembly_preview: "Selected clip preview authorization creation",
  assembly_preview_validation:
    "Preview binding, range and manifest verification",
  assembly_result: "Selected assembly result schema parsing",
  assembly_signing:
    "Completed assembly receipt signing and final result validation",
};
const outcomes = {
  started: "started",
  succeeded: "succeeded",
  failed: "failed",
  completed: "completed",
  disconnected: "client disconnected",
} as const;
const messages = new Set(
  Object.values(phaseMessages).flatMap((phase) =>
    Object.values(outcomes).map((outcome) => `${phase}: ${outcome}`),
  ),
);
const assemblyDiagnosticSchema = z
  .object({
    selectedWords: z.number().int().min(0).max(12000).optional(),
    durationMs: z.number().int().min(0).max(1_200_000).optional(),
    contextBytes: z.number().int().min(0).max(16_777_216).optional(),
    captionGroups: z.number().int().min(0).max(12000).optional(),
    captionCues: z.number().int().min(0).max(12000).optional(),
    captionZeroDurationCues: z.number().int().min(0).max(12000).optional(),
    captionOmittedWords: z.number().int().min(0).max(12000).optional(),
    qualityWarnings: z.number().int().min(0).max(12000).optional(),
    geometryTransitions: z.number().int().min(0).max(12000).optional(),
    cards: z.number().int().min(0).max(120).optional(),
    pictures: z.number().int().min(0).max(3).optional(),
    plannedPictures: z.number().int().min(0).max(3).optional(),
    validatedPictures: z.number().int().min(0).max(3).optional(),
    retimedPicturePlans: z.number().int().min(0).max(3).optional(),
    pictureSearches: z.number().int().min(0).max(3).optional(),
    pictureGenerationCalls: z.number().int().min(0).max(3).optional(),
    generatedPictures: z.number().int().min(0).max(3).optional(),
    retrievedPictures: z.number().int().min(0).max(3).optional(),
    imageProviderStatus: z.number().int().min(100).max(599).optional(),
    pictureCandidates: z.number().int().min(0).max(24).optional(),
    relevanceRejected: z.number().int().min(0).max(24).optional(),
    rightsRejected: z.number().int().min(0).max(24).optional(),
    provisionalSegments: z.number().int().min(0).max(12000).optional(),
    pictureBytes: z
      .number()
      .int()
      .min(0)
      .max(3 * 96 * 1024)
      .optional(),
    plannedCards: z.number().int().min(0).max(120).optional(),
    fallbackCards: z.number().int().min(0).max(120).optional(),
    matchedSegments: z.number().int().min(0).max(12000).optional(),
    heldSegments: z.number().int().min(0).max(12000).optional(),
    wideSegments: z.number().int().min(0).max(12000).optional(),
    holdExpiredSegments: z.number().int().min(0).max(12000).optional(),
    shotResetSegments: z.number().int().min(0).max(12000).optional(),
    focusSegments: z.number().int().min(0).max(12000).optional(),
    proxyBytes: z.number().int().min(0).max(1_073_741_824).optional(),
    bytesMatched: z.boolean().optional(),
    checksumMatched: z.boolean().optional(),
    sourceMatched: z.boolean().optional(),
    previewMatched: z.boolean().optional(),
  })
  .strict();
type Context = {
  requestId: string;
  action: AnalysisAction;
  started: number;
  records: number;
  dropped: number;
  privateCapture?: (event: PrivateGeminiCaptureEvent) => void;
};
type Event = "started" | "succeeded" | "failed" | "completed" | "disconnected";
const allowedRule =
  /^(?:google_(?:files_)?(?:upload_start|upload_finalize|upload|processing|generation|validation|transcription|delete|delete_confirm)_(?:failed|http_[45]\d{2})|google_files_cleanup_failed|analysis_complete|temporary_media_cleanup_failed)$/;
const errorClassNames = [
  "Error",
  "TypeError",
  "SyntaxError",
  "AbortError",
  "TimeoutError",
  "ZodError",
  "ApiError",
  "ApplicationError",
] as const;
const errorClasses: ReadonlySet<string> = new Set(errorClassNames);
const networkCodeNames = [
  "ENOTFOUND",
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_SOCKET",
] as const;
const networkCodes: ReadonlySet<string> = new Set(networkCodeNames);
const diagnosticSchema = z
  .object({
    event: z.literal("analysis_diagnostic"),
    diagnosticVersion: z.literal(ANALYSIS_DIAGNOSTIC_VERSION).optional(),
    requestId: requestIdSchema,
    action: z.enum([
      "upload",
      "sample",
      "sample-replay",
      "sample-replay-options",
      "retained-video",
      "run",
      "clear",
      "probe",
      "assemble",
      "preview",
      "render",
      "render-result",
      "output",
      "download",
      "session",
      "grant",
      "exit",
      "diagnostics",
    ]),
    phase: z.enum(phases),
    outcome: z.enum([
      "started",
      "succeeded",
      "failed",
      "completed",
      "disconnected",
    ]),
    message: z
      .string()
      .max(240)
      .refine((value) => messages.has(value))
      .optional(),
    assembly: assemblyDiagnosticSchema.optional(),
    browser: browserDiagnosticSchema.optional(),
    validation: validationDiagnosticSchema.optional(),
    elapsedMs: z.number().int().min(0).max(86_400_000),
    requestElapsedMs: z.number().int().min(0).max(86_400_000).optional(),
    timingScope: z.enum(["phase", "request"]).optional(),
    droppedRecords: z.number().int().min(0).max(1_000_000).optional(),
    applicationHttpStatus: z.number().int().min(100).max(599).optional(),
    upstreamHttpStatus: z.number().int().min(400).max(599).optional(),
    errorClass: z.enum(errorClassNames).optional(),
    code: errorCodeSchema.optional(),
    rules: z
      .array(z.string().max(80).regex(allowedRule))
      .min(1)
      .max(2)
      .optional(),
    networkCode: z.enum(networkCodeNames).optional(),
    providerOperation: googleOperationSchema.optional(),
    providerHttpStatus: z.number().int().min(100).max(599).optional(),
    providerElapsedMs: z.number().int().min(0).max(86_400_000).optional(),
    google: googleRejectionSchema.optional(),
    generationRequest: generationRequestDiagnosticSchema.optional(),
    renderer: rendererDiagnosticSchema.optional(),
    candidateJson: z.object({ decoded: z.boolean() }).strict().optional(),
    candidateNormalization: candidateNormalizationDiagnosticSchema.optional(),
    sampleReplay: z
      .object({
        words: z
          .number()
          .int()
          .min(0)
          .max(OWNER_VALIDATION_LIMITS.maxTranscriptWords),
        candidates: z.number().int().min(0).max(3),
        transcriptionCalls: z.literal(0),
        candidateSelectionCalls: z.literal(0),
      })
      .strict()
      .optional(),
    reconciliation: reconciliationDiagnosticSchema.optional(),
    transcriptionRequest: z
      .object({
        model: z.literal("gemini-3.5-transcribe"),
        timeoutMs: z.number().int().positive().max(360000),
        store: z.literal(false),
        background: z.literal(false),
        stream: z.literal(false),
        mode: z.literal("verbatim"),
        timestamps: z.literal("word"),
        diarization: z.literal("speaker"),
      })
      .strict()
      .optional(),
  })
  .strict();

// The managed launcher uses the same validator instead of trusting a log prefix.
export function parseAnalysisDiagnosticLine(line: string): string | null {
  if (line.length > 2048) return null;
  try {
    const result = diagnosticSchema.safeParse(JSON.parse(line));
    return result.success ? JSON.stringify(result.data) : null;
  } catch {
    return null;
  }
}

// Own only bounded structural diagnostics. Never serialize an exception or input.
export class AnalysisDiagnostics {
  private readonly contexts = new AsyncLocalStorage<Context>();
  private privateCapture: PrivateGeminiCapture | null = null;
  constructor(
    private readonly write: (line: string) => void = () => {},
    private readonly now = () => performance.now(),
  ) {}
  enablePrivateCapture(capture: PrivateGeminiCapture | null) {
    this.privateCapture = capture;
  }
  browser(record: unknown) {
    const parsed = browserDiagnosticSchema.safeParse(record);
    if (parsed.success)
      this.emit(
        "browser_diagnostic",
        "succeeded",
        undefined,
        undefined,
        undefined,
        () => ({ browser: parsed.data }),
        "phase",
        true,
      );
  }
  private capture(event: () => PrivateGeminiCaptureEvent) {
    const write = this.contexts.getStore()?.privateCapture;
    if (!write) return;
    try {
      write(event());
    } catch {
      // Private capture cannot affect validation, retries, results or cleanup.
    }
  }
  request(
    requestId: string,
    action: AnalysisAction,
    next: (
      finish: (event: "completed" | "disconnected", status?: number) => void,
    ) => void,
  ) {
    if (!requestIdSchema.safeParse(requestId).success) return next(() => {});
    const context: Context = {
      requestId,
      action,
      started: this.now(),
      records: 0,
      dropped: 0,
    };
    if (
      action === "run" ||
      action === "assemble" ||
      action === "sample-replay"
    ) {
      try {
        const write = this.privateCapture?.open(requestId);
        if (write) context.privateCapture = write;
      } catch {
        // A broken private sink must not affect request admission.
      }
    }
    this.contexts.run(context, () => {
      this.emit(
        "request",
        "started",
        context.started,
        undefined,
        undefined,
        undefined,
        "request",
      );
      let finished = false;
      next((event, status) => {
        if (finished) return;
        finished = true;
        this.contexts.run(context, () => {
          this.capture(() => ({
            kind: "request_finished",
            outcome: event,
            status,
          }));
          this.emit(
            "request",
            event,
            context.started,
            undefined,
            status,
            undefined,
            "request",
          );
        });
      });
    });
  }
  async step<T>(phase: AnalysisPhase, work: () => Promise<T>): Promise<T> {
    const started = this.now();
    this.emit(phase, "started", started);
    try {
      const result = await work();
      this.emit(phase, "succeeded", started);
      return result;
    } catch (error) {
      this.emit(phase, "failed", started, error);
      throw error;
    }
  }
  check<T>(phase: AnalysisPhase, work: () => T): T {
    const started = this.now();
    this.emit(phase, "started", started);
    try {
      const result = work();
      this.emit(phase, "succeeded", started);
      return result;
    } catch (error) {
      this.emit(phase, "failed", started, error);
      throw error;
    }
  }
  failure(
    phase: AnalysisPhase,
    error: unknown,
    applicationHttpStatus?: number,
  ) {
    this.emit(
      phase,
      "failed",
      this.contexts.getStore()?.started ?? this.now(),
      error,
      applicationHttpStatus,
      undefined,
      "request",
    );
  }
  generationRequest(input: Parameters<typeof describeGenerationRequest>[0]) {
    this.emit(
      "gemini_request",
      "completed",
      undefined,
      undefined,
      undefined,
      () => ({ generationRequest: describeGenerationRequest(input) }),
    );
  }
  assembly(
    phase: AnalysisPhase,
    detail: z.infer<typeof assemblyDiagnosticSchema>,
  ) {
    this.emit(phase, "completed", undefined, undefined, undefined, () => ({
      assembly: assemblyDiagnosticSchema.parse(detail),
    }));
  }
  critique(phase: AnalysisPhase, error: unknown) {
    this.emit(phase, "completed", undefined, error, undefined, () => ({
      assembly: { qualityWarnings: 1 },
    }));
  }
  rendererRequest(detail: RendererDiagnostic, error?: unknown) {
    this.emit(
      "renderer_request",
      detail.failure ? "failed" : "succeeded",
      undefined,
      error,
      undefined,
      () => ({ renderer: rendererDiagnosticSchema.parse(detail) }),
      "phase",
      Boolean(detail.failure),
    );
  }
  candidateJsonDecoded(decoded: boolean) {
    this.emit(
      "candidate_validation",
      "completed",
      undefined,
      undefined,
      undefined,
      () => ({ candidateJson: { decoded } }),
      "phase",
      !decoded,
    );
  }
  candidateNormalization(detail: CandidateNormalizationDiagnostic) {
    this.emit(
      "candidate_normalization",
      "completed",
      undefined,
      undefined,
      undefined,
      () => ({
        candidateNormalization:
          candidateNormalizationDiagnosticSchema.parse(detail),
      }),
      "phase",
      detail.droppedCount > 0 || detail.inputShape === "unsupported",
    );
  }
  sampleReplay(words: number, candidates: number) {
    this.emit(
      "sample_replay",
      "completed",
      undefined,
      undefined,
      undefined,
      () => ({
        sampleReplay: {
          words,
          candidates,
          transcriptionCalls: 0,
          candidateSelectionCalls: 0,
        },
      }),
    );
  }
  transcriptionRequest(timeoutMs: number) {
    this.emit(
      "gemini_request",
      "completed",
      undefined,
      undefined,
      undefined,
      () => ({
        transcriptionRequest: {
          model: "gemini-3.5-transcribe",
          timeoutMs,
          store: false,
          background: false,
          stream: false,
          mode: "verbatim",
          timestamps: "word",
          diarization: "speaker",
        },
      }),
    );
  }
  privateStageOutput(stage: string, output: unknown) {
    this.capture(() => ({ kind: "stage_output", stage, output }));
  }
  privateGenerationResult(result: {
    text: string | undefined;
    finished: boolean;
  }) {
    this.capture(() => ({ kind: "generation_result", ...result }));
  }
  privateReconciliationInput(value: unknown, mediaDurationMs: number) {
    this.capture(() => ({
      kind: "reconciliation_input",
      timeUnits: "milliseconds",
      mediaDurationMs,
      normalizedOutput: value,
      timing: describePrivateWordTiming(value, mediaDurationMs),
    }));
  }
  privateGoogleResponse(
    operation: GoogleOperation,
    status: number,
    body: Uint8Array | (() => Uint8Array) | undefined,
    headers?: Headers,
    complete = true,
    observedBytes?: number,
  ) {
    this.capture(() => {
      const bytes = typeof body === "function" ? body() : body;
      return {
        kind: "google_response",
        operation,
        status,
        responseHeaders: Object.fromEntries(headers?.entries() ?? []),
        bodyUtf8: bytes ? Buffer.from(bytes).toString("utf8") : "",
        bodyBytes: bytes?.byteLength ?? 0,
        complete,
        observedBytes: observedBytes ?? bytes?.byteLength ?? 0,
      };
    });
  }
  googleHttpResponse(
    operation: GoogleOperation,
    status: number,
    elapsedMs: number,
    body?: Uint8Array,
    headers?: Headers,
  ) {
    this.privateGoogleResponse(operation, status, body, headers);
    // Successful polling/listing is represented by the enclosing lifecycle step.
    // Non-2xx GETs remain visible, including expected deletion-confirmation 403/404.
    if (status < 400 && ["files_get", "files_list"].includes(operation)) return;
    this.emit(
      "google_http",
      "completed",
      undefined,
      undefined,
      undefined,
      () => ({
        providerOperation: operation,
        providerHttpStatus: status,
        providerElapsedMs: this.duration(elapsedMs),
        ...(status >= 400
          ? {
              google: describeGoogleRejectionBody(body),
            }
          : {}),
      }),
      "phase",
      status >= 400,
    );
  }
  googleHttpFailure(
    operation: GoogleOperation,
    elapsedMs: number,
    error: unknown,
  ) {
    this.emit("google_http", "failed", undefined, error, undefined, () => ({
      providerOperation: operation,
      providerElapsedMs: this.duration(elapsedMs),
    }));
  }
  private duration(value: number) {
    return Number.isFinite(value)
      ? Math.min(86_400_000, Math.max(0, Math.round(value)))
      : 0;
  }
  private emit(
    phase: AnalysisPhase,
    event: Event,
    started: number | undefined,
    error?: unknown,
    applicationHttpStatus?: number,
    additionalFields?: () => Record<string, unknown>,
    timingScope: "phase" | "request" = "phase",
    critical = false,
  ) {
    const context = this.contexts.getStore();
    if (!context) return;
    if (
      [
        "reconciliation",
        "transcript_validation",
        "candidate_normalization",
        "assembly_validation",
      ].includes(phase) &&
      event === "failed" &&
      error instanceof ReconciliationFailure
    )
      this.capture(() => ({
        kind: "reconciliation_failure",
        detail: error.reconciliation,
      }));
    const terminal =
      phase === "request" && ["completed", "disconnected"].includes(event);
    // Reserve sixteen failures and one terminal record after progress saturation.
    const limit = terminal
      ? ANALYSIS_DIAGNOSTIC_RECORD_LIMIT
      : critical || event === "failed"
        ? ANALYSIS_DIAGNOSTIC_RECORD_LIMIT - 1
        : ANALYSIS_DIAGNOSTIC_RECORD_LIMIT - 17;
    if (context.records >= limit) {
      context.dropped = Math.min(1_000_000, context.dropped + 1);
      return;
    }
    context.records++;
    try {
      const duration = started === undefined ? 0 : this.now() - started;
      const fields: Record<string, unknown> = {
        event: "analysis_diagnostic",
        diagnosticVersion: ANALYSIS_DIAGNOSTIC_VERSION,
        requestId: context.requestId,
        action: context.action,
        phase,
        outcome: event,
        message: `${phaseMessages[phase]}: ${outcomes[event]}`,
        elapsedMs: this.duration(duration),
        requestElapsedMs: this.duration(this.now() - context.started),
        timingScope,
        ...(terminal ? { droppedRecords: context.dropped } : {}),
        ...additionalFields?.(),
      };
      if (
        typeof applicationHttpStatus === "number" &&
        Number.isInteger(applicationHttpStatus) &&
        applicationHttpStatus >= 100 &&
        applicationHttpStatus <= 599
      )
        fields.applicationHttpStatus = applicationHttpStatus;
      const validation = describeValidationFailure(error);
      if (validation)
        fields.validation = validationDiagnosticSchema.parse(validation);
      if (error instanceof z.ZodError) fields.errorClass = "ZodError";
      if (error instanceof Error) {
        const google = describeGoogleSdkError(error);
        if (google) fields.google = google;
        fields.errorClass = errorClasses.has(error.name) ? error.name : "Error";
        if (error instanceof ApplicationError) fields.code = error.code;
        if (error instanceof RendererRequestFailure)
          fields.renderer = rendererDiagnosticSchema.parse(error.renderer);
        if (error instanceof ReconciliationFailure) {
          const detail = reconciliationDiagnosticSchema.safeParse(
            error.reconciliation,
          );
          if (detail.success) fields.reconciliation = detail.data;
        }
        if (
          "status" in error &&
          typeof error.status === "number" &&
          Number.isInteger(error.status) &&
          error.status >= 400 &&
          error.status <= 599
        )
          fields.upstreamHttpStatus = error.status;
        if (
          "ruleId" in error &&
          typeof error.ruleId === "string" &&
          error.ruleId.length <= 161
        ) {
          const rules = error.ruleId.split(";");
          if (
            rules.length <= 2 &&
            rules.every((rule) => allowedRule.test(rule))
          )
            fields.rules = rules;
        }
        let cause: unknown = error;
        for (let depth = 0; depth < 3 && cause instanceof Error; depth++) {
          if (
            "code" in cause &&
            typeof cause.code === "string" &&
            networkCodes.has(cause.code)
          ) {
            fields.networkCode = cause.code;
            break;
          }
          cause = cause.cause;
        }
      }
      const line = parseAnalysisDiagnosticLine(JSON.stringify(fields));
      if (line !== null) this.write(line);
    } catch {
      // Logging availability must not change a response, retry or cleanup.
    }
  }
}
