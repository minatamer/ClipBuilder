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

export type OwnerHostOptions = {
  root: string;
  ui: string;
  token: string;
  port: number;
  shutdown?: () => void;
  media: (job: OwnerMediaJob, signal: AbortSignal) => Promise<OwnerMediaResult>;
};
export function createOwnerHost(options: OwnerHostOptions) {
  const files = new WorkspaceFiles(options.root);
  const workspaces = new Map<string, OwnerWorkspace>();
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
  let expiryTask = Promise.resolve();
  function expire() {
    expiryTask = expiryTask
      .then(async () => {
        for (const [id, deadline] of expires) {
          if (Date.now() >= deadline && !busy.has(id)) {
            closingWorkspaces.add(id);
            await closeStreams(id);
            await files.remove(id);
            workspaces.delete(id);
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
        res
          .writeHead(200, { "Content-Type": "application/json" })
          .end('{"mode":"fake","paid":false,"cloud":false}');
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
      if (req.method === "POST" && req.url === "/api/source") {
        if (uploading || workspaces.size >= 1)
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
          const file = await open(
            await files.file(newId, "source.mp4"),
            "wx",
            0o600,
          );
          try {
            let received = 0;
            for await (const chunk of req) {
              controller.signal.throwIfAborted();
              received += chunk.length;
              if (received > size) throw new Error("invalid_source");
              await file.writeFile(Buffer.from(chunk));
            }
            if (received !== size) throw new Error("invalid_source");
          } finally {
            await file.close();
          }
          const inspected = await options.media(
            { workspaceId: newId, operation: "inspect" },
            controller.signal,
          );
          if (inspected.operation !== "inspect")
            throw new Error("invalid_source");
          const workspace: OwnerWorkspace = {
            id: newId,
            source: inspected.source,
            mode: "synthetic-ai",
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
      const route = req.url?.match(
        /^\/api\/workspace\/([a-f0-9-]{36})(?:\/(source|portrait))?$/,
      );
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
      if (req.method === "GET" && route?.[2]) {
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
        if (busy.has(workspace.id)) {
          res.writeHead(409).end();
          return;
        }
        busy.add(workspace.id);
        try {
          await requireDisk(options.root, OWNER_LIMITS.outputBytes * 2);
          const result = await options.media(
            { workspaceId: workspace.id, operation: "portrait" },
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
        if (busy.has(workspace.id)) {
          res.writeHead(409).end();
          return;
        }
        closingWorkspaces.add(workspace.id);
        await closeStreams(workspace.id);
        await files.remove(workspace.id);
        workspaces.delete(workspace.id);
        expires.delete(workspace.id);
        closingWorkspaces.delete(workspace.id);
        res.writeHead(204).end();
        return;
      }
      res.writeHead(404).end();
    } catch {
      if (newId) await files.remove(newId).catch(() => undefined);
      if (!res.destroyed)
        res
          .writeHead(400, { "Content-Type": "application/json" })
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
      await Promise.allSettled([...tasks]);
      await expiryTask;
      await files.close();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}
