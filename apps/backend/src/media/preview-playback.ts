import type { Writable } from "node:stream";
import {
  mediaPreviewResponseSchema,
  TEMPORARY_MEDIA_LIMITS,
  type MediaPreviewResponse,
  type MediaPreviewAccess,
} from "@clipbuilder/contracts";
import type {
  ProcessingAdmission,
  AdmissionContext,
} from "../admission/processing.admission.js";
import type { SelectedAssembly } from "../assembly/selected-assembly.usecase.js";
import { ApplicationError } from "../http/errorMapper.js";

import { streamArtifact } from "./artifact-stream.js";

export interface PreviewMedia {
  previewInfo(
    input: MediaPreviewAccess,
    signal: AbortSignal,
  ): Promise<MediaPreviewResponse>;
  previewContent(
    input: MediaPreviewAccess,
    range: string | undefined,
    signal: AbortSignal,
  ): Promise<Response>;
}
export class PreviewPlayback {
  private readonly references = new Map<string, MediaPreviewResponse>();
  constructor(
    private readonly admission: ProcessingAdmission,
    private readonly assembly: Pick<SelectedAssembly, "verify">,
    private readonly media: PreviewMedia,
    private readonly now = Date.now,
  ) {}
  async open(context: AdmissionContext, input: unknown) {
    const result = this.assembly.verify(context, input);
    for (const [key, value] of this.references)
      if (value.expiresAtMs <= this.now()) this.references.delete(key);
    if (
      !this.references.has(result.binding.sessionId) &&
      this.references.size >= TEMPORARY_MEDIA_LIMITS.maxSessions
    )
      throw new ApplicationError({ code: "ACTIVE_SESSION_EXISTS" });
    const descriptor = mediaPreviewResponseSchema.parse(
      await this.media.previewInfo(
        {
          binding: result.binding,
          manifestHash: result.manifestHash,
        },
        context.signal,
      ),
    );
    if (
      JSON.stringify(descriptor.binding) !== JSON.stringify(result.binding) ||
      descriptor.manifestHash !== result.manifestHash ||
      JSON.stringify(descriptor.range) !==
        JSON.stringify(result.manifest.range) ||
      descriptor.expiresAtMs <= this.now()
    )
      throw new ApplicationError({ code: "SESSION_INVALID" });
    context.signal?.throwIfAborted();
    this.assembly.verify(context, input);
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
  ) {
    const session = this.admission.restoreSession(context),
      descriptor = this.references.get(session.sessionId);
    if (!descriptor || descriptor.expiresAtMs <= this.now())
      throw new ApplicationError({ code: "SESSION_INVALID" });
    await streamArtifact({
      bytes: descriptor.artifact.bytes,
      expiresAtMs: descriptor.expiresAtMs,
      now: this.now(),
      range,
      signal: context.signal,
      destination,
      headers,
      fetch: (signal) =>
        this.media.previewContent(
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
