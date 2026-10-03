import { createHash, randomUUID } from "node:crypto";
import {
  finalRenderRequestSchema,
  finalRenderResultSchema,
  mediaRenderResponseSchema,
  mediaOutputResponseSchema,
  hasSameRenderedAssembly,
  TEMPORARY_MEDIA_LIMITS,
  type FinalRenderRequest,
  type FinalRenderResult,
  type MediaRenderRequest,
  type MediaRenderResponse,
  type MediaPreviewAccess,
  type MediaOutputResponse,
  type MediaBinding,
  type SelectedAssemblyResult,
} from "@clipbuilder/contracts";
import type {
  ProcessingAdmission,
  AdmissionContext,
} from "../admission/processing.admission.js";
import type { SelectedAssembly } from "../assembly/selected-assembly.usecase.js";
import { ApplicationError } from "../http/errorMapper.js";
export interface FinalRenderMedia {
  render(
    input: MediaRenderRequest,
    signal: AbortSignal,
  ): Promise<MediaRenderResponse>;
  outputInfo(
    input: MediaPreviewAccess,
    signal: AbortSignal,
  ): Promise<MediaOutputResponse>;
  cancel(binding: MediaBinding, signal: AbortSignal): Promise<unknown>;
}
function digest(value: object) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
export class FinalRender {
  constructor(
    private readonly admission: ProcessingAdmission,
    private readonly assembly: Pick<SelectedAssembly, "verify">,
    private readonly media: FinalRenderMedia,
    private readonly now = Date.now,
  ) {}
  private payload(assembly: SelectedAssemblyResult, value: unknown) {
    const output = mediaOutputResponseSchema.parse(value),
      result = finalRenderResultSchema.parse({
        ...output,
        version: 1,
        receipt: "pending",
      });
    if (
      !hasSameRenderedAssembly(result, assembly) ||
      result.expiresAtMs <= this.now() ||
      result.expiresAtMs >
        Math.min(
          this.admission.verifyReceipt(assembly.receipt).expiresAtMs,
          this.now() + TEMPORARY_MEDIA_LIMITS.outputTtlMs,
        )
    )
      throw new ApplicationError({ code: "INVALID_REQUEST" });
    const { receipt: _receipt, ...payload } = result;
    void _receipt;
    return payload;
  }
  private sign(
    context: AdmissionContext,
    payload: Omit<FinalRenderResult, "receipt">,
  ) {
    return finalRenderResultSchema.parse({
      ...payload,
      receipt: this.admission.completedReceipt(
        context,
        "render",
        payload.binding.sourceRevision,
        digest(payload),
      ),
    });
  }
  async run(context: AdmissionContext, input: FinalRenderRequest) {
    const request = finalRenderRequestSchema.parse(input),
      assembly = this.assembly.verify(context, request.assembly);
    const payload = await this.admission.run(
      context,
      {
        action: "render",
        contentType: "application/json",
        allowedContentTypes: ["application/json"],
        maxBytes: 8192,
        turnstileToken: request.turnstileToken,
        bytes: Buffer.from(
          JSON.stringify({
            binding: assembly.binding,
            generation: assembly.generation,
            manifestHash: assembly.manifestHash,
            assemblyDigest: digest(assembly),
          }),
        ),
      },
      () => {},
      async (signal) => {
        try {
          const rendered = mediaRenderResponseSchema.parse(
            await this.media.render(
              {
                binding: assembly.binding,
                nonce: randomUUID(),
                manifestHash: assembly.manifestHash,
                manifest: assembly.manifest,
              },
              signal,
            ),
          );
          const published = mediaOutputResponseSchema.parse(
            await this.media.outputInfo(
              {
                binding: assembly.binding,
                manifestHash: assembly.manifestHash,
              },
              signal,
            ),
          );
          if (
            JSON.stringify(rendered.output) !==
              JSON.stringify(published.output) ||
            rendered.manifestHash !== published.manifestHash ||
            rendered.expiresAtMs !== published.expiresAtMs
          )
            throw new Error();
          signal.throwIfAborted();
          return this.payload(assembly, published);
        } catch {
          await this.media.cancel(
            assembly.binding,
            AbortSignal.timeout(TEMPORARY_MEDIA_LIMITS.sweepDeadlineMs),
          );
          throw new ApplicationError({ code: "MODEL_OUTPUT_REJECTED" });
        }
      },
    );
    return this.sign(context, payload);
  }
  async restore(context: AdmissionContext, input: unknown) {
    const assembly = this.assembly.verify(context, input);
    const output = await this.media.outputInfo(
      { binding: assembly.binding, manifestHash: assembly.manifestHash },
      context.signal,
    );
    context.signal.throwIfAborted();
    return this.sign(context, this.payload(assembly, output));
  }
  verify(context: AdmissionContext, input: unknown) {
    const result = finalRenderResultSchema.parse(input),
      claims = this.admission.verifyReceipt(result.receipt),
      { receipt: _receipt, ...payload } = result;
    void _receipt;
    if (
      claims.action !== "render" ||
      claims.sessionId !== this.admission.session(context).sessionId ||
      claims.sessionId !== result.binding.sessionId ||
      claims.sourceRevision !== result.binding.sourceRevision ||
      claims.resultDigest !== digest(payload) ||
      result.expiresAtMs <= this.now() ||
      result.expiresAtMs > claims.expiresAtMs
    )
      throw new ApplicationError({ code: "SESSION_INVALID" });
    return result;
  }
}
