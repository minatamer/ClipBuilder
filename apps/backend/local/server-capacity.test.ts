import { expect, it, vi } from "vitest";
import { mkdtemp, rmdir, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { createOwnerHost, type OwnerHostOptions } from "./server.ts";
import { listenOwner, ownerRequest } from "../../../test/owner-http.ts";
import { OWNER_LIMITS } from "../../../packages/contracts/local/policy.ts";

it.each(["codex", "gemini", "hosted"] as const)(
  "admits twenty-five manual rows only on the composed expanded profile (%s)",
  async (kind) => {
    const root = await mkdtemp(join(tmpdir(), "clipbuilder-manual-capacity-"));
    const bytes = Buffer.from("synthetic-source");
    const media = vi.fn<OwnerHostOptions["media"]>(async () => ({
      operation: "inspect",
      source: {
        fingerprint: createHash("sha256").update(bytes).digest("hex"),
        bytes: bytes.length,
        durationMs: 120000,
        width: 320,
        height: 180,
        fps: 30,
      },
    }));
    const transcribe = vi.fn(async () => []),
      select = vi.fn(async () => []);
    const host = createOwnerHost({
      root,
      port: 0,
      token: "synthetic-manual",
      hosted: kind === "hosted",
      media,
      capacity: async () => {},
      providers: () => ({
        ...(kind !== "gemini"
          ? {
              localAi: {
                aiProvider: "codex" as const,
                aiSetup: "ready" as const,
                captionProvider: "local-speech" as const,
              },
            }
          : {}),
        analysis: { mode: "synthetic-ai", transcribe, select },
      }),
    });
    try {
      const port = await listenOwner(host.server),
        headers = { Authorization: "Bearer synthetic-manual" };
      const opened = await ownerRequest(port, "/api/source", {
        method: "POST",
        headers: { ...headers, "Content-Type": "video/mp4" },
        body: bytes,
      });
      expect(opened.status).toBe(200);
      const workspace = JSON.parse(opened.body.toString());
      const request = {
        sourceRevision: workspace.revision,
        policyRevision: 1,
        manualOnly: true,
        aiDuration: { minMs: 10000, maxMs: 30000 },
        ranges: Array.from({ length: 25 }, (_, i) => ({
          id: crypto.randomUUID(),
          startMs: i * 4000,
          endMs: i * 4000 + 2000,
        })),
      };
      const result = await ownerRequest(
        port,
        `/api/workspace/${workspace.id}/analysis`,
        {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
            "X-ClipBuilder-Capacity": "local-codex",
          },
          body: JSON.stringify(request),
        },
      );
      expect(result.status).toBe(kind === "codex" ? 200 : 400);
      if (kind === "codex") {
        const response = JSON.parse(result.body.toString());
        expect((response.value ?? response).manual).toHaveLength(25);
      }
      expect(transcribe).toHaveBeenCalledTimes(kind === "codex" ? 1 : 0);
      expect(select).not.toHaveBeenCalled();
      expect(media).toHaveBeenCalledTimes(1);
    } finally {
      await host.close();
      expect(await readdir(root)).toEqual([]);
      await rmdir(root);
    }
  },
);

it.each(["codex", "gemini", "hosted"] as const)(
  "binds %s capacity to composition and rejects forged expansion before AI",
  async (kind) => {
    const root = await mkdtemp(join(tmpdir(), "clipbuilder-capacity-test-"));
    const bytes = Buffer.from("synthetic-source");
    const media = vi.fn<OwnerHostOptions["media"]>(async () => ({
      operation: "inspect",
      source: {
        fingerprint: createHash("sha256").update(bytes).digest("hex"),
        bytes: bytes.length,
        durationMs: 2 * OWNER_LIMITS.sourceMs,
        width: 320,
        height: 180,
        fps: 30,
      },
    }));
    const transcribe = vi.fn(async () => []);
    const host = createOwnerHost({
      root,
      port: 0,
      token: "synthetic-capacity",
      hosted: kind === "hosted",
      media,
      capacity: async () => {},
      providers: () => ({
        ...(kind !== "gemini"
          ? {
              localAi: {
                aiProvider: "codex" as const,
                aiSetup: "ready" as const,
                captionProvider: "local-speech" as const,
              },
            }
          : {}),
        analysis: { mode: "synthetic-ai", transcribe, select: async () => [] },
      }),
    });
    try {
      const port = await listenOwner(host.server);
      const headers = { Authorization: "Bearer synthetic-capacity" };
      const capabilities = JSON.parse(
        (
          await ownerRequest(port, "/api/capabilities", { headers })
        ).body.toString(),
      );
      if (kind === "hosted")
        expect(capabilities).not.toHaveProperty("capacity");
      else
        expect(capabilities.capacity).toMatchObject({
          profile: kind === "codex" ? "local-codex" : "bounded",
          longSources: kind === "codex",
          manyClips: kind === "codex",
          sourceBytes: kind === "codex" ? null : OWNER_LIMITS.sourceBytes,
          sourceMs: kind === "codex" ? null : OWNER_LIMITS.sourceMs,
        });
      if (kind !== "codex") {
        const oversized = await ownerRequest(port, "/api/source", {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "video/mp4",
            "Content-Length": String(OWNER_LIMITS.sourceBytes + 1),
            "X-ClipBuilder-Capacity": "local-codex",
          },
          body: bytes,
        });
        expect(oversized.status).toBe(400);
        expect(media).toHaveBeenCalledTimes(0);
      }
      const long = await ownerRequest(port, "/api/source", {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "video/mp4",
          "X-ClipBuilder-Capacity": "local-codex",
        },
        body: bytes,
      });
      expect(long.status).toBe(kind === "codex" ? 200 : 400);
      expect(media).toHaveBeenCalledTimes(1);
      expect(transcribe).toHaveBeenCalledTimes(0);
      if (kind !== "codex") expect(await readdir(root)).toEqual([]);
    } finally {
      await host.close();
      await rmdir(root);
    }
  },
);

it.each(["/api/source", "/api/open/video"])(
  "reports low disk at %s before native/AI work and removes owned scratch",
  async (path) => {
    const root = await mkdtemp(join(tmpdir(), "clipbuilder-capacity-test-"));
    const media = vi.fn<OwnerHostOptions["media"]>();
    const host = createOwnerHost({
      root,
      port: 0,
      token: "synthetic-capacity",
      media,
      capacity: async () => {
        throw new Error("disk_unavailable");
      },
    });
    try {
      const port = await listenOwner(host.server);
      const response = await ownerRequest(port, path, {
        method: "POST",
        headers: {
          Authorization: "Bearer synthetic-capacity",
          "Content-Type": "video/mp4",
        },
        body: "synthetic",
      });
      expect(response.status).toBe(507);
      expect(JSON.parse(response.body.toString())).toEqual({
        error: "disk_unavailable",
      });
      expect(media).toHaveBeenCalledTimes(0);
      expect(await readdir(root)).toEqual([]);
    } finally {
      await host.close();
      await rmdir(root);
    }
  },
);
