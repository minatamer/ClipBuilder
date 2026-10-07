import { AsyncLocalStorage } from "node:async_hooks";
import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Transform, Writable, type Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { Storage } from "@google-cloud/storage";
import { GoogleAuth } from "google-auth-library";
import { z } from "zod";
import {
  TEMPORARY_MEDIA_LIMITS,
  PUBLIC_LIMITS,
  uuidV4Schema,
  sessionIdSchema,
  objectGenerationSchema,
} from "@clipbuilder/contracts";
import { MediaFailure } from "../media/media.failure.js";
import {
  temporaryIntentSchema,
  type TemporaryIntent,
  type IntentRecord,
  type TemporaryMediaStore,
} from "./temporary-intent.js";
import { validUploadCapability } from "./upload-capability.js";

function errorStatus(error: unknown) {
  if (typeof error !== "object" || error === null) return null;
  if ("code" in error && Number.isFinite(Number(error.code)))
    return Number(error.code);
  if (
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "status" in error.response
  )
    return Number(error.response.status);
  return null;
}
function artifactKey(sessionId: string, artifactId: string) {
  return (
    "media/" +
    sessionIdSchema.parse(sessionId) +
    "/" +
    uuidV4Schema.parse(artifactId)
  );
}
function boundedStream(maximum: number) {
  let bytes = 0;
  return new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      bytes += chunk.length;
      callback(bytes > maximum ? new MediaFailure("invalid") : null, chunk);
    },
  });
}
const metadataSchema = z.object({
  generation: objectGenerationSchema,
  size: z.coerce.number().int().nonnegative(),
  contentType: z.string().optional(),
  temporaryHold: z.boolean().optional(),
  eventBasedHold: z.boolean().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});
const listSchema = z.object({
  items: z.array(metadataSchema.extend({ name: z.string() })).optional(),
  nextPageToken: z.string().optional(),
});
export function assertDisposableMetadata(value: unknown) {
  const meta = z
    .object({
      iamConfiguration: z.object({
        uniformBucketLevelAccess: z.object({ enabled: z.literal(true) }),
        publicAccessPrevention: z.literal("enforced"),
      }),
      softDeletePolicy: z
        .object({
          retentionDurationSeconds: z.coerce.number().int().min(0).max(0),
        })
        .optional(),
      versioning: z.object({ enabled: z.literal(false).optional() }).optional(),
      retentionPolicy: z.never().optional(),
      defaultEventBasedHold: z.literal(false).optional(),
    })
    .safeParse(value);
  if (!meta.success) throw new MediaFailure("cleanup_pending");
}
export class GcsMediaStore implements TemporaryMediaStore {
  private readonly context = new AsyncLocalStorage<AbortSignal>();
  private readonly storage = new Storage({
    retryOptions: { autoRetry: false, maxRetries: 0 },
  });
  private readonly auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/devstorage.read_write"],
    clientOptions: { transporterOptions: { timeout: 10_000, retry: false } },
  });
  constructor(
    private readonly bucketName: string,
    private readonly uploadOrigin: string,
  ) {}
  withSignal<T>(signal: AbortSignal, work: () => Promise<T>): Promise<T> {
    signal.throwIfAborted();
    return this.context.run(signal, work);
  }
  private requestSignal() {
    const parent = this.context.getStore();
    return parent
      ? AbortSignal.any([parent, AbortSignal.timeout(10_000)])
      : AbortSignal.timeout(10_000);
  }
  private bucketUrl() {
    return (
      "https://storage.googleapis.com/storage/v1/b/" +
      encodeURIComponent(this.bucketName)
    );
  }
  private objectUrl(key: string, generation?: string) {
    return (
      this.bucketUrl() +
      "/o/" +
      encodeURIComponent(key) +
      (generation === undefined
        ? ""
        : "?generation=" + objectGenerationSchema.parse(generation))
    );
  }
  private async json(
    url: string,
    method: "GET" | "POST" | "DELETE" = "GET",
    data?: object | string,
  ) {
    return (
      await this.auth.request<unknown>({
        url,
        method,
        ...(data === undefined ? {} : { data }),
        headers: { "Content-Type": "application/json" },
        timeout: 10_000,
        retry: false,
        signal: this.requestSignal(),
      })
    ).data;
  }
  async assertDisposable() {
    assertDisposableMetadata(await this.json(this.bucketUrl()));
  }
  private async list(prefix: string, maximum: number) {
    const raw = listSchema.parse(
      await this.json(
        this.bucketUrl() +
          "/o?versions=true&prefix=" +
          encodeURIComponent(prefix) +
          "&maxResults=" +
          (maximum + 1),
      ),
    );
    if (raw.nextPageToken || (raw.items?.length ?? 0) > maximum)
      throw new MediaFailure("cleanup_pending");
    return raw.items ?? [];
  }
  private async readIntent(key: string): Promise<IntentRecord> {
    const meta = metadataSchema.parse(await this.json(this.objectUrl(key)));
    if (meta.size > 16_384) throw new MediaFailure("cleanup_pending");
    const signal = this.requestSignal();
    const response = await this.auth.request<Readable>({
      url: this.objectUrl(key, meta.generation) + "&alt=media",
      responseType: "stream",
      timeout: 10_000,
      retry: false,
      signal,
    });
    const chunks: Buffer[] = [];
    await pipeline(
      response.data,
      boundedStream(16_384),
      new Writable({
        write(chunk: Buffer, _encoding, callback) {
          chunks.push(chunk);
          callback();
        },
      }),
      { signal },
    );
    const intent = temporaryIntentSchema.parse(
      JSON.parse(Buffer.concat(chunks).toString("utf8")),
    );
    if (key !== "intents/" + intent.binding.sessionId + ".json")
      throw new MediaFailure("cleanup_pending");
    return { intent, generation: meta.generation };
  }
  async listIntents() {
    const records: IntentRecord[] = [];
    for (const file of await this.list(
      "intents/",
      TEMPORARY_MEDIA_LIMITS.maxSessions,
    ))
      records.push(await this.readIntent(file.name));
    return records;
  }
  async getIntent(sessionId: string) {
    try {
      return await this.readIntent(
        "intents/" + sessionIdSchema.parse(sessionId) + ".json",
      );
    } catch (error) {
      if (errorStatus(error) === 404) return null;
      throw new MediaFailure("cleanup_pending");
    }
  }
  async saveIntent(intent: TemporaryIntent, previousGeneration: string) {
    const body = JSON.stringify(temporaryIntentSchema.parse(intent));
    if (
      Buffer.byteLength(body) > 16_384 ||
      (previousGeneration !== "0" &&
        !objectGenerationSchema.safeParse(previousGeneration).success)
    )
      throw new MediaFailure("invalid");
    try {
      const raw = await this.json(
        "https://storage.googleapis.com/upload/storage/v1/b/" +
          encodeURIComponent(this.bucketName) +
          "/o?uploadType=media&name=" +
          encodeURIComponent("intents/" + intent.binding.sessionId + ".json") +
          "&ifGenerationMatch=" +
          previousGeneration,
        "POST",
        body,
      );
      return {
        intent,
        generation: z.object({ generation: objectGenerationSchema }).parse(raw)
          .generation,
      };
    } catch (error) {
      throw new MediaFailure(
        errorStatus(error) === 412 ? "conflict" : "cleanup_pending",
      );
    }
  }
  async deleteIntent(sessionId: string, generation: string) {
    await this.json(
      this.objectUrl(
        "intents/" + sessionIdSchema.parse(sessionId) + ".json",
        generation,
      ) +
        "&ifGenerationMatch=" +
        generation,
      "DELETE",
    );
  }
  async beginUpload(intent: TemporaryIntent, uploadOrigin?: string) {
    const response = await this.auth.request({
      url:
        "https://storage.googleapis.com/upload/storage/v1/b/" +
        encodeURIComponent(this.bucketName) +
        "/o?uploadType=resumable&ifGenerationMatch=0",
      method: "POST",
      timeout: 10_000,
      retry: false,
      signal: this.requestSignal(),
      headers: {
        "X-Upload-Content-Length": String(intent.expectedBytes),
        "X-Upload-Content-Type": intent.contentType,
        Origin: uploadOrigin ?? this.uploadOrigin,
      },
      data: {
        name: artifactKey(intent.binding.sessionId, intent.sourceId),
        contentType: intent.contentType,
        cacheControl: "no-store",
        metadata: { expiresAtMs: String(intent.expiresAtMs) },
      },
    });
    const location = response.headers.get("location");
    if (!location) throw new MediaFailure("media_failed");
    return validUploadCapability(location);
  }
  async cancelUpload(url: string) {
    const response = await fetch(validUploadCapability(url), {
      method: "DELETE",
      redirect: "error",
      signal: this.requestSignal(),
    });
    await response.body?.cancel();
    if (![200, 204, 404, 499].includes(response.status))
      throw new MediaFailure("cleanup_pending");
  }
  async listArtifacts(sessionId: string) {
    const prefix = "media/" + sessionIdSchema.parse(sessionId) + "/";
    return (
      await this.list(prefix, TEMPORARY_MEDIA_LIMITS.maxObjectsPerSession)
    ).map((file) => ({
      artifactId: uuidV4Schema.parse(file.name.slice(prefix.length)),
      generation: file.generation,
      bytes: file.size,
    }));
  }
  async expiredArtifacts(nowMs: number) {
    return (await this.list("media/", TEMPORARY_MEDIA_LIMITS.maxObjects))
      .filter(
        (file) =>
          z.coerce
            .number()
            .int()
            .positive()
            .parse(file.metadata?.expiresAtMs) <= nowMs,
      )
      .map((file) => {
        const pieces = file.name.split("/");
        if (pieces.length !== 3) throw new MediaFailure("cleanup_pending");
        return {
          sessionId: sessionIdSchema.parse(pieces[1]),
          artifactId: uuidV4Schema.parse(pieces[2]),
          generation: file.generation,
        };
      });
  }
  async deleteArtifact(
    sessionId: string,
    artifactId: string,
    generation: string,
  ) {
    const url = this.objectUrl(artifactKey(sessionId, artifactId), generation);
    try {
      await this.json(url + "&ifGenerationMatch=" + generation, "DELETE");
    } catch (error) {
      if (errorStatus(error) !== 404) throw new MediaFailure("cleanup_pending");
    }
    try {
      await this.json(url);
    } catch (error) {
      if (errorStatus(error) === 404) return;
      throw new MediaFailure("cleanup_pending");
    }
    throw new MediaFailure("cleanup_pending");
  }
  async artifactMetadata(
    sessionId: string,
    artifactId: string,
    generation: string,
  ) {
    try {
      const meta = metadataSchema.parse(
        await this.json(
          this.objectUrl(artifactKey(sessionId, artifactId), generation),
        ),
      );
      if (
        meta.generation !== generation ||
        meta.temporaryHold ||
        meta.eventBasedHold ||
        meta.size <= 0 ||
        meta.size > PUBLIC_LIMITS.maxSourceBytes ||
        !meta.contentType
      )
        throw new MediaFailure("invalid");
      return { bytes: meta.size, contentType: meta.contentType };
    } catch {
      throw new MediaFailure("invalid");
    }
  }
  async download(
    sessionId: string,
    artifactId: string,
    generation: string,
    destination: string,
    signal: AbortSignal,
  ) {
    const file = this.storage
      .bucket(this.bucketName)
      .file(artifactKey(sessionId, artifactId), { generation });
    await pipeline(
      file.createReadStream({ validation: "crc32c" }),
      boundedStream(PUBLIC_LIMITS.maxSourceBytes),
      createWriteStream(destination, { flags: "wx" }),
      { signal },
    );
  }
  async stream(
    sessionId: string,
    artifactId: string,
    generation: string,
    range: { start: number; end: number },
    destination: Writable,
    signal: AbortSignal,
  ) {
    const file = this.storage
      .bucket(this.bucketName)
      .file(artifactKey(sessionId, artifactId), { generation });
    await pipeline(
      file.createReadStream({
        start: range.start,
        end: range.end,
        validation: false,
      }),
      boundedStream(range.end - range.start + 1),
      destination,
      { signal },
    );
  }
  async upload(
    sessionId: string,
    artifactId: string,
    source: string,
    expiresAtMs: number,
    signal: AbortSignal,
    contentType: "video/mp4" | "audio/m4a" = "video/mp4",
  ) {
    const info = await stat(source);
    if (
      !info.isFile() ||
      info.size <= 0 ||
      info.size > PUBLIC_LIMITS.maxOutputBytes
    )
      throw new MediaFailure("invalid");
    const hash = createHash("sha256"),
      file = this.storage
        .bucket(this.bucketName)
        .file(artifactKey(sessionId, artifactId));
    const hasher = new Transform({
      transform(chunk: Buffer, _encoding, callback) {
        hash.update(chunk);
        callback(null, chunk);
      },
    });
    await pipeline(
      createReadStream(source),
      hasher,
      file.createWriteStream({
        resumable: false,
        timeout: 120_000,
        validation: "crc32c",
        preconditionOpts: { ifGenerationMatch: 0 },
        metadata: {
          contentType,
          cacheControl: "no-store",
          metadata: { expiresAtMs: String(expiresAtMs) },
        },
      }),
      { signal },
    );
    const meta = metadataSchema.parse(
      await this.json(this.objectUrl(artifactKey(sessionId, artifactId))),
    );
    if (meta.size !== info.size) throw new MediaFailure("invalid");
    return {
      artifactId,
      generation: meta.generation,
      bytes: info.size,
      checksum: hash.digest("hex"),
    };
  }
}
