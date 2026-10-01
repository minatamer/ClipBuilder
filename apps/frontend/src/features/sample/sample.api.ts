import {
  analysisBundleSchema,
  analysisIdSchema,
  analysisRequestSchema,
  assemblyBundleSchema,
  assemblyIdSchema,
  assemblyRequestSchema,
  assemblyStartResponseSchema,
  errorEnvelopeSchema,
  developmentUploadResponseSchema,
  operationStatusSchema,
  operationIdSchema,
  publicConfigResponseSchema,
  renderRequestSchema,
  renderStartResponseSchema,
  uploadAuthorizeRequestSchema,
  uploadCompleteRequestSchema,
  SAFE_ERROR_MESSAGES,
  sessionResponseSchema,
  startSessionResponseSchema,
  type AssemblyRequest,
  type RenderRequest,
  type UploadAuthorizeRequest,
  type SafeError,
} from "@clipbuilder/contracts";
import type { ZodType } from "zod";

export class SampleApiFailure extends Error {
  constructor(readonly failure: SafeError) {
    super(failure.message);
    this.name = "SampleApiFailure";
  }
}

export function sampleFailure(): SafeError {
  return {
    code: "INTERNAL_ERROR",
    message: SAFE_ERROR_MESSAGES.INTERNAL_ERROR,
    retryable: true,
    requestId: `req_${"0".repeat(32)}`,
  };
}

export function createSampleApi(
  transport: typeof fetch = (...args) => fetch(...args),
) {
  async function read<T>(
    path: string,
    schema: ZodType<T>,
    signal: AbortSignal,
    body?: unknown,
  ): Promise<T> {
    try {
      if (signal.aborted) throw new SampleApiFailure(sampleFailure());
      const response = await transport(`/api/sample/${path}`, {
        method: body === undefined ? "GET" : "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal,
      });
      const value: unknown = await response.json();
      if (signal.aborted) throw new SampleApiFailure(sampleFailure());
      if (!response.ok) {
        const parsed = errorEnvelopeSchema.safeParse(value);
        throw new SampleApiFailure(
          parsed.success ? parsed.data.error : sampleFailure(),
        );
      }
      const parsed = schema.safeParse(value);
      if (!parsed.success) throw new SampleApiFailure(sampleFailure());
      return parsed.data;
    } catch (error) {
      throw error instanceof SampleApiFailure
        ? error
        : new SampleApiFailure(sampleFailure());
    }
  }

  async function evidence(sessionId: string, signal: AbortSignal) {
    try {
      const session = await read("session", sessionResponseSchema, signal);
      if (session.sessionId !== sessionId)
        throw new SampleApiFailure(sampleFailure());
      return session;
    } catch (error) {
      if (
        error instanceof SampleApiFailure &&
        error.failure.code === "SESSION_MISSING"
      )
        return null;
      throw error;
    }
  }

  function validateRequest<T>(schema: ZodType<T>, value: unknown): T {
    const parsed = schema.safeParse(value);
    if (!parsed.success) throw new SampleApiFailure(sampleFailure());
    return parsed.data;
  }

  const analysis = async (analysisId: string, signal: AbortSignal) => {
    if (!analysisIdSchema.safeParse(analysisId).success)
      throw new SampleApiFailure(sampleFailure());
    return read(`analysis/${analysisId}`, analysisBundleSchema, signal);
  };

  return {
    evidence,
    analysis,
    config: (signal: AbortSignal) =>
      read("config", publicConfigResponseSchema, signal),
    async startUpload(signal: AbortSignal) {
      const started = await read(
        "sessions",
        startSessionResponseSchema,
        signal,
        { mode: "upload" },
      );
      const server = await evidence(started.sessionId, signal);
      if (
        started.mode !== "upload" ||
        server === null ||
        server.mode !== "upload" ||
        server.expiresAt !== started.expiresAt
      )
        throw new SampleApiFailure(sampleFailure());
      return {
        sessionId: server.sessionId,
        mode: server.mode,
        expiresAt: server.expiresAt,
        remaining: server.remaining,
      };
    },
    authorize: async (request: UploadAuthorizeRequest, signal: AbortSignal) =>
      read(
        "upload/authorize",
        developmentUploadResponseSchema,
        signal,
        validateRequest(uploadAuthorizeRequestSchema, request),
      ),
    completeUpload: async (
      uploadId: string,
      observedBytes: number,
      signal: AbortSignal,
    ) =>
      read(
        "upload/complete",
        operationStatusSchema,
        signal,
        validateRequest(uploadCompleteRequestSchema, {
          uploadId,
          observedBytes,
        }),
      ),
    analyze: async (mediaId: string, signal: AbortSignal) =>
      read(
        "analyze",
        operationStatusSchema,
        signal,
        validateRequest(analysisRequestSchema, {
          mediaId,
          context: { targetPlatform: "generic-vertical" },
          turnstileToken: "local-synthetic-fixture",
        }),
      ),
    async poll(operationId: string, signal: AbortSignal) {
      if (!operationIdSchema.safeParse(operationId).success)
        throw new SampleApiFailure(sampleFailure());
      const result = await read(
        `operations/${operationId}`,
        operationStatusSchema,
        signal,
      );
      if (result.operationId !== operationId)
        throw new SampleApiFailure(sampleFailure());
      return result;
    },
    async assembly(assemblyId: string, signal: AbortSignal) {
      if (!assemblyIdSchema.safeParse(assemblyId).success)
        throw new SampleApiFailure(sampleFailure());
      const result = await read(
        `assembly/${assemblyId}`,
        assemblyBundleSchema,
        signal,
      );
      if (result.assemblyId !== assemblyId)
        throw new SampleApiFailure(sampleFailure());
      return result;
    },
    async render(request: RenderRequest, signal: AbortSignal) {
      const result = await read(
        "render",
        renderStartResponseSchema,
        signal,
        validateRequest(renderRequestSchema, request),
      );
      if (result.operation.kind !== "render")
        throw new SampleApiFailure(sampleFailure());
      return result;
    },
    async start(signal: AbortSignal) {
      const started = await read(
        "sessions",
        startSessionResponseSchema,
        signal,
        { mode: "sample" },
      );
      const server = await evidence(started.sessionId, signal);
      if (
        server === null ||
        started.mode !== "sample" ||
        server.mode !== "sample" ||
        started.sampleAnalysisId === undefined
      )
        throw new SampleApiFailure(sampleFailure());
      const bundle = await analysis(started.sampleAnalysisId, signal);
      if (
        server.analysisId !== bundle.analysisId ||
        server.analysisRevision !== bundle.revision ||
        server.expiresAt !== started.expiresAt
      )
        throw new SampleApiFailure(sampleFailure());
      return {
        identity: {
          sessionId: server.sessionId,
          mode: server.mode,
          expiresAt: server.expiresAt,
          remaining: server.remaining,
        },
        analysis: bundle,
      };
    },
    async build(request: AssemblyRequest, signal: AbortSignal) {
      const parsed = assemblyRequestSchema.safeParse(request);
      if (!parsed.success) throw new SampleApiFailure(sampleFailure());
      const result = await read(
        "assemble",
        assemblyStartResponseSchema,
        signal,
        parsed.data,
      );
      if (result.operation.kind !== "assembly")
        throw new SampleApiFailure(sampleFailure());
      return result;
    },
    async clear(signal: AbortSignal) {
      try {
        if (signal.aborted) throw new SampleApiFailure(sampleFailure());
        const response = await transport("/api/sample/clear", {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          signal,
        });
        if (signal.aborted || response.status !== 204)
          throw new SampleApiFailure(sampleFailure());
      } catch (error) {
        throw error instanceof SampleApiFailure
          ? error
          : new SampleApiFailure(sampleFailure());
      }
    },
  };
}

export type SampleApi = ReturnType<typeof createSampleApi>;
export const sampleApi = createSampleApi();
