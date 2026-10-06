import {
  mediaUploadResponseSchema,
  PUBLIC_LIMITS,
  sourceAnalysisRequestSchema,
  operationIdSchema,
  type OperationId,
} from "@clipbuilder/contracts";

export const CLOUD_UPLOAD_CHUNK_BYTES = 4 * 1024 * 1024;
export const CLOUD_UPLOAD_REQUEST_TIMEOUT_MS = 60_000;
const RESPONSE_BYTES = 8192;

export type CloudUploadProgress = {
  confirmedBytes: number;
  totalBytes: number;
};
export type CloudUploadAdmission = ReturnType<
  typeof mediaUploadResponseSchema.parse
>;
type UploadReason =
  | "invalid-input"
  | "expired"
  | "aborted"
  | "timeout"
  | "transport"
  | "http"
  | "acknowledgement"
  | "metadata"
  | "body-limit"
  | "stalled";
export type CloudUploadDiagnostic = CloudUploadProgress & {
  operationId?: OperationId;
  stage: "request" | "complete" | "failed";
  chunk: number;
  request: "chunk" | "status";
  durationMs: number;
  status: number;
  statusQueries: number;
  resends: number;
  reason: UploadReason | null;
};

class UploadFailure extends Error {
  constructor(
    readonly reason: UploadReason,
    readonly ambiguous = false,
  ) {
    super("cloud-upload-failed");
  }
}

type Acknowledgement =
  { complete: false; offset: number } | { complete: true; generation: string };

/** Uses only the existing admitted capability; no allocation or AI dispatch. */
export async function transferCloudUpload(input: {
  admitted: CloudUploadAdmission;
  file: Blob;
  signal: AbortSignal;
  transport: typeof fetch;
  progress?: (value: CloudUploadProgress) => void;
  diagnostic?: (value: CloudUploadDiagnostic) => void;
  operationId?: OperationId;
}): Promise<string> {
  const { file, signal } = input;
  const operation = operationIdSchema.safeParse(input.operationId);
  let confirmedBytes = 0,
    chunk = 0,
    statusQueries = 0,
    resends = 0;
  const notify = () => {
    signal.throwIfAborted();
    input.progress?.({ confirmedBytes, totalBytes: file.size });
    signal.throwIfAborted();
  };
  const record = (
    value: Pick<
      CloudUploadDiagnostic,
      "stage" | "request" | "durationMs" | "status" | "reason"
    >,
    acknowledgedBytes = confirmedBytes,
  ) => {
    try {
      input.diagnostic?.({
        ...(operation.success ? { operationId: operation.data } : {}),
        ...value,
        chunk,
        confirmedBytes: acknowledgedBytes,
        totalBytes: file.size,
        statusQueries,
        resends,
      });
    } catch {
      // Diagnostics must never change the transfer outcome.
    }
  };
  const available = () => {
    if (signal.aborted) throw new UploadFailure("aborted");
    if (Date.now() >= input.admitted.expiresAtMs)
      throw new UploadFailure("expired");
  };

  async function request(
    start: number,
    end: number,
    statusOnly: boolean,
  ): Promise<Acknowledgement> {
    available();
    const controller = new AbortController();
    const forwardAbort = () => controller.abort();
    signal.addEventListener("abort", forwardAbort, { once: true });
    const timer = setTimeout(
      forwardAbort,
      Math.min(
        CLOUD_UPLOAD_REQUEST_TIMEOUT_MS,
        input.admitted.expiresAtMs - Date.now(),
      ),
    );
    const startedAt = Date.now();
    let response: Response | undefined;
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    const stopReader = () => {
      void reader?.cancel().catch(() => undefined);
    };
    let removeResponseAbort = () => {};
    let reason: UploadReason | null = null;
    let acknowledgedBytes = confirmedBytes;
    try {
      // A late response from an aborted transport is discarded, including its body.
      response = await new Promise<Response>((resolve, reject) => {
        const aborted = () => reject(new UploadFailure("timeout", true));
        controller.signal.addEventListener("abort", aborted, { once: true });
        removeResponseAbort = () =>
          controller.signal.removeEventListener("abort", aborted);
        if (controller.signal.aborted) {
          aborted();
          return;
        }
        void Promise.resolve()
          .then(() => {
            controller.signal.throwIfAborted();
            return input.transport(input.admitted.uploadUrl, {
              method: "PUT",
              credentials: "omit",
              redirect: "error",
              cache: "no-store",
              signal: controller.signal,
              headers: {
                "Content-Type": "video/mp4",
                "Content-Range": statusOnly
                  ? `bytes */${file.size}`
                  : `bytes ${start}-${end - 1}/${file.size}`,
                // Google's resumable client protocol avoids Fetch's opaque 308.
                "X-GUploader-No-308": "yes",
              },
              body: statusOnly ? new Blob([]) : file.slice(start, end),
            });
          })
          .then(
            (result) => {
              if (controller.signal.aborted) {
                void result.body?.cancel().catch(() => undefined);
                return;
              }
              resolve(result);
            },
            () => reject(new UploadFailure("transport", true)),
          );
      });
      available();
      controller.signal.throwIfAborted();
      if (
        response.redirected ||
        response.type === "opaque" ||
        response.type === "opaqueredirect"
      )
        throw new UploadFailure("http");
      if (response.status >= 500) throw new UploadFailure("http", true);
      const override = response.headers.get("X-HTTP-Status-Code-Override");
      if (response.status === 200 && override === "308") {
        const range = response.headers.get("Range");
        if (range === null && statusOnly && confirmedBytes === 0)
          return { complete: false, offset: 0 };
        const match = /^bytes=0-([0-9]+)$/.exec(range ?? "");
        const offset = match ? Number(match[1]) + 1 : NaN;
        if (
          !Number.isSafeInteger(offset) ||
          offset <= 0 ||
          offset < confirmedBytes ||
          offset > end ||
          offset >= file.size
        )
          throw new UploadFailure("acknowledgement");
        acknowledgedBytes = offset;
        return { complete: false, offset };
      }
      if (
        (response.status !== 200 && response.status !== 201) ||
        override !== null
      )
        throw new UploadFailure("http");
      if (end !== file.size || !response.body)
        throw new UploadFailure("metadata");
      reader = response.body.getReader();
      controller.signal.addEventListener("abort", stopReader, { once: true });
      const parts: ArrayBuffer[] = [];
      let bytes = 0;
      for (;;) {
        const part = await reader.read().catch(() => {
          throw new UploadFailure("transport", true);
        });
        available();
        controller.signal.throwIfAborted();
        if (part.done) break;
        bytes += part.value.byteLength;
        if (bytes > RESPONSE_BYTES) throw new UploadFailure("body-limit");
        parts.push(new Uint8Array(part.value).buffer);
      }
      const text = await new Blob(parts).text();
      let metadata: unknown;
      try {
        metadata = JSON.parse(text);
      } catch {
        throw new UploadFailure("metadata");
      }
      if (
        typeof metadata !== "object" ||
        metadata === null ||
        !("size" in metadata) ||
        metadata.size !== String(file.size) ||
        !("generation" in metadata)
      )
        throw new UploadFailure("metadata");
      const generation = sourceAnalysisRequestSchema.shape.generation.safeParse(
        metadata.generation,
      );
      if (!generation.success) throw new UploadFailure("metadata");
      available();
      controller.signal.throwIfAborted();
      acknowledgedBytes = file.size;
      return { complete: true, generation: generation.data };
    } catch (error) {
      const failure = signal.aborted
        ? new UploadFailure("aborted")
        : Date.now() >= input.admitted.expiresAtMs
          ? new UploadFailure("expired")
          : controller.signal.aborted
            ? new UploadFailure("timeout", true)
            : error instanceof UploadFailure
              ? error
              : new UploadFailure(reader ? "metadata" : "transport");
      reason = failure.reason;
      throw failure;
    } finally {
      clearTimeout(timer);
      removeResponseAbort();
      signal.removeEventListener("abort", forwardAbort);
      controller.signal.removeEventListener("abort", stopReader);
      if (reader) {
        await reader.cancel().catch(() => undefined);
        reader.releaseLock();
      } else {
        await response?.body?.cancel().catch(() => undefined);
      }
      record(
        {
          stage: "request",
          request: statusOnly ? "status" : "chunk",
          durationMs: Math.max(0, Date.now() - startedAt),
          status: response?.status ?? 0,
          reason,
        },
        acknowledgedBytes,
      );
    }
  }

  try {
    if (
      !mediaUploadResponseSchema.safeParse(input.admitted).success ||
      !Number.isSafeInteger(file.size) ||
      file.size <= 0 ||
      file.size > PUBLIC_LIMITS.maxSourceBytes ||
      file.type !== "video/mp4"
    )
      throw new UploadFailure("invalid-input");
    available();
    notify();
    while (confirmedBytes < file.size) {
      chunk++;
      const end = Math.min(
        confirmedBytes + CLOUD_UPLOAD_CHUNK_BYTES,
        file.size,
      );
      let queried = false;
      for (let attempt = 0; attempt < 2; attempt++) {
        let ack: Acknowledgement;
        try {
          ack = await request(confirmedBytes, end, false);
        } catch (error) {
          if (!(error instanceof UploadFailure) || !error.ambiguous || queried)
            throw error;
          available();
          queried = true;
          statusQueries++;
          ack = await request(0, end, true);
        }
        available();
        if (ack.complete) {
          confirmedBytes = file.size;
          notify();
          record({
            stage: "complete",
            request: "chunk",
            durationMs: 0,
            status: 200,
            reason: null,
          });
          return ack.generation;
        }
        if (ack.offset < confirmedBytes)
          throw new UploadFailure("acknowledgement");
        if (ack.offset > confirmedBytes) {
          confirmedBytes = ack.offset;
          notify();
        }
        if (confirmedBytes === end) break;
        if (attempt === 1) throw new UploadFailure("stalled");
        resends++;
      }
    }
    throw new UploadFailure("metadata");
  } catch (error) {
    const reason = signal.aborted
      ? "aborted"
      : error instanceof UploadFailure
        ? error.reason
        : "invalid-input";
    record({
      stage: "failed",
      request: "chunk",
      durationMs: 0,
      status: 0,
      reason,
    });
    throw new Error("cloud-upload-failed");
  }
}
