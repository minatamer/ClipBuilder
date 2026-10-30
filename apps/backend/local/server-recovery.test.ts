import { expect, it, vi } from "vitest";
import { mkdtemp, mkdir, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { createOwnerHost, type OwnerHostOptions } from "./server.ts";
import { listenOwner, ownerRequest } from "../../../test/owner-http.ts";

it.each([false, true])(
  "recovers local source without native/provider work but never persists hosted sessions (%s)",
  async (hosted) => {
    const directory = await mkdtemp(
        join(tmpdir(), "clipbuilder-server-recovery-"),
      ),
      root = join(directory, "workspaces"),
      library = join(directory, "library");
    await mkdir(root);
    const bytes = Buffer.from("synthetic-source"),
      auth = { Authorization: "Bearer synthetic-recovery" };
    const media = vi.fn<OwnerHostOptions["media"]>(async (job) => {
      if (job.operation !== "inspect") throw Error("unexpected_media_call");
      return {
        operation: "inspect",
        source: {
          fingerprint: createHash("sha256").update(bytes).digest("hex"),
          bytes: bytes.length,
          durationMs: 1000,
          width: 320,
          height: 180,
          fps: 30,
        },
      };
    });
    const create = () =>
      createOwnerHost({
        root,
        storageRoot: library,
        recoverSession: true,
        hosted,
        token: "synthetic-recovery",
        port: 0,
        media,
        capacity: async () => {},
      });
    let host = create();
    try {
      let port = await listenOwner(host.server);
      const uploaded = await ownerRequest(port, "/api/source", {
        method: "POST",
        headers: { ...auth, "Content-Type": "video/mp4" },
        body: bytes,
      });
      expect(uploaded.status).toBe(200);
      const original = JSON.parse(uploaded.body.toString());
      await host.close();
      host = create();
      port = await listenOwner(host.server);
      if (!hosted) {
        const duplicate = await ownerRequest(port, "/api/source", {
          method: "POST",
          headers: { ...auth, "Content-Type": "video/mp4" },
          body: bytes,
        });
        expect(duplicate.status).toBe(400);
      }
      const response = await ownerRequest(port, "/api/workspace", {
        headers: auth,
      });
      expect(response.status).toBe(200);
      const current = JSON.parse(response.body.toString());
      if (hosted) expect(current).toBeNull();
      else {
        expect(current.id).not.toBe(original.id);
        expect(current.source).toEqual(original.source);
        const source = await ownerRequest(
          port,
          `/api/workspace/${current.id}/source`,
          { headers: auth },
        );
        expect(source.body).toEqual(bytes);
      }
      expect(media).toHaveBeenCalledTimes(1);
      await host.close();
      if (hosted) expect(await readdir(directory)).toEqual(["workspaces"]);
    } finally {
      await host.close();
      await rm(directory, { recursive: true, force: true });
    }
  },
);
it("drains a media stream whose response closed before file stat completed", async () => {
  const directory = await mkdtemp(join(tmpdir(), "clipbuilder-closed-stream-")),
    bytes = Buffer.from("synthetic");
  const host = createOwnerHost({
    root: directory,
    token: "synthetic",
    port: 0,
    capacity: async () => {},
    media: async (job) => {
      if (job.operation !== "inspect") throw Error("unexpected_media_call");
      return {
        operation: "inspect",
        source: {
          fingerprint: createHash("sha256").update(bytes).digest("hex"),
          bytes: bytes.length,
          durationMs: 1000,
          width: 320,
          height: 180,
          fps: 30,
        },
      };
    },
  });
  try {
    const port = await listenOwner(host.server),
      auth = { Authorization: "Bearer synthetic" };
    const uploaded = await ownerRequest(port, "/api/source", {
      method: "POST",
      headers: { ...auth, "Content-Type": "video/mp4" },
      body: bytes,
    });
    const workspace = JSON.parse(uploaded.body.toString());
    host.server.prependListener("request", (request, response) => {
      if (request.method === "GET" && request.url?.endsWith("/source"))
        response.destroy();
    });
    await expect(
      ownerRequest(port, `/api/workspace/${workspace.id}/source`, {
        headers: auth,
      }),
    ).rejects.toThrow();
    await new Promise((done) => setTimeout(done, 30));
    await host.close();
    expect(await readdir(directory)).toEqual([]);
  } finally {
    await host.close();
    await rm(directory, { recursive: true, force: true });
  }
}, 5000);
