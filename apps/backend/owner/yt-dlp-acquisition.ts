import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { lstat, mkdir, mkdtemp, realpath, rm } from "node:fs/promises";
import { isAbsolute, join, parse, relative, resolve } from "node:path";
import { z } from "zod";
import {
  OWNER_ACQUISITION_LIMITS,
  type OwnerYoutubeOffer,
} from "../../../packages/contracts/owner/acquisition.ts";
import { OWNER_LIMITS } from "../../../packages/contracts/owner/policy.ts";
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

export const OWNER_DOWNLOADER_PIN = {
  version: "2026.10.21",
  sha256: "33121d192d706e62f684a06f80918e3f3a8ba52ac3a65213b6951c39c7d9f555",
  challengeVersion: "2.9.8",
  challengeArchiveSha256:
    "cba84b26e0df5ae7f74fc66b86a95b866872a86292ebd84fa1e959927edd93bf",
} as const;
export type PreparedAcquisitionTools = {
  downloader: string;
  challenge: string;
  /** From the separately reviewed/extracted pinned archive, not a job input. */
  challengeExecutableSha256: string;
  systemRoot: string;
};
export type YtDlpConfiguration = {
  scratchRoot: string;
  tools: PreparedAcquisitionTools;
  /** Explicit composition-owned source/method clearance; UI acknowledgement cannot enable it. */
  permitsSource: (videoId: string) => boolean;
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
    action: "metadata" | "video" | "audio";
    formatId?: string;
    output?: string;
  },
  line: (value: string) => void,
) => Promise<void>;

async function executableDigest(file: string, signal: AbortSignal) {
  if (!isAbsolute(file)) throw new Error("acquisition_tools_unavailable");
  let cursor = parse(resolve(file)).root;
  for (const part of resolve(file).slice(cursor.length).split(/[\\/]/)) {
    cursor = join(cursor, part);
    if (
      (await lstat(cursor)).isSymbolicLink() ||
      (await realpath(cursor)) !== resolve(cursor)
    )
      throw new Error("acquisition_tools_unavailable");
  }
  const before = await lstat(file, { bigint: true });
  if (
    !before.isFile() ||
    before.nlink !== 1n ||
    before.size > 256n * 1024n ** 2n
  )
    throw new Error("acquisition_tools_unavailable");
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file, { signal }))
    hash.update(chunk);
  const after = await lstat(file, { bigint: true });
  if (
    before.ino !== after.ino ||
    before.size !== after.size ||
    before.mtimeNs !== after.mtimeNs ||
    before.ctimeNs !== after.ctimeNs
  )
    throw new Error("acquisition_tools_unavailable");
  return hash.digest("hex");
}
export async function verifyAcquisitionTools(
  tools: PreparedAcquisitionTools,
  signal: AbortSignal,
) {
  if (
    !/^[a-f0-9]{64}$/.test(tools.challengeExecutableSha256) ||
    !isAbsolute(tools.systemRoot)
  )
    throw new Error("acquisition_tools_unavailable");
  if (
    (await executableDigest(tools.downloader, signal)) !==
      OWNER_DOWNLOADER_PIN.sha256 ||
    (await executableDigest(tools.challenge, signal)) !==
      tools.challengeExecutableSha256
  )
    throw new Error("acquisition_tools_unavailable");
}

const quote = (value: string) => {
  if (Array.from(value).some((char) => char.charCodeAt(0) < 32))
    throw new Error("acquisition_config_invalid");
  return `'${value.replaceAll("'", `'"'"'`)}'`;
};
const FORMATS =
  "%\u0028formats.:.{format_id,width,height,fps,vcodec,acodec,filesize,filesize_approx,protocol,dynamic_range,language,has_drm,quality,preference,tbr,abr,audio_channels,asr,audio_track,language_preference})j";
const META = "%\u0028.{id,duration,live_status,availability,age_limit})j";
const PROGRESS =
  "%\u0028progress.{status,downloaded_bytes,total_bytes,total_bytes_estimate,speed,eta,elapsed,fragment_index,fragment_count})j";

/** Source-derived stdin framing. No URL/capability in process argv or a config file. */
export function ytDlpAcquisitionInput(input: {
  canonicalUrl: string;
  proxy: string;
  challenge: string;
  action: "metadata" | "video" | "audio";
  formatId?: string;
  output?: string;
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
  else {
    if (
      !input.formatId ||
      !/^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(input.formatId) ||
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
      String(OWNER_LIMITS.sourceBytes),
      "--format",
      input.formatId,
      "--output",
      input.output,
      "--print",
      "after_move:CB_DONE",
    );
  }
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

/** Dormant adapter. Neither this factory nor imports inspect a URL, env or binary. */
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
    action: (run: SessionRun) => Promise<T>,
    directory?: string,
  ) {
    signal.throwIfAborted();
    if (
      !config.permitsSource(identity.videoId) ||
      identity.canonicalUrl !==
        `https://www.youtube.com/watch?v=${identity.videoId}`
    )
      throw new Error("acquisition_source_not_cleared");
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
      return await action(async (options, line) => {
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
            }),
            cwd: directory ?? scratch,
            env,
            timeoutMs:
              options.action === "metadata"
                ? OWNER_ACQUISITION_LIMITS.metadataMs
                : OWNER_ACQUISITION_LIMITS.transferMs,
          },
          line,
          controller.signal,
        );
        broker?.assertHealthy();
        controller.signal.throwIfAborted();
      });
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
  async function readMetadata(
    identity: OwnerLinkedIdentity,
    run: SessionRun,
  ): Promise<OwnerYoutubeOffer> {
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
    return buildOwnerYoutubeOffer(
      normalizeOwnerYoutubeMetadata(
        { meta, formats },
        {
          videoId: identity.videoId,
          revision: randomUUID(),
          mode: "provider-source",
        },
      ),
    );
  }
  return {
    mode: "provider-source",
    metadata: (identity, signal) =>
      session(identity, signal, (run) => readMetadata(identity, run)),
    async download(input, progress, signal) {
      await session(
        input.identity,
        signal,
        async (run) => {
          const current = await readMetadata(input.identity, run);
          const selected = current.choices.find(
            (choice) =>
              choice.video.formatId === input.choice.video.formatId &&
              choice.audio?.formatId === input.choice.audio?.formatId,
          );
          if (
            !selected?.supported ||
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
          let completed = 0;
          for (const stage of ["video", "audio"] as const) {
            if (
              stage === "audio" &&
              selected.video.formatId === selected.audio?.formatId
            )
              continue;
            let last = 0;
            let done = false;
            await run(
              {
                action: stage,
                formatId:
                  stage === "video"
                    ? selected.video.formatId
                    : selected.audio!.formatId,
                output: join(input.directory, `acquisition.${stage}`),
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
        },
        input.directory,
      );
    },
  };
}
