import { normalizedAnalysisSchema } from "./analysis.reconciliation.js";
import { CANDIDATE_SELECTION_POLICY } from "./analysis.prompt.js";
import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { GoogleGenAI, type GenerateContentConfig } from "@google/genai";
import { z } from "zod";
import {
  GROUNDED_ANALYSIS_LIMITS,
  TEMPORARY_MEDIA_LIMITS,
} from "@clipbuilder/contracts";
import type { BackendConfig } from "../config/env.schema.js";
import { ApplicationError } from "../http/errorMapper.js";
import { AnalysisDiagnostics } from "./analysis.diagnostics.js";
import { googleOperation } from "./gemini.diagnostics.js";
import {
  TRANSCRIBE_MODEL,
  normalizeTranscription,
} from "./transcribe.normalization.js";
import { CANDIDATE_GENERATION_SCHEMA_POLICY } from "./analysis.provider-shape.js";
import type { MediaDescriptor } from "@clipbuilder/contracts";

export interface AnalysisProvider {
  analyze(
    audio: Blob,
    signal: AbortSignal,
    scope: string,
    media: MediaDescriptor,
  ): Promise<unknown>;
  cleanup?(signal: AbortSignal, scope?: string): Promise<void>;
}
export interface GeminiTransport {
  upload(name: string, proxy: Blob, signal: AbortSignal): Promise<unknown>;
  get(name: string, signal: AbortSignal): Promise<unknown>;
  generate(
    uri: string,
    signal: AbortSignal,
    task: GeminiTask,
  ): Promise<{ text: string | undefined; finished: boolean }>;
  transcribe(uri: string, signal: AbortSignal): Promise<unknown>;
  candidates(
    prompt: string,
    signal: AbortSignal,
  ): Promise<{ text: string | undefined; finished: boolean }>;
  delete(name: string, signal: AbortSignal): Promise<void>;
}
export type GeminiTask = {
  policy: string;
  prompt: string;
  schema: z.ZodType;
  videoFps: number;
};
const fileSchema = z.object({
  name: z.string(),
  uri: z.string().optional(),
  mimeType: z.enum(["video/mp4", "audio/m4a"]).optional(),
  state: z.enum(["PROCESSING", "ACTIVE", "FAILED"]),
});

class GoogleFilesFailure extends Error {
  constructor(
    readonly phase:
      | "upload_start"
      | "upload_finalize"
      | "delete"
      | "delete_confirm"
      | "transcription",
    readonly status: number,
    readonly neverCreated = false,
  ) {
    super("google_files_request_failed");
  }
  get ruleId() {
    return `google_files_${this.phase}_http_${this.status}`;
  }
}
function composeGoogleClient(
  config: BackendConfig,
  transport?: typeof fetch,
  diagnostics = new AnalysisDiagnostics(),
) {
  if (
    config.nodeEnv === "test" ||
    config.providerMode !== "live" ||
    !config.paidDemoEnabled ||
    !config.features.liveAnalysis ||
    !config.gemini.apiKey ||
    !config.gemini.transferApproved ||
    !config.gemini.paidProjectConfirmed
  )
    throw new ApplicationError({ code: "FEATURE_DISABLED" });
  const rawFetch = transport ?? fetch;
  const boundedFetch: typeof fetch = async (url, options) => {
    const started = performance.now();
    const operation = googleOperation(url, options?.method);
    try {
      const response = await rawFetch(url, { ...options, redirect: "error" });
      if (!response.body) {
        diagnostics.googleHttpResponse(
          operation,
          response.status,
          performance.now() - started,
          undefined,
          response.headers,
        );
        return response;
      }
      const reader = response.body.getReader(),
        chunks: Uint8Array[] = [];
      let size = 0,
        incompleteCaptured = false;
      try {
        for (;;) {
          const chunk = await reader.read();
          if (chunk.done) break;
          size += chunk.value.byteLength;
          if (size > GROUNDED_ANALYSIS_LIMITS.responseBytes) {
            incompleteCaptured = true;
            diagnostics.privateGoogleResponse(
              operation,
              response.status,
              () =>
                Buffer.concat(
                  [...chunks, chunk.value],
                  GROUNDED_ANALYSIS_LIMITS.responseBytes,
                ),
              response.headers,
              false,
              size,
            );
            throw new Error("provider_response_rejected");
          }
          chunks.push(chunk.value);
        }
        const body = Buffer.concat(chunks);
        const bounded = new Response(body, {
          status: response.status,
          headers: response.headers,
        });
        diagnostics.googleHttpResponse(
          operation,
          response.status,
          performance.now() - started,
          body,
          response.headers,
        );
        return bounded;
      } catch (error) {
        if (!incompleteCaptured)
          diagnostics.privateGoogleResponse(
            operation,
            response.status,
            () => Buffer.concat(chunks),
            response.headers,
            false,
            size,
          );
        throw error;
      } finally {
        await reader.cancel().catch(() => undefined);
        reader.releaseLock();
      }
    } catch (error) {
      diagnostics.googleHttpFailure(
        operation,
        performance.now() - started,
        error,
      );
      throw error;
    }
  };
  const ai = new GoogleGenAI({
    apiKey: config.gemini.apiKey,
    httpOptions: {
      timeout: config.gemini.timeoutMs,
      retryOptions: { attempts: 1 },
      fetch: boundedFetch,
    },
  });
  return { ai, boundedFetch };
}

function generationConfig(
  config: BackendConfig,
  abortSignal: AbortSignal,
  policy: string,
): GenerateContentConfig {
  return {
    abortSignal,
    systemInstruction: policy,
    responseMimeType: "application/json",
    maxOutputTokens: config.gemini.maxOutputTokens,
    candidateCount: 1,
    tools: [],
  };
}

export function composeGeminiTransport(
  config: BackendConfig,
  transport?: typeof fetch,
  diagnostics = new AnalysisDiagnostics(),
): GeminiTransport {
  const { ai, boundedFetch } = composeGoogleClient(
    config,
    transport,
    diagnostics,
  );
  return {
    async upload(name, file, signal) {
      // SDK 2.25.0's uploader has independent chunk retries and does not forward
      // abortSignal throughout. Use the documented two-request Files transport.
      let start: Response | undefined, final: Response | undefined;
      try {
        start = await boundedFetch(
          "https://generativelanguage.googleapis.com/upload/v1beta/files",
          {
            method: "POST",
            signal,
            headers: {
              "x-goog-api-key": config.gemini.apiKey!,
              "Content-Type": "application/json",
              "X-Goog-Upload-Protocol": "resumable",
              "X-Goog-Upload-Command": "start",
              "X-Goog-Upload-Header-Content-Length": String(file.size),
              "X-Goog-Upload-Header-Content-Type": file.type,
            },
            body: JSON.stringify({ file: { name } }),
          },
        );
        if (!start.ok)
          throw new GoogleFilesFailure(
            "upload_start",
            start.status,
            [400, 401, 403, 404, 413, 429].includes(start.status),
          );
        const capability = new URL(
          start.headers.get("x-goog-upload-url") ?? "",
        );
        if (
          capability.origin !== "https://generativelanguage.googleapis.com" ||
          capability.pathname !== "/upload/v1beta/files" ||
          capability.username ||
          capability.password
        )
          throw new Error("provider_upload_rejected");
        signal.throwIfAborted();
        final = await boundedFetch(capability.toString(), {
          method: "POST",
          signal,
          body: file,
          headers: {
            "X-Goog-Upload-Offset": "0",
            "X-Goog-Upload-Command": "upload, finalize",
            "Content-Type": file.type,
          },
        });
        if (!final.ok)
          throw new GoogleFilesFailure("upload_finalize", final.status);
        if (final.headers.get("x-goog-upload-status") !== "final")
          throw new Error("provider_upload_rejected");
        return z.object({ file: fileSchema }).parse(await final.json()).file;
      } finally {
        await start?.body?.cancel().catch(() => undefined);
        if (final?.body && !final.body.locked)
          await final.body.cancel().catch(() => undefined);
      }
    },
    get: (name, abortSignal) => ai.files.get({ name, config: { abortSignal } }),
    async generate(uri, abortSignal, task) {
      if (!config.features.liveAssembly)
        throw new ApplicationError({ code: "FEATURE_DISABLED" });
      const responseJsonSchema = z.toJSONSchema(task.schema, { io: "input" });
      diagnostics.generationRequest({
        purpose: "selected_plan",
        schemaPolicy: "json_only",
        schemaLocation: "prompt",
        model: config.gemini.model,
        maxOutputTokens: config.gemini.maxOutputTokens,
        timeoutMs: config.gemini.timeoutMs,
        schema: responseJsonSchema,
      });
      const response = await ai.models.generateContent({
        model: config.gemini.model,
        contents: [
          {
            role: "user",
            parts: [
              {
                fileData: { fileUri: uri, mimeType: "video/mp4" },
                videoMetadata: { fps: task.videoFps },
              },
              {
                text: `${task.prompt}\nExpected JSON response schema (guidance; return only the JSON object):\n${JSON.stringify(responseJsonSchema)}`,
              },
            ],
          },
        ],
        config: generationConfig(config, abortSignal, task.policy),
      });
      const candidate = response.candidates?.[0];
      return {
        text: response.text,
        finished:
          response.candidates?.length === 1 &&
          candidate?.finishReason === "STOP" &&
          !candidate.content?.parts?.some(
            (part) =>
              part.functionCall ||
              part.executableCode ||
              part.codeExecutionResult,
          ),
      };
    },
    async transcribe(uri, signal) {
      diagnostics.transcriptionRequest(config.gemini.timeoutMs);
      const response = await boundedFetch(
        "https://generativelanguage.googleapis.com/v1beta/interactions",
        {
          method: "POST",
          signal,
          headers: {
            "x-goog-api-key": config.gemini.apiKey!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: TRANSCRIBE_MODEL,
            store: false,
            background: false,
            stream: false,
            input: [{ type: "audio", uri, mime_type: "audio/m4a" }],
            generation_config: {
              transcription_config: {
                language_codes: ["en-US"],
                mode: {
                  type: "verbatim",
                  diarization_mode: "speaker",
                  timestamp_granularities: ["word"],
                },
              },
            },
          }),
        },
      );
      if (!response.ok)
        throw new GoogleFilesFailure("transcription", response.status);
      return response.json();
    },
    async candidates(prompt, abortSignal) {
      diagnostics.generationRequest({
        purpose: "candidate_selection",
        schemaPolicy: CANDIDATE_GENERATION_SCHEMA_POLICY,
        model: config.gemini.model,
        maxOutputTokens: config.gemini.maxOutputTokens,
        timeoutMs: config.gemini.timeoutMs,
        schema: undefined,
      });
      const response = await ai.models.generateContent({
        model: config.gemini.model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: generationConfig(
          config,
          abortSignal,
          CANDIDATE_SELECTION_POLICY,
        ),
      });
      const candidate = response.candidates?.[0];
      return {
        text: response.text,
        finished:
          response.candidates?.length === 1 &&
          candidate?.finishReason === "STOP" &&
          !candidate.content?.parts?.some(
            (part) =>
              part.functionCall ||
              part.executableCode ||
              part.codeExecutionResult,
          ),
      };
    },
    async delete(name, abortSignal) {
      if (!/^files\/[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/.test(name))
        throw new Error("provider_file_rejected");
      const url = `https://generativelanguage.googleapis.com/v1beta/${name}`;
      let deleted: Response | undefined, confirmed: Response | undefined;
      try {
        // Google can return 403 for a missing private file. That status alone
        // cannot prove deletion; an authorized complete list must confirm it.
        deleted = await boundedFetch(url, {
          method: "DELETE",
          signal: abortSignal,
          headers: { "x-goog-api-key": config.gemini.apiKey! },
        });
        if (!deleted.ok && ![403, 404].includes(deleted.status))
          throw new GoogleFilesFailure("delete", deleted.status);
        abortSignal.throwIfAborted();
        confirmed = await boundedFetch(url, {
          method: "GET",
          signal: abortSignal,
          headers: { "x-goog-api-key": config.gemini.apiKey! },
        });
        if (confirmed.status === 403) {
          let pageToken: string | undefined;
          const listSchema = z.object({
            files: z
              .array(z.object({ name: z.string().min(1).max(80) }))
              .max(100)
              .default([]),
            nextPageToken: z.string().min(1).max(2048).optional(),
          });
          for (let page = 0; page < 3; page++) {
            abortSignal.throwIfAborted();
            const listUrl = new URL(
              "https://generativelanguage.googleapis.com/v1beta/files",
            );
            listUrl.searchParams.set("pageSize", "100");
            if (pageToken) listUrl.searchParams.set("pageToken", pageToken);
            const listed = await boundedFetch(listUrl, {
              method: "GET",
              signal: abortSignal,
              headers: { "x-goog-api-key": config.gemini.apiKey! },
            });
            try {
              if (!listed.ok)
                throw new GoogleFilesFailure("delete_confirm", listed.status);
              const files = listSchema.parse(await listed.json());
              if (files.files.some((file) => file.name === name))
                throw new GoogleFilesFailure("delete_confirm", 403);
              pageToken = files.nextPageToken;
              if (!pageToken) return;
            } finally {
              await listed.body?.cancel().catch(() => undefined);
            }
          }
          throw new Error("provider_cleanup_list_incomplete");
        }
        if (confirmed.status !== 404)
          throw new GoogleFilesFailure("delete_confirm", confirmed.status);
      } finally {
        await deleted?.body?.cancel().catch(() => undefined);
        await confirmed?.body?.cancel().catch(() => undefined);
      }
    },
  };
}

type PendingGoogleFile = {
  scope: string;
  uploadSettled: Promise<void>;
  deletion: Promise<void> | null;
  neverCreated: boolean;
};
export class GeminiAnalysisProvider {
  private pendingFiles = new Map<string, PendingGoogleFile>();
  constructor(
    private readonly transport: GeminiTransport,
    private readonly timeoutMs: number,
    private readonly wait: (
      ms: number,
      signal: AbortSignal,
    ) => Promise<void> = async (ms, signal) => {
      await delay(ms, undefined, { signal });
    },
    private readonly diagnostics = new AnalysisDiagnostics(),
  ) {}
  analyze(
    proxy: Blob,
    signal: AbortSignal,
    scope: string,
    task: GeminiTask,
  ): Promise<unknown> {
    return this.executeFile(proxy, signal, scope, task);
  }
  async transcribe(audio: Blob, signal: AbortSignal, scope: string) {
    return normalizedAnalysisSchema
      .omit({ candidates: true })
      .parse(await this.executeFile(audio, signal, scope));
  }
  async candidates(prompt: string, signal: AbortSignal) {
    if (this.pendingFiles.size)
      throw new ApplicationError({ code: "CLEANUP_PENDING" });
    const deadline = AbortSignal.any([
      signal,
      AbortSignal.timeout(this.timeoutMs),
    ]);
    let phase: "generation" | "validation" = "generation";
    try {
      deadline.throwIfAborted();
      const result = await this.diagnostics.step("candidate_generation", () =>
        this.transport.candidates(prompt, deadline),
      );
      this.diagnostics.privateGenerationResult(result);
      deadline.throwIfAborted();
      phase = "validation";
      return this.diagnostics.check("candidate_validation", () => {
        const text = result.text ?? "";
        if (Buffer.byteLength(text) > GROUNDED_ANALYSIS_LIMITS.responseBytes)
          throw new Error("candidate_response_limit");
        try {
          const decoded: unknown = JSON.parse(text);
          this.diagnostics.candidateJsonDecoded(true);
          return decoded;
        } catch {
          this.diagnostics.candidateJsonDecoded(false);
          this.diagnostics.privateStageOutput("candidate_decoding", {
            reason: "json_unavailable",
          });
          return null;
        }
      });
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError({
        code: deadline.aborted
          ? signal.aborted
            ? "CLIENT_ABORTED"
            : "OPERATION_TIMEOUT"
          : phase === "validation"
            ? "MODEL_OUTPUT_REJECTED"
            : "ANALYSIS_PROVIDER_FAILED",
      });
    }
  }
  private async executeFile(
    proxy: Blob,
    signal: AbortSignal,
    scope: string,
    task?: GeminiTask,
  ): Promise<unknown> {
    if (this.pendingFiles.size)
      throw new ApplicationError({ code: "CLEANUP_PENDING" });
    if (
      proxy.type !== (task ? "video/mp4" : "audio/m4a") ||
      proxy.size <= 0 ||
      proxy.size > TEMPORARY_MEDIA_LIMITS.proxyBytes
    )
      throw new ApplicationError({ code: "INVALID_REQUEST" });
    const deadline = AbortSignal.any([
      signal,
      AbortSignal.timeout(this.timeoutMs),
    ]);
    const name = `files/cb-${randomUUID()}`;
    let settleUpload = () => {};
    const pending: PendingGoogleFile = {
      scope,
      uploadSettled: new Promise<void>((resolve) => {
        settleUpload = resolve;
      }),
      deletion: null,
      neverCreated: false,
    };
    let registered = false;
    let value: unknown;
    let failure: ApplicationError | undefined;
    let phase: "upload" | "processing" | "generation" | "validation" = "upload";
    try {
      deadline.throwIfAborted();
      // Preassigned opaque name lets cleanup target even an uncertain upload response.
      this.pendingFiles.set(name, pending);
      registered = true;
      let uploaded: unknown;
      try {
        uploaded = await this.diagnostics.step("gemini_upload", () =>
          this.transport.upload(name, proxy, deadline),
        );
      } catch (error) {
        if (error instanceof GoogleFilesFailure && error.neverCreated) {
          pending.neverCreated = true;
          this.pendingFiles.delete(name);
        }
        throw error;
      } finally {
        settleUpload();
      }
      let file = fileSchema.parse(uploaded);
      phase = "processing";
      const uri = await this.diagnostics.step("gemini_processing", async () => {
        for (let polls = 0; file.state === "PROCESSING"; polls++) {
          if (
            file.name !== name ||
            (file.mimeType !== undefined && file.mimeType !== proxy.type)
          )
            throw new Error();
          if (polls >= GROUNDED_ANALYSIS_LIMITS.maxFilePolls) throw new Error();
          await this.wait(GROUNDED_ANALYSIS_LIMITS.filePollMs, deadline);
          file = fileSchema.parse(await this.transport.get(name, deadline));
        }
        if (
          file.name !== name ||
          file.state !== "ACTIVE" ||
          (file.mimeType !== undefined && file.mimeType !== proxy.type) ||
          file.uri !==
            `https://generativelanguage.googleapis.com/v1beta/${name}`
        )
          throw new Error();
        return file.uri;
      });
      deadline.throwIfAborted();
      phase = "generation";
      const result = await this.diagnostics.step(
        task ? "gemini_generation" : "transcription_generation",
        () =>
          task
            ? this.transport.generate(uri, deadline, task)
            : this.transport.transcribe(uri, deadline),
      );
      this.diagnostics.privateStageOutput(
        task ? "selected_plan_raw" : "transcription_raw",
        result,
      );
      deadline.throwIfAborted();
      phase = "validation";
      value = this.diagnostics.check(
        task ? "gemini_validation" : "transcription_normalization",
        () => {
          if (!task) {
            const normalized = normalizeTranscription(result, this.diagnostics);
            this.diagnostics.privateStageOutput(
              "transcription_normalized",
              normalized,
            );
            return normalizedAnalysisSchema
              .omit({ candidates: true })
              .parse(normalized);
          }
          const generated = z
            .object({ text: z.string().min(1), finished: z.literal(true) })
            .parse(result);
          this.diagnostics.privateGenerationResult(generated);
          const decoded: unknown = JSON.parse(generated.text);
          this.diagnostics.privateStageOutput(
            "selected_plan_json_decoded",
            decoded,
          );
          return decoded;
        },
      );
      this.diagnostics.privateStageOutput(
        task ? "selected_plan_normalized" : "transcription_normalized",
        value,
      );
    } catch (error) {
      const status =
        error instanceof Error &&
        "status" in error &&
        typeof error.status === "number" &&
        Number.isInteger(error.status) &&
        error.status >= 400 &&
        error.status <= 599
          ? error.status
          : undefined;
      if (task && phase === "validation" && !deadline.aborted) {
        this.diagnostics.critique("gemini_validation", error);
        value = null;
      } else {
        failure = new ApplicationError({
          code: deadline.aborted
            ? signal.aborted
              ? "CLIENT_ABORTED"
              : "OPERATION_TIMEOUT"
            : phase === "validation" || phase === "processing"
              ? "MODEL_OUTPUT_REJECTED"
              : "ANALYSIS_PROVIDER_FAILED",
          ruleId:
            error instanceof GoogleFilesFailure
              ? error.ruleId
              : `google_${phase}_${status === undefined ? "failed" : `http_${status}`}`,
        });
        this.diagnostics.failure(
          phase === "upload"
            ? "gemini_upload"
            : phase === "processing"
              ? "gemini_processing"
              : phase === "generation"
                ? task
                  ? "gemini_generation"
                  : "transcription_generation"
                : "gemini_validation",
          failure,
        );
      }
    }
    if (registered) {
      try {
        await this.diagnostics.step("gemini_cleanup", () =>
          this.deleteFile(
            name,
            pending,
            AbortSignal.timeout(GROUNDED_ANALYSIS_LIMITS.cleanupMs),
          ),
        );
      } catch (error) {
        // Cleanup has its own diagnostics and retained deletion obligation.
        // Never replace the primary analysis failure in the response.
        const cleanupRule =
          error instanceof GoogleFilesFailure
            ? error.ruleId
            : "google_files_cleanup_failed";
        const cleanupFailure = new ApplicationError({
          code: "CLEANUP_PENDING",
          ruleId: cleanupRule,
        });
        this.diagnostics.failure("gemini_cleanup", cleanupFailure);
        failure ??= cleanupFailure;
      }
    }
    if (failure) throw failure;
    return value;
  }
  async cleanup(signal: AbortSignal, scope = "local") {
    for (const [name, pending] of this.pendingFiles) {
      if (pending.scope !== scope) continue;
      signal.throwIfAborted();
      let abort = () => {};
      const canceled = new Promise<never>((_, reject) => {
        abort = () => reject(new ApplicationError({ code: "CLIENT_ABORTED" }));
        signal.addEventListener("abort", abort, { once: true });
      });
      try {
        await Promise.race([pending.uploadSettled, canceled]);
      } finally {
        signal.removeEventListener("abort", abort);
      }
      signal.throwIfAborted();
      try {
        await this.deleteFile(name, pending, signal);
      } catch (error) {
        throw new ApplicationError({
          code: "CLEANUP_PENDING",
          ruleId:
            error instanceof GoogleFilesFailure
              ? error.ruleId
              : "google_files_cleanup_failed",
        });
      }
    }
  }
  private deleteFile(
    name: string,
    pending: PendingGoogleFile,
    signal: AbortSignal,
  ) {
    if (pending.neverCreated) return Promise.resolve();
    pending.deletion ??= this.transport.delete(name, signal).then(
      () => {
        this.pendingFiles.delete(name);
      },
      (error: unknown) => {
        pending.deletion = null;
        throw error;
      },
    );
    return pending.deletion;
  }
}
