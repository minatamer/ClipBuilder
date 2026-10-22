import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import {
  ownerMediaJobSchema,
  OWNER_LIMITS,
} from "../../../packages/contracts/owner/index.ts";
import {
  inspectOwnerSource,
  ownerMediaPath,
  ownerPortrait,
  type OwnerNativeTools,
} from "./media.ts";

export function createOwnerWorker(options: {
  root: string;
  token: string;
  tools: OwnerNativeTools;
}) {
  const controllers = new Set<AbortController>();
  const tasks = new Set<Promise<void>>();
  let current: { id: string; controller: AbortController } | undefined;
  let closing = false;
  let pendingCancel: string | undefined;
  let busy = false;
  const server = createServer((req, res) => {
    const task = handle(req, res);
    tasks.add(task);
    void task.finally(() => tasks.delete(task));
  });
  async function handle(req: IncomingMessage, res: ServerResponse) {
    if (
      closing ||
      req.headers.authorization !== `Bearer ${options.token}` ||
      req.headers.origin ||
      req.headers.host !==
        `127.0.0.1:${(server.address() as { port: number } | null)?.port}`
    ) {
      res.writeHead(403).end();
      return;
    }
    if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200).end('{"mode":"fake","cloud":false}');
      return;
    }
    if (req.method === "POST" && req.url === "/cancel") {
      try {
        const job = await readJob(req);
        if (current?.id === job.workspaceId) current.controller.abort();
        else pendingCancel = job.workspaceId;
        res.writeHead(204).end();
      } catch {
        res.writeHead(400).end();
      }
      return;
    }
    if (req.method !== "POST" || req.url !== "/media") {
      res.writeHead(404).end();
      return;
    }
    if (busy) {
      res.writeHead(409).end('{"error":"busy"}');
      return;
    }
    busy = true;
    const controller = new AbortController();
    controllers.add(controller);
    res.once("close", () => controller.abort());
    try {
      const job = await readJob(req);
      current = { id: job.workspaceId, controller };
      if (pendingCancel === job.workspaceId) controller.abort();
      pendingCancel = undefined;
      const source = await ownerMediaPath(
        options.root,
        job.workspaceId,
        "source.mp4",
      );
      const signal = AbortSignal.any([
        controller.signal,
        AbortSignal.timeout(10 * 60_000),
      ]);
      const result =
        job.operation === "inspect"
          ? {
              operation: "inspect",
              source: await inspectOwnerSource(source, options.tools, signal),
            }
          : await ownerPortrait(
              source,
              await ownerMediaPath(
                options.root,
                job.workspaceId,
                "portrait.mp4",
              ),
              options.tools,
              signal,
              job.cut,
              job.fingerprint,
            );
      res
        .writeHead(200, {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        })
        .end(JSON.stringify(result));
    } catch {
      if (!res.destroyed)
        res.writeHead(400).end('{"error":"media_unavailable"}');
    } finally {
      controllers.delete(controller);
      busy = false;
      current = undefined;
    }
  }
  async function readJob(req: IncomingMessage) {
    const chunks: Buffer[] = [];
    let bytes = 0;
    for await (const chunk of req) {
      bytes += chunk.length;
      if (bytes > OWNER_LIMITS.jsonBytes) throw new Error("invalid");
      chunks.push(Buffer.from(chunk));
    }
    return ownerMediaJobSchema.parse(
      JSON.parse(Buffer.concat(chunks).toString("utf8")),
    );
  }
  return {
    server,
    async close() {
      closing = true;
      for (const controller of controllers) controller.abort();
      server.closeAllConnections();
      await Promise.allSettled([...tasks]);
      await new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}
