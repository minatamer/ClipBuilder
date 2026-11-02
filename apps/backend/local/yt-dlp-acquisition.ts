import { randomUUID } from "node:crypto";
import {
  lstat,
  mkdir,
  mkdtemp,
  realpath,
  rm,
  readFile,
} from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";
import { z } from "zod";
import {
  OWNER_ACQUISITION_LIMITS,
  type OwnerYoutubeOffer,
} from "../../../packages/contracts/local/acquisition.ts";
import { OWNER_LIMITS } from "../../../packages/contracts/local/policy.ts";
import {
  ownerAcquisitionSectionSchema,
  ownerPaddedAcquisitionWindow,
  type OwnerAcquisitionSection,
} from "../../../packages/contracts/local/acquisition-section.ts";
import { OWNER_AUDIO_LIMITS } from "../../../packages/contracts/local/audio.ts";
import { selectYoutubeAudio } from "./youtube-audio.ts";
import { probeOwnerSectionClock } from "./section-clock.ts";
import { fetchYoutubeThumbnail } from "./youtube-thumbnail.ts";
import {
  buildOwnerYoutubeOffer,
  normalizeOwnerYoutubeMetadata,
} from "./youtube-formats.ts";
import { createAcquisitionEgress } from "./acquisition-egress.ts";
import {
  runAcquisitionProcess,
  type AcquisitionProcess,
} from "./acquisition-process.ts";
import type {
  OwnerAcquisitionPort,
  OwnerLinkedIdentity,
} from "./acquisition-port.ts";

import {
  verifyAcquisitionTools,
  type PreparedAcquisitionTools,
} from "./acquisition-tools.ts";
export type YtDlpConfiguration = {
  scratchRoot: string;
  tools: PreparedAcquisitionTools;
  sectionTools?: { ffmpeg: string; ffprobe: string };
};
type AdapterPorts = {
  run: AcquisitionProcess;
  verify: (
    tools: PreparedAcquisitionTools,
    signal: AbortSignal,
  ) => Promise<void>;
  egress: typeof createAcquisitionEgress;
};
type SessionRun = (
  options: {
    action: "metadata" | "video" | "audio" | "clock";
    formatId?: string;
    output?: string;
    maxBytes?: number;
    section?: OwnerAcquisitionSection;
  },
  line: (value: string) => void,
) => Promise<void>;

const quote = (value: string) => {
  if (Array.from(value).some((char) => char.charCodeAt(0) < 32))
    throw new Error("acquisition_config_invalid");
  return `'${value.replaceAll("'", `'"'"'`)}'`;
};
const FORMATS =
  "%\u0028formats.:.{format_id,width,height,fps,vcodec,acodec,filesize,filesize_approx,protocol,dynamic_range,language,has_drm,quality,preference,tbr,abr,audio_channels,asr,audio_track,language_preference})j";
const META = "%\u0028.{id,title,duration,live_status,availability,age_limit})j";
const PROGRESS =
  "%\u0028progress.{status,downloaded_bytes,total_bytes,total_bytes_estimate,speed,eta,elapsed,fragment_index,fragment_count})j";

/** Fixed native section policy, never arbitrary downloader/FFmpeg arguments. */
export function ytDlpSectionArguments(
  section: OwnerAcquisitionSection,
  ffmpeg: string,
  maxBytes = OWNER_LIMITS.sourceBytes,
): string[] {
  if (!isAbsolute(ffmpeg)) throw Error("acquisition_section_unsupported");
  const window = ownerPaddedAcquisitionWindow(section);
  return [
    "--download-sections",
    `*${window.startMs / 1000}-${window.endMs / 1000}`,
    "--ffmpeg-location",
    ffmpeg,
    "--downloader",
    "ffmpeg",
    "--merge-output-format",
    "mkv",
    "--no-force-keyframes-at-cuts",
    "--downloader-args",
    "ffmpeg_i:-copyts -start_at_zero -tls_verify 1 -rw_timeout 30000000 -protocol_whitelist https,tls,tcp,http,httpproxy -format_whitelist mov,mp4,matroska,webm",
    "--downloader-args",
    `ffmpeg_o:-avoid_negative_ts disabled -fs ${maxBytes} -map_metadata -1 -map_chapters -1 -loglevel warning -stats -stats_period 1`,
  ];
}

/** Source-derived stdin framing. No URL/capability in process argv or a config file. */
export function ytDlpAcquisitionInput(input: {
  canonicalUrl: string;
  proxy: string;
  challenge: string;
  action: "metadata" | "video" | "audio" | "clock";
  formatId?: string;
  output?: string;
  maxBytes?: number;
  section?: OwnerAcquisitionSection;
  ffmpeg?: string;
}): string {
  if (
    !/^https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}$/.test(
      input.canonicalUrl,
    ) ||
    !/^http:\/\/owner:[a-f0-9]{64}@127\.0\.0\.1:\d{1,5}$/.test(input.proxy) ||
    !isAbsolute(input.challenge)
  )
    throw new Error("acquisition_config_invalid");
  const args = [
    "--no-plugin-dirs",
    "--no-update",
    "--no-remote-components",
    "--no-cache-dir",
    "--no-cookies",
    "--no-cookies-from-browser",
    "--no-js-runtimes",
    "--js-runtimes",
    `deno:${input.challenge}`,
    "--no-exec",
    "--no-exec-before-download",
    "--use-extractors",
    "^youtube$",
    "--no-playlist",
    "--no-wait-for-video",
    "--downloader",
    "native",
    "--proxy",
    input.proxy,
    "--retries",
    "0",
    "--fragment-retries",
    "0",
    "--extractor-retries",
    "0",
    "--file-access-retries",
    "0",
    "--concurrent-fragments",
    "1",
    "--abort-on-error",
    "--abort-on-unavailable-fragments",
    "--color",
    "never",
    "--newline",
    "--no-warnings",
    "--no-mtime",
    "--no-continue",
    "--no-overwrites",
    "--fixup",
    "never",
    "--no-check-formats",
  ];
  if (input.action === "metadata")
    args.push(
      "--skip-download",
      "--print",
      `CB_META:${META}`,
      "--print",
      `CB_FORMATS:${FORMATS}`,
    );
  else if (input.action === "clock") {
    if (
      !input.formatId ||
      !/^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(input.formatId)
    )
      throw Error("acquisition_config_invalid");
    args.push(
      "--skip-download",
      "--format",
      input.formatId,
      "--print",
      "CB_CLOCK:%(url)j",
    );
  } else {
    if (
      !input.formatId ||
      !(
        input.section
          ? /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}(?:\+[A-Za-z0-9][A-Za-z0-9._-]{0,79})?$/
          : /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/
      ).test(input.formatId) ||
      !input.output ||
      !isAbsolute(input.output)
    )
      throw new Error("acquisition_config_invalid");
    args.push(
      "--quiet",
      "--progress",
      "--progress-delta",
      "1",
      "--progress-template",
      `download:CB_PROGRESS:${PROGRESS}`,
      "--limit-rate",
      String(48 * 1024 ** 2),
      "--max-filesize",
      String(input.maxBytes ?? OWNER_LIMITS.sourceBytes),
      "--format",
      input.formatId,
      "--output",
      input.output,
      "--print",
      "after_move:%(id&CB_DONE|CB_DONE)s",
    );
    if (input.section) {
      if (input.action !== "video" || !input.ffmpeg)
        throw Error("acquisition_section_unsupported");
      args.push(
        ...ytDlpSectionArguments(input.section, input.ffmpeg, input.maxBytes),
      );
    }
  }
  if (
    input.maxBytes !== undefined &&
    (!Number.isSafeInteger(input.maxBytes) ||
      input.maxBytes < 1 ||
      input.maxBytes > OWNER_LIMITS.sourceBytes)
  )
    throw new Error("acquisition_config_invalid");
  args.push(input.canonicalUrl);
  return args.map(quote).join("\n") + "\n";
}

const progressSchema = z
  .object({
    status: z.enum(["downloading", "finished"]),
    downloaded_bytes: z
      .number()
      .int()
      .nonnegative()
      .max(OWNER_LIMITS.sourceBytes),
    total_bytes: z
      .number()
      .int()
      .positive()
      .max(OWNER_LIMITS.sourceBytes)
      .optional(),
    total_bytes_estimate: z.number().finite().positive().optional(),
    speed: z.number().finite().nonnegative().nullable().optional(),
    eta: z.number().finite().nonnegative().nullable().optional(),
    elapsed: z.number().finite().nonnegative().optional(),
    fragment_index: z.number().int().nonnegative().optional(),
    fragment_count: z.number().int().nonnegative().optional(),
  })
  .strict();

/** Inert factory: only explicit protected metadata/import actions use the network. */
export function createYtDlpAcquisitionPort(
  config: YtDlpConfiguration,
  overrides: Partial<AdapterPorts> = {},
): OwnerAcquisitionPort {
  const ports: AdapterPorts = {
    run: runAcquisitionProcess,
    verify: verifyAcquisitionTools,
    egress: createAcquisitionEgress,
    ...overrides,
  };
  async function session<T>(
    identity: OwnerLinkedIdentity,
    signal: AbortSignal,
    action: (
      run: SessionRun,
      proxy: string,
      scopedSignal: AbortSignal,
    ) => Promise<T>,
    directory?: string,
  ) {
    signal.throwIfAborted();
    if (
      !/^[A-Za-z0-9_-]{11}$/u.test(identity.videoId) ||
      identity.canonicalUrl !==
        `https://www.youtube.com/watch?v=${identity.videoId}`
    )
      throw new Error("acquisition_source_invalid");
    await ports.verify(config.tools, signal);
    signal.throwIfAborted();
    const base = await realpath(config.scratchRoot);
    if ((await lstat(base)).isSymbolicLink())
      throw new Error("acquisition_unavailable");
    if (
      directory &&
      (!/^[a-f0-9-]{36}$/.test(relative(base, directory)) ||
        (await lstat(directory)).isSymbolicLink() ||
        (await realpath(directory)) !== resolve(directory))
    )
      throw new Error("acquisition_unavailable");
    const scratch = await mkdtemp(join(base, "acquisition-"));
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
    const timer = setTimeout(
      abort,
      directory
        ? OWNER_ACQUISITION_LIMITS.transferMs
        : OWNER_ACQUISITION_LIMITS.metadataMs,
    );
    let broker: Awaited<ReturnType<typeof createAcquisitionEgress>> | undefined;
    try {
      controller.signal.throwIfAborted();
      broker = await ports.egress(controller.signal);
      controller.signal.throwIfAborted();
      const proxy = broker.proxy;
      const env = {
        SystemRoot: config.tools.systemRoot,
        WINDIR: config.tools.systemRoot,
        TEMP: scratch,
        TMP: scratch,
        DENO_DIR: join(scratch, "deno"),
        DENO_NO_UPDATE_CHECK: "1",
        DENO_NO_PROMPT: "1",
        DENO_NO_PACKAGE_JSON: "1",
        NO_COLOR: "1",
      };
      await mkdir(env.DENO_DIR, { mode: 0o700 });
      return await action(
        async (options, line) => {
          controller.signal.throwIfAborted();
          await ports.run(
            {
              executable: config.tools.downloader,
              args: ["--ignore-config", "--config-locations", "-", "--"],
              input: ytDlpAcquisitionInput({
                ...options,
                canonicalUrl: identity.canonicalUrl,
                proxy,
                challenge: config.tools.challenge,
                ...(options.section && config.sectionTools
                  ? { ffmpeg: config.sectionTools.ffmpeg }
                  : {}),
              }),
              cwd: directory ?? scratch,
              env,
              timeoutMs:
                options.action === "metadata" || options.action === "clock"
                  ? OWNER_ACQUISITION_LIMITS.metadataMs
                  : OWNER_ACQUISITION_LIMITS.transferMs,
            },
            line,
            controller.signal,
          );
          broker?.assertHealthy();
          controller.signal.throwIfAborted();
        },
        proxy,
        controller.signal,
      );
    } finally {
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      controller.abort();
      try {
        await broker?.close();
      } finally {
        await rm(scratch, { recursive: true, force: true });
      }
    }
  }
  async function readProjection(run: SessionRun) {
    let meta: unknown;
    let formats: unknown;
    await run({ action: "metadata" }, (line) => {
      try {
        if (line.startsWith("CB_META:") && meta === undefined)
          meta = JSON.parse(line.slice(8));
        else if (line.startsWith("CB_FORMATS:") && formats === undefined)
          formats = JSON.parse(line.slice(11));
        else throw new Error();
      } catch {
        throw new Error("acquisition_metadata_invalid");
      }
    });
    return { meta, formats };
  }
  async function readMetadata(
    identity: OwnerLinkedIdentity,
    run: SessionRun,
  ): Promise<OwnerYoutubeOffer> {
    return buildOwnerYoutubeOffer(
      normalizeOwnerYoutubeMetadata(await readProjection(run), {
        videoId: identity.videoId,
        revision: randomUUID(),
        mode: "provider-source",
      }),
    );
  }
  return {
    mode: "provider-source",
    audio(identity, directory, signal) {
      return session(
        identity,
        signal,
        async (run) => {
          const metadata = normalizeOwnerYoutubeMetadata(
            await readProjection(run),
            {
              videoId: identity.videoId,
              revision: randomUUID(),
              mode: "provider-source",
            },
          );
          const format = selectYoutubeAudio(metadata),
            output = join(directory, `sound-${randomUUID()}.m4a`);
          let last = 0,
            done = false;
          try {
            await run(
              {
                action: "audio",
                formatId: format.formatId,
                output,
                maxBytes: OWNER_AUDIO_LIMITS.inputBytes,
              },
              (line) => {
                if (line === "CB_DONE" && !done) {
                  done = true;
                  return;
                }
                if (!line.startsWith("CB_PROGRESS:"))
                  throw new Error("acquisition_progress_invalid");
                const progress = progressSchema.parse(
                  JSON.parse(line.slice(12)),
                );
                if (
                  progress.downloaded_bytes < last ||
                  progress.downloaded_bytes > OWNER_AUDIO_LIMITS.inputBytes ||
                  (progress.total_bytes !== undefined &&
                    progress.total_bytes > OWNER_AUDIO_LIMITS.inputBytes) ||
                  (progress.total_bytes_estimate !== undefined &&
                    progress.total_bytes_estimate >
                      OWNER_AUDIO_LIMITS.inputBytes)
                )
                  throw new Error("acquisition_bytes_invalid");
                last = progress.downloaded_bytes;
              },
            );
            const info = await lstat(output);
            if (
              !done ||
              !info.isFile() ||
              info.isSymbolicLink() ||
              info.nlink !== 1 ||
              info.size < 1 ||
              info.size !== last ||
              info.size > OWNER_AUDIO_LIMITS.inputBytes
            )
              throw new Error("acquisition_transfer_incomplete");
            signal.throwIfAborted();
            return new Uint8Array(await readFile(output));
          } finally {
            await rm(output, { force: true });
          }
        },
        directory,
      );
    },
    thumbnail: (identity, signal) =>
      fetchYoutubeThumbnail(identity.videoId, signal),
    metadata: (identity, signal) =>
      session(identity, signal, (run) => readMetadata(identity, run)),
    async download(input, progress, signal) {
      const section = input.section
        ? ownerAcquisitionSectionSchema.parse(input.section)
        : undefined;
      if (section && !config.sectionTools)
        throw Error("acquisition_section_unsupported");
      return await session(
        input.identity,
        signal,
        async (run, proxy, scopedSignal) => {
          const current = await readMetadata(input.identity, run);
          const selected = current.choices.find(
            (choice) =>
              choice.video.formatId === input.choice.video.formatId &&
              choice.audio?.formatId === input.choice.audio?.formatId,
          );
          if (
            !selected ||
            !(
              selected?.supported ||
              (section &&
                ["duration", "bytes"].includes(selected?.reason ?? ""))
            ) ||
            JSON.stringify([
              selected.video,
              selected.audio,
              current.durationMs,
            ]) !==
              JSON.stringify([
                input.choice.video,
                input.choice.audio,
                input.offer.durationMs,
              ]) ||
            (input.selection.kind === "best" &&
              current.bestChoiceId !== selected.id)
          )
            throw new Error("acquisition_stale_format");
          if (
            section &&
            (section.durationMs !== current.durationMs || !selected?.audio)
          )
            throw Error("acquisition_stale_format");
          let clockOffsetMs = 0;
          if (section && selected.video.formatId === selected.audio?.formatId) {
            let url: string | undefined;
            await run(
              { action: "clock", formatId: selected.video.formatId },
              (line) => {
                if (url || !line.startsWith("CB_CLOCK:"))
                  throw Error("acquisition_section_unsupported");
                url = z
                  .string()
                  .max(8192)
                  .parse(JSON.parse(line.slice(9)));
              },
            );
            if (!url || !config.sectionTools)
              throw Error("acquisition_section_unsupported");
            clockOffsetMs = await probeOwnerSectionClock(
              {
                ffprobe: config.sectionTools.ffprobe,
                url,
                proxy,
                directory: input.directory,
                systemRoot: config.tools.systemRoot,
                run: ports.run,
              },
              scopedSignal,
            );
          }
          let completed = 0;
          for (const stage of ["video", "audio"] as const) {
            if (
              stage === "audio" &&
              (section || selected.video.formatId === selected.audio?.formatId)
            )
              continue;
            let last = 0;
            let done = false;
            await run(
              {
                action: stage,
                formatId:
                  section &&
                  selected.video.formatId !== selected.audio!.formatId
                    ? `${selected.video.formatId}+${selected.audio!.formatId}`
                    : stage === "video"
                      ? selected.video.formatId
                      : selected.audio!.formatId,
                output: join(input.directory, `acquisition.${stage}`),
                ...(section ? { section } : {}),
              },
              (line) => {
                if (line === "CB_DONE" && !done) {
                  done = true;
                  return;
                }
                if (!line.startsWith("CB_PROGRESS:"))
                  throw new Error("acquisition_progress_invalid");
                let value: z.infer<typeof progressSchema>;
                try {
                  value = progressSchema.parse(JSON.parse(line.slice(12)));
                } catch {
                  throw new Error("acquisition_progress_invalid");
                }
                if (
                  value.downloaded_bytes < last ||
                  completed + value.downloaded_bytes > OWNER_LIMITS.sourceBytes
                )
                  throw new Error("acquisition_bytes_invalid");
                last = value.downloaded_bytes;
                const remaining =
                  !section &&
                  stage === "video" &&
                  selected.video.formatId !== selected.audio?.formatId
                    ? selected.audio?.bytes !== null &&
                      !selected.audio?.bytesEstimated
                      ? selected.audio?.bytes
                      : null
                    : 0;
                const total =
                  value.total_bytes !== undefined &&
                  remaining !== null &&
                  remaining !== undefined
                    ? completed + value.total_bytes + remaining
                    : null;
                if (
                  total !== null &&
                  (total > OWNER_LIMITS.sourceBytes || completed + last > total)
                )
                  throw new Error("acquisition_progress_invalid");
                progress({
                  stage,
                  downloadedBytes: completed + last,
                  totalBytes: total,
                });
              },
            );
            if (!done) throw new Error("acquisition_transfer_incomplete");
            const file = join(input.directory, `acquisition.${stage}`);
            const info = await lstat(file);
            if (
              !info.isFile() ||
              info.isSymbolicLink() ||
              info.nlink !== 1 ||
              info.size < 1 ||
              info.size > OWNER_LIMITS.sourceBytes ||
              info.size !== last
            )
              throw new Error("acquisition_transfer_incomplete");
            completed += info.size;
          }
          return section ? { clockOffsetMs } : undefined;
        },
        input.directory,
      );
    },
  };
}
