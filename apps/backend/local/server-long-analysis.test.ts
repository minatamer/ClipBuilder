import { createHash } from "node:crypto";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it, vi } from "vitest";
import { createOwnerHost, type OwnerHostOptions } from "./server.ts";
import { fakeOwnerAnalysis } from "./fake-analysis.ts";
import { listenOwner, ownerRequest } from "../../../test/owner-http.ts";

it("recovers a whole two-hour Codex analysis and its receipts with zero inference or media calls on reopen/retry", async () => {
  const directory = await mkdtemp(join(tmpdir(), "clipbuilder-long-recovery-")),
    root = join(directory, "workspaces");
  await mkdir(root);
  const bytes = Buffer.from("synthetic long source"),
    auth = { Authorization: "Bearer synthetic" };
  const speech = vi.fn(fakeOwnerAnalysis.transcribeWindow!),
    select = vi.fn(fakeOwnerAnalysis.select);
  const media = vi.fn<OwnerHostOptions["media"]>(async (job) => {
    if (job.operation !== "inspect") throw Error("unexpected_media");
    return {
      operation: "inspect",
      source: {
        fingerprint: createHash("sha256").update(bytes).digest("hex"),
        bytes: bytes.length,
        durationMs: 7_200_000,
        width: 320,
        height: 180,
        fps: 30,
      },
    };
  });
  const create = () =>
    createOwnerHost({
      root,
      storageRoot: join(directory, "library"),
      recoverSession: true,
      token: "synthetic",
      port: 0,
      capacity: async () => {},
      media,
      providers: () => ({
        localAi: {
          aiProvider: "codex",
          aiSetup: "ready",
          captionProvider: "local-speech",
        },
        analysis: { ...fakeOwnerAnalysis, transcribeWindow: speech, select },
      }),
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
    let workspace = JSON.parse(uploaded.body.toString());
    const request = {
      sourceRevision: 0,
      policyRevision: 0,
      ranges: [],
      manualOnly: false,
      aiCount: 2,
      aiDuration: { minMs: 10_000, maxMs: 30_000 },
    };
    const response = await ownerRequest(
      port,
      `/api/workspace/${workspace.id}/analysis`,
      {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify(request),
      },
    );
    expect({
      status: response.status,
      body: response.status !== 200 ? response.body.toString() : "",
    }).toEqual({ status: 200, body: "" });
    const result = JSON.parse(response.body.toString());
    expect(result.coverage).toMatchObject({
      state: "complete",
      completed: 15,
      planned: 15,
      coveredThroughMs: 7_200_000,
    });
    expect(speech).toHaveBeenCalledTimes(15);
    expect(select).toHaveBeenCalledTimes(15);
    expect(result.suggestions[1].cut.startFrame).toBeGreaterThan(
      (6_000_000 * 30) / 1000,
    );
    await host.close();
    host = create();
    port = await listenOwner(host.server);
    workspace = JSON.parse(
      (
        await ownerRequest(port, "/api/workspace", { headers: auth })
      ).body.toString(),
    );
    const restored = JSON.parse(
      (
        await ownerRequest(port, `/api/workspace/${workspace.id}/analysis`, {
          headers: auth,
        })
      ).body.toString(),
    );
    expect(restored.suggestions).toEqual(result.suggestions);
    expect(media).toHaveBeenCalledTimes(1);
    const retry = await ownerRequest(
      port,
      `/api/workspace/${workspace.id}/analysis`,
      {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify(request),
      },
    );
    expect(retry.status).toBe(200);
    expect(JSON.parse(retry.body.toString()).calls).toEqual({
      transcription: 0,
      selection: 0,
    });
    expect(speech).toHaveBeenCalledTimes(15);
    expect(select).toHaveBeenCalledTimes(15);
    const narrow = await ownerRequest(
      port,
      `/api/workspace/${workspace.id}/analysis`,
      {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({
          ...request,
          window: { startMs: 60_000, endMs: 120_000 },
        }),
      },
    );
    expect(narrow.status).toBe(200);
    const shorter = JSON.parse(narrow.body.toString());
    expect(shorter.calls).toEqual({ transcription: 0, selection: 1 });
    expect(shorter.suggestions.length).toBeGreaterThan(0);
    expect(speech).toHaveBeenCalledTimes(15);
  } finally {
    await host.close();
    await rm(directory, { recursive: true, force: true });
  }
}, 60_000);
