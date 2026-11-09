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
        ? JSON.stringify({
            packets: [
              { pts_time: "0", duration_time: "0.033333" },
              { pts_time: "7199.966667", duration_time: "0.033333" },
            ],
          })
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
          capacity: resolveOwnerCapacity({ aiProvider: "gemini" }),
        },
        signal,
      ),
    ).resolves.toMatchObject({ durationMs: 7_200_000 });
    expect(
      run.mock.calls
        .filter(([, args]) => args.includes("-show_packets"))
        .every(
          ([, args]) =>
            args.includes("packet=pts_time,duration_time:packet_side_data=") &&
            args[args.indexOf("-of") + 1] === "json",
        ),
    ).toBe(true);
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
    await expect(
      inspectOwnerSource(
        file,
        {
          ...tools,
          capacity: resolveOwnerCapacity({
            hosted: true,
            aiProvider: "gemini",
          }),
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

it.each([
  {
    name: "ancillary packet sections",
    value: JSON.stringify({
      packets: [
        {
          pts_time: "1.966667",
          duration_time: "0.033333",
          side_data_list: [{}],
        },
      ],
    }),
    valid: true,
  },
  { name: "empty packet set", value: '{"packets":[]}', valid: false },
  {
    name: "missing duration",
    value: '{"packets":[{"pts_time":"1"}]}',
    valid: false,
  },
  {
    name: "unavailable clock",
    value: '{"packets":[{"pts_time":"N/A","duration_time":"0.033333"}]}',
    valid: false,
  },
  {
    name: "blank clock",
    value: '{"packets":[{"pts_time":" ","duration_time":"0.033333"}]}',
    valid: false,
  },
  {
    name: "zero duration",
    value: '{"packets":[{"pts_time":"1","duration_time":"0"}]}',
    valid: false,
  },
  {
    name: "negative duration",
    value: '{"packets":[{"pts_time":"1","duration_time":"-0.03"}]}',
    valid: false,
  },
  { name: "invalid JSON", value: "{", valid: false },
  {
    name: "empty tail seek recovered from earlier window",
    value: '{"packets":[{"pts_time":"69.966667","duration_time":"0.033333"}]}',
    valid: true,
    long: true,
    emptyFirst: true,
  },
  {
    name: "two empty tail windows",
    value: '{"packets":[]}',
    valid: false,
    long: true,
    emptyFirst: true,
  },
])("reads named packet clocks and guards $name", async (testCase) => {
  const { value, valid } = testCase;
  const long = "long" in testCase && testCase.long === true;
  let packetCalls = 0;
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-packet-clock-")),
    file = join(root, "synthetic.mp4");
  await writeFile(file, "synthetic-only");
  const probe = vi.spyOn(inspection, "probeMedia").mockResolvedValue({
    streams: [
      {
        codec_type: "video",
        codec_name: "h264",
        width: 320,
        height: 180,
        avg_frame_rate: "30/1",
        pix_fmt: "yuv420p",
      },
      {
        codec_type: "audio",
        codec_name: "aac",
        channels: 2,
        sample_rate: 48000,
      },
    ],
    format: { duration: long ? 70 : 2, format_name: "mp4" },
  });
  const run = vi
    .spyOn(native, "runOwnedProcess")
    .mockImplementation(async (_command, args) => {
      if (!args.includes("-show_packets")) return '{"streams":[{}]}';
      packetCalls++;
      return long && packetCalls === 1 ? '{"packets":[]}' : value;
    });
  try {
    const result = inspectOwnerSource(
      file,
      { ffmpeg: "synthetic", ffprobe: "synthetic" },
      AbortSignal.timeout(2000),
    );
    if (valid)
      await expect(result).resolves.toMatchObject({
        durationMs: long ? 70000 : 2000,
      });
    else await expect(result).rejects.toThrow("invalid_video_clock");
    expect(packetCalls).toBe(long ? 2 : 1);
    const intervals = run.mock.calls
      .filter(([, args]) => args.includes("-show_packets"))
      .map(([, args]) =>
        args.includes("-read_intervals")
          ? args[args.indexOf("-read_intervals") + 1]
          : null,
      );
    expect(intervals).toEqual(long ? ["10%", "0%"] : [null]);
  } finally {
    probe.mockRestore();
    run.mockRestore();
    await rm(root, { recursive: true, force: true });
  }
});
