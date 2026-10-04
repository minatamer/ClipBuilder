import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import {
  GROUNDED_ANALYSIS_LIMITS,
  TEMPORARY_MEDIA_LIMITS,
} from "@clipbuilder/contracts";
import type { BackendConfig } from "../config/env.schema.js";
import { ApplicationError } from "../http/errorMapper.js";
import {
  geminiWireSchema,
  normalizeGeminiAnalysis,
} from "./analysis.provider-shape.js";
import { ANALYSIS_POLICY, ANALYSIS_REQUEST } from "./analysis.prompt.js";

export interface AnalysisProvider {
  analyze(proxy: Blob, signal: AbortSignal, scope?: string): Promise<unknown>;
  cleanup?(signal: AbortSignal, scope?: string): Promise<void>;
}
export interface GeminiTransport {
  upload(name: string, proxy: Blob, signal: AbortSignal): Promise<unknown>;
  get(name: string, signal: AbortSignal): Promise<unknown>;
  generate(
    uri: string,
    signal: AbortSignal,
    task?: GeminiTask,
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
  mimeType: z.literal("video/mp4").optional(),
  state: z.enum(["PROCESSING", "ACTIVE", "FAILED"]),
});
export function composeGeminiTransport(
  config: BackendConfig,
  transport?: typeof fetch,
): GeminiTransport {
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
    const response = await rawFetch(url, { ...options, redirect: "error" });
    if (!response.body) return response;
    const reader = response.body.getReader(),
      chunks: Uint8Array[] = [];
    let size = 0;
    try {
      for (;;) {
        const chunk = await reader.read();
        if (chunk.done) break;
        size += chunk.value.byteLength;
        if (size > GROUNDED_ANALYSIS_LIMITS.responseBytes)
          throw new Error("provider_response_rejected");
        chunks.push(chunk.value);
      }
      return new Response(Buffer.concat(chunks), {
        status: response.status,
        headers: response.headers,
      });
    } finally {
      await reader.cancel();
      reader.releaseLock();
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
              "X-Goog-Upload-Header-Content-Type": "video/mp4",
            },
            body: JSON.stringify({ file: { name } }),
          },
        );
        const capability = new URL(
          start.headers.get("x-goog-upload-url") ?? "",
        );
        if (
          !start.ok ||
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
            "Content-Type": "video/mp4",
          },
        });
        if (!final.ok || final.headers.get("x-goog-upload-status") !== "final")
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
      if (task && !config.features.liveAssembly)
        throw new ApplicationError({ code: "FEATURE_DISABLED" });
      const response = await ai.models.generateContent({
        model: config.gemini.model,
        contents: [
          {
            role: "user",
            parts: [
              {
                fileData: { fileUri: uri, mimeType: "video/mp4" },
                ...(task ? { videoMetadata: { fps: task.videoFps } } : {}),
              },
              {
                text: task?.prompt ?? ANALYSIS_REQUEST,
              },
            ],
          },
        ],
        config: {
          abortSignal,
          systemInstruction: task?.policy ?? ANALYSIS_POLICY,
          responseMimeType: "application/json",
          responseJsonSchema: z.toJSONSchema(task?.schema ?? geminiWireSchema, {
            io: "input",
          }),
          maxOutputTokens: config.gemini.maxOutputTokens,
          candidateCount: 1,
          tools: [],
        },
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
      const missing = (error: unknown) =>
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        error.status === 404;
      try {
        await ai.files.delete({ name, config: { abortSignal } });
      } catch (error) {
        if (!missing(error)) throw error;
      }
      try {
        await ai.files.get({ name, config: { abortSignal } });
      } catch (error) {
        if (missing(error)) return;
        throw error;
      }
      throw new Error("provider_cleanup_pending");
    },
  };
}

type PendingGoogleFile = {
  scope: string;
  uploadSettled: Promise<void>;
  deletion: Promise<void> | null;
};
export class GeminiAnalysisProvider implements AnalysisProvider {
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
  ) {}
  async analyze(
    proxy: Blob,
    signal: AbortSignal,
    scope = "local",
    task?: GeminiTask,
  ): Promise<unknown> {
    if (this.pendingFiles.size)
      throw new ApplicationError({ code: "FEATURE_DISABLED" });
    if (
      proxy.type !== "video/mp4" ||
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
    };
    let registered = false;
    let value: unknown;
    let failure: ApplicationError | undefined;
    try {
      deadline.throwIfAborted();
      // Preassigned opaque name lets cleanup target even an uncertain upload response.
      this.pendingFiles.set(name, pending);
      registered = true;
      let uploaded: unknown;
      try {
        uploaded = await this.transport.upload(name, proxy, deadline);
      } finally {
        settleUpload();
      }
      let file = fileSchema.parse(uploaded);
      for (let polls = 0; file.state === "PROCESSING"; polls++) {
        if (file.name !== name) throw new Error();
        if (polls >= GROUNDED_ANALYSIS_LIMITS.maxFilePolls) throw new Error();
        await this.wait(GROUNDED_ANALYSIS_LIMITS.filePollMs, deadline);
        file = fileSchema.parse(await this.transport.get(name, deadline));
      }
      if (
        file.name !== name ||
        file.state !== "ACTIVE" ||
        file.uri !== `https://generativelanguage.googleapis.com/v1beta/${name}`
      )
        throw new Error();
      deadline.throwIfAborted();
      const result = await this.transport.generate(file.uri, deadline, task);
      deadline.throwIfAborted();
      if (
        !result.finished ||
        !result.text ||
        new TextEncoder().encode(result.text).length >
          GROUNDED_ANALYSIS_LIMITS.responseBytes
      )
        throw new Error();
      value = task
        ? task.schema.parse(JSON.parse(result.text))
        : normalizeGeminiAnalysis(JSON.parse(result.text));
    } catch {
      failure = new ApplicationError({
        code: deadline.aborted ? "CLIENT_ABORTED" : "MODEL_OUTPUT_REJECTED",
      });
    }
    if (registered) {
      try {
        await this.deleteFile(
          name,
          pending,
          AbortSignal.timeout(GROUNDED_ANALYSIS_LIMITS.cleanupMs),
        );
      } catch {
        failure = new ApplicationError({ code: "FEATURE_DISABLED" });
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
      await this.deleteFile(name, pending, signal);
    }
  }
  private deleteFile(
    name: string,
    pending: { deletion: Promise<void> | null },
    signal: AbortSignal,
  ) {
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
