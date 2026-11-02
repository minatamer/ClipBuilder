import { isAbsolute } from "node:path";
import { z } from "zod";
import { admittedAcquisitionHost } from "./acquisition-egress.ts";
import type { AcquisitionProcess } from "./acquisition-process.ts";

/** Probe headers only inside the acquisition broker; no arbitrary worker URL job. */
export async function probeOwnerSectionClock(
  options: {
    ffprobe: string;
    url: string;
    proxy: string;
    directory: string;
    systemRoot: string;
    run: AcquisitionProcess;
  },
  signal: AbortSignal,
) {
  const url = new URL(options.url);
  if (
    options.url.length > 8192 ||
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    (url.port && url.port !== "443") ||
    !admittedAcquisitionHost(url.hostname) ||
    !url.hostname.endsWith(".googlevideo.com") ||
    !isAbsolute(options.ffprobe) ||
    !/^http:\/\/owner:[a-f0-9]{64}@127\.0\.0\.1:\d{1,5}$/.test(options.proxy)
  )
    throw Error("acquisition_section_unsupported");
  const lines: string[] = [];
  await options.run(
    {
      executable: options.ffprobe,
      args: [
        "-v",
        "error",
        "-tls_verify",
        "1",
        "-http_proxy",
        options.proxy,
        "-rw_timeout",
        "30000000",
        "-protocol_whitelist",
        "https,tls,tcp,http,httpproxy",
        "-format_whitelist",
        "mov,mp4,matroska,webm",
        "-show_entries",
        "stream=codec_type,start_time:format=start_time",
        "-of",
        "json",
        url.toString(),
      ],
      input: "",
      cwd: options.directory,
      env: {
        SystemRoot: options.systemRoot,
        WINDIR: options.systemRoot,
        TEMP: options.directory,
        TMP: options.directory,
      },
      timeoutMs: 30_000,
    },
    (line) => lines.push(line),
    signal,
  );
  const result = z
    .object({
      streams: z
        .array(
          z.object({
            codec_type: z.string(),
            start_time: z.coerce.number().finite(),
          }),
        )
        .min(1)
        .max(2),
      format: z.object({ start_time: z.coerce.number().finite() }),
    })
    .parse(JSON.parse(lines.join("\n")));
  const video = result.streams.find((stream) => stream.codec_type === "video");
  if (!video) throw Error("acquisition_section_unsupported");
  const offset = (video.start_time - result.format.start_time) * 1000;
  if (offset < -0.001 || offset > 30_000)
    throw Error("acquisition_section_unsupported");
  return Math.max(0, offset);
}
