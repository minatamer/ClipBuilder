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
  mediaOutputResponseSchema,
  rendererFailureResponseSchema,
} from "@clipbuilder/contracts";
import type { BackendConfig } from "../config/env.schema.js";
import { AnalysisDiagnostics } from "../analysis/analysis.diagnostics.js";
import {
  RendererRequestFailure,
  rendererDiagnosticSchema,
  rendererSchemaIssues,
  type RendererDiagnostic,
  type RendererOperation,
} from "./renderer.diagnostics.js";
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
    private readonly diagnostics = new AnalysisDiagnostics(),
  ) {
    if (
      config.nodeEnv === "test" ||
      config.renderer.environment !== "cloud" ||
      !config.renderer.spendApproved ||
      !config.renderer.origin
    )
      throw new Error("renderer_disabled");
  }
  private async exchange<T>(
    operation: RendererOperation,
    input: object,
    signal: AbortSignal,
    consume: (response: Response, detail: RendererDiagnostic) => Promise<T>,
    range?: string,
    handoff = false,
  ): Promise<T> {
    const started = performance.now();
    const body = JSON.stringify(input);
    const detail: RendererDiagnostic = {
      operation,
      attempt: 1,
      phase: "authorization",
      elapsedMs: 0,
      requestBytes: Buffer.byteLength(body),
      responseBytes: 0,
      responseComplete: false,
    };
    const deadline = AbortSignal.any([
      signal,
      AbortSignal.timeout(TEMPORARY_MEDIA_LIMITS.workDeadlineMs),
    ]);
    let response: Response | undefined;
    try {
      deadline.throwIfAborted();
      const authorization = await this.identity.authorization();
      deadline.throwIfAborted();
      detail.phase = "transport";
      response = await this.transport(
        this.config.renderer.origin + "/internal/" + operation,
        {
          method: "POST",
          headers: {
            Authorization: authorization,
            "X-Serverless-Authorization": authorization,
            "Content-Type": "application/json",
            ...(operation === "upload"
              ? { Origin: this.config.frontendOrigin }
              : {}),
            ...(range ? { Range: range } : {}),
          },
          body,
          signal: deadline,
          redirect: "error",
        },
      );
      detail.httpStatus = response.status;
      detail.phase = "http";
      if (!response.ok) {
        detail.failure = "http_rejected";
        if (response.body) {
          const body = await this.readBody(
            response,
            detail,
            TEMPORARY_MEDIA_LIMITS.descriptorBytes,
          );
          try {
            const parsed = rendererFailureResponseSchema.safeParse(
              JSON.parse(body.toString("utf8")),
            );
            if (parsed.success) {
              detail.rendererCode = parsed.data.code;
              detail.rendererStage = parsed.data.stage;
              detail.rendererUnderlyingCode = parsed.data.underlyingCode;
            }
          } catch {
            /* Keep status even when an upstream error is not JSON. */
          }
        }
        throw new Error("renderer_http_rejected");
      }
      const value = await consume(response, detail);
      detail.phase = handoff ? "headers" : "completed";
      detail.elapsedMs = Math.round(performance.now() - started);
      this.diagnostics.rendererRequest(detail);
      return value;
    } catch (error) {
      detail.elapsedMs = Math.round(performance.now() - started);
      if (deadline.aborted)
        detail.failure =
          signal.aborted &&
          !(
            signal.reason instanceof Error &&
            signal.reason.name === "TimeoutError"
          )
            ? "canceled"
            : "timeout";
      detail.failure ??=
        detail.phase === "authorization"
          ? "authorization_failed"
          : detail.phase === "transport"
            ? "transport_failed"
            : detail.phase === "json"
              ? "json_invalid"
              : detail.phase === "schema"
                ? "schema_invalid"
                : "body_read_failed";
      if (error instanceof z.ZodError)
        detail.schemaIssues = rendererSchemaIssues(error);
      if (error instanceof Error) {
        const errorClass = rendererDiagnosticSchema.shape.errorClass
          .unwrap()
          .safeParse(error.name);
        detail.errorClass = errorClass.success ? errorClass.data : "Error";
        if (detail.phase === "authorization") {
          const authorizationError = z
            .object({
              response: z.object({
                status: z.number().int().min(400).max(599),
              }),
            })
            .safeParse(error);
          if (authorizationError.success)
            detail.authorizationHttpStatus =
              authorizationError.data.response.status;
        }
      }
      const failure = new RendererRequestFailure(detail, error);
      this.diagnostics.rendererRequest(detail, failure);
      throw failure;
    } finally {
      if (
        (!handoff || detail.failure) &&
        response?.body &&
        !response.body.locked
      )
        await response.body.cancel().catch(() => undefined);
    }
  }
  private async readBody(
    response: Response,
    detail: RendererDiagnostic,
    maxBytes: number,
  ) {
    if (!response.body) {
      detail.failure = "body_missing";
      throw new Error("renderer_body_missing");
    }
    const reader = response.body.getReader(),
      chunks: Uint8Array[] = [];
    try {
      for (;;) {
        const chunk = await reader.read();
        if (chunk.done) break;
        detail.responseBytes += chunk.value.byteLength;
        if (detail.responseBytes > maxBytes) {
          detail.failure = "body_limit";
          throw new Error("renderer_body_limit");
        }
        chunks.push(chunk.value);
      }
      detail.responseComplete = true;
      return Buffer.concat(chunks);
    } finally {
      await reader.cancel().catch(() => undefined);
      reader.releaseLock();
    }
  }
  private call<T>(
    path: string,
    input: object,
    schema: z.ZodType<T>,
    signal: AbortSignal,
  ): Promise<T> {
    const operation = rendererDiagnosticSchema.shape.operation.parse(
      path.slice("/internal/".length),
    );
    return this.exchange(operation, input, signal, async (response, detail) => {
      detail.phase = "body";
      const body = await this.readBody(
        response,
        detail,
        TEMPORARY_MEDIA_LIMITS.descriptorBytes,
      );
      detail.phase = "json";
      const value: unknown = JSON.parse(body.toString("utf8"));
      detail.phase = "schema";
      return schema.parse(value);
    });
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
    return this.artifactContent("preview", input, range, signal);
  }
  outputInfo(input: MediaPreviewAccess, signal: AbortSignal) {
    return this.call(
      "/internal/output-info",
      mediaPreviewAccessSchema.parse(input),
      mediaOutputResponseSchema,
      AbortSignal.any([signal, AbortSignal.timeout(30_000)]),
    );
  }
  outputContent(
    input: MediaPreviewAccess,
    range: string | undefined,
    signal: AbortSignal,
  ) {
    return this.artifactContent("output", input, range, signal);
  }
  private async artifactContent(
    kind: "preview" | "output",
    input: MediaPreviewAccess,
    range: string | undefined,
    signal: AbortSignal,
  ) {
    return this.exchange(
      `${kind}-content`,
      mediaPreviewAccessSchema.parse(input),
      signal,
      async (response) => response,
      range,
      true,
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
  audio(binding: MediaBinding, signal: AbortSignal): Promise<Blob> {
    return this.analysisContent(binding, signal, "audio/m4a");
  }
  proxy(binding: MediaBinding, signal: AbortSignal): Promise<Blob> {
    return this.analysisContent(binding, signal, "video/mp4");
  }
  private async analysisContent(
    binding: MediaBinding,
    signal: AbortSignal,
    contentType: "video/mp4" | "audio/m4a",
  ): Promise<Blob> {
    const body = mediaCancelRequestSchema.parse({ binding });
    const deadline = AbortSignal.any([signal, AbortSignal.timeout(30_000)]);
    return this.exchange(
      contentType === "audio/m4a" ? "analysis-audio" : "analysis-proxy",
      body,
      deadline,
      async (response, detail) => {
        if (
          response.headers.get("content-type")?.split(";")[0] !== contentType
        ) {
          detail.failure = "content_type_invalid";
          throw new Error("renderer_content_type_invalid");
        }
        detail.phase = "body";
        const bytes = await this.readBody(
          response,
          detail,
          TEMPORARY_MEDIA_LIMITS.proxyBytes,
        );
        return new Blob([bytes], { type: contentType });
      },
    );
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
