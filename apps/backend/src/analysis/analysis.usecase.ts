import { createHash, randomUUID, randomBytes } from "node:crypto";
import {
  groundedAnalysisResultSchema,
  sourceAnalysisRequestSchema,
  sourceAnalysisUploadSchema,
  mediaPrepareResponseSchema,
  mediaDescriptorSchema,
  mediaUploadResponseSchema,
  GROUNDED_ANALYSIS_LIMITS,
  ANALYSIS_AUDIO_PROFILE,
  TEMPORARY_MEDIA_LIMITS,
  type MediaBinding,
  type MediaPrepareRequest,
  type MediaPrepareResponse,
  type MediaUploadRequest,
  type SourceAnalysisUpload,
  type SourceAnalysisRequest,
  type GroundedAnalysisResult,
  retainedSampleAnalysisRequestSchema,
  retainedSampleAnalysisResponseSchema,
  analysisBundleSchema,
  sampleReplayRequestSchema,
  type AnalysisBundleV1,
  type RetainedSampleAnalysisRequest,
} from "@clipbuilder/contracts";
import type {
  ProcessingAdmission,
  AdmissionContext,
} from "../admission/processing.admission.js";
import { ApplicationError } from "../http/errorMapper.js";
import { reconcileAnalysis } from "./analysis.reconciliation.js";
import type { AnalysisProvider } from "./gemini.adapter.js";
import { AnalysisDiagnostics } from "./analysis.diagnostics.js";
import type { LocalSampleReplay } from "./sample-replay.js";

export interface AnalysisMediaPort {
  upload(
    request: MediaUploadRequest,
    signal: AbortSignal,
  ): Promise<{ uploadUrl: string; expiresAtMs: number }>;
  prepare(
    request: MediaPrepareRequest,
    signal: AbortSignal,
  ): Promise<MediaPrepareResponse>;
  audio(binding: MediaBinding, signal: AbortSignal): Promise<Blob>;
  releaseProxy(binding: MediaBinding, signal: AbortSignal): Promise<void>;
  cancel(binding: MediaBinding, signal: AbortSignal): Promise<unknown>;
}
type SourceRecord = {
  binding: MediaBinding;
  media: SourceAnalysisUpload["media"] | null;
  mediaId: string;
  bytes: number;
  expiresAtMs: number;
  cleared: boolean;
  retainedSample?: true;
};
export interface RetainedSampleProcessingPort {
  readonly bytes: number;
  fingerprint(signal: AbortSignal): Promise<string>;
  transfer(uploadUrl: string, signal: AbortSignal): Promise<string>;
}
export function resultDigest(result: Omit<GroundedAnalysisResult, "receipt">) {
  return createHash("sha256").update(JSON.stringify(result)).digest("hex");
}
export class SourceAnalysis {
  private sources = new Map<string, SourceRecord>();
  constructor(
    private readonly admission: ProcessingAdmission,
    private readonly media: AnalysisMediaPort,
    private readonly provider: AnalysisProvider,
    private readonly providerName: "fake" | "google-gemini",
    private readonly now = () => Date.now(),
    private readonly sample: RetainedSampleProcessingPort | null = null,
    private readonly diagnostics = new AnalysisDiagnostics(),
    private readonly sampleReplay: LocalSampleReplay | null = null,
  ) {}
  get sampleReplayAvailable() {
    return this.sampleReplay?.available() ?? false;
  }
  sampleReplayOptions() {
    if (!this.sampleReplay)
      throw new ApplicationError({ code: "FEATURE_DISABLED" });
    const result = this.sampleReplay.options();
    this.diagnostics.sampleReplay(
      result.transcript.words.length,
      result.candidates.length,
    );
    return result;
  }
  async replaySample(context: AdmissionContext, value: unknown) {
    if (!this.sampleReplay)
      throw new ApplicationError({ code: "FEATURE_DISABLED" });
    const request = sampleReplayRequestSchema.parse(value);
    const cached = this.sampleReplay.options(request.analysisRevision);
    return this.produceAnalysis(
      context,
      {
        generation: request.generation,
        turnstileToken: request.turnstileToken,
      },
      cached,
    );
  }
  private cleanupSignal() {
    return AbortSignal.timeout(GROUNDED_ANALYSIS_LIMITS.cleanupMs);
  }
  async upload(context: AdmissionContext, input: SourceAnalysisUpload) {
    const request = sourceAnalysisUploadSchema.parse(input),
      grant = this.admission.session(context);
    for (const [id, source] of this.sources)
      if (source.expiresAtMs <= this.now()) this.sources.delete(id);
    const bytes = Buffer.from(JSON.stringify(request));
    return this.admission.run(
      context,
      {
        bytes,
        contentType: "application/json",
        allowedContentTypes: ["application/json"],
        maxBytes: GROUNDED_ANALYSIS_LIMITS.requestBytes,
        turnstileToken: request.turnstileToken,
        action: "transcription",
      },
      () => {},
      async (signal) => {
        const source: SourceRecord = {
          binding: {
            sessionId: grant.sessionId,
            sourceRevision: request.media.sourceRevision,
            fingerprint: request.fingerprint,
          },
          media: request.media,
          mediaId: request.media.mediaId,
          bytes: request.media.bytes,
          expiresAtMs: grant.expiresAtMs,
          cleared: false,
        };
        this.sources.set(grant.sessionId, source);
        try {
          return mediaUploadResponseSchema.parse(
            await this.diagnostics.step("source_upload", () =>
              this.media.upload(
                {
                  binding: source.binding,
                  bytes: request.media.bytes,
                  contentType: "video/mp4",
                  rightsAcknowledged: true,
                  dataTransferAcknowledged: true,
                },
                signal,
              ),
            ),
          );
        } catch (error) {
          source.cleared = true;
          await this.diagnostics
            .step("source_cleanup", () =>
              this.media.cancel(source.binding, this.cleanupSignal()),
            )
            .catch(() => undefined);
          throw error instanceof ApplicationError
            ? error
            : new ApplicationError({ code: "INVALID_REQUEST" });
        }
      },
    );
  }
  async prepareSample(
    context: AdmissionContext,
    input: RetainedSampleAnalysisRequest,
  ) {
    const request = retainedSampleAnalysisRequestSchema.parse(input);
    const sample = this.sample;
    if (!sample) throw new ApplicationError({ code: "FEATURE_DISABLED" });
    const grant = this.admission.session(context);
    for (const [id, source] of this.sources)
      if (source.expiresAtMs <= this.now()) this.sources.delete(id);
    return this.admission.run(
      context,
      {
        bytes: Buffer.from(JSON.stringify(request)),
        contentType: "application/json",
        allowedContentTypes: ["application/json"],
        maxBytes: GROUNDED_ANALYSIS_LIMITS.requestBytes,
        turnstileToken: request.turnstileToken,
        action: "transcription",
      },
      () => {},
      async (signal) => {
        const fingerprint = await this.diagnostics.step(
          "sample_fingerprint",
          () => sample.fingerprint(signal),
        );
        signal.throwIfAborted();
        const source: SourceRecord = {
          binding: {
            sessionId: grant.sessionId,
            sourceRevision: `rev_${randomBytes(16).toString("base64url")}`,
            fingerprint,
          },
          media: null,
          retainedSample: true,
          mediaId: `med_${randomBytes(16).toString("base64url")}`,
          bytes: sample.bytes,
          expiresAtMs: grant.expiresAtMs,
          cleared: false,
        };
        this.sources.set(grant.sessionId, source);
        try {
          const upload = mediaUploadResponseSchema.parse(
            await this.diagnostics.step("source_upload", () =>
              this.media.upload(
                {
                  binding: source.binding,
                  bytes: source.bytes,
                  contentType: "video/mp4",
                  rightsAcknowledged: true,
                  dataTransferAcknowledged: true,
                },
                signal,
              ),
            ),
          );
          const generation = await this.diagnostics.step(
            "sample_transfer",
            () => sample.transfer(upload.uploadUrl, signal),
          );
          signal.throwIfAborted();
          return retainedSampleAnalysisResponseSchema.parse({ generation });
        } catch (error) {
          source.cleared = true;
          await this.diagnostics
            .step("source_cleanup", () =>
              this.media.cancel(source.binding, this.cleanupSignal()),
            )
            .catch(() => undefined);
          throw error instanceof ApplicationError
            ? error
            : new ApplicationError({ code: "STORAGE_FAILED" });
        }
      },
    );
  }
  analyze(context: AdmissionContext, input: SourceAnalysisRequest) {
    return this.produceAnalysis(context, input);
  }
  private async produceAnalysis(
    context: AdmissionContext,
    input: SourceAnalysisRequest,
    replay?: AnalysisBundleV1,
  ): Promise<GroundedAnalysisResult> {
    const request = sourceAnalysisRequestSchema.parse(input),
      grant = this.admission.session(context);
    const source = this.sources.get(grant.sessionId);
    if (!source || source.cleared || (replay && !source.retainedSample))
      throw new ApplicationError({ code: "SESSION_INVALID" });
    const bytes = Buffer.from(
      JSON.stringify({
        binding: source.binding,
        generation: request.generation,
      }),
    );
    const result = await this.admission.run(
      context,
      {
        bytes,
        contentType: "application/json",
        allowedContentTypes: ["application/json"],
        maxBytes: GROUNDED_ANALYSIS_LIMITS.requestBytes,
        turnstileToken: request.turnstileToken,
        action: "candidate-analysis",
      },
      () => {},
      async (signal) => {
        try {
          const prepared = mediaPrepareResponseSchema.parse(
            await this.diagnostics.step("media_prepare", () =>
              this.media.prepare(
                {
                  binding: source.binding,
                  generation: request.generation,
                  nonce: randomUUID(),
                },
                signal,
              ),
            ),
          );
          const authoritativeMedia = this.diagnostics.check(
            "source_validation",
            () => {
              const expectedWidth =
                source.media &&
                (source.media.rotationDegrees % 180
                  ? source.media.height
                  : source.media.width);
              const expectedHeight =
                source.media &&
                (source.media.rotationDegrees % 180
                  ? source.media.width
                  : source.media.height);
              const profile = prepared.source.profile;
              if (
                !profile ||
                (source.media &&
                  (profile.container !== source.media.container ||
                    profile.videoCodec !== source.media.videoCodec ||
                    profile.audioCodec !== source.media.audioCodec ||
                    profile.rotationDegrees !== source.media.rotationDegrees ||
                    prepared.source.width !== expectedWidth ||
                    prepared.source.height !== expectedHeight)) ||
                prepared.source.fingerprint !== source.binding.fingerprint ||
                prepared.source.bytes !== source.bytes
              )
                throw new Error();
              return mediaDescriptorSchema.parse({
                ...(source.media ?? {
                  mediaId: source.mediaId,
                  sourceRevision: source.binding.sourceRevision,
                  container: profile.container,
                  videoCodec: profile.videoCodec,
                  audioCodec: profile.audioCodec,
                  rotationDegrees: profile.rotationDegrees,
                  hasAudio: true,
                  bytes: source.bytes,
                  width:
                    profile.rotationDegrees % 180
                      ? prepared.source.height
                      : prepared.source.width,
                  height:
                    profile.rotationDegrees % 180
                      ? prepared.source.width
                      : prepared.source.height,
                  orientation:
                    prepared.source.width === prepared.source.height
                      ? "square"
                      : prepared.source.width > prepared.source.height
                        ? "landscape"
                        : "portrait",
                }),
                durationMs: prepared.source.durationMs,
                averageFrameRate: profile.averageFrameRate,
              });
            },
          );
          signal.throwIfAborted();
          let raw: unknown;
          let proxyFailed = false;
          try {
            if (replay) {
              this.sampleReplay?.options(replay.revision);
              this.diagnostics.check("sample_replay", () => {
                const {
                  mediaId: _cachedId,
                  sourceRevision: _cachedRevision,
                  ...cachedMedia
                } = replay.media;
                const {
                  mediaId: _currentId,
                  sourceRevision: _currentRevision,
                  ...currentMedia
                } = authoritativeMedia;
                void _cachedId;
                void _cachedRevision;
                void _currentId;
                void _currentRevision;
                if (
                  JSON.stringify(cachedMedia) !== JSON.stringify(currentMedia)
                )
                  throw new ApplicationError({ code: "INVALID_REQUEST" });
              });
              raw = replay;
            } else {
              const proxy = await this.diagnostics.step("proxy_fetch", () =>
                this.media.audio(source.binding, signal),
              );
              await this.diagnostics.step("proxy_validation", async () => {
                if (
                  proxy.type !== ANALYSIS_AUDIO_PROFILE.contentType ||
                  proxy.size !== prepared.analysisAudio.bytes ||
                  proxy.size > TEMPORARY_MEDIA_LIMITS.proxyBytes ||
                  createHash("sha256")
                    .update(Buffer.from(await proxy.arrayBuffer()))
                    .digest("hex") !== prepared.analysisAudio.checksum
                )
                  throw new Error();
              });
              raw = await this.diagnostics.step("analysis_provider", () =>
                this.provider.analyze(
                  proxy,
                  signal,
                  grant.sessionId,
                  authoritativeMedia,
                ),
              );
            }
          } catch (error) {
            proxyFailed = true;
            throw error;
          } finally {
            await this.diagnostics
              .step("proxy_cleanup", () =>
                this.media.releaseProxy(source.binding, this.cleanupSignal()),
              )
              .catch(() => {
                if (!proxyFailed)
                  throw new ApplicationError({
                    code: "CLEANUP_PENDING",
                    ruleId: "temporary_media_cleanup_failed",
                  });
              });
          }
          this.diagnostics.privateReconciliationInput(
            raw,
            authoritativeMedia.durationMs,
          );
          const analysis = this.diagnostics.check("reconciliation", () =>
            replay
              ? analysisBundleSchema.parse({
                  ...replay,
                  media: authoritativeMedia,
                })
              : reconcileAnalysis(
                  raw,
                  authoritativeMedia,
                  this.providerName,
                  this.diagnostics,
                ),
          );
          if (replay)
            this.diagnostics.sampleReplay(
              analysis.transcript.words.length,
              analysis.candidates.length,
            );
          if (replay)
            this.diagnostics.privateStageOutput("replayed_analysis", analysis);
          signal.throwIfAborted();
          if (source.cleared) throw new Error();
          return {
            binding: source.binding,
            generation: request.generation,
            analysis,
          };
        } catch (error) {
          this.diagnostics.failure("analysis_result", error);
          source.cleared = true;
          await this.diagnostics
            .step("source_cleanup", () =>
              this.media.cancel(source.binding, this.cleanupSignal()),
            )
            .catch(() => undefined);
          throw error instanceof ApplicationError
            ? error
            : new ApplicationError({ code: "MODEL_OUTPUT_REJECTED" });
        }
      },
    );
    return groundedAnalysisResultSchema.parse({
      ...result,
      receipt: this.admission.completedReceipt(
        context,
        "candidate-analysis",
        source.binding.sourceRevision,
        resultDigest(result),
      ),
    });
  }
  verify(context: AdmissionContext, value: unknown): GroundedAnalysisResult {
    const result = groundedAnalysisResultSchema.parse(value),
      grant = this.admission.session(context);
    const claims = this.admission.verifyReceipt(result.receipt);
    const { receipt: _receipt, ...payload } = result;
    void _receipt;
    if (
      claims.action !== "candidate-analysis" ||
      claims.sessionId !== grant.sessionId ||
      result.binding.sessionId !== grant.sessionId ||
      claims.sourceRevision !== result.binding.sourceRevision ||
      claims.resultDigest !== resultDigest(payload)
    )
      throw new ApplicationError({ code: "SESSION_INVALID" });
    return result;
  }
  async exit(context: Omit<AdmissionContext, "csrf">) {
    let grant;
    try {
      grant = this.admission.restoreSession(context);
    } catch (error) {
      if (
        error instanceof ApplicationError &&
        ["SESSION_INVALID", "SESSION_MISSING"].includes(error.code)
      )
        return;
      throw error;
    }
    const source = this.sources.get(grant.sessionId);
    if (source) source.cleared = true;
    this.admission.exit({ ...context, csrf: grant.csrf });
    await this.cleanupSource(grant.sessionId, source);
  }
  async clear(context: AdmissionContext) {
    const grant = this.admission.session(context),
      source = this.sources.get(grant.sessionId);
    if (source) source.cleared = true;
    this.admission.clear(context);
    await this.cleanupSource(grant.sessionId, source);
  }
  private async cleanupSource(
    sessionId: string,
    source: SourceRecord | undefined,
  ) {
    const cleanup = await Promise.allSettled([
      this.provider.cleanup?.(this.cleanupSignal(), sessionId),
      source
        ? this.media.cancel(source.binding, this.cleanupSignal())
        : Promise.resolve(),
    ]);
    for (const result of cleanup)
      if (result.status === "rejected")
        throw result.reason instanceof ApplicationError
          ? result.reason
          : new ApplicationError({
              code: "CLEANUP_PENDING",
              ruleId: "temporary_media_cleanup_failed",
            });
  }
}
