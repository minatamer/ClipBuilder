import { createHash } from "node:crypto";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it, vi } from "vitest";
import { createOwnerHost, type OwnerHostOptions } from "./server.ts";
import { fakeOwnerAnalysis } from "./fake-analysis.ts";
import { listenOwner, ownerRequest } from "../../../test/owner-http.ts";

it("retains/paginates every unique moment beyond 360, prepares more than ten serially, recovers without work and keeps Gemini bounded", async () => {
  const directory = await mkdtemp(join(tmpdir(), "clipbuilder-many-clips-")),
    root = join(directory, "workspaces");
  await mkdir(root);
  const bytes = Buffer.from("fictional source"),
    auth = {
      Authorization: "Bearer synthetic",
      "Content-Type": "application/json",
    };
  const speech = vi.fn(fakeOwnerAnalysis.transcribeWindow!),
    select = vi.fn(fakeOwnerAnalysis.select),
    image = vi.fn();
  let active = 0,
    maximum = 0,
    provider: "codex" | "gemini" = "codex";
  const plan = vi.fn(async () => {
    active++;
    maximum = Math.max(maximum, active);
    await new Promise((done) => setTimeout(done, 1));
    active--;
    return [];
  });
  const media = vi.fn<OwnerHostOptions["media"]>(async (job) => {
    if (job.operation === "inspect")
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
    if (job.operation === "clip-preview") {
      const frames = job.cut.endFrame - job.cut.startFrame;
      await writeFile(
        join(root, job.workspaceId, `${job.clipId}.source.mp4`),
        "fictional preview",
      );
      return {
        operation: "clip-preview",
        frames,
        bytes: 17,
        durationMs: Math.round((frames * 1000) / 30),
      };
    }
    throw Error("unexpected_media");
  });
  const create = () =>
    createOwnerHost({
      root,
      storageRoot: join(directory, "library"),
      recoverSession: true,
      token: "synthetic",
      port: 0,
      media,
      capacity: async () => {},
      providers: () => ({
        ...(provider === "codex"
          ? {
              localAi: {
                aiProvider: "codex",
                aiSetup: "ready",
                captionProvider: "local-speech",
              },
            }
          : {}),
        analysis: { ...fakeOwnerAnalysis, transcribeWindow: speech, select },
        clipPreparation: { mode: "synthetic-ai", plan, image },
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
    const input = {
      sourceRevision: 0,
      policyRevision: 0,
      ranges: [],
      aiCount: "all",
      aiDuration: { minMs: 10_000, maxMs: 10_000 },
      manualOnly: false,
    };
    const response = await ownerRequest(
      port,
      `/api/workspace/${workspace.id}/analysis`,
      { method: "POST", headers: auth, body: JSON.stringify(input) },
    );
    expect(response.status).toBe(200);
    const first = JSON.parse(response.body.toString());
    expect(first.page.total).toBe(720);
    expect(first.value.suggestions).toHaveLength(50);
    const moments = [...first.value.suggestions];
    let next = first.page.next;
    while (next !== null) {
      const part = JSON.parse(
        (
          await ownerRequest(
            port,
            `/api/workspace/${workspace.id}/analysis-pages/${first.value.id}/${next}`,
            { headers: auth },
          )
        ).body.toString(),
      );
      expect(part.value.suggestions.length).toBeLessThanOrEqual(50);
      moments.push(...part.value.suggestions);
      next = part.page.next;
    }
    expect(new Set(moments.map((item) => item.processingIdentity)).size).toBe(
      720,
    );
    expect(moments.at(-1).cut.endFrame).toBe(216000);
    expect(plan).not.toHaveBeenCalled();
    const batch = await ownerRequest(
      port,
      `/api/workspace/${workspace.id}/clips`,
      {
        method: "POST",
        headers: auth,
        body: JSON.stringify({
          operationId: crypto.randomUUID(),
          analysisId: first.value.id,
          policyRevision: 0,
          sourceRevision: 0,
          momentIds: moments.slice(0, 24).map((item) => item.id),
        }),
      },
    );
    expect(batch.status).toBe(202);
    let clips;
    for (let i = 0; i < 100; i++) {
      clips = JSON.parse(
        (
          await ownerRequest(port, `/api/workspace/${workspace.id}/clips`, {
            headers: auth,
          })
        ).body.toString(),
      );
      if (!clips.active) break;
      await new Promise((done) => setTimeout(done, 10));
    }
    expect(clips.clips).toHaveLength(24);
    expect(
      clips.clips.every(
        (clip: { state: string }) => clip.state === "review-ready",
      ),
    ).toBe(true);
    expect(plan).toHaveBeenCalledTimes(24);
    expect(maximum).toBe(1);
    expect(image).not.toHaveBeenCalled();
    const before = {
      speech: speech.mock.calls.length,
      select: select.mock.calls.length,
      media: media.mock.calls.length,
    };
    await host.close();
    provider = "gemini";
    host = create();
    port = await listenOwner(host.server);
    workspace = JSON.parse(
      (
        await ownerRequest(port, "/api/workspace", { headers: auth })
      ).body.toString(),
    );
    const restored = JSON.parse(
      (
        await ownerRequest(port, `/api/workspace/${workspace.id}/clips`, {
          headers: auth,
        })
      ).body.toString(),
    );
    expect(restored.clips).toHaveLength(24);
    expect(speech).toHaveBeenCalledTimes(before.speech);
    expect(select).toHaveBeenCalledTimes(before.select);
    expect(media).toHaveBeenCalledTimes(before.media);
    const forged = await ownerRequest(
      port,
      `/api/workspace/${workspace.id}/analysis`,
      {
        method: "POST",
        headers: { ...auth, "X-ClipBuilder-Capacity": "local-codex" },
        body: JSON.stringify({ ...input, aiCount: 100 }),
      },
    );
    expect(forged.status).toBe(400);
    expect(select).toHaveBeenCalledTimes(before.select);
    expect(
      (
        await ownerRequest(
          port,
          `/api/workspace/${workspace.id}/clip-pages/0`,
          { headers: auth },
        )
      ).status,
    ).toBe(404);
  } finally {
    await host.close();
    await rm(directory, { recursive: true, force: true });
  }
}, 60_000);
