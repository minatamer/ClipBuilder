import { expect, it, vi } from "vitest";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { probeOwnerSectionClock } from "./section-clock.ts";
import type { AcquisitionProcess } from "./acquisition-process.ts";

const request = {
  ffprobe: join(tmpdir(), "synthetic-probe.exe"),
  url: "https://rr1-synthetic.googlevideo.com/media",
  proxy: `http://owner:${"a".repeat(64)}@127.0.0.1:43210`,
  directory: tmpdir(),
  systemRoot: tmpdir(),
};
it("measures the muxed video-origin delta without provider work and keeps TLS and broker confinement", async () => {
  const run = vi.fn<AcquisitionProcess>(async (_request, line) =>
    line(
      JSON.stringify({
        streams: [
          { codec_type: "video", start_time: "5.000000" },
          { codec_type: "audio", start_time: "4.978666" },
        ],
        format: { start_time: "4.978666" },
      }),
    ),
  );
  expect(
    await probeOwnerSectionClock(
      { ...request, run },
      new AbortController().signal,
    ),
  ).toBeCloseTo(21.334, 3);
  expect(run).toHaveBeenCalledTimes(1);
  expect(run.mock.calls[0]![0].args).toEqual(
    expect.arrayContaining(["-tls_verify", "1", "-http_proxy", request.proxy]),
  );
  for (const url of [
    "http://rr1-synthetic.googlevideo.com/media",
    "https://127.0.0.1/media",
    "https://user:password@rr1-synthetic.googlevideo.com/media",
    "https://evil.test/media",
    "https://rr1-synthetic.googlevideo.com:444/media",
  ])
    await expect(
      probeOwnerSectionClock(
        { ...request, url, run },
        new AbortController().signal,
      ),
    ).rejects.toThrow();
  expect(run).toHaveBeenCalledTimes(1);
});
