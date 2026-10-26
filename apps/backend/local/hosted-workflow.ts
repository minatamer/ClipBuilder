import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { sessionStartProofSchema } from "@clipbuilder/contracts";
import type { AbuseVerifier } from "../src/admission/processing.admission.js";
import {
  createOwnerHost,
  type OwnerHostOptions,
  type OwnerHostProviders,
} from "./server.ts";
import type { WorkspaceFiles } from "./workspace-files.ts";
import { LocalDiagnostics } from "./diagnostics.ts";
import type { OwnerAiMode } from "../../../packages/contracts/local/policy.ts";
import type { requireDisk } from "./workspace-files.ts";
import { HostedUpload, hostedJson } from "./hosted-upload.ts";
import { z } from "zod";

import {
  EDITING_SESSION_COOKIE,
  EDITING_CSRF_COOKIE,
  HOSTED_EDITING_POLICY,
  hostedEditingPath,
} from "../../../packages/contracts/local/hosted-editing.ts";
export {
  EDITING_SESSION_COOKIE,
  EDITING_CSRF_COOKIE,
  HOSTED_EDITING_POLICY,
  hostedEditingPath,
} from "../../../packages/contracts/local/hosted-editing.ts";
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const equal = (a: string, b: string) =>
  Buffer.byteLength(a) === Buffer.byteLength(b) &&
  timingSafeEqual(Buffer.from(a), Buffer.from(b));
export function editingCookie(
  header: string | undefined,
  name: string,
): string | null {
  if (!header || header.length > 8192) return null;
  const matches = header
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.startsWith(name + "="));
  if (matches.length !== 1) return null;
  const value = matches[0]!.slice(name.length + 1);
  return /^[A-Za-z0-9_-]{43}$/u.test(value) ? value : null;
}
type Session = {
  csrf: string;
  expires: number;
  calls: number;
  native: number;
  reads: number;
  bytes: number;
  host: ReturnType<typeof createOwnerHost>;
  upload: HostedUpload;
  transfers: Set<{ request: IncomingMessage; done: Promise<void> }>;
};
type Options = {
  root: string;
  origin: string;
  ttlMs: number;
  siteKey?: string;
  aiMode: OwnerAiMode;
  captionGeneration?: boolean;
  providerCalls?: number;
  sourceLimits: { bytes: number; durationMs: number };
  abuse: AbuseVerifier;
  capacity: typeof requireDisk;
  media: OwnerHostOptions["media"];
  providers(files: WorkspaceFiles): OwnerHostProviders;
  diagnostics?: LocalDiagnostics;
  now?: () => number;
};

/** Same editing use cases, one isolated temporary session per backend instance. */
export function createHostedEditingWorkflow(options: Options) {
  const sessions = new Map<string, Session>();
  const trusted = new WeakSet<IncomingMessage>();
  const diagnostics = options.diagnostics ?? new LocalDiagnostics();
  const now = options.now ?? Date.now;
  const providerLimit = Math.min(
    options.providerCalls ?? HOSTED_EDITING_POLICY.providerCalls,
    HOSTED_EDITING_POLICY.providerCalls,
  );
  if (!Number.isSafeInteger(providerLimit) || providerLimit < 1)
    throw new Error("provider_budget_invalid");
  let starts: number[] = [],
    pending = 0,
    providerCalls = 0,
    closing = false;
  const cleanup = new Set<Promise<void>>();
  const recovery = new Map<string, Session>();
  const discard = (key: string, session: Session) => {
    sessions.delete(key);
    const task = (async () => {
      for (const transfer of session.transfers) transfer.request.destroy();
      await Promise.allSettled(
        [...session.transfers].map((transfer) => transfer.done),
      );
      const results = await Promise.allSettled([
        session.host.close(),
        session.upload.discard(),
      ]);
      const failures = results.filter((result) => result.status === "rejected");
      if (failures.length)
        throw new AggregateError(
          failures.map((result) => result.reason),
          "hosted_cleanup_failed",
        );
      recovery.delete(key);
    })();
    cleanup.add(task);
    void task
      .catch((error) => {
        recovery.set(key, session);
        const failures: unknown[] =
          error instanceof AggregateError ? error.errors : [error];
        for (const failure of failures) diagnostics.failure("cleanup", failure);
      })
      .finally(() => cleanup.delete(task));
    return task;
  };
  const sweep = () => {
    for (const [key, session] of sessions)
      if (session.expires <= now()) void discard(key, session);
    if (!cleanup.size)
      for (const [key, session] of recovery) void discard(key, session);
  };
  const timer = setInterval(sweep, 30_000);
  timer.unref();
  const reply = (res: ServerResponse, status: number, value: unknown) =>
    res
      .writeHead(status, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      })
      .end(JSON.stringify(value));
  const cookies = (
    res: ServerResponse,
    token: string,
    csrf: string,
    maxAge: number,
  ) =>
    res.setHeader("Set-Cookie", [
      `${EDITING_SESSION_COOKIE}=${token}; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}`,
      `${EDITING_CSRF_COOKIE}=${csrf}; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}`,
    ]);
  async function dispatch(req: IncomingMessage, res: ServerResponse) {
    const path = req.url ?? "",
      method = req.method ?? "";
    if (closing || !hostedEditingPath(method, path)) {
      res.writeHead(404).end();
      return;
    }
    if (
      req.headers.origin !== options.origin ||
      req.headers["sec-fetch-site"] !== "same-origin"
    ) {
      res.writeHead(403).end();
      return;
    }
    sweep();
    const token = editingCookie(req.headers.cookie, EDITING_SESSION_COOKIE);
    const session = token ? sessions.get(hash(token)) : undefined;
    if (path === "/capabilities") {
      reply(res, 200, {
        execution: "hosted",
        aiMode: options.aiMode,
        sourceMode: null,
        planningAvailable: true,
        captionGeneration:
          options.captionGeneration ?? options.aiMode === "provider-ai",
        localMedia: false,
        cloud: true,
        ...(options.siteKey ? { processingSiteKey: options.siteKey } : {}),
      });
      return;
    }
    if (method === "POST" && path === "/session") {
      if (session) {
        reply(res, 200, { active: true });
        return;
      }
      starts = starts.filter(
        (time) => time > now() - HOSTED_EDITING_POLICY.rateWindowMs,
      );
      if (
        sessions.size + cleanup.size + recovery.size >=
          HOSTED_EDITING_POLICY.sessions ||
        pending >= HOSTED_EDITING_POLICY.pendingStarts
      ) {
        res.writeHead(429).end();
        return;
      }
      if (starts.length >= HOSTED_EDITING_POLICY.starts) {
        res.writeHead(429).end();
        return;
      }
      if (
        req.headers["content-type"] !== "application/json" ||
        (req.headers["content-encoding"] ?? "identity") !== "identity"
      ) {
        res.writeHead(415).end();
        return;
      }
      pending++;
      const controller = new AbortController();
      const abort = () => {
        if (!res.writableEnded) controller.abort();
      };
      res.once("close", abort);
      const deadline = setTimeout(() => {
        controller.abort();
        req.destroy();
      }, 5000);
      try {
        const chunks: Buffer[] = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 8192) throw new Error("session_proof_large");
          chunks.push(Buffer.from(chunk));
        }
        const proof = sessionStartProofSchema.parse(
          JSON.parse(Buffer.concat(chunks).toString("utf8")),
        );
        const verified = await options.abuse.verify({
          token: proof.turnstileToken,
          action: "session-start",
          sessionId: proof.startNonce,
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(5000),
          ]),
        });
        controller.signal.throwIfAborted();
        if (!verified) {
          res.writeHead(403).end();
          return;
        }
        if (
          closing ||
          sessions.size + cleanup.size + recovery.size >=
            HOSTED_EDITING_POLICY.sessions
        ) {
          res.writeHead(429).end();
          return;
        }
        const secret = randomBytes(32).toString("base64url"),
          csrf = randomBytes(32).toString("base64url");
        const upload = new HostedUpload(
          options.root,
          options.sourceLimits.bytes,
        );
        const charge = () => {
          if (
            closing ||
            entry.expires <= now() ||
            entry.calls >= providerLimit ||
            providerCalls >= providerLimit
          )
            throw new Error("provider_budget_exhausted");
          entry.calls++;
          providerCalls++;
        };
        const media: OwnerHostOptions["media"] = async (...args) => {
          if (
            closing ||
            entry.expires <= now() ||
            entry.native >= HOSTED_EDITING_POLICY.nativeCalls
          )
            throw new Error("native_budget_exhausted");
          entry.native++;
          return options.media(...args);
        };
        const host = createOwnerHost({
          root: options.root,
          token: randomBytes(32).toString("hex"),
          port: 0,
          hosted: true,
          authorize: (request) => trusted.has(request),
          frontendOrigin: options.origin,
          media,
          sourceLimits: options.sourceLimits,
          capacity: options.capacity,
          diagnostics,
          async receiveSource(id, files, request, signal) {
            const value = z
              .object({ uploadId: z.uuid() })
              .strict()
              .parse(await hostedJson(request));
            return upload.finish(value.uploadId, files, id, signal);
          },
          reserveRead(bytes) {
            if (
              entry.reads >= HOSTED_EDITING_POLICY.reads ||
              bytes > HOSTED_EDITING_POLICY.readBytes - entry.bytes
            )
              throw new Error("delivery_budget_exhausted");
            entry.reads++;
            entry.bytes += bytes;
          },
          providers(files) {
            const ports = options.providers(files);
            return {
              ...ports,
              ...(ports.captionTranscription
                ? {
                    captionTranscription: async (
                      ...args: Parameters<
                        NonNullable<typeof ports.captionTranscription>
                      >
                    ) => {
                      charge();
                      return ports.captionTranscription!(...args);
                    },
                  }
                : {}),
              ...(ports.analysis
                ? {
                    analysis: {
                      ...ports.analysis,
                      async transcribe(...args) {
                        charge();
                        return ports.analysis!.transcribe(...args);
                      },
                      async select(...args) {
                        charge();
                        return ports.analysis!.select(...args);
                      },
                    },
                  }
                : {}),
              ...(ports.clipPreparation
                ? {
                    clipPreparation: {
                      ...ports.clipPreparation,
                      async plan(...args) {
                        charge();
                        return ports.clipPreparation!.plan(...args);
                      },
                      async image(...args) {
                        charge();
                        return ports.clipPreparation!.image(...args);
                      },
                    },
                  }
                : {}),
            };
          },
        });
        const entry: Session = {
          csrf,
          expires: now() + options.ttlMs,
          calls: 0,
          native: 0,
          reads: 0,
          bytes: 0,
          host,
          upload,
          transfers: new Set(),
        };
        sessions.set(hash(secret), entry);
        starts.push(now());
        cookies(res, secret, csrf, Math.floor(options.ttlMs / 1000));
        reply(res, 201, { active: true });
      } catch (error) {
        diagnostics.failure("http_request", error);
        if (!res.destroyed) reply(res, 400, { error: "session_unavailable" });
      } finally {
        pending--;
        clearTimeout(deadline);
        res.off("close", abort);
      }
      return;
    }
    if (method === "GET" && path === "/session") {
      reply(res, 200, { active: Boolean(session) });
      return;
    }
    if (!session) {
      if (method === "GET" && path === "/workspace") reply(res, 200, null);
      else res.writeHead(401).end();
      return;
    }
    if (
      method !== "GET" &&
      (!equal((req.headers["x-csrf-token"] as string) ?? "", session.csrf) ||
        !equal(
          editingCookie(req.headers.cookie, EDITING_CSRF_COOKIE) ?? "",
          session.csrf,
        ))
    ) {
      res.writeHead(403).end();
      return;
    }
    if (method === "DELETE" && path === "/session") {
      await discard(hash(token!), session);
      cookies(res, "", "", 0);
      res.writeHead(204).end();
      return;
    }
    if (method === "POST" && path === "/upload") {
      await transfer(session, req, res, () => session.upload.start(req), 201);
      return;
    }
    const chunk =
      method === "PUT"
        ? /^\/upload\/([a-f0-9-]{36})\/(\d{1,5})$/u.exec(path)
        : null;
    if (chunk) {
      await transfer(
        session,
        req,
        res,
        () => session.upload.chunk(chunk[1]!, Number(chunk[2]), req),
        200,
      );
      return;
    }
    req.url = "/api" + path;
    trusted.add(req);
    const deadline = setTimeout(() => req.destroy(), 30 * 60_000);
    try {
      await session.host.dispatch(req, res);
    } finally {
      clearTimeout(deadline);
      trusted.delete(req);
    }
  }
  async function transfer(
    session: Session,
    req: IncomingMessage,
    res: ServerResponse,
    work: () => Promise<unknown>,
    status: number,
  ) {
    let finish!: () => void;
    const done = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const tracked = { request: req, done };
    session.transfers.add(tracked);
    const deadline = setTimeout(() => req.destroy(), 120_000);
    try {
      reply(res, status, await work());
    } catch {
      if (!res.destroyed) reply(res, 400, { error: "upload_unavailable" });
    } finally {
      clearTimeout(deadline);
      session.transfers.delete(tracked);
      finish();
    }
  }
  return {
    dispatch,
    async close() {
      closing = true;
      clearInterval(timer);
      await Promise.allSettled(
        [...sessions, ...recovery].map(([key, session]) =>
          discard(key, session),
        ),
      );
      await Promise.allSettled([...cleanup]);
    },
  };
}
