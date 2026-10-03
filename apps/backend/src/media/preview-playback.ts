import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { Writable } from "node:stream";
import {
  mediaByteRange,
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
    let selected;
    try {
      selected = mediaByteRange(range, descriptor.artifact.bytes);
    } catch {
      throw new ApplicationError({ code: "INVALID_REQUEST" });
    }
    const signal = AbortSignal.any([
      context.signal ?? new AbortController().signal,
      AbortSignal.timeout(
        Math.max(1, Math.min(60_000, descriptor.expiresAtMs - this.now())),
      ),
    ]);
    const response = await this.media.previewContent(
        { binding: descriptor.binding, manifestHash: descriptor.manifestHash },
        range,
        signal,
      ),
      length = selected.end - selected.start + 1,
      contentRange = `bytes ${selected.start}-${selected.end}/${descriptor.artifact.bytes}`;
    try {
      if (
        response.status !== (selected.partial ? 206 : 200) ||
        !response.body ||
        response.headers.get("content-type")?.split(";")[0] !== "video/mp4" ||
        response.headers.get("content-length") !== String(length) ||
        response.headers.get("content-range") !==
          (selected.partial ? contentRange : null)
      )
        throw new ApplicationError({ code: "INVALID_REQUEST" });
      headers(response.status, {
        "Content-Type": "video/mp4",
        "Content-Length": String(length),
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        ...(selected.partial ? { "Content-Range": contentRange } : {}),
      });
      const body = response.body;
      async function* chunks() {
        const reader = body.getReader();
        let count = 0;
        try {
          for (;;) {
            const value = await reader.read();
            if (value.done) break;
            count += value.value.byteLength;
            if (count > length) throw new Error("invalid-media");
            yield value.value;
          }
          if (count !== length) throw new Error("invalid-media");
        } finally {
          await reader.cancel().catch(() => undefined);
          reader.releaseLock();
        }
      }
      await pipeline(Readable.from(chunks()), destination, { signal });
    } finally {
      if (response.body && !response.body.locked)
        await response.body.cancel().catch(() => undefined);
    }
  }
}
