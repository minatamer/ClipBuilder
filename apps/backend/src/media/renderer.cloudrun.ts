import { GoogleAuth } from "google-auth-library";
import { z } from "zod";
import {
  TEMPORARY_MEDIA_LIMITS,
  mediaUploadRequestSchema,
  mediaUploadResponseSchema,
  mediaPrepareRequestSchema,
  mediaPrepareResponseSchema,
  mediaRenderRequestSchema,
  mediaRenderResponseSchema,
  mediaCancelRequestSchema,
  type MediaUploadRequest,
  type MediaPrepareRequest,
  type MediaRenderRequest,
  type MediaBinding,
  type MediaSelectRequest,
  mediaSelectRequestSchema,
  mediaSelectResponseSchema,
  mediaPreviewRequestSchema,
  mediaPreviewAccessSchema,
  mediaPreviewResponseSchema,
  type MediaPreviewRequest,
  type MediaPreviewAccess,
} from "@clipbuilder/contracts";
import type { BackendConfig } from "../config/env.schema.js";
export interface RendererIdentity {
  authorization(): Promise<string>;
}
export function rendererIdentity(origin: string): RendererIdentity {
  const auth = new GoogleAuth({
    clientOptions: { transporterOptions: { timeout: 10_000, retry: false } },
  });
  return {
    async authorization() {
      const client = await auth.getIdTokenClient(origin);
      const value = (await client.getRequestHeaders()).get("authorization");
      if (!value) throw new Error("renderer_unavailable");
      return value;
    },
  };
}
export class CloudRendererClient {
  constructor(
    private readonly config: BackendConfig,
    private readonly identity: RendererIdentity,
    private readonly transport: typeof fetch = fetch,
  ) {
    if (
      config.nodeEnv === "test" ||
      config.renderer.environment !== "cloud" ||
      !config.renderer.spendApproved ||
      !config.renderer.origin
    )
      throw new Error("renderer_disabled");
  }
  private async call<T>(
    path: string,
    input: object,
    schema: z.ZodType<T>,
    signal: AbortSignal,
  ): Promise<T> {
    const deadline = AbortSignal.any([
      signal,
      AbortSignal.timeout(TEMPORARY_MEDIA_LIMITS.workDeadlineMs),
    ]);
    let response: Response | undefined;
    try {
      deadline.throwIfAborted();
      const authorization = await this.identity.authorization();
      deadline.throwIfAborted();
      response = await this.transport(this.config.renderer.origin + path, {
        method: "POST",
        headers: {
          Authorization: authorization,
          "X-Serverless-Authorization": authorization,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
        signal: deadline,
        redirect: "error",
      });
      if (!response.ok || !response.body)
        throw new Error("renderer_unavailable");
      const reader = response.body.getReader(),
        chunks: Uint8Array[] = [];
      let size = 0;
      try {
        for (;;) {
          const chunk = await reader.read();
          if (chunk.done) break;
          size += chunk.value.byteLength;
          if (size > TEMPORARY_MEDIA_LIMITS.descriptorBytes)
            throw new Error("renderer_unavailable");
          chunks.push(chunk.value);
        }
      } finally {
        await reader.cancel();
        reader.releaseLock();
      }
      return schema.parse(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    } catch {
      throw new Error("renderer_unavailable");
    } finally {
      if (response?.body && !response.body.locked)
        await response.body.cancel().catch(() => undefined);
    }
  }
  upload(input: MediaUploadRequest, signal: AbortSignal) {
    return this.call(
      "/internal/upload",
      mediaUploadRequestSchema.parse(input),
      mediaUploadResponseSchema,
      signal,
    );
  }
  prepare(input: MediaPrepareRequest, signal: AbortSignal) {
    return this.call(
      "/internal/prepare",
      mediaPrepareRequestSchema.parse(input),
      mediaPrepareResponseSchema,
      signal,
    );
  }
  render(input: MediaRenderRequest, signal: AbortSignal) {
    return this.call(
      "/internal/render",
      mediaRenderRequestSchema.parse(input),
      mediaRenderResponseSchema,
      signal,
    );
  }
  select(input: MediaSelectRequest, signal: AbortSignal) {
    return this.call(
      "/internal/select",
      mediaSelectRequestSchema.parse(input),
      mediaSelectResponseSchema,
      signal,
    );
  }
  preview(input: MediaPreviewRequest, signal: AbortSignal) {
    return this.call(
      "/internal/preview",
      mediaPreviewRequestSchema.parse(input),
      mediaPreviewResponseSchema,
      signal,
    );
  }
  previewInfo(input: MediaPreviewAccess, signal: AbortSignal) {
    return this.call(
      "/internal/preview-info",
      mediaPreviewAccessSchema.parse(input),
      mediaPreviewResponseSchema,
      AbortSignal.any([signal, AbortSignal.timeout(30_000)]),
    );
  }
  async previewContent(
    input: MediaPreviewAccess,
    range: string | undefined,
    signal: AbortSignal,
  ) {
    const authorization = await this.identity.authorization();
    signal.throwIfAborted();
    return this.transport(
      this.config.renderer.origin + "/internal/preview-content",
      {
        method: "POST",
        headers: {
          Authorization: authorization,
          "X-Serverless-Authorization": authorization,
          "Content-Type": "application/json",
          ...(range ? { Range: range } : {}),
        },
        body: JSON.stringify(mediaPreviewAccessSchema.parse(input)),
        signal,
        redirect: "error",
      },
    );
  }
  cancel(binding: MediaBinding, signal: AbortSignal) {
    return this.call(
      "/internal/cancel",
      mediaCancelRequestSchema.parse({ binding }),
      z.object({ deleted: z.literal(true) }).strict(),
      signal,
    );
  }
  async proxy(binding: MediaBinding, signal: AbortSignal): Promise<Blob> {
    const body = mediaCancelRequestSchema.parse({ binding });
    const deadline = AbortSignal.any([signal, AbortSignal.timeout(30_000)]);
    let response: Response | undefined;
    try {
      const authorization = await this.identity.authorization();
      deadline.throwIfAborted();
      response = await this.transport(
        this.config.renderer.origin + "/internal/analysis-proxy",
        {
          method: "POST",
          body: JSON.stringify(body),
          signal: deadline,
          redirect: "error",
          headers: {
            Authorization: authorization,
            "X-Serverless-Authorization": authorization,
            "Content-Type": "application/json",
          },
        },
      );
      if (
        !response.ok ||
        response.headers.get("content-type")?.split(";")[0] !== "video/mp4" ||
        !response.body
      )
        throw new Error();
      const reader = response.body.getReader(),
        chunks: Uint8Array[] = [];
      let size = 0;
      try {
        for (;;) {
          const chunk = await reader.read();
          if (chunk.done) break;
          size += chunk.value.byteLength;
          if (size > TEMPORARY_MEDIA_LIMITS.proxyBytes) throw new Error();
          chunks.push(chunk.value);
        }
      } finally {
        await reader.cancel();
        reader.releaseLock();
      }
      return new Blob([Buffer.concat(chunks)], { type: "video/mp4" });
    } catch {
      throw new Error("renderer_unavailable");
    } finally {
      if (response?.body && !response.body.locked)
        await response.body.cancel().catch(() => undefined);
    }
  }
  async releaseProxy(
    binding: MediaBinding,
    signal: AbortSignal,
  ): Promise<void> {
    await this.call(
      "/internal/release-analysis-proxy",
      mediaCancelRequestSchema.parse({ binding }),
      z.object({ deleted: z.literal(true) }).strict(),
      signal,
    );
  }
}
