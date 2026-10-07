import type { Writable } from "node:stream";
import {
  mediaOutputResponseSchema,
  TEMPORARY_MEDIA_LIMITS,
  type MediaOutputResponse,
  type MediaPreviewAccess,
} from "@clipbuilder/contracts";
import type {
  ProcessingAdmission,
  AdmissionContext,
} from "../admission/processing.admission.js";
import type { FinalRender } from "../render/final-render.usecase.js";
import { ApplicationError } from "../http/errorMapper.js";
import { streamArtifact } from "./artifact-stream.js";
import { MediaDeliveryAllowance } from "./delivery-allowance.js";
export interface OutputMedia {
  outputInfo(
    input: MediaPreviewAccess,
    signal: AbortSignal,
  ): Promise<MediaOutputResponse>;
  outputContent(
    input: MediaPreviewAccess,
    range: string | undefined,
    signal: AbortSignal,
  ): Promise<Response>;
}
export class OutputDelivery {
  private readonly references = new Map<string, MediaOutputResponse>();
  constructor(
    private readonly admission: ProcessingAdmission,
    private readonly render: Pick<FinalRender, "verify">,
    private readonly media: OutputMedia,
    private readonly now = Date.now,
    private readonly allowance = new MediaDeliveryAllowance(now),
  ) {}
  private capacity(sessionId: string) {
    for (const [key, value] of this.references)
      if (value.expiresAtMs <= this.now()) this.references.delete(key);
    if (
      !this.references.has(sessionId) &&
      this.references.size >= TEMPORARY_MEDIA_LIMITS.maxSessions
    )
      throw new ApplicationError({ code: "ACTIVE_SESSION_EXISTS" });
  }
  async open(context: AdmissionContext, input: unknown) {
    const result = this.render.verify(context, input);
    this.capacity(result.binding.sessionId);
    this.allowance.reserveMetadata(
      result.binding.sessionId,
      this.admission.session(context).expiresAtMs,
      context.signal,
    );
    const descriptor = mediaOutputResponseSchema.parse(
      await this.media.outputInfo(
        { binding: result.binding, manifestHash: result.manifestHash },
        context.signal,
      ),
    );
    if (
      JSON.stringify(descriptor.binding) !== JSON.stringify(result.binding) ||
      descriptor.manifestHash !== result.manifestHash ||
      JSON.stringify(descriptor.output) !== JSON.stringify(result.output) ||
      descriptor.expiresAtMs !== result.expiresAtMs ||
      descriptor.expiresAtMs <= this.now()
    )
      throw new ApplicationError({ code: "SESSION_INVALID" });
    context.signal.throwIfAborted();
    this.render.verify(context, input);
    this.capacity(result.binding.sessionId);
    this.references.set(result.binding.sessionId, descriptor);
    return { ready: true as const, expiresAtMs: descriptor.expiresAtMs };
  }
  clear(context: AdmissionContext) {
    this.references.delete(this.admission.session(context).sessionId);
  }
  async stream(
    context: AdmissionContext,
    range: string | undefined,
    destination: Writable,
    headers: (status: number, fields: Record<string, string>) => void,
    attachment = false,
  ) {
    const session = this.admission.restoreSession(context),
      descriptor = this.references.get(session.sessionId);
    if (!descriptor || descriptor.expiresAtMs <= this.now())
      throw new ApplicationError({ code: "SESSION_INVALID" });
    await streamArtifact({
      bytes: descriptor.output.bytes,
      expiresAtMs: descriptor.expiresAtMs,
      now: this.now(),
      range,
      signal: context.signal,
      destination,
      headers,
      attachment,
      reserve: (bytes) =>
        this.allowance.reserveContent(session.sessionId, bytes, context.signal),
      authorize: () => {
        this.admission.restoreSession(context);
        if (
          !this.references.has(session.sessionId) ||
          descriptor.expiresAtMs <= this.now()
        )
          throw new ApplicationError({ code: "SESSION_INVALID" });
      },
      fetch: (signal) =>
        this.media.outputContent(
          {
            binding: descriptor.binding,
            manifestHash: descriptor.manifestHash,
          },
          range,
          signal,
        ),
    });
  }
}
