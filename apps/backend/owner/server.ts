import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { createReadStream } from "node:fs";
import { open, stat } from "node:fs/promises";
import { resolve } from "node:path";
import {
  OWNER_LIMITS,
  type OwnerWorkspace,
  type OwnerMediaJob,
  type OwnerMediaResult,
} from "../../../packages/contracts/owner/index.ts";
import { WorkspaceFiles, requireDisk } from "./workspace-files.ts";
import { analyzeOwner, type OwnerAnalysisPorts } from "./analysis.ts";
import {
  ownerAnalysisInputsSchema,
  ownerMomentExportSchema,
  type OwnerAnalysis,
} from "../../../packages/contracts/owner/selection.ts";
import { readOwnerJson } from "./request-body.ts";
import { OwnerClipBatch, type OwnerClipPorts } from "./clip-batch.ts";
import { OwnerDraftStore } from "./draft-store.ts";
import { OwnerWorkspaceDrafts } from "./workspace-drafts.ts";
import {
  ownerDraftSnapshotSchema,
  ownerWorkspaceClearRequestSchema,
} from "../../../packages/contracts/owner/drafts.ts";
import { ownerIdSchema } from "../../../packages/contracts/owner/policy.ts";
import { OWNER_PICTURE_LIMITS } from "../../../packages/contracts/owner/assets.ts";
import {
  ownerAgentClipListSchema,
  ownerAgentStatusSchema,
} from "../../../packages/contracts/owner/agent.ts";
import type { OwnerClipList } from "../../../packages/contracts/owner/clips.ts";
import { ownerAgentClip } from "./agent-view.ts";
import { OwnerSourceAcquisition } from "./source-acquisition.ts";
import type { OwnerAcquisitionPort } from "./acquisition-port.ts";
import { ownerYoutubeLinkRequestSchema } from "../../../packages/contracts/owner/acquisition.ts";
import { ownerSourceMetadataRequestSchema } from "../../../packages/contracts/owner/acquisition-flow.ts";
import type { OwnerAcquisitionNativeStage } from "../../../packages/contracts/owner/acquisition-profile.ts";
import { ownerRuntimeCapabilitiesSchema } from "../../../packages/contracts/owner/runtime.ts";

export type OwnerHostProviders = {
  analysis?: OwnerAnalysisPorts;
  clipPreparation?: Pick<OwnerClipPorts, "mode" | "plan" | "image">;
  close?: (signal: AbortSignal) => Promise<void>;
  cleanupWorkspace?: (id: string, signal: AbortSignal) => Promise<void>;
};

export type OwnerHostOptions = {
  root: string;
  ui: string;
  token: string;
  port: number;
  storageRoot?: string;
  desktopStorageRoot?: string;
  acquisition?: OwnerAcquisitionPort;
  shutdown?: () => void;
  analysis?: OwnerAnalysisPorts;
  clipPreparation?: Pick<OwnerClipPorts, "mode" | "plan" | "image">;
  providers?: (files: WorkspaceFiles) => OwnerHostProviders;
  media: (
    job: OwnerMediaJob,
    signal: AbortSignal,
    stage?: (value: OwnerAcquisitionNativeStage) => void,
  ) => Promise<OwnerMediaResult>;
};
export function createOwnerHost(options: OwnerHostOptions) {
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
    localMedia: true,
    cloud: false,
  });
  const workspaces = new Map<string, OwnerWorkspace>();
  const analyses = new Map<string, OwnerAnalysis>();
  const batches = new Map<string, OwnerClipBatch>();
  const storage = options.storageRoot
    ? new OwnerDraftStore(options.storageRoot)
    : undefined;
  const drafts = storage
    ? new OwnerWorkspaceDrafts(storage, files, (id) =>
        ownerDraftSnapshotSchema.parse({
          version: 1,
          workspace: workspaces.get(id),
          analysis: analyses.get(id) ?? null,
          clips: batches.get(id)?.snapshot().clips ?? [],
        }),
      )
    : undefined;
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
      () => drafts?.changed(workspace.id),
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
      return workspace;
    },
  });
  async function receiveSource(
    id: string,
    req: IncomingMessage,
    signal: AbortSignal,
  ) {
    const size = Number(req.headers["content-length"]);
    if (
      !Number.isSafeInteger(size) ||
      size <= 0 ||
      size > OWNER_LIMITS.sourceBytes ||
      req.headers["content-type"] !== "video/mp4"
    )
      throw new Error("invalid_source");
    await requireDisk(options.root, size * 2);
    const file = await open(await files.file(id, "source.mp4"), "wx", 0o600);
    try {
      let received = 0;
      for await (const chunk of req) {
        signal.throwIfAborted();
        received += chunk.length;
        if (received > size) throw new Error("invalid_source");
        await file.writeFile(Buffer.from(chunk));
      }
      if (received !== size) throw new Error("invalid_source");
    } finally {
      await file.close();
    }
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
            batches.delete(id);
            await files.remove(id);
            workspaces.delete(id);
            analyses.delete(id);
            expires.delete(id);
            closingWorkspaces.delete(id);
          }
        }
      })
      .catch(() => {
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
  const origin = () => `http://localhost:${boundPort()}`;
  const server = createServer((req, res) => {
    const task = handle(req, res);
    tasks.add(task);
    void task.finally(() => tasks.delete(task));
  });
  function authorized(req: IncomingMessage) {
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
  ) {
    const size = (await stat(file)).size;
    const range = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    const start = range ? Number(range[1]) : 0;
    const end = range?.[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
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
        res.destroy();
        return closed;
      },
    };
    if (workspaceId) streams.add(owned);
    try {
      input.on("error", () => res.destroy());
      input.once("close", finish);
      res.once("close", () => {
        input.destroy();
      });
      input.pipe(res);
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
      if (req.method === "GET" && asset) {
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
        /^\/api\/sources\/(downloads|desktop)\/([a-f0-9-]{36})(?:\/(locate))?$/,
      );
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
          (id, signal) => receiveSource(id, req, signal),
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
          let restoredId: string | undefined;
          try {
            const loaded = await storage.load(id, files);
            restoredId = loaded.workspace.id;
            controller.signal.throwIfAborted();
            const workspace: OwnerWorkspace = {
              ...loaded.workspace,
              mode: analysis?.mode ?? "unavailable",
            };
            const batch = createBatch(workspace);
            batch.restore(loaded.clips);
            workspaces.set(workspace.id, workspace);
            batches.set(workspace.id, batch);
            if (loaded.analysis) analyses.set(workspace.id, loaded.analysis);
            expires.set(workspace.id, Date.now() + OWNER_LIMITS.workspaceMs);
            const saved = (await storage.list()).find((item) => item.id === id);
            if (!saved) throw new Error("saved_draft_missing");
            drafts.bind(workspace.id, id, saved.savedAt);
            restoredId = undefined;
            res
              .writeHead(200, { "Content-Type": "application/json" })
              .end(JSON.stringify(workspace));
            return;
          } finally {
            uploading = false;
            if (restoredId) {
              batches.delete(restoredId);
              workspaces.delete(restoredId);
              analyses.delete(restoredId);
              expires.delete(restoredId);
              await files.remove(restoredId);
            }
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
          await requireDisk(options.root, size * 2);
          newId = await files.create();
          await receiveSource(newId, req, controller.signal);
          const inspected = await options.media(
            { workspaceId: newId, operation: "inspect" },
            controller.signal,
          );
          if (inspected.operation !== "inspect")
            throw new Error("invalid_source");
          const workspace: OwnerWorkspace = {
            id: newId,
            source: inspected.source,
            mode: analysis?.mode ?? "unavailable",
            revision: 0,
          };
          controller.signal.throwIfAborted();
          workspaces.set(newId, workspace);
          expires.set(newId, Date.now() + OWNER_LIMITS.workspaceMs);
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
        /^\/api\/workspace\/([a-f0-9-]{36})(?:\/(source|portrait|analysis|clips|assets|draft)(?:\/([a-f0-9-]{36}|cancel)(?:\/(render|cancel|output|source|edit|picture|validate)(?:\/(\d+))?)?)?)?$/,
      );
      if (
        agent &&
        (route?.[2] !== "clips" ||
          !ownerIdSchema.safeParse(route[3]).success ||
          route[5] ||
          (req.method === "GET"
            ? Boolean(route[4])
            : req.method !== "POST" ||
              !["edit", "picture", "render", "cancel", "validate"].includes(
                route[4] ?? "",
              )))
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
          route[4] === "picture"
        ) {
          if (busy.has(workspace.id)) {
            res.writeHead(409).end();
            return;
          }
          busy.add(workspace.id);
          try {
            const size = Number(req.headers["content-length"]);
            if (
              !Number.isSafeInteger(size) ||
              size <= 0 ||
              size > OWNER_PICTURE_LIMITS.inputBytes ||
              !["image/jpeg", "image/png"].includes(
                String(req.headers["content-type"]),
              )
            )
              throw new Error("invalid_picture");
            const chunks: Buffer[] = [];
            let received = 0;
            for await (const chunk of req) {
              controller.signal.throwIfAborted();
              received += chunk.length;
              if (received > size) throw new Error("invalid_picture");
              chunks.push(Buffer.from(chunk));
            }
            if (received !== size) throw new Error("invalid_picture");
            const result = await batch.picture(
              route[3],
              Buffer.concat(chunks),
              controller.signal,
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
          route[4] === "render"
        ) {
          if (busy.has(workspace.id)) {
            res.writeHead(409).end();
            return;
          }
          busy.add(workspace.id);
          try {
            const result = await batch.render(
              route[3],
              await readOwnerJson(req),
            );
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
        route?.[2] === "assets" &&
        route[3] &&
        !route[4]
      ) {
        const admitted = batches
          .get(workspace.id)
          ?.snapshot()
          .clips.some((clip) =>
            clip.assets.some((asset) => asset.id === route[3]),
          );
        if (!admitted) {
          res.writeHead(404).end();
          return;
        }
        await stream(
          await files.asset(workspace.id, route[3]),
          req,
          res,
          "image/jpeg",
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
          const inputs = ownerAnalysisInputsSchema.parse(
            await readOwnerJson(req),
          );
          if (
            inputs.policyRevision <
            (analyses.get(workspace.id)?.inputs.policyRevision ?? 0)
          ) {
            res.writeHead(409).end();
            return;
          }
          const result = await analyzeOwner(
            workspace,
            inputs,
            analysis,
            controller.signal,
          );
          controller.signal.throwIfAborted();
          analyses.set(workspace.id, result);
          drafts?.changed(workspace.id);
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
          await requireDisk(options.root, OWNER_LIMITS.outputBytes * 2);
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
        batches.delete(workspace.id);
        await files.remove(workspace.id);
        workspaces.delete(workspace.id);
        analyses.delete(workspace.id);
        expires.delete(workspace.id);
        closingWorkspaces.delete(workspace.id);
        res.writeHead(204).end();
        return;
      }
      res.writeHead(404).end();
    } catch (error) {
      if (newId) await files.remove(newId).catch(() => undefined);
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
          .end('{"error":"local_operation_unavailable"}');
    } finally {
      controllers.delete(controller);
    }
  }
  return {
    server,
    expire,
    async close() {
      closing = true;
      clearInterval(expiryTimer);
      for (const c of controllers) c.abort();
      server.closeAllConnections();
      try {
        await sources.close();
        await storage?.cancelPending();
        await Promise.allSettled([...tasks]);
        await expiryTask;
        await Promise.all([...batches.values()].map((batch) => batch.close()));
        await drafts?.close();
        batches.clear();
        await providers?.close?.(AbortSignal.timeout(30_000));
        await files.close();
        analyses.clear();
        workspaces.clear();
        expires.clear();
      } finally {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    },
  };
}
