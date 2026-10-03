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
  ) {}
  async run(
    context: AdmissionContext,
    input: SelectedAssemblyRequest,
  ): Promise<SelectedAssemblyResult> {
    const request = selectedAssemblyRequestSchema.parse(input),
      result = this.source.verify(context, request.analysis);
    const candidate = result.analysis.candidates.find(
      (item) => item.id === request.candidateId,
    );
    if (!candidate) throw new ApplicationError({ code: "INVALID_REQUEST" });
    const allWords = result.analysis.transcript.words,
      first = allWords.findIndex((word) => word.id === candidate.startWordId),
      last = allWords.findIndex((word) => word.id === candidate.endWordId);
    if (first < 0 || last <= first)
      throw new ApplicationError({ code: "INVALID_REQUEST" });
    const range = {
        startMs: allWords[first]!.startMs,
        endMs: allWords[last]!.endMs,
      },
      words = allWords.filter(
        (word) => word.startMs < range.endMs && word.endMs > range.startMs,
      );
    if (
      words.length > FIXED_COMPOSITION_POLICY.maxSelectedWords ||
      Buffer.byteLength(JSON.stringify(words)) >
        FIXED_COMPOSITION_POLICY.selectedContextBytes
    )
      throw new ApplicationError({ code: "INVALID_REQUEST" });
    let captions;
    try {
      captions = compileFixedCaptions({ range, words });
    } catch {
      throw new ApplicationError({ code: "INVALID_REQUEST" });
    }
    const payload = await this.admission.run(
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
          const prepared = mediaSelectResponseSchema.parse(
            await this.media.select(
              {
                binding: result.binding,
                generation: result.generation,
                nonce: randomUUID(),
                range,
              },
              signal,
            ),
          );
          const media = result.analysis.media;
          if (
            JSON.stringify(prepared.range) !== JSON.stringify(range) ||
            prepared.source.fingerprint !== result.binding.fingerprint ||
            prepared.source.bytes !== media.bytes ||
            prepared.source.durationMs !== media.durationMs ||
            prepared.source.width !==
              (media.rotationDegrees % 180 ? media.height : media.width) ||
            prepared.source.height !==
              (media.rotationDegrees % 180 ? media.width : media.height)
          )
            throw new Error();
          let raw: unknown;
          try {
            const proxy = await this.media.proxy(result.binding, signal);
            if (
              proxy.size !== prepared.analysisProxy.bytes ||
              proxy.size > TEMPORARY_MEDIA_LIMITS.proxyBytes ||
              createHash("sha256")
                .update(Buffer.from(await proxy.arrayBuffer()))
                .digest("hex") !== prepared.analysisProxy.checksum
            )
              throw new Error();
            raw = await this.provider.plan(
              proxy,
              { range, words },
              signal,
              result.binding.sessionId,
            );
          } finally {
            await this.media.releaseProxy(
              result.binding,
              AbortSignal.timeout(GROUNDED_ANALYSIS_LIMITS.cleanupMs),
            );
          }
          const compiled = compileFixedAssembly(
            raw,
            result,
            { range, words },
            captions,
          );
          signal.throwIfAborted();
          const { receipt: _receipt, ...validated } =
            selectedAssemblyResultSchema.parse({
              version: 1 as const,
              binding: result.binding,
              generation: result.generation,
              analysisRevision: result.analysis.revision,
              candidateId: candidate.id,
              provider: this.providerName,
              ...compiled,
              receipt: "pending",
            });
          void _receipt;
          const preview = mediaPreviewResponseSchema.parse(
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
          );
          if (
            preview.manifestHash !== validated.manifestHash ||
            JSON.stringify(preview.binding) !==
              JSON.stringify(result.binding) ||
            JSON.stringify(preview.range) !== JSON.stringify(range)
          )
            throw new Error();
          signal.throwIfAborted();
          return validated;
        } catch (error) {
          await this.media.cancel(
            result.binding,
            AbortSignal.timeout(GROUNDED_ANALYSIS_LIMITS.cleanupMs),
          );
          throw error instanceof ApplicationError
            ? error
            : new ApplicationError({ code: "MODEL_OUTPUT_REJECTED" });
        }
      },
    );
    return selectedAssemblyResultSchema.parse({
      ...payload,
      receipt: this.admission.completedReceipt(
        context,
        "visual-plan",
        result.binding.sourceRevision,
        digest(payload),
      ),
    });
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
