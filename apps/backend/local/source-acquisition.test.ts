import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
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
import { OwnerSourceAcquisition } from "./source-acquisition.ts";
import { fakeOwnerAcquisition } from "./fake-acquisition.ts";
import { WorkspaceFiles } from "./workspace-files.ts";
import { OwnerSourceLibrary } from "./source-library.ts";
import { OWNER_LIMITS } from "../../../packages/contracts/local/index.ts";
import type { OwnerAcquisitionPort } from "./acquisition-port.ts";
import type {
  OwnerMediaJob,
  OwnerMediaResult,
  OwnerWorkspace,
} from "../../../packages/contracts/local/index.ts";
import type { OwnerYoutubeOffer } from "../../../packages/contracts/local/acquisition.ts";

let directory: string, files: WorkspaceFiles, current: OwnerWorkspace | null;
let acquisition: OwnerSourceAcquisition,
  releases: Array<() => void>,
  metadataTasks: Promise<unknown>[];
let metadata: ReturnType<typeof vi.fn<OwnerAcquisitionPort["metadata"]>>,
  download: ReturnType<typeof vi.fn<OwnerAcquisitionPort["download"]>>;
let media: ReturnType<
  typeof vi.fn<
    (job: OwnerMediaJob, signal: AbortSignal) => Promise<OwnerMediaResult>
  >
>;
const url = "https://www.youtube.com/watch?v=aaaaaaaaaaa";
const signal = () => new AbortController().signal;
beforeEach(async () => {
  directory = await mkdtemp(
    join(tmpdir(), "clipbuilder-owner-acquisition-test-"),
  );
  const scratch = join(directory, "scratch");
  await mkdir(scratch);
  files = new WorkspaceFiles(scratch);
  current = null;
  releases = [];
  metadataTasks = [];
  metadata = vi.fn(fakeOwnerAcquisition.metadata);
  download = vi.fn(fakeOwnerAcquisition.download);
  media = vi.fn(async (job, operationSignal) => {
    operationSignal.throwIfAborted();
    if (
      job.operation !== "synthesize-acquisition" &&
      job.operation !== "inspect-acquisition"
    )
      throw new Error("unexpected_media_job");
    const sourcePath = await files.file(job.workspaceId, "source.mp4");
    if (job.operation === "synthesize-acquisition")
      await writeFile(
        sourcePath,
        `synthetic full source:${job.expected.width}x${job.expected.height}`,
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
  });
  acquisition = create();
});
afterEach(async () => {
  for (const release of releases) release();
  await Promise.allSettled(metadataTasks);
  await acquisition.close();
  await files.close();
  expect(await readdir(files.root)).toEqual([]);
  await rm(directory, { recursive: true, force: true });
});
function create(
  port: OwnerAcquisitionPort | undefined = {
    mode: "synthetic-source",
    metadata,
    download,
  },
) {
  return new OwnerSourceAcquisition({
    files,
    roots: {
      downloads: join(directory, "Downloads", "ClipBuilder"),
      desktop: join(directory, "Desktop", "ClipBuilder"),
    },
    ...(port ? { port } : {}),
    media,
    available: () => current === null,
    opened(id, source) {
      if (current) throw new Error("workspace_busy");
      return (current = { id, source, mode: "synthetic-ai", revision: 0 });
    },
  });
}
function input(
  offer: OwnerYoutubeOffer,
  tier = 1080,
  destination: "downloads" | "desktop" = "downloads",
) {
  const choice = offer.choices.find((item) => item.tier === tier)!;
  return {
    destination,
    request: {
      sourceId: offer.sourceId,
      revision: offer.revision,
      choiceId: choice.id,
      selection: { kind: "tier" as const, tier },
    },
  };
}
async function settled() {
  await vi.waitFor(() => expect(acquisition.active).toBe(false));
  return acquisition.snapshot()!;
}
async function clear() {
  if (current) await files.remove(current.id);
  current = null;
}
function held() {
  let release!: () => void, entered!: () => void;
  const waiting = new Promise<void>((done) => {
      release = done;
    }),
    started = new Promise<void>((done) => {
      entered = done;
    });
  releases.push(release);
  return { waiting, started, release, entered };
}

it("imports an exact Desktop variant once, preserves it across restart, and opens an alias/saved variant offline without acquisition ports", async () => {
  const lookup = await acquisition.lookup(url, signal());
  expect(lookup.saved).toEqual([]);
  expect(metadata).toHaveBeenCalledTimes(0);
  expect(download).toHaveBeenCalledTimes(0);
  const offer = await acquisition.metadata(url, signal()),
    request = input(offer, 1080, "desktop");
  const first = acquisition.start(request),
    repeated = acquisition.start(request);
  expect(repeated.id).toBe(first.id);
  const completed = await settled();
  expect(completed.stage).toBe("ready");
  expect(metadata).toHaveBeenCalledTimes(1);
  expect(download).toHaveBeenCalledTimes(1);
  expect(media.mock.calls.map(([job]) => job.operation)).toEqual([
    "synthesize-acquisition",
  ]);
  expect(current?.source.width).toBe(1920);
  expect(current?.source.height).toBe(1080);
  const catalog = await acquisition.catalog(signal());
  expect(catalog.destinations).toEqual(["downloads", "desktop"]);
  expect(catalog.entries).toHaveLength(1);
  expect(catalog.entries[0]!.destination).toBe("desktop");
  expect(catalog.warning).toBe(false);
  expect(catalog.bytes).toBe(current?.source.bytes);
  await clear();
  await acquisition.close();
  // Omit the downloader entirely, modelling offline/missing-tool reuse.
  acquisition = new OwnerSourceAcquisition({
    files,
    roots: { desktop: join(directory, "Desktop", "ClipBuilder") },
    media,
    available: () => current === null,
    opened(id, source) {
      return (current = { id, source, mode: "unavailable", revision: 0 });
    },
  });
  const saved = await acquisition.lookup(
    "https://youtu.be/aaaaaaaaaaa?t=7",
    signal(),
  );
  expect(saved.metadataAvailable).toBe(false);
  expect(saved.saved[0]!.variant.id).toBe(completed.variantId);
  await acquisition.open(
    { destination: "desktop", variantId: completed.variantId },
    signal(),
  );
  expect(current?.mode).toBe("unavailable");
  expect(metadata).toHaveBeenCalledTimes(1);
  expect(download).toHaveBeenCalledTimes(1);
  expect(media.mock.calls.map(([job]) => job.operation)).toEqual([
    "synthesize-acquisition",
    "inspect-acquisition",
  ]);
});

it("reuses matching formats after explicit refresh and preserves completed variants when a new quality fails or is canceled", async () => {
  let offer = await acquisition.metadata(url, signal());
  acquisition.start(input(offer));
  const completed = await settled();
  await clear();
  offer = await acquisition.metadata(url, signal());
  acquisition.start(input(offer));
  await settled();
  expect(download).toHaveBeenCalledTimes(1);
  expect(media.mock.calls.map(([job]) => job.operation)).toEqual([
    "synthesize-acquisition",
    "inspect-acquisition",
  ]);
  await clear();
  offer = await acquisition.metadata(url, signal());
  download.mockRejectedValueOnce(new Error("source_selection_stale"));
  acquisition.start(input(offer, 720));
  expect((await settled()).error).toBe("stale");
  expect(current).toBeNull();
  expect(await readdir(files.root)).toEqual([]);
  expect(
    (await acquisition.catalog(signal())).entries.map(
      (entry) => entry.variant.id,
    ),
  ).toEqual([completed.variantId]);
  const pause = held();
  download.mockImplementationOnce(async (_input, progress, operationSignal) => {
    progress({ stage: "video", downloadedBytes: 0, totalBytes: null });
    pause.entered();
    await pause.waiting;
    operationSignal.throwIfAborted();
  });
  offer = await acquisition.metadata(url, signal());
  acquisition.start(input(offer, 2160));
  await pause.started;
  expect(acquisition.cancel()?.stage).toBe("canceling");
  pause.release();
  expect((await settled()).stage).toBe("canceled");
  expect(download).toHaveBeenCalledTimes(3);
  expect(media).toHaveBeenCalledTimes(2);
  expect(
    (await acquisition.catalog(signal())).entries.map(
      (entry) => entry.variant.id,
    ),
  ).toEqual([completed.variantId]);
  expect(await readdir(files.root)).toEqual([]);
});

it("never implicitly reuses synthetic variants for provider-source acquisition", async () => {
  const offer = await acquisition.metadata(url, signal());
  acquisition.start(input(offer));
  await settled();
  await clear();
  await acquisition.close();
  acquisition = create({
    mode: "provider-source",
    metadata: vi.fn(async () => {
      throw new Error("must_not_refresh");
    }),
    download: vi.fn(async () => {
      throw new Error("must_not_download");
    }),
  });
  expect((await acquisition.lookup(url, signal())).saved).toEqual([]);
  expect((await acquisition.catalog(signal())).entries[0]!.variant.mode).toBe(
    "synthetic-source",
  );
  expect(metadata).toHaveBeenCalledTimes(1);
  expect(download).toHaveBeenCalledTimes(1);
  expect(media).toHaveBeenCalledTimes(1);
});

it("allows an explicit retry after failure and reopens a successful identical choice locally after clear", async () => {
  const offer = await acquisition.metadata(url, signal());
  const request = input(offer);
  download.mockRejectedValueOnce(new Error("synthetic_failure"));
  const failed = acquisition.start(request);
  expect((await settled()).stage).toBe("failed");
  expect(await readdir(files.root)).toEqual([]);
  const retried = acquisition.start(request);
  expect(retried.id).not.toBe(failed.id);
  expect((await settled()).stage).toBe("ready");
  expect(download).toHaveBeenCalledTimes(2);
  expect(acquisition.start(request).id).toBe(retried.id);
  await clear();
  const reopened = acquisition.start(request);
  expect(reopened.id).not.toBe(retried.id);
  expect((await settled()).stage).toBe("ready");
  expect(metadata).toHaveBeenCalledTimes(1);
  expect(download).toHaveBeenCalledTimes(2);
  expect(media.mock.calls.map(([job]) => job.operation)).toEqual([
    "synthesize-acquisition",
    "inspect-acquisition",
  ]);
});

it("admits at most one metadata request even when two callers arrive before local lookup finishes", async () => {
  const pause = held();
  metadata.mockImplementation(async (identity, operationSignal) => {
    pause.entered();
    await pause.waiting;
    operationSignal.throwIfAborted();
    return fakeOwnerAcquisition.metadata(identity, operationSignal);
  });
  const first = acquisition.metadata(url, signal()),
    second = acquisition.metadata(url, signal());
  metadataTasks.push(first, second);
  const secondResult = second.then(
    () => "resolved",
    () => "rejected",
  );
  await pause.started;
  const outcome = await Promise.race([
    secondResult,
    new Promise<string>((done) => {
      setTimeout(() => done("pending"), 50);
    }),
  ]);
  expect(outcome).toBe("rejected");
  expect(metadata).toHaveBeenCalledTimes(1);
  pause.release();
  await first;
});

it("aborts metadata on shutdown and waits for the owned port to drain before close resolves", async () => {
  const pause = held();
  let observed: AbortSignal | undefined;
  metadata.mockImplementationOnce(async (identity, operationSignal) => {
    observed = operationSignal;
    pause.entered();
    await pause.waiting;
    operationSignal.throwIfAborted();
    return fakeOwnerAcquisition.metadata(identity, operationSignal);
  });
  const operation = acquisition.metadata(url, signal());
  const outcome = operation.then(
    () => "resolved",
    () => "rejected",
  );
  metadataTasks.push(outcome);
  await pause.started;
  let closed = false;
  const closing = acquisition.close().then(() => {
    closed = true;
  });
  await Promise.resolve();
  expect(observed?.aborted).toBe(true);
  expect(closed).toBe(false);
  pause.release();
  expect(await outcome).toBe("rejected");
  await closing;
  expect(closed).toBe(true);
  expect(acquisition.active).toBe(false);
  expect(metadata).toHaveBeenCalledTimes(1);
  expect(download).toHaveBeenCalledTimes(0);
  expect(media).toHaveBeenCalledTimes(0);
  expect(await readdir(files.root)).toEqual([]);
});

it("warns on the aggregate saved library threshold across Downloads and Desktop without deleting or downloading", async () => {
  const half = OWNER_LIMITS.libraryWarningBytes / 2;
  const usage = vi
    .spyOn(OwnerSourceLibrary.prototype, "usage")
    .mockResolvedValueOnce({ bytes: half, warning: false })
    .mockResolvedValueOnce({ bytes: half - 1, warning: false })
    .mockResolvedValueOnce({ bytes: half, warning: false })
    .mockResolvedValueOnce({ bytes: half, warning: false });
  try {
    const below = await acquisition.catalog(signal());
    expect(below.bytes).toBe(OWNER_LIMITS.libraryWarningBytes - 1);
    expect(below.warning).toBe(false);
    const full = await acquisition.catalog(signal());
    expect(full.bytes).toBe(OWNER_LIMITS.libraryWarningBytes);
    expect(full.warning).toBe(true);
    expect(metadata).toHaveBeenCalledTimes(0);
    expect(download).toHaveBeenCalledTimes(0);
    expect(media).toHaveBeenCalledTimes(0);
    expect(await readdir(directory)).toEqual(["scratch"]);
  } finally {
    usage.mockRestore();
  }
});
