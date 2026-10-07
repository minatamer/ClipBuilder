import { z } from "zod";
import {
  processingGrantResponseSchema,
  mediaUploadResponseSchema,
  groundedAnalysisResultSchema,
  GROUNDED_ANALYSIS_LIMITS,
  errorEnvelopeSchema,
  sourceAnalysisUploadSchema,
  sourceAnalysisRequestSchema,
  type SourceAnalysisUpload,
  selectedAssemblyRequestSchema,
  selectedAssemblyResultSchema,
  type SelectedAssemblyRequest,
  type SelectedAssemblyResult,
  finalRenderRequestSchema,
  finalRenderResultSchema,
  type FinalRenderRequest,
  type FinalRenderResult,
  retainedSampleAnalysisRequestSchema,
  retainedSampleAnalysisResponseSchema,
  type RetainedSampleAnalysisRequest,
  analysisBundleSchema,
  sampleReplayRequestSchema,
  type OperationId,
  type CloudUploadDiagnostic,
} from "@clipbuilder/contracts";
import { SampleApiFailure, sampleFailure } from "../sample/sample.api";
import {
  transferCloudUpload,
  type CloudUploadAdmission,
  type CloudUploadProgress,
} from "./cloud-upload";
import { reportBrowserDiagnostic } from "../diagnostics/browser.diagnostics";

export function createSourceAnalysisApi(
  transport: typeof fetch = (...args) => fetch(...args),
  diagnostic: (value: CloudUploadDiagnostic) => void = (record) => {
    void reportBrowserDiagnostic({ kind: "cloud-upload", record });
  },
) {
  let csrf = "";
  async function call<T>(
    action: string,
    value: unknown,
    schema: z.ZodType<T>,
    signal: AbortSignal,
  ): Promise<T> {
    let response: Response | undefined;
    try {
      response = await transport(`/api/analysis/${action}`, {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
        body: JSON.stringify(value),
        signal,
      });
      if (response.status === 204) return schema.parse(undefined);
      if (!response.body) throw new Error();
      const reader = response.body.getReader(),
        chunks: ArrayBuffer[] = [];
      let size = 0;
      try {
        for (;;) {
          const chunk = await reader.read();
          if (chunk.done) break;
          size += chunk.value.byteLength;
          if (size > GROUNDED_ANALYSIS_LIMITS.responseBytes) throw new Error();
          chunks.push(new Uint8Array(chunk.value).buffer);
        }
      } finally {
        await reader.cancel();
        reader.releaseLock();
      }
      signal.throwIfAborted();
      const body: unknown = JSON.parse(await new Blob(chunks).text());
      if (!response.ok) {
        const parsed = errorEnvelopeSchema.safeParse(body);
        throw new SampleApiFailure(
          parsed.success ? parsed.data.error : sampleFailure(),
        );
      }
      return schema.parse(body);
    } catch (error) {
      throw error instanceof SampleApiFailure
        ? error
        : new SampleApiFailure(sampleFailure());
    } finally {
      if (response?.body && !response.body.locked)
        await response.body.cancel().catch(() => undefined);
    }
  }
  return {
    sampleReplayOptions: (signal: AbortSignal) =>
      call("sample-replay-options", {}, analysisBundleSchema, signal),
    sampleReplay: (
      generation: string,
      analysisRevision: string,
      turnstileToken: string,
      signal: AbortSignal,
    ) =>
      call(
        "sample-replay",
        sampleReplayRequestSchema.parse({
          generation,
          analysisRevision,
          turnstileToken,
        }),
        groundedAnalysisResultSchema,
        signal,
      ),
    async session(signal: AbortSignal) {
      const grant = await call(
        "session",
        {},
        processingGrantResponseSchema,
        signal,
      );
      csrf = grant.csrfToken;
      return grant;
    },
    assemble: (input: SelectedAssemblyRequest, signal: AbortSignal) =>
      call(
        "assemble",
        selectedAssemblyRequestSchema.parse(input),
        selectedAssemblyResultSchema,
        signal,
      ),
    render: (input: FinalRenderRequest, signal: AbortSignal) =>
      call(
        "render",
        finalRenderRequestSchema.parse(input),
        finalRenderResultSchema,
        signal,
      ),
    renderResult: (input: SelectedAssemblyResult, signal: AbortSignal) =>
      call(
        "render-result",
        selectedAssemblyResultSchema.parse(input),
        finalRenderResultSchema,
        signal,
      ),
    output: (input: FinalRenderResult, signal: AbortSignal) =>
      call(
        "output",
        finalRenderResultSchema.parse(input),
        z
          .object({
            ready: z.literal(true),
            expiresAtMs: z.number().int().positive(),
          })
          .strict(),
        signal,
      ),
    preview: (input: SelectedAssemblyResult, signal: AbortSignal) =>
      call(
        "preview",
        selectedAssemblyResultSchema.parse(input),
        z
          .object({
            ready: z.literal(true),
            expiresAtMs: z.number().int().positive(),
          })
          .strict(),
        signal,
      ),
    async grant(signal: AbortSignal) {
      const result = await call(
        "grant",
        { rightsAcknowledged: true, dataTransferAcknowledged: true },
        processingGrantResponseSchema,
        signal,
      );
      csrf = result.csrfToken;
      return result;
    },
    async upload(input: SourceAnalysisUpload, signal: AbortSignal) {
      return call(
        "upload",
        sourceAnalysisUploadSchema.parse(input),
        mediaUploadResponseSchema,
        signal,
      );
    },
    sample: (input: RetainedSampleAnalysisRequest, signal: AbortSignal) =>
      call(
        "sample",
        retainedSampleAnalysisRequestSchema.parse(input),
        retainedSampleAnalysisResponseSchema,
        signal,
      ),
    async transfer(
      admitted: CloudUploadAdmission,
      file: Blob,
      signal: AbortSignal,
      progress?: (value: CloudUploadProgress) => void,
      operationId?: OperationId,
    ) {
      try {
        return await transferCloudUpload({
          admitted,
          file,
          signal,
          transport,
          ...(progress ? { progress } : {}),
          ...(operationId ? { operationId } : {}),
          diagnostic,
        });
      } catch {
        throw new SampleApiFailure(sampleFailure());
      }
    },
    analyze: (
      generation: string,
      turnstileToken: string,
      signal: AbortSignal,
    ) =>
      call(
        "run",
        sourceAnalysisRequestSchema.parse({ generation, turnstileToken }),
        groundedAnalysisResultSchema,
        signal,
      ),
    async clear(signal: AbortSignal, allowMissingSession = false) {
      const grant = await call(
        "session",
        {},
        processingGrantResponseSchema,
        signal,
      ).catch((error: unknown) => {
        if (
          allowMissingSession &&
          error instanceof SampleApiFailure &&
          error.failure.code === "SESSION_MISSING"
        )
          return null;
        throw error;
      });
      if (!grant) {
        csrf = "";
        return;
      }
      csrf = grant.csrfToken;
      await call("clear", {}, z.undefined(), signal);
      csrf = "";
    },
  };
}
export type SourceAnalysisApi = ReturnType<typeof createSourceAnalysisApi>;
