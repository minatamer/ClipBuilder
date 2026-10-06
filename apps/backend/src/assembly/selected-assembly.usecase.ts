import { AnalysisDiagnostics } from "../analysis/analysis.diagnostics.js";
import { createHash, randomUUID } from "node:crypto";
import {
  GROUNDED_ANALYSIS_LIMITS,
  TEMPORARY_MEDIA_LIMITS,
  FIXED_COMPOSITION_POLICY,
  selectedAssemblyRequestSchema,
  selectedAssemblyResultSchema,
  mediaSelectResponseSchema,
  type SelectedAssemblyRequest,
  type SelectedAssemblyResult,
  type MediaSelectRequest,
  type MediaSelectResponse,
  type MediaBinding,
  type MediaPreviewRequest,
  type MediaPreviewResponse,
  mediaPreviewResponseSchema,
} from "@clipbuilder/contracts";
import type {
  ProcessingAdmission,
  AdmissionContext,
} from "../admission/processing.admission.js";
import type { SourceAnalysis } from "../analysis/analysis.usecase.js";
import { ApplicationError } from "../http/errorMapper.js";
import { type SpeakerPlanContext } from "./speaker-focus.js";
import { compileFixedAssembly, manifestDigest } from "./fixed-assembly.js";
import { compileFixedCaptions } from "./fixed-captions.js";
import { compileContextualPictures } from "./contextual-pictures.js";
import type { ContextualPictureSource } from "./commons-pictures.js";

export interface SelectedAssemblyMedia {
  preview(
    request: MediaPreviewRequest,
    signal: AbortSignal,
  ): Promise<MediaPreviewResponse>;
  select(
    request: MediaSelectRequest,
    signal: AbortSignal,
  ): Promise<MediaSelectResponse>;
  proxy(binding: MediaBinding, signal: AbortSignal): Promise<Blob>;
  releaseProxy(binding: MediaBinding, signal: AbortSignal): Promise<void>;
  cancel(binding: MediaBinding, signal: AbortSignal): Promise<unknown>;
}
export interface SelectedAssemblyProvider {
  plan(
    proxy: Blob,
    context: SpeakerPlanContext,
    signal: AbortSignal,
    scope: string,
  ): Promise<unknown>;
  cleanup?(signal: AbortSignal, scope: string): Promise<void>;
}
function digest(value: object) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
export class SelectedAssembly {
  constructor(
    private readonly admission: ProcessingAdmission,
    private readonly source: Pick<SourceAnalysis, "verify">,
    private readonly media: SelectedAssemblyMedia,
    private readonly provider: SelectedAssemblyProvider,
    private readonly providerName: "fake" | "google-gemini",
    private readonly diagnostics = new AnalysisDiagnostics(),
    private readonly pictures?: ContextualPictureSource,
    private readonly generatedPictures?: ContextualPictureSource,
  ) {}
  async run(
    context: AdmissionContext,
    input: SelectedAssemblyRequest,
  ): Promise<SelectedAssemblyResult> {
    const request = this.diagnostics.check("assembly_input", () =>
        selectedAssemblyRequestSchema.parse(input),
      ),
      result = this.diagnostics.check("assembly_evidence", () =>
        this.source.verify(context, request.analysis),
      );
    let selection;
    try {
      selection = this.diagnostics.check("assembly_range", () => {
        const candidate = result.analysis.candidates.find(
          (item) => item.id === request.candidateId,
        );
        if (!candidate) throw new Error("assembly_candidate_missing");
        const allWords = result.analysis.transcript.words,
          first = allWords.findIndex(
            (word) => word.id === candidate.startWordId,
          ),
          last = allWords.findIndex((word) => word.id === candidate.endWordId);
        if (first < 0 || last <= first)
          throw new Error("assembly_word_range_invalid");
        const range = {
            startMs: allWords[first]!.startMs,
            endMs: allWords[last]!.endMs,
          },
          words = allWords.filter(
            (word) => word.startMs < range.endMs && word.endMs > range.startMs,
          ),
          contextBytes = Buffer.byteLength(JSON.stringify(words));
        this.diagnostics.assembly("assembly_range", {
          selectedWords: words.length,
          contextBytes,
          durationMs: range.endMs - range.startMs,
        });
        if (
          words.length > FIXED_COMPOSITION_POLICY.maxSelectedWords ||
          contextBytes > FIXED_COMPOSITION_POLICY.selectedContextBytes
        )
          throw new Error("assembly_context_limit");
        return { candidate, range, words };
      });
    } catch {
      throw new ApplicationError({ code: "INVALID_REQUEST" });
    }
    const { candidate, range, words } = selection;
    let captions;
    try {
      captions = this.diagnostics.check("assembly_captions", () =>
        compileFixedCaptions({ range, words }, (reason) =>
          this.diagnostics.critique("assembly_captions", new Error(reason)),
        ),
      );
      this.diagnostics.assembly("assembly_captions", {
        captionGroups: captions.length,
        captionCues: captions.reduce(
          (count, caption) => count + caption.wordCues.length,
          0,
        ),
        captionZeroDurationCues: captions.reduce(
          (count, caption) =>
            count +
            caption.wordCues.filter((cue) => cue.startMs === cue.endMs).length,
          0,
        ),
        captionOmittedWords:
          words.length -
          captions.reduce(
            (count, caption) => count + caption.wordCues.length,
            0,
          ),
      });
    } catch {
      throw new ApplicationError({ code: "INVALID_REQUEST" });
    }
    this.diagnostics.privateStageOutput("assembly_selected_context", {
      range,
      words,
      captions,
    });
    const payload = await this.diagnostics.step("assembly_admission", () =>
      this.admission.run(
        context,
        {
          bytes: Buffer.from(
            JSON.stringify({
              source: result.binding,
              generation: result.generation,
              analysisRevision: result.analysis.revision,
              candidateId: candidate.id,
              range,
              analysisDigest: digest(result),
            }),
          ),
          contentType: "application/json",
          allowedContentTypes: ["application/json"],
          maxBytes: GROUNDED_ANALYSIS_LIMITS.requestBytes,
          turnstileToken: request.turnstileToken,
          action: "visual-plan",
        },
        () => {},
        async (signal) => {
          try {
            const prepared = await this.diagnostics.step(
              "assembly_media_prepare",
              async () =>
                mediaSelectResponseSchema.parse(
                  await this.media.select(
                    {
                      binding: result.binding,
                      generation: result.generation,
                      nonce: randomUUID(),
                      range,
                    },
                    signal,
                  ),
                ),
            );
            const media = result.analysis.media;
            this.diagnostics.check("assembly_source_validation", () => {
              const sourceMatched = !(
                JSON.stringify(prepared.range) !== JSON.stringify(range) ||
                prepared.source.fingerprint !== result.binding.fingerprint ||
                prepared.source.bytes !== media.bytes ||
                prepared.source.durationMs !== media.durationMs ||
                prepared.source.width !==
                  (media.rotationDegrees % 180 ? media.height : media.width) ||
                prepared.source.height !==
                  (media.rotationDegrees % 180 ? media.width : media.height)
              );
              this.diagnostics.assembly("assembly_source_validation", {
                sourceMatched,
              });
              if (!sourceMatched) throw new Error("assembly_source_mismatch");
            });
            let raw: unknown;
            let proxyCleanupFailure: ApplicationError | undefined;
            try {
              const proxy = await this.diagnostics.step(
                "assembly_proxy_fetch",
                () => this.media.proxy(result.binding, signal),
              );
              await this.diagnostics.step(
                "assembly_proxy_validation",
                async () => {
                  const bytesMatched =
                      proxy.size === prepared.analysisProxy.bytes &&
                      proxy.size <= TEMPORARY_MEDIA_LIMITS.proxyBytes,
                    checksumMatched =
                      bytesMatched &&
                      createHash("sha256")
                        .update(Buffer.from(await proxy.arrayBuffer()))
                        .digest("hex") === prepared.analysisProxy.checksum;
                  this.diagnostics.assembly("assembly_proxy_validation", {
                    proxyBytes: proxy.size,
                    bytesMatched,
                    checksumMatched,
                  });
                  if (!bytesMatched || !checksumMatched)
                    throw new Error("assembly_proxy_mismatch");
                },
              );
              raw = await this.diagnostics.step("selected_planning", () =>
                this.provider.plan(
                  proxy,
                  { range, words },
                  signal,
                  result.binding.sessionId,
                ),
              );
            } finally {
              try {
                await this.diagnostics.step("proxy_cleanup", () =>
                  this.media.releaseProxy(
                    result.binding,
                    AbortSignal.timeout(GROUNDED_ANALYSIS_LIMITS.cleanupMs),
                  ),
                );
              } catch {
                proxyCleanupFailure = new ApplicationError({
                  code: "CLEANUP_PENDING",
                });
                this.diagnostics.failure("proxy_cleanup", proxyCleanupFailure);
              }
            }
            if (proxyCleanupFailure) throw proxyCleanupFailure;
            this.diagnostics.privateStageOutput(
              "assembly_reconciliation_input",
              {
                raw,
                range,
                words,
                captions,
              },
            );
            const compiled = this.diagnostics.check("assembly_validation", () =>
              compileFixedAssembly(
                raw,
                result,
                { range, words },
                captions,
                this.diagnostics,
              ),
            );
            const compiledPictures = await compileContextualPictures(
              raw,
              { range, words },
              compiled.manifest,
              this.pictures,
              signal,
              this.diagnostics,
              this.generatedPictures
                ? {
                    source: this.generatedPictures,
                    reserve: () => this.admission.reserveImageCall(context),
                  }
                : undefined,
            );
            compiled.manifest = compiledPictures.manifest;
            compiled.manifestHash = manifestDigest(compiled.manifest);
            this.diagnostics.privateStageOutput(
              "assembly_reconciliation_result",
              {
                ...compiled,
                manifest: {
                  ...compiled.manifest,
                  pictures: compiled.manifest.pictures?.map((picture) => {
                    if (picture.asset.repository !== "google-gemini")
                      return picture;
                    const { dataUri: _dataUri, ...metadata } = picture.asset;
                    void _dataUri;
                    return { ...picture, asset: metadata };
                  }),
                },
              },
            );
            signal.throwIfAborted();
            const { receipt: _receipt, ...validated } = this.diagnostics.check(
              "assembly_result",
              () =>
                selectedAssemblyResultSchema.parse({
                  version: 2 as const,
                  binding: result.binding,
                  generation: result.generation,
                  analysisRevision: result.analysis.revision,
                  candidateId: candidate.id,
                  provider: this.providerName,
                  ...compiled,
                  pictureNotes: compiledPictures.pictureNotes,
                  receipt: "pending",
                }),
            );
            void _receipt;
            const preview = await this.diagnostics.step(
              "assembly_preview",
              async () =>
                mediaPreviewResponseSchema.parse(
                  await this.media.preview(
                    {
                      binding: result.binding,
                      generation: result.generation,
                      nonce: randomUUID(),
                      range,
                      manifestHash: validated.manifestHash,
                    },
                    signal,
                  ),
                ),
            );
            this.diagnostics.check("assembly_preview_validation", () => {
              const previewMatched = !(
                preview.manifestHash !== validated.manifestHash ||
                JSON.stringify(preview.binding) !==
                  JSON.stringify(result.binding) ||
                JSON.stringify(preview.range) !== JSON.stringify(range)
              );
              this.diagnostics.assembly("assembly_preview_validation", {
                previewMatched,
              });
              if (!previewMatched) throw new Error("assembly_preview_mismatch");
            });
            signal.throwIfAborted();
            return validated;
          } catch (error) {
            await this.diagnostics
              .step("source_cleanup", () =>
                this.media.cancel(
                  result.binding,
                  AbortSignal.timeout(GROUNDED_ANALYSIS_LIMITS.cleanupMs),
                ),
              )
              .catch(() => {
                this.diagnostics.failure(
                  "source_cleanup",
                  new ApplicationError({ code: "CLEANUP_PENDING" }),
                );
              });
            throw error instanceof ApplicationError
              ? error
              : new ApplicationError({ code: "MODEL_OUTPUT_REJECTED" });
          }
        },
      ),
    );
    return this.diagnostics.check("assembly_signing", () =>
      selectedAssemblyResultSchema.parse({
        ...payload,
        receipt: this.admission.completedReceipt(
          context,
          "visual-plan",
          result.binding.sourceRevision,
          digest(payload),
        ),
      }),
    );
  }
  verify(context: AdmissionContext, value: unknown) {
    const result = selectedAssemblyResultSchema.parse(value),
      claims = this.admission.verifyReceipt(result.receipt),
      { receipt: _receipt, ...payload } = result;
    void _receipt;
    if (
      claims.action !== "visual-plan" ||
      claims.sessionId !== this.admission.session(context).sessionId ||
      claims.sessionId !== result.binding.sessionId ||
      claims.sourceRevision !== result.binding.sourceRevision ||
      claims.resultDigest !== digest(payload) ||
      result.manifestHash !== manifestDigest(result.manifest)
    )
      throw new ApplicationError({ code: "SESSION_INVALID" });
    return result;
  }
}
