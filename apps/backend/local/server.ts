import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { createReadStream } from "node:fs";
import { open, stat } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { canonicalOwnerYoutubeSource } from "./youtube-url.ts";
import {
  ownerYoutubeAudioImportSchema,
  OWNER_YOUTUBE_AUDIO_TIMEOUT_MS,
} from "../../../packages/contracts/local/youtube-audio.ts";
import { createHash } from "node:crypto";
import {
  OWNER_LIMITS,
  type OwnerWorkspace,
  type OwnerMediaJob,
  type OwnerMediaResult,
} from "../../../packages/contracts/local/index.ts";
import { WorkspaceFiles, requireDisk } from "./workspace-files.ts";
import {
  analyzeOwner,
  type OwnerAnalysisPorts,
  type OwnerTranscript,
} from "./analysis.ts";
import {
  ownerAnalysisRequestSchema,
  ownerMomentExportSchema,
  type OwnerAnalysis,
} from "../../../packages/contracts/local/selection.ts";
import { readOwnerJson } from "./request-body.ts";
import { OwnerClipBatch, type OwnerClipPorts } from "./clip-batch.ts";
import { OWNER_AUDIO_LIMITS } from "../../../packages/contracts/local/audio.ts";
import { localCodexFailureSchema } from "../../../packages/contracts/local/codex.ts";
import { OwnerDraftStore } from "./draft-store.ts";
import { OwnerWorkspaceDrafts } from "./workspace-drafts.ts";
import { OwnerSessionRecovery } from "./session-recovery.ts";
import {
  ownerDraftSnapshotSchema,
  ownerWorkspaceClearRequestSchema,
} from "../../../packages/contracts/local/drafts.ts";
import { ownerIdSchema } from "../../../packages/contracts/local/policy.ts";
import {
  OWNER_PICTURE_LIMITS,
  ownerPictureMime,
} from "../../../packages/contracts/local/assets.ts";
import {
  ownerAgentClipListSchema,
  ownerAgentStatusSchema,
} from "../../../packages/contracts/local/agent.ts";
import type { OwnerClipList } from "../../../packages/contracts/local/clips.ts";
import { ownerAgentClip } from "./agent-view.ts";
import { OwnerSourceAcquisition } from "./source-acquisition.ts";
import type { OwnerAcquisitionPort } from "./acquisition-port.ts";
import { ownerYoutubeLinkRequestSchema } from "../../../packages/contracts/local/acquisition.ts";
import { ownerSourceMetadataRequestSchema } from "../../../packages/contracts/local/acquisition-flow.ts";
import type { OwnerAcquisitionNativeStage } from "../../../packages/contracts/local/acquisition-profile.ts";
import { ownerRuntimeCapabilitiesSchema } from "../../../packages/contracts/local/runtime.ts";
import { openLocalDraft, openLocalVideo } from "./open-local-file.ts";
import { LocalDiagnostics } from "./diagnostics.ts";
import type { ClipCaptionTranscription } from "./clip-caption-port.ts";
import { fakeOwnerCaptionWords } from "./fake-analysis.ts";
import { limitHostedDemoInputs } from "../../../packages/contracts/local/hosted-editing.ts";

export type OwnerHostProviders = {
  localAi?: {
    aiProvider: "codex";
    aiSetup: "ready" | "speech-missing" | "codex-missing" | "disabled";
    captionProvider: "local-speech";
  };
  captionTranscription?: ClipCaptionTranscription;
  analysis?: OwnerAnalysisPorts;
  clipPreparation?: Pick<
    OwnerClipPorts,
    "mode" | "plan" | "image" | "resume" | "focus" | "hookSuggestion" | "texts"
  >;
  close?: (signal: AbortSignal) => Promise<void>;
  cleanupWorkspace?: (id: string, signal: AbortSignal) => Promise<void>;
};

export type OwnerHostOptions = {
  authorize?: (request: IncomingMessage) => boolean;
  hosted?: boolean;
  clipLimit?: number | undefined;
  exported?: (() => Promise<void>) | undefined;
  capacity?: typeof requireDisk;
  sourceLimits?: { bytes: number; durationMs: number };
  reserveRead?: (bytes: number) => void;
  receiveSource?: (
    id: string,
    files: WorkspaceFiles,
    request: IncomingMessage,
    signal: AbortSignal,
  ) => Promise<{ fingerprint: string; bytes: number }>;
  diagnostics?: LocalDiagnostics;
  root: string;
  ui?: string;
  token: string;
  port: number;
  frontendOrigin?: string;
  storageRoot?: string;
  recoverSession?: boolean;
  desktopStorageRoot?: string;
  acquisition?: OwnerAcquisitionPort;
  shutdown?: () => void;
  analysis?: OwnerAnalysisPorts;
  clipPreparation?: Pick<OwnerClipPorts, "mode" | "plan" | "image" | "focus">;
  providers?: (files: WorkspaceFiles) => OwnerHostProviders;
  media: (
    job: OwnerMediaJob,
    signal: AbortSignal,
    stage?: (value: OwnerAcquisitionNativeStage) => void,
  ) => Promise<OwnerMediaResult>;
};
export function createOwnerHost(options: OwnerHostOptions) {
  const diagnostics = options.diagnostics ?? new LocalDiagnostics();
  const files = new WorkspaceFiles(options.root);
  const providers = options.providers?.(files);
  const analysis = providers?.analysis ?? options.analysis;
  const clipPreparation = providers?.clipPreparation ?? options.clipPreparation;
  const capabilities = ownerRuntimeCapabilitiesSchema.parse({
    aiMode: analysis?.mode ?? "unavailable",
    sourceMode: options.acquisition?.mode ?? null,
    planningAvailable: Boolean(
      analysis && clipPreparation && analysis.mode === clipPreparation.mode,
    ),
    captionGeneration: Boolean(providers?.captionTranscription),
    ...(options.hosted
      ? { execution: "hosted", localMedia: false, cloud: true }
      : {
          localMedia: true,
          cloud: false,
          ...(options.acquisition?.audio ? { youtubeAudio: true } : {}),
          ...providers?.localAi,
        }),
  });
  const workspaces = new Map<string, OwnerWorkspace>();
  const analyses = new Map<string, OwnerAnalysis>();
  const transcripts = new Map<string, OwnerTranscript>();
  const batches = new Map<string, OwnerClipBatch>();
  const storage = options.storageRoot
    ? new OwnerDraftStore(options.storageRoot)
    : undefined;
  const snapshot = (id: string) =>
    ownerDraftSnapshotSchema.parse({
      version: 1,
      workspace: workspaces.get(id),
      analysis: analyses.get(id) ?? null,
      clips: batches.get(id)?.snapshot().clips ?? [],
    });
  const recovery =
    options.recoverSession && !options.hosted && options.storageRoot
      ? new OwnerSessionRecovery(
          options.storageRoot,
          files,
          snapshot,
          diagnostics,
        )
      : undefined;
  const drafts = storage
    ? new OwnerWorkspaceDrafts(storage, files, snapshot, diagnostics)
    : undefined;
  const changed = (id: string) => {
    drafts?.changed(id);
    recovery?.changed(id);
  };
  const createBatch = (workspace: OwnerWorkspace) =>
    new OwnerClipBatch(
      workspace,
      files,
      {
        ...(clipPreparation ?? {
          mode: "synthetic-ai" as const,
          async plan() {
            throw new Error("analysis_unavailable");
          },
          async image() {
            throw new Error("analysis_unavailable");
          },
        }),
        render: options.media,
      },
      () => changed(workspace.id),
      diagnostics,
      options.capacity,
      options.clipLimit,
      options.exported,
    );
  const controllers = new Set<AbortController>();
  const tasks = new Set<Promise<void>>();
  const streams = new Set<{ id: string; close: () => Promise<void> }>();
  const closeStreams = async (id: string) => {
    await Promise.all(
      [...streams]
        .filter((stream) => stream.id === id)
        .map((stream) => stream.close()),
    );
  };
  let closing = false;
  let uploading = false;
  const busy = new Set<string>();
  const closingWorkspaces = new Set<string>();
  const expires = new Map<string, number>();
  const sources = new OwnerSourceAcquisition({
    files,
    diagnostics,
    roots: {
      ...(options.storageRoot ? { downloads: options.storageRoot } : {}),
      ...(options.desktopStorageRoot
        ? { desktop: options.desktopStorageRoot }
        : {}),
    },
    ...(options.acquisition ? { port: options.acquisition } : {}),
    media: options.media,
    available: () => !closing && !uploading && workspaces.size === 0,
    opened(id, source) {
      if (closing || workspaces.size) throw new Error("workspace_busy");
      const workspace: OwnerWorkspace = {
        id,
        source,
        mode: analysis?.mode ?? "unavailable",
        revision: 0,
      };
      workspaces.set(id, workspace);
      expires.set(id, Date.now() + OWNER_LIMITS.workspaceMs);
      recovery?.changed(id);
      return workspace;
    },
  });
  async function receiveSource(
    id: string,
    req: IncomingMessage,
    signal: AbortSignal,
  ) {
    if (options.receiveSource)
      return options.receiveSource(id, files, req, signal);
    const size = Number(req.headers["content-length"]);
    if (
      !Number.isSafeInteger(size) ||
      size <= 0 ||
      size > (options.sourceLimits?.bytes ?? OWNER_LIMITS.sourceBytes) ||
      req.headers["content-type"] !== "video/mp4"
    )
      throw new Error("invalid_source");
    await (options.capacity ?? requireDisk)(options.root, size * 2);
    const file = await open(await files.file(id, "source.mp4"), "wx", 0o600);
    const hash = createHash("sha256");
    try {
      let received = 0;
      for await (const chunk of req) {
        signal.throwIfAborted();
        received += chunk.length;
        if (received > size) throw new Error("invalid_source");
        const bytes = Buffer.from(chunk);
        hash.update(bytes);
        await file.writeFile(bytes);
      }
      if (received !== size) throw new Error("invalid_source");
      return { fingerprint: hash.digest("hex"), bytes: received };
    } finally {
      await file.close();
    }
  }
  async function inspectWorkspace(
    id: string,
    signal: AbortSignal,
  ): Promise<OwnerWorkspace> {
    const inspected = await options.media(
      { workspaceId: id, operation: "inspect" },
      signal,
    );
    if (inspected.operation !== "inspect") throw new Error("invalid_source");
    if (
      options.sourceLimits &&
      (inspected.source.durationMs > options.sourceLimits.durationMs ||
        inspected.source.bytes > options.sourceLimits.bytes)
    )
      throw new Error("invalid_source");
    const workspace: OwnerWorkspace = {
      id,
      source: inspected.source,
      mode: analysis?.mode ?? "unavailable",
      revision: 0,
    };
    signal.throwIfAborted();
    workspaces.set(id, workspace);
    expires.set(id, Date.now() + OWNER_LIMITS.workspaceMs);
    recovery?.changed(id);
    return workspace;
  }
  async function reopenDraft(
    id: string,
    signal: AbortSignal,
  ): Promise<OwnerWorkspace> {
    if (!storage || !drafts) throw new Error("draft_unavailable");
    let restoredId: string | undefined;
    try {
      const loaded = await storage.load(id, files, signal);
      restoredId = loaded.workspace.id;
      signal.throwIfAborted();
      const workspace: OwnerWorkspace = {
        ...loaded.workspace,
        mode: analysis?.mode ?? "unavailable",
      };
      const batch = createBatch(workspace);
      batch.restore(loaded.clips);
      workspaces.set(workspace.id, workspace);
      batches.set(workspace.id, batch);
      if (loaded.analysis) {
        analyses.set(workspace.id, loaded.analysis);
        transcripts.set(workspace.id, {
          fingerprint: workspace.source.fingerprint,
          sourceRevision: loaded.analysis.inputs.sourceRevision,
          mode: loaded.analysis.mode,
          words: loaded.analysis.words,
        });
      }
      expires.set(workspace.id, Date.now() + OWNER_LIMITS.workspaceMs);
      const saved = (await storage.list()).find((item) => item.id === id);
      signal.throwIfAborted();
      if (!saved) throw new Error("saved_draft_missing");
      drafts.bind(workspace.id, id, saved.savedAt);
      recovery?.changed(workspace.id);
      restoredId = undefined;
      return workspace;
    } finally {
      if (restoredId) {
        await batches.get(restoredId)?.close();
        batches.delete(restoredId);
        workspaces.delete(restoredId);
        analyses.delete(restoredId);
        transcripts.delete(restoredId);
        expires.delete(restoredId);
        await files.remove(restoredId);
      }
    }
  }
  const recoveryController = new AbortController();
  let recoveryTask: Promise<void> | undefined,
    recoveryAttempted = false;
  function recover() {
    if (!recovery || recoveryAttempted || workspaces.size || closing)
      return Promise.resolve();
    if (recoveryTask) return recoveryTask;
    uploading = true;
    recoveryTask = (async () => {
      const loaded = await recovery.restore(
        AbortSignal.any([
          recoveryController.signal,
          AbortSignal.timeout(120_000),
        ]),
      );
      if (loaded) {
        const workspace: OwnerWorkspace = {
          ...loaded.workspace,
          mode: analysis?.mode ?? "unavailable",
        };
        const batch = createBatch(workspace);
        batch.restore(loaded.clips);
        workspaces.set(workspace.id, workspace);
        batches.set(workspace.id, batch);
        if (loaded.analysis) {
          analyses.set(workspace.id, loaded.analysis);
          transcripts.set(workspace.id, {
            fingerprint: workspace.source.fingerprint,
            sourceRevision: loaded.analysis.inputs.sourceRevision,
            mode: loaded.analysis.mode,
            words: loaded.analysis.words,
          });
        }
        expires.set(workspace.id, Date.now() + OWNER_LIMITS.workspaceMs);
        recovery.changed(workspace.id);
      }
      recoveryAttempted = true;
    })().finally(() => {
      uploading = false;
      recoveryTask = undefined;
    });
    return recoveryTask;
  }
  let expiryTask = Promise.resolve();
  function expire() {
    expiryTask = expiryTask
      .then(async () => {
        for (const [id, deadline] of expires) {
          if (
            Date.now() >= deadline &&
            !busy.has(id) &&
            !batches.get(id)?.active
          ) {
            closingWorkspaces.add(id);
            if ((await drafts?.flush(id))?.state === "unsaved") {
              closingWorkspaces.delete(id);
              expires.set(id, Date.now() + 60_000);
              continue;
            }
            await closeStreams(id);
            await batches.get(id)?.close();
            await drafts?.flush(id);
            await providers?.cleanupWorkspace?.(
              id,
              AbortSignal.timeout(30_000),
            );
            await drafts?.forget(id);
            await recovery?.clear();
            batches.delete(id);
            await files.remove(id);
            workspaces.delete(id);
            analyses.delete(id);
            transcripts.delete(id);
            expires.delete(id);
            closingWorkspaces.delete(id);
          }
        }
      })
      .catch((error: unknown) => {
        diagnostics.failure("cleanup", error);
        /* Failed cleanup remains owned for close/retry. */
      });
    return expiryTask;
  }
  const expiryTimer = setInterval(() => {
    void expire();
  }, 30_000);
  expiryTimer.unref();
  const boundPort = () => {
    const address = server.address();
    return address && typeof address === "object" ? address.port : options.port;
  };
  const origin = () =>
    options.frontendOrigin ?? `http://localhost:${boundPort()}`;
  function dispatch(req: IncomingMessage, res: ServerResponse) {
    const task = diagnostics.run(
      req.method === "GET" ? "http_read" : "http_request",
      () => handle(req, res),
      { quiet: req.method === "GET", status: () => res.statusCode },
    );
    tasks.add(task);
    void task.finally(() => tasks.delete(task));
    return task;
  }
  const server = createServer(dispatch);
  function authorized(req: IncomingMessage) {
    if (options.authorize) return options.authorize(req);
    if (
      req.headers.host !== `localhost:${boundPort()}` &&
      req.headers.host !== `127.0.0.1:${boundPort()}`
    )
      return false;
    if (req.headers.origin && req.headers.origin !== origin()) return false;
    if (req.headers["sec-fetch-site"] === "cross-site") return false;
    const bearer = req.headers.authorization === `Bearer ${options.token}`;
    const cookie = req.headers.cookie
      ?.split("; ")
      .includes(`owner=${options.token}`);
    return (
      bearer ||
      Boolean(
        cookie && (req.method === "GET" || req.headers.origin === origin()),
      )
    );
  }
  async function stream(
    file: string,
    req: IncomingMessage,
    res: ServerResponse,
    type: string,
    workspaceId?: string,
    maximumRangeBytes?: number,
  ) {
    const size = (await stat(file)).size;
    const range = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    const start = range ? Number(range[1]) : 0;
    const end = Math.min(
      range?.[2] ? Number(range[2]) : size - 1,
      size - 1,
      range && maximumRangeBytes ? start + maximumRangeBytes - 1 : size - 1,
    );
    if (
      (req.headers.range && !range) ||
      !Number.isSafeInteger(start) ||
      start < 0 ||
      start > end ||
      start >= size
    ) {
      res.writeHead(416).end();
      return;
    }
    options.reserveRead?.(end - start + 1);
    res.writeHead(range ? 206 : 200, {
      "Content-Type": type,
      "Content-Length": end - start + 1,
      "Accept-Ranges": "bytes",
      ...(range ? { "Content-Range": `bytes ${start}-${end}/${size}` } : {}),
    });
    const input = createReadStream(file, { start, end });
    let finish!: () => void;
    const closed = new Promise<void>((done) => {
      finish = done;
    });
    const owned = {
      id: workspaceId ?? "",
      close: () => {
        input.destroy();
        res.destroy();
        return closed;
      },
    };
    if (workspaceId) streams.add(owned);
    try {
      input.on("error", (error) => {
        diagnostics.failure("stream", error);
        res.destroy();
      });
      input.once("close", finish);
      res.once("close", () => {
        input.destroy();
      });
      if (res.destroyed) input.destroy();
      else input.pipe(res);
      await closed;
    } finally {
      streams.delete(owned);
    }
  }
  async function handle(req: IncomingMessage, res: ServerResponse) {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob:; media-src 'self' blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
    );
    const controller = new AbortController();
    if (options.hosted)
      controller.signal.addEventListener("abort", () => req.destroy(), {
        once: true,
      });
    const agent = req.url?.startsWith("/api/agent/workspace/") ?? false;
    const clipReply = (list: OwnerClipList) =>
      agent
        ? ownerAgentClipListSchema.parse({
            ...list,
            clips: list.clips.map(ownerAgentClip),
          })
        : list;
    controllers.add(controller);
    res.once("close", () => controller.abort());
    let newId: string | undefined;
    try {
      const navigation =
        Boolean(options.ui) &&
        req.method === "GET" &&
        req.url === "/" &&
        req.headers.host === `localhost:${boundPort()}` &&
        (!req.headers.origin || req.headers.origin === origin()) &&
        [undefined, "none", "same-origin"].includes(
          req.headers["sec-fetch-site"] as string | undefined,
        );
      if (navigation)
        res.setHeader(
          "Set-Cookie",
          `owner=${options.token}; HttpOnly; SameSite=Strict; Path=/`,
        );
      if (closing || (!navigation && !authorized(req))) {
        res.writeHead(403).end();
        return;
      }
      // A direct source/open request must not overwrite an older recoverable
      // session merely because this process has not served its first GET yet.
      if (recovery && req.method === "POST") await recover();
      if (req.method === "GET" && req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" }).end(
          JSON.stringify({
            mode: capabilities.aiMode,
            paid: capabilities.aiMode === "provider-ai",
            cloud: false,
          }),
        );
        return;
      }
      if (req.method === "GET" && req.url === "/api/capabilities") {
        res
          .writeHead(200, { "Content-Type": "application/json" })
          .end(JSON.stringify(capabilities));
        return;
      }
      if (
        req.method === "POST" &&
        req.url === "/api/shutdown" &&
        options.shutdown
      ) {
        res.writeHead(204).end();
        options.shutdown();
        return;
      }
      const asset =
        req.url === "/"
          ? "index.html"
          : req.url === "/app.js"
            ? "app.js"
            : req.url === "/app.css"
              ? "app.css"
              : null;
      if (req.method === "GET" && asset && options.ui) {
        await stream(
          resolve(options.ui, asset),
          req,
          res,
          asset.endsWith("js")
            ? "text/javascript"
            : asset.endsWith("css")
              ? "text/css"
              : "text/html",
        );
        return;
      }
      if (req.method === "GET" && req.url === "/api/workspace") {
        await recover();
        const current = [...workspaces.values()].find(
          (workspace) => !closingWorkspaces.has(workspace.id),
        );
        res
          .writeHead(200, { "Content-Type": "application/json" })
          .end(JSON.stringify(current ?? null));
        return;
      }
      if (req.method === "GET" && req.url === "/api/sources") {
        const result = await sources.catalog(controller.signal);
        res
          .writeHead(200, { "Content-Type": "application/json" })
          .end(JSON.stringify(result));
        return;
      }
      if (req.method === "GET" && req.url === "/api/sources/state") {
        res
          .writeHead(200, { "Content-Type": "application/json" })
          .end(JSON.stringify(sources.snapshot()));
        return;
      }
      const thumbnail = req.url?.match(
        /^\/api\/sources\/thumbnail\/([a-f0-9]{64})$/,
      );
      if (req.method === "GET" && thumbnail?.[1]) {
        try {
          const bytes = await sources.thumbnail(
            thumbnail[1],
            controller.signal,
          );
          res
            .writeHead(200, {
              "Content-Type": "image/jpeg",
              "Content-Length": bytes.length,
            })
            .end(bytes);
        } catch {
          if (!res.destroyed) res.writeHead(404).end();
        }
        return;
      }
      if (req.method === "POST" && req.url === "/api/sources/lookup") {
        const input = ownerYoutubeLinkRequestSchema.parse(
          await readOwnerJson(req),
        );
        const result = await sources.lookup(input.url, controller.signal);
        res
          .writeHead(200, { "Content-Type": "application/json" })
          .end(JSON.stringify(result));
        return;
      }
      if (req.method === "POST" && req.url === "/api/sources/metadata") {
        const input = ownerSourceMetadataRequestSchema.parse(
          await readOwnerJson(req),
        );
        const result = await sources.metadata(input.url, controller.signal);
        res
          .writeHead(200, { "Content-Type": "application/json" })
          .end(JSON.stringify(result));
        return;
      }
      if (req.method === "POST" && req.url === "/api/sources/import") {
        const result = sources.start(await readOwnerJson(req));
        res
          .writeHead(202, { "Content-Type": "application/json" })
          .end(JSON.stringify(result));
        return;
      }
      if (req.method === "POST" && req.url === "/api/sources/open") {
        const result = await sources.open(
          await readOwnerJson(req),
          controller.signal,
        );
        res
          .writeHead(200, { "Content-Type": "application/json" })
          .end(JSON.stringify(result));
        return;
      }
      if (req.method === "POST" && req.url === "/api/sources/cancel") {
        res
          .writeHead(200, { "Content-Type": "application/json" })
          .end(JSON.stringify(sources.cancel()));
        return;
      }
      const sourceAction = req.url?.match(
        /^\/api\/sources\/(downloads|desktop)\/([a-f0-9-]{36})(?:\/(locate|preview))?$/,
      );
      if (
        sourceAction &&
        req.method === "GET" &&
        sourceAction[3] === "preview"
      ) {
        if (!req.headers.range) {
          res.writeHead(416).end();
          return;
        }
        const file = await sources.preview(
          { destination: sourceAction[1], variantId: sourceAction[2] },
          controller.signal,
        );
        await stream(file, req, res, "video/mp4", undefined, 512 * 1024);
        return;
      }
      if (sourceAction && req.method === "DELETE" && !sourceAction[3]) {
        await sources.delete(
          { destination: sourceAction[1], variantId: sourceAction[2] },
          controller.signal,
        );
        res.writeHead(204).end();
        return;
      }
      if (
        sourceAction &&
        req.method === "POST" &&
        sourceAction[3] === "locate"
      ) {
        const result = await sources.locate(
          { destination: sourceAction[1], variantId: sourceAction[2] },
          async (id, signal) => {
            await receiveSource(id, req, signal);
          },
          controller.signal,
        );
        res
          .writeHead(200, { "Content-Type": "application/json" })
          .end(JSON.stringify(result));
        return;
      }
      if (req.method === "GET" && req.url === "/api/agent/status") {
        const workspace = [...workspaces.values()].find(
          (value) => !closingWorkspaces.has(value.id),
        );
        const list = workspace
          ? batches.get(workspace.id)?.snapshot()
          : undefined;
        res.writeHead(200, { "Content-Type": "application/json" }).end(
          JSON.stringify(
            ownerAgentStatusSchema.parse({
              workspace: workspace ?? null,
              active: list?.active ?? false,
              clips: list?.clips.map(ownerAgentClip) ?? [],
            }),
          ),
        );
        return;
      }
      if (req.method === "GET" && req.url === "/api/drafts") {
        if (!storage) {
          res.writeHead(503).end();
          return;
        }
        res
          .writeHead(200, { "Content-Type": "application/json" })
          .end(JSON.stringify(await storage.list()));
        return;
      }
      if (
        req.method === "POST" &&
        (req.url === "/api/open/video" || req.url === "/api/open/draft")
      ) {
        if (uploading || workspaces.size || sources.active)
          throw new Error("workspace_busy");
        uploading = true;
        try {
          const result =
            req.url === "/api/open/draft"
              ? await openLocalDraft(
                  await readOwnerJson(req),
                  {
                    match: (input, signal) => {
                      if (!storage) throw new Error("draft_unavailable");
                      return storage.matchReference(input, signal);
                    },
                    reopen: reopenDraft,
                  },
                  controller.signal,
                )
              : await openLocalVideo(
                  {
                    create: () => files.create(),
                    receive: (id, signal) => receiveSource(id, req, signal),
                    match: (file, signal) =>
                      storage
                        ? storage.matchVideo(file, signal)
                        : Promise.resolve(null),
                    reopen: reopenDraft,
                    inspect: inspectWorkspace,
                    discard: (id) => files.remove(id),
                  },
                  controller.signal,
                );
          res
            .writeHead(200, { "Content-Type": "application/json" })
            .end(JSON.stringify(result));
          return;
        } finally {
          uploading = false;
        }
      }
      const savedDraft = req.url?.match(
        /^\/api\/drafts\/([a-f0-9-]{36})(?:\/(open))?$/,
      );
      if (savedDraft && storage && drafts) {
        const id = ownerIdSchema.parse(savedDraft[1]);
        if (req.method === "DELETE" && !savedDraft[2]) {
          await drafts.forgetSaved(id);
          await storage.delete(id);
          res.writeHead(204).end();
          return;
        }
        if (req.method === "POST" && savedDraft[2] === "open") {
          if (uploading || workspaces.size || sources.active) {
            res.writeHead(409).end();
            return;
          }
          uploading = true;
          try {
            const workspace = await reopenDraft(id, controller.signal);
            res
              .writeHead(200, { "Content-Type": "application/json" })
              .end(JSON.stringify(workspace));
            return;
          } finally {
            uploading = false;
          }
        }
        res.writeHead(404).end();
        return;
      }
      if (req.method === "POST" && req.url === "/api/source") {
        if (uploading || workspaces.size >= 1 || sources.active)
          throw new Error("workspace_busy");
        const size = Number(req.headers["content-length"]);
        if (
          !Number.isSafeInteger(size) ||
          size <= 0 ||
          size > OWNER_LIMITS.sourceBytes ||
          req.headers["content-type"] !== "video/mp4"
        )
          throw new Error("invalid_source");
        uploading = true;
        try {
          await (options.capacity ?? requireDisk)(options.root, size * 2);
          newId = await files.create();
          await receiveSource(newId, req, controller.signal);
          const workspace = await inspectWorkspace(newId, controller.signal);
          newId = undefined;
          res
            .writeHead(200, { "Content-Type": "application/json" })
            .end(JSON.stringify(workspace));
          return;
        } finally {
          uploading = false;
        }
      }
      const route = (
        agent
          ? req.url?.replace("/api/agent/workspace/", "/api/workspace/")
          : req.url
      )?.match(
        /^\/api\/workspace\/([a-f0-9-]{36})(?:\/(source|portrait|analysis|clips|assets|audio-assets|draft)(?:\/([a-f0-9-]{36}|cancel)(?:\/(render|retry|cancel|output|source|edit|picture|audio|youtube-audio|validate|captions|fake-captions)(?:\/(\d+))?)?)?)?$/,
      );
      if (
        agent &&
        (route?.[2] !== "clips" ||
          !ownerIdSchema.safeParse(route[3]).success ||
          route[5] ||
          (req.method === "GET"
            ? Boolean(route[4])
            : req.method !== "POST" ||
              ![
                "edit",
                "picture",
                "render",
                "retry",
                "cancel",
                "validate",
              ].includes(route[4] ?? "")))
      ) {
        res.writeHead(404).end();
        return;
      }
      const workspace = route?.[1] ? workspaces.get(route[1]) : undefined;
      if (!workspace) {
        res.writeHead(404).end();
        return;
      }
      if (closingWorkspaces.has(workspace.id) && req.method !== "DELETE") {
        res.writeHead(409).end();
        return;
      }
      if (req.method === "GET" && !route?.[2]) {
        res
          .writeHead(200, { "Content-Type": "application/json" })
          .end(JSON.stringify(workspace));
        return;
      }
      if (route?.[2] === "draft") {
        if (!drafts) {
          res.writeHead(503).end();
          return;
        }
        if (req.method === "GET") {
          res
            .writeHead(200, { "Content-Type": "application/json" })
            .end(JSON.stringify(drafts.status(workspace.id)));
          return;
        }
        if (req.method === "POST") {
          if (
            busy.has(workspace.id) ||
            (drafts.status(workspace.id).id === null &&
              batches.get(workspace.id)?.active)
          ) {
            res.writeHead(409).end();
            return;
          }
          busy.add(workspace.id);
          try {
            const result = await drafts.save(workspace.id);
            res
              .writeHead(200, { "Content-Type": "application/json" })
              .end(JSON.stringify(result));
            return;
          } finally {
            busy.delete(workspace.id);
          }
        }
      }
      if (route?.[2] === "clips") {
        let batch = batches.get(workspace.id);
        if (agent) {
          const clip = batch
            ?.snapshot()
            .clips.find((value) => value.id === route[3]);
          if (!clip) {
            res.writeHead(404).end();
            return;
          }
          if (req.method === "GET") {
            res
              .writeHead(200, { "Content-Type": "application/json" })
              .end(JSON.stringify(ownerAgentClip(clip)));
            return;
          }
        }
        if (req.method === "GET" && !route[3]) {
          res
            .writeHead(200, { "Content-Type": "application/json" })
            .end(
              JSON.stringify(
                batch?.snapshot() ?? { clips: [], active: false, workers: 1 },
              ),
            );
          return;
        }
        if (req.method === "POST" && !route[3]) {
          if (busy.has(workspace.id)) {
            res.writeHead(409).end();
            return;
          }
          if (!clipPreparation) {
            res.writeHead(503).end();
            return;
          }
          const analysis = analyses.get(workspace.id);
          if (!analysis) {
            res.writeHead(409).end();
            return;
          }
          busy.add(workspace.id);
          try {
            batch ??= createBatch(workspace);
            batches.set(workspace.id, batch);
            const result = await batch.submit(
              await readOwnerJson(req),
              analysis,
            );
            res
              .writeHead(202, { "Content-Type": "application/json" })
              .end(JSON.stringify(result));
            return;
          } finally {
            busy.delete(workspace.id);
          }
        }
        if (req.method === "POST" && batch && route[3] && route[4] === "edit") {
          if (busy.has(workspace.id)) {
            res.writeHead(409).end();
            return;
          }
          busy.add(workspace.id);
          try {
            const result = await batch.edit(route[3], await readOwnerJson(req));
            res
              .writeHead(200, { "Content-Type": "application/json" })
              .end(JSON.stringify(clipReply(result)));
            return;
          } finally {
            busy.delete(workspace.id);
          }
        }
        if (
          req.method === "POST" &&
          batch &&
          route[3] &&
          route[4] === "fake-captions"
        ) {
          if (options.hosted) {
            res.writeHead(404).end();
            return;
          }
          if (busy.has(workspace.id) || batch.active) {
            res.writeHead(409).end();
            return;
          }
          busy.add(workspace.id);
          try {
            const result = await batch.generateCaptions(
              route[3],
              await readOwnerJson(req),
              (current, clip, signal) =>
                fakeOwnerCaptionWords(
                  {
                    ...current,
                    source: {
                      ...current.source,
                      durationMs: Math.round(
                        (clip.base!.overlay.frames * 1000) / 30,
                      ),
                    },
                  },
                  signal,
                ),
              controller.signal,
              true,
            );
            res
              .writeHead(200, { "Content-Type": "application/json" })
              .end(JSON.stringify(clipReply(result)));
          } finally {
            busy.delete(workspace.id);
          }
          return;
        }
        if (
          req.method === "POST" &&
          batch &&
          route[3] &&
          route[4] === "captions"
        ) {
          if (!providers?.captionTranscription) {
            res.writeHead(503).end();
            return;
          }
          if (busy.has(workspace.id) || batch.active) {
            res.writeHead(409).end();
            return;
          }
          busy.add(workspace.id);
          try {
            const result = await batch.generateCaptions(
              route[3],
              await readOwnerJson(req),
              providers.captionTranscription,
              controller.signal,
              false,
              !options.hosted &&
                providers.localAi?.captionProvider === "local-speech",
            );
            res
              .writeHead(200, { "Content-Type": "application/json" })
              .end(JSON.stringify(clipReply(result)));
          } finally {
            busy.delete(workspace.id);
          }
          return;
        }
        if (
          req.method === "POST" &&
          batch &&
          route[3] &&
          route[4] === "validate"
        ) {
          if (busy.has(workspace.id)) {
            res.writeHead(409).end();
            return;
          }
          busy.add(workspace.id);
          try {
            const result = await batch.validateEdit(
              route[3],
              await readOwnerJson(req),
            );
            res
              .writeHead(200, { "Content-Type": "application/json" })
              .end(JSON.stringify(result));
            return;
          } finally {
            busy.delete(workspace.id);
          }
        }
        if (
          req.method === "POST" &&
          batch &&
          route[3] &&
          route[4] === "youtube-audio"
        ) {
          if (options.hosted || !options.acquisition?.audio) {
            res.writeHead(404).end();
            return;
          }
          if (busy.has(workspace.id) || batch.active) {
            res.writeHead(409).end();
            return;
          }
          const clip = batch
            .snapshot()
            .clips.find((item) => item.id === route[3]);
          if (
            !clip?.base ||
            (clip.audioAssets?.length ?? 0) >= OWNER_AUDIO_LIMITS.assets
          )
            throw new Error("audio_unavailable");
          busy.add(workspace.id);
          try {
            const request = ownerYoutubeAudioImportSchema.parse(
              await readOwnerJson(req),
            );
            const identity = canonicalOwnerYoutubeSource(request.url);
            await (options.capacity ?? requireDisk)(
              options.root,
              OWNER_AUDIO_LIMITS.inputBytes + OWNER_AUDIO_LIMITS.bytes,
            );
            const signal = AbortSignal.any([
              controller.signal,
              AbortSignal.timeout(OWNER_YOUTUBE_AUDIO_TIMEOUT_MS),
            ]);
            const bytes = await options.acquisition.audio(
              identity,
              dirname(await files.file(workspace.id, "source.mp4")),
              signal,
            );
            if (
              bytes.byteLength < 1 ||
              bytes.byteLength > OWNER_AUDIO_LIMITS.inputBytes
            )
              throw new Error("invalid_audio_asset");
            const result = await batch.audio(
              clip.id,
              Buffer.from(bytes),
              signal,
            );
            res
              .writeHead(200, { "Content-Type": "application/json" })
              .end(JSON.stringify(clipReply(result)));
            return;
          } finally {
            busy.delete(workspace.id);
          }
        }
        if (
          req.method === "POST" &&
          batch &&
          route[3] &&
          (route[4] === "picture" || route[4] === "audio")
        ) {
          if (busy.has(workspace.id)) {
            res.writeHead(409).end();
            return;
          }
          busy.add(workspace.id);
          try {
            const invalidMedia =
              route[4] === "audio" ? "invalid_audio_asset" : "invalid_picture";
            const size = Number(req.headers["content-length"]);
            if (
              !Number.isSafeInteger(size) ||
              size <= 0 ||
              size >
                (route[4] === "audio"
                  ? OWNER_AUDIO_LIMITS.inputBytes
                  : OWNER_PICTURE_LIMITS.inputBytes) ||
              !(
                route[4] === "audio"
                  ? [
                      "audio/mpeg",
                      "audio/mp3",
                      "audio/wav",
                      "audio/x-wav",
                      "audio/mp4",
                      "audio/x-m4a",
                    ]
                  : ["image/jpeg", "image/png", "image/webp"]
              ).includes(String(req.headers["content-type"]))
            )
              throw new Error(invalidMedia);
            const chunks: Buffer[] = [];
            let received = 0;
            for await (const chunk of req) {
              controller.signal.throwIfAborted();
              received += chunk.length;
              if (received > size) throw new Error(invalidMedia);
              chunks.push(Buffer.from(chunk));
            }
            if (received !== size) throw new Error(invalidMedia);
            const result = await batch[
              route[4] === "audio" ? "audio" : "picture"
            ](route[3], Buffer.concat(chunks), controller.signal);
            res
              .writeHead(200, { "Content-Type": "application/json" })
              .end(JSON.stringify(clipReply(result)));
            return;
          } finally {
            busy.delete(workspace.id);
          }
        }
        if (
          req.method === "POST" &&
          batch &&
          (route[3] === "cancel" || route[4] === "cancel")
        ) {
          res
            .writeHead(200, { "Content-Type": "application/json" })
            .end(
              JSON.stringify(
                clipReply(
                  batch.cancel(route[3] === "cancel" ? undefined : route[3]),
                ),
              ),
            );
          return;
        }
        if (
          req.method === "POST" &&
          batch &&
          route[3] &&
          (route[4] === "render" || route[4] === "retry")
        ) {
          if (busy.has(workspace.id)) {
            res.writeHead(409).end();
            return;
          }
          busy.add(workspace.id);
          try {
            const request = await readOwnerJson(req);
            const result =
              route[4] === "retry"
                ? await batch.retry(
                    route[3],
                    request,
                    analyses.get(workspace.id),
                  )
                : await batch.render(route[3], request);
            res
              .writeHead(202, { "Content-Type": "application/json" })
              .end(JSON.stringify(clipReply(result)));
            return;
          } finally {
            busy.delete(workspace.id);
          }
        }
        if (
          req.method === "GET" &&
          batch &&
          route[3] &&
          route[4] === "output" &&
          route[5]
        ) {
          const revision = Number(route[5]);
          const clip = batch
            .snapshot()
            .clips.find((clip) => clip.id === route[3]);
          if (!clip?.outputs.some((output) => output.revision === revision)) {
            res.writeHead(404).end();
            return;
          }
          await stream(
            await files.output(workspace.id, clip.id, revision),
            req,
            res,
            "video/mp4",
            workspace.id,
          );
          return;
        }
        if (
          req.method === "GET" &&
          batch &&
          route[3] &&
          route[4] === "source"
        ) {
          const clip = batch
            .snapshot()
            .clips.find((clip) => clip.id === route[3]);
          if (!clip?.base) {
            res.writeHead(404).end();
            return;
          }
          await stream(
            await files.clipSource(workspace.id, clip.id),
            req,
            res,
            "video/mp4",
            workspace.id,
          );
          return;
        }
        res.writeHead(404).end();
        return;
      }
      if (
        req.method === "GET" &&
        (route?.[2] === "assets" || route?.[2] === "audio-assets") &&
        route[3] &&
        !route[4]
      ) {
        const currentClips = batches.get(workspace.id)?.snapshot().clips ?? [];
        if (route[2] === "audio-assets") {
          const audio = currentClips
            .flatMap((clip) => clip.audioAssets ?? [])
            .find((asset) => asset.id === route[3]);
          if (!audio) {
            res.writeHead(404).end();
            return;
          }
          await stream(
            await files.audio(workspace.id, route[3]),
            req,
            res,
            "audio/wav",
            workspace.id,
          );
          return;
        }
        const admitted = currentClips
          .flatMap((clip) => clip.assets)
          .find((asset) => asset.id === route[3]);
        if (!admitted) {
          res.writeHead(404).end();
          return;
        }
        await stream(
          await files.asset(workspace.id, route[3], admitted.format),
          req,
          res,
          ownerPictureMime(admitted.format),
          workspace.id,
        );
        return;
      }
      if (req.method === "GET" && route?.[2] === "analysis") {
        res
          .writeHead(200, { "Content-Type": "application/json" })
          .end(JSON.stringify(analyses.get(workspace.id) ?? null));
        return;
      }
      if (req.method === "POST" && route?.[2] === "analysis") {
        if (busy.has(workspace.id) || batches.get(workspace.id)?.active) {
          res.writeHead(409).end();
          return;
        }
        if (!analysis) {
          res.writeHead(503).end();
          return;
        }
        busy.add(workspace.id);
        try {
          const parsedInputs = ownerAnalysisRequestSchema.parse(
            await readOwnerJson(req),
          );
          const inputs =
            options.clipLimit === 3
              ? limitHostedDemoInputs(parsedInputs)
              : parsedInputs;
          if (
            inputs.policyRevision <
            (analyses.get(workspace.id)?.inputs.policyRevision ?? 0)
          ) {
            res.writeHead(409).end();
            return;
          }
          const result = await diagnostics.run("find_moments", () =>
            analyzeOwner(workspace, inputs, analysis, controller.signal, {
              transcript: transcripts.get(workspace.id),
              completed(transcript) {
                transcripts.set(workspace.id, transcript);
              },
              reused() {
                diagnostics.analysis.check("transcription_reuse", () => {});
              },
            }),
          );
          controller.signal.throwIfAborted();
          analyses.set(workspace.id, result);
          changed(workspace.id);
          res
            .writeHead(200, { "Content-Type": "application/json" })
            .end(JSON.stringify(result));
          return;
        } finally {
          busy.delete(workspace.id);
        }
      }
      if (
        req.method === "GET" &&
        (route?.[2] === "source" || route?.[2] === "portrait")
      ) {
        await stream(
          await files.file(
            workspace.id,
            route[2] === "source" ? "source.mp4" : "portrait.mp4",
          ),
          req,
          res,
          "video/mp4",
          workspace.id,
        );
        return;
      }
      if (req.method === "POST" && route?.[2] === "portrait") {
        if (busy.has(workspace.id) || batches.get(workspace.id)?.active) {
          res.writeHead(409).end();
          return;
        }
        busy.add(workspace.id);
        try {
          const selection = ownerMomentExportSchema.parse(
            await readOwnerJson(req),
          );
          const analysis = analyses.get(workspace.id);
          if (
            !analysis ||
            analysis.id !== selection.analysisId ||
            analysis.inputs.sourceRevision !== workspace.revision ||
            analysis.inputs.policyRevision !== selection.policyRevision
          ) {
            res.writeHead(409).end();
            return;
          }
          const moment = [...analysis.manual, ...analysis.suggestions].find(
            (moment) => moment.id === selection.momentId,
          );
          if (!moment) {
            res.writeHead(409).end();
            return;
          }
          await (options.capacity ?? requireDisk)(
            options.root,
            OWNER_LIMITS.outputBytes * 2,
          );
          const result = await options.media(
            {
              workspaceId: workspace.id,
              operation: "portrait",
              cut: moment.cut,
              fingerprint: workspace.source.fingerprint,
            },
            controller.signal,
          );
          res
            .writeHead(200, { "Content-Type": "application/json" })
            .end(JSON.stringify(result));
          return;
        } finally {
          busy.delete(workspace.id);
        }
      }
      if (req.method === "DELETE" && !route?.[2]) {
        if (busy.has(workspace.id) || batches.get(workspace.id)?.active) {
          res.writeHead(409).end();
          return;
        }
        const discardUnsaved =
          req.headers["content-type"] === "application/json"
            ? ownerWorkspaceClearRequestSchema.parse(await readOwnerJson(req))
                .discardUnsaved
            : false;
        closingWorkspaces.add(workspace.id);
        if (
          (await drafts?.flush(workspace.id))?.state === "unsaved" &&
          !discardUnsaved
        ) {
          closingWorkspaces.delete(workspace.id);
          res.writeHead(409).end();
          return;
        }
        await closeStreams(workspace.id);
        await batches.get(workspace.id)?.close();
        try {
          await providers?.cleanupWorkspace?.(
            workspace.id,
            AbortSignal.timeout(30_000),
          );
        } catch (error) {
          closingWorkspaces.delete(workspace.id);
          throw error;
        }
        await drafts?.forget(workspace.id);
        await recovery?.clear();
        batches.delete(workspace.id);
        await files.remove(workspace.id);
        workspaces.delete(workspace.id);
        analyses.delete(workspace.id);
        transcripts.delete(workspace.id);
        expires.delete(workspace.id);
        closingWorkspaces.delete(workspace.id);
        res.writeHead(204).end();
        return;
      }
      res.writeHead(404).end();
    } catch (error) {
      diagnostics.failure("http_request", error);
      if (newId) await files.remove(newId).catch(() => undefined);
      if (
        options.clipLimit === 3 &&
        error instanceof Error &&
        error.message === "clip_limit"
      ) {
        if (!res.destroyed)
          res
            .writeHead(429, { "Content-Type": "application/json" })
            .end('{"error":"demo_clip_limit"}');
        return;
      }
      if (!res.destroyed)
        res
          .writeHead(
            error instanceof Error &&
              ["stale_edit_revision", "source_operation_busy"].includes(
                error.message,
              )
              ? 409
              : 400,
            { "Content-Type": "application/json" },
          )
          .end(
            JSON.stringify({
              error: "local_operation_unavailable",
              ...(!options.hosted &&
              providers?.localAi &&
              error instanceof Error &&
              localCodexFailureSchema.safeParse(error.message).success
                ? { reason: error.message }
                : {}),
            }),
          );
    } finally {
      controllers.delete(controller);
    }
  }
  return {
    dispatch,
    server,
    expire,
    async close() {
      return diagnostics.run("cleanup", async () => {
        closing = true;
        clearInterval(expiryTimer);
        for (const c of controllers) c.abort();
        recoveryController.abort();
        const stopped = new Promise<void>((done) => server.close(() => done()));
        server.closeAllConnections();
        try {
          await Promise.all([...streams].map((stream) => stream.close()));
          await recoveryTask?.catch(() => undefined);
          await sources.close();
          await storage?.cancelPending();
          await Promise.allSettled([...tasks]);
          await expiryTask;
          await Promise.all(
            [...batches.values()].map((batch) => batch.close()),
          );
          await drafts?.close();
          await recovery?.close();
          batches.clear();
          await providers?.close?.(AbortSignal.timeout(30_000));
          await files.close();
          analyses.clear();
          transcripts.clear();
          workspaces.clear();
          expires.clear();
        } finally {
          await stopped;
        }
      });
    },
  };
}
