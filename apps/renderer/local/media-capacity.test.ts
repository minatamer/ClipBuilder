import { createOwnerWorker } from "./server.ts";
import { listenOwner, ownerRequest } from "../../../test/owner-http.ts";
import { expect, it, vi } from "vitest";
import { mkdtemp, writeFile, rm, rmdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { inspectOwnerSource } from "./media.ts";
import * as inspection from "../src/media/inspection.ts";
import * as native from "../src/media/process-runner.ts";
import { resolveOwnerCapacity } from "../../../packages/contracts/local/capacity.ts";

it("binds native duration admission to trusted tool composition while preserving codec checks", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-native-capacity-"));
  const file = join(root, "synthetic.mp4");
  await writeFile(file, "synthetic-only");
  const video = {
    codec_type: "video",
    codec_name: "h264",
    width: 320,
    height: 180,
    avg_frame_rate: "30/1",
    pix_fmt: "yuv420p",
  };
  const probe = vi.spyOn(inspection, "probeMedia").mockResolvedValue({
    streams: [
      video,
      {
        codec_type: "audio",
        codec_name: "aac",
        channels: 2,
        sample_rate: 48000,
      },
    ],
    format: { duration: 7200, format_name: "mp4" },
  });
  const run = vi
    .spyOn(native, "runOwnedProcess")
    .mockImplementation(async (_command, args) =>
      args.includes("-show_packets")
        ? "0,0.033333\n7199.966667,0.033333"
        : '{"streams":[{}]}',
    );
  try {
    const ready = { longSources: true, manyClips: false };
    const tools = { ffmpeg: "synthetic-ffmpeg", ffprobe: "synthetic-ffprobe" };
    const signal = AbortSignal.timeout(2000);
    await expect(inspectOwnerSource(file, tools, signal)).rejects.toThrow();
    await expect(
      inspectOwnerSource(
        file,
        {
          ...tools,
          capacity: resolveOwnerCapacity({ aiProvider: "codex" }, ready),
        },
        signal,
      ),
    ).resolves.toMatchObject({
      durationMs: 7_200_000,
      width: 320,
      height: 180,
    });
    await expect(
      inspectOwnerSource(
        file,
        {
          ...tools,
          capacity: resolveOwnerCapacity(
            { hosted: true, aiProvider: "codex" },
            ready,
          ),
        },
        signal,
      ),
    ).rejects.toThrow();
    probe.mockResolvedValueOnce({
      streams: [
        { ...video, codec_name: "unsupported" },
        {
          codec_type: "audio",
          codec_name: "aac",
          channels: 2,
          sample_rate: 48000,
        },
      ],
      format: { duration: 7200, format_name: "mp4" },
    });
    await expect(
      inspectOwnerSource(
        file,
        {
          ...tools,
          capacity: resolveOwnerCapacity({ aiProvider: "codex" }, ready),
        },
        signal,
      ),
    ).rejects.toThrow();
  } finally {
    probe.mockRestore();
    run.mockRestore();
    await rm(file);
    await rmdir(root);
  }
});

it("rejects a forged capacity field at the authenticated worker boundary before executing", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-worker-capacity-"));
  const execute =
    vi.fn<NonNullable<Parameters<typeof createOwnerWorker>[0]["execute"]>>();
  const worker = createOwnerWorker({
    root,
    token: "synthetic-worker",
    tools: { ffmpeg: "synthetic", ffprobe: "synthetic" },
    execute,
  });
  try {
    const port = await listenOwner(worker.server);
    const response = await ownerRequest(port, "/media", {
      method: "POST",
      headers: {
        Authorization: "Bearer synthetic-worker",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operation: "inspect",
        workspaceId: crypto.randomUUID(),
        capacity: { profile: "local-codex", longSources: true },
      }),
    });
    expect(response.status).toBe(400);
    expect(execute).toHaveBeenCalledTimes(0);
  } finally {
    await worker.close();
    await rmdir(root);
  }
});
