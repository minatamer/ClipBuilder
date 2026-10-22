import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createHash, randomUUID } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  createOwnerHost,
  type OwnerHostOptions,
} from "../apps/backend/owner/server.ts";
import { fakeOwnerAcquisition } from "../apps/backend/owner/fake-acquisition.ts";
import { fakeOwnerAnalysis } from "../apps/backend/owner/fake-analysis.ts";
import { fakeOwnerClipPreparation } from "../apps/backend/owner/fake-clips.ts";
import { ownerWorkspaceSchema } from "../packages/contracts/owner/index.ts";
import {
  ownerYoutubeOfferSchema,
  ownerAcquisitionProgressSchema,
} from "../packages/contracts/owner/acquisition.ts";
import {
  ownerSourceCatalogSchema,
  ownerSourceLookupSchema,
} from "../packages/contracts/owner/acquisition-flow.ts";
import { ownerAnalysisSchema } from "../packages/contracts/owner/selection.ts";
import { ownerClipListSchema } from "../packages/contracts/owner/clips.ts";
import { listenOwner, ownerRequest } from "./owner-http.ts";

// The host/coordinator/library/filesystem are real; AI/native bytes are counted
// doubles. Encoded compatibility is covered by the separate native proof.
const auth = { Authorization: "Bearer synthetic-source-api" },
  json = { ...auth, "Content-Type": "application/json" };
let directory: string,
  root: string,
  host: ReturnType<typeof createOwnerHost> | undefined,
  port: number;
let media: ReturnType<typeof vi.fn<OwnerHostOptions["media"]>>;
const acquisition = {
  mode: "synthetic-source" as const,
  metadata: vi.fn(fakeOwnerAcquisition.metadata),
  download: vi.fn(fakeOwnerAcquisition.download),
};
const analysis = {
  mode: "synthetic-ai" as const,
  transcribe: vi.fn(fakeOwnerAnalysis.transcribe),
  select: vi.fn(fakeOwnerAnalysis.select),
};
const preparation = {
  mode: "synthetic-ai" as const,
  plan: vi.fn(fakeOwnerClipPreparation.plan),
  image: vi.fn(fakeOwnerClipPreparation.image),
};
beforeEach(async () => {
  vi.clearAllMocks();
  directory = await mkdtemp(join(tmpdir(), "clipbuilder-owner-source-api-"));
  root = join(directory, "scratch");
  await mkdir(root);
  media = vi.fn(async (job, signal) => {
    signal.throwIfAborted();
    const sourcePath = join(root, job.workspaceId, "source.mp4");
    if (
      job.operation === "synthesize-acquisition" ||
      job.operation === "inspect-acquisition"
    ) {
      if (job.operation === "synthesize-acquisition")
        await writeFile(
          sourcePath,
          `synthetic acquired source:${job.expected.width}x${job.expected.height}`,
        );
      const bytes = await readFile(sourcePath);
      return {
        operation: job.operation,
        descriptor: structuredClone(job.expected),
        source: {
          fingerprint: createHash("sha256").update(bytes).digest("hex"),
          bytes: bytes.length,
          durationMs: job.expected.durationMs,
          width: job.expected.width,
          height: job.expected.height,
          fps: job.expected.fps,
        },
      };
    }
    if (job.operation !== "clip") throw new Error("unexpected_native_call");
    const bytes = Buffer.from("synthetic native clip");
    await writeFile(
      join(root, job.workspaceId, `${job.clipId}.r${job.renderRevision}.mp4`),
      bytes,
    );
    return {
      operation: "clip",
      bytes: bytes.length,
      frames: job.overlay.frames,
      durationMs: Math.round((job.overlay.frames * 1000) / 30),
    };
  });
});
afterEach(async () => {
  await host?.close();
  host = undefined;
  expect(await readdir(root)).toEqual([]);
  await rm(directory, { recursive: true, force: true });
});
async function start(withAcquisition: boolean) {
  host = createOwnerHost({
    root,
    ui: directory,
    token: "synthetic-source-api",
    port: 0,
    storageRoot: join(directory, "Downloads", "ClipBuilder"),
    desktopStorageRoot: join(directory, "Desktop", "ClipBuilder"),
    ...(withAcquisition ? { acquisition } : {}),
    analysis,
    clipPreparation: preparation,
    media,
  });
  port = await listenOwner(host.server);
}
const get = (path: string) => ownerRequest(port, path, { headers: auth });
const post = (path: string, body: unknown) =>
  ownerRequest(port, path, {
    method: "POST",
    headers: json,
    body: JSON.stringify(body),
  });

it("imports through protected HTTP into the existing range/analysis/batch flow and reuses the retained source after an offline host restart", async () => {
  await start(true);
  const link = { url: "https://youtu.be/aaaaaaaaaaa?t=7" };
  expect(
    ownerSourceLookupSchema.parse(
      JSON.parse((await post("/api/sources/lookup", link)).body.toString()),
    ).saved,
  ).toEqual([]);
  expect(acquisition.metadata).toHaveBeenCalledTimes(0);
  expect(acquisition.download).toHaveBeenCalledTimes(0);
  const offer = ownerYoutubeOfferSchema.parse(
      JSON.parse(
        (
          await post("/api/sources/metadata", {
            ...link,
            rightsAcknowledged: true,
          })
        ).body.toString(),
      ),
    ),
    choice = offer.choices.find((item) => item.tier === 1080)!;
  const accepted = await post("/api/sources/import", {
    destination: "downloads",
    request: {
      sourceId: offer.sourceId,
      revision: offer.revision,
      choiceId: choice.id,
      selection: { kind: "tier", tier: 1080 },
      rightsAcknowledged: true,
    },
  });
  expect(accepted.status).toBe(202);
  await vi.waitFor(async () => {
    expect(
      ownerAcquisitionProgressSchema.parse(
        JSON.parse((await get("/api/sources/state")).body.toString()),
      ).stage,
    ).toBe("ready");
  });
  const workspace = ownerWorkspaceSchema.parse(
    JSON.parse((await get("/api/workspace")).body.toString()),
  );
  expect(workspace.source.width).toBe(1920);
  expect(workspace.source.height).toBe(1080);
  const analyzed = await post(`/api/workspace/${workspace.id}/analysis`, {
    sourceRevision: 0,
    policyRevision: 1,
    ranges: [{ id: randomUUID(), startMs: 200, endMs: 1200 }],
    aiDuration: { minMs: 10_000, maxMs: 10_000 },
    manualOnly: true,
  });
  expect(analyzed.status).toBe(200);
  const completed = ownerAnalysisSchema.parse(
    JSON.parse(analyzed.body.toString()),
  );
  expect(completed.manual).toHaveLength(1);
  expect(
    (
      await post(`/api/workspace/${workspace.id}/clips`, {
        operationId: randomUUID(),
        analysisId: completed.id,
        sourceRevision: 0,
        policyRevision: 1,
        momentIds: [completed.manual[0]!.id],
      })
    ).status,
  ).toBe(202);
  await vi.waitFor(async () => {
    expect(
      ownerClipListSchema.parse(
        JSON.parse(
          (await get(`/api/workspace/${workspace.id}/clips`)).body.toString(),
        ),
      ).clips[0]?.state,
    ).toBe("ready");
  });
  expect(analysis.transcribe).toHaveBeenCalledTimes(1);
  expect(analysis.select).toHaveBeenCalledTimes(0);
  expect(preparation.plan).toHaveBeenCalledTimes(1);
  expect(preparation.image).toHaveBeenCalledTimes(1);
  expect(acquisition.metadata).toHaveBeenCalledTimes(1);
  expect(acquisition.download).toHaveBeenCalledTimes(1);
  expect(media.mock.calls.map(([job]) => job.operation)).toEqual([
    "synthesize-acquisition",
    "clip",
  ]);
  const catalog = ownerSourceCatalogSchema.parse(
      JSON.parse((await get("/api/sources")).body.toString()),
    ),
    saved = catalog.entries[0]!.variant;
  expect(JSON.stringify(catalog)).not.toContain("videoId");
  expect(JSON.stringify(catalog)).not.toContain(directory);
  expect(catalog.bytes).toBe(workspace.source.bytes);
  const blockedDelete = await ownerRequest(
    port,
    `/api/sources/downloads/${saved.id}`,
    {
      method: "DELETE",
      headers: auth,
    },
  );
  expect(blockedDelete.status).toBe(409);
  expect(
    ownerSourceCatalogSchema.parse(
      JSON.parse((await get("/api/sources")).body.toString()),
    ).entries[0]?.variant,
  ).toEqual(saved);
  await host!.close();
  host = undefined;
  expect(await readdir(root)).toEqual([]);
  await start(false);
  const lookup = ownerSourceLookupSchema.parse(
    JSON.parse(
      (
        await post("/api/sources/lookup", {
          url: "https://www.youtube.com/watch?v=aaaaaaaaaaa&start=99",
        })
      ).body.toString(),
    ),
  );
  expect(lookup.metadataAvailable).toBe(false);
  expect(lookup.saved[0]!.variant.id).toBe(saved.id);
  const opened = await post("/api/sources/open", {
    destination: "downloads",
    variantId: saved.id,
  });
  expect(opened.status).toBe(200);
  expect(
    ownerWorkspaceSchema.parse(JSON.parse(opened.body.toString())).source
      .fingerprint,
  ).toBe(workspace.source.fingerprint);
  expect(acquisition.metadata).toHaveBeenCalledTimes(1);
  expect(acquisition.download).toHaveBeenCalledTimes(1);
  expect(analysis.transcribe).toHaveBeenCalledTimes(1);
  expect(analysis.select).toHaveBeenCalledTimes(0);
  expect(media.mock.calls.map(([job]) => job.operation)).toEqual([
    "synthesize-acquisition",
    "clip",
    "inspect-acquisition",
  ]);
});

it("rejects unauthorized clients and missing rights acknowledgment before metadata, downloading, native work or library creation", async () => {
  await start(true);
  expect(
    (
      await ownerRequest(port, "/api/sources/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: "https://youtu.be/aaaaaaaaaaa",
          rightsAcknowledged: true,
        }),
      })
    ).status,
  ).toBe(403);
  expect(
    (
      await post("/api/sources/metadata", {
        url: "https://youtu.be/aaaaaaaaaaa",
      })
    ).status,
  ).toBe(400);
  expect(
    (await post("/api/sources/lookup", { url: "https://127.0.0.1/private" }))
      .status,
  ).toBe(400);
  expect(acquisition.metadata).toHaveBeenCalledTimes(0);
  expect(acquisition.download).toHaveBeenCalledTimes(0);
  expect(media).toHaveBeenCalledTimes(0);
  expect((await readdir(directory)).sort()).toEqual(["scratch"]);
});
