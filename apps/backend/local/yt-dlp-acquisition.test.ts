import { afterEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, parse, resolve } from "node:path";
import {
  createYtDlpAcquisitionPort,
  ytDlpAcquisitionInput,
  type YtDlpConfiguration,
} from "./yt-dlp-acquisition.ts";
import {
  runAcquisitionProcess,
  type AcquisitionProcess,
  type AcquisitionProcessRequest,
} from "./acquisition-process.ts";
import { canonicalOwnerYoutubeSource } from "./youtube-url.ts";
import { selectOwnerYoutubeFormat } from "./youtube-formats.ts";
import { OWNER_LIMITS } from "../../../packages/contracts/local/policy.ts";

const roots: string[] = [];
afterEach(async () => {
  for (const root of roots.splice(0)) {
    expect(dirname(root)).toBe(resolve(tmpdir()));
    await rm(root, { recursive: true, force: true });
  }
});
const controller = () => new AbortController();
const identity = canonicalOwnerYoutubeSource(
  "https://youtu.be/SYNTHETIC01?t=20",
);
const proxy = `http://owner:${"b".repeat(64)}@127.0.0.1:43210`;

/** Independent decoder for the generated POSIX shlex token subset, without a shell. */
function tokens(input: string): string[] {
  const result: string[] = [];
  let value = "",
    quote = "",
    active = false;
  for (let index = 0; index < input.length; index++) {
    const char = input[index]!;
    if (quote === "'") {
      if (char === "'") quote = "";
      else value += char;
    } else if (quote === '"') {
      if (char === '"') quote = "";
      else if (char === "\\") value += input[++index] ?? "";
      else value += char;
    } else if (char === "'" || char === '"') {
      active = true;
      quote = char;
    } else if (/\s/u.test(char)) {
      if (active) {
        result.push(value);
        value = "";
        active = false;
      }
    } else if (char === "\\") {
      active = true;
      value += input[++index] ?? "";
    } else {
      active = true;
      value += char;
    }
  }
  if (quote) throw new Error("test_config_unterminated");
  if (active) result.push(value);
  return result;
}
function option(args: string[], name: string): string {
  const index = args.indexOf(name);
  if (index < 0 || args[index + 1] === undefined)
    throw new Error("test_option_missing");
  return args[index + 1]!;
}
function rawMetadata(muxed = false): {
  meta: {
    id: string;
    title: string;
    duration: number;
    live_status: string;
    availability: string;
    age_limit: number;
  };
  formats: Record<string, unknown>[];
} {
  return {
    meta: {
      id: "SYNTHETIC01",
      title: "Synthetic selected video",
      duration: 75.125,
      live_status: "not_live",
      availability: "public",
      age_limit: 0,
    },
    formats: [
      {
        format_id: muxed ? "18" : "137",
        width: 1920,
        height: 1080,
        fps: 30,
        vcodec: "avc1.640028",
        acodec: muxed ? "mp4a.40.2" : "none",
        filesize: 1000,
        protocol: "https",
        dynamic_range: "SDR",
        has_drm: false,
        quality: 8,
        preference: 0,
        tbr: 5000,
        ...(muxed
          ? {
              abr: 128,
              audio_channels: 2,
              asr: 48_000,
              language: "en",
              language_preference: 10,
              audio_track: { id: "en-original", is_original: true },
            }
          : {}),
      },
      ...(!muxed
        ? [
            {
              format_id: "140",
              vcodec: "none",
              acodec: "mp4a.40.2",
              filesize: 100,
              protocol: "https",
              has_drm: false,
              abr: 128,
              audio_channels: 2,
              asr: 48_000,
              language: "en",
              language_preference: 10,
              audio_track: { id: "en-original", is_original: true },
            },
          ]
        : []),
    ],
  };
}
async function fixture(muxed = false) {
  const root = await mkdtemp(
    join(tmpdir(), "clipbuilder-acquisition-adapter-"),
  );
  roots.push(root);
  const scratchRoot = join(root, "workspaces");
  const directory = join(scratchRoot, randomUUID());
  await mkdir(directory, { recursive: true });
  const config: YtDlpConfiguration = {
    scratchRoot,
    tools: {
      downloader: join(root, "reviewed-tools", "yt-dlp.exe"),
      challenge: join(root, "runtime's folder", "deno.exe"),
      challengeExecutableSha256: "a".repeat(64),
      systemRoot: parse(root).root,
    },
  };
  const raw = rawMetadata(muxed);
  const close = vi.fn(async () => {});
  const healthy = vi.fn(() => {});
  const verify = vi.fn(async () => {});
  const egress = vi.fn(async (signal: AbortSignal) => {
    signal.throwIfAborted();
    return { proxy, close, assertHealthy: healthy };
  });
  const requests: AcquisitionProcessRequest[] = [];
  const signals: AbortSignal[] = [];
  const run = vi.fn<AcquisitionProcess>(async (request, line, signal) => {
    requests.push(request);
    signals.push(signal);
    const args = tokens(request.input);
    if (args.includes("--skip-download")) {
      line(`CB_META:${JSON.stringify(raw.meta)}`);
      line(`CB_FORMATS:${JSON.stringify(raw.formats)}`);
    } else {
      const output = option(args, "--output");
      const bytes = Buffer.from(
        output.endsWith(".video") ? "synthetic-video" : "synthetic-audio",
      );
      await writeFile(output, bytes);
      line(
        `CB_PROGRESS:${JSON.stringify({ status: "downloading", downloaded_bytes: 3 })}`,
      );
      line(
        `CB_PROGRESS:${JSON.stringify({ status: "finished", downloaded_bytes: bytes.length, total_bytes: bytes.length })}`,
      );
      line("CB_DONE");
    }
  });
  const port = createYtDlpAcquisitionPort(config, { run, verify, egress });
  const input = async (signal = controller().signal) => {
    const offer = await port.metadata(identity, signal);
    const selected = selectOwnerYoutubeFormat(offer, {
      sourceId: offer.sourceId,
      revision: offer.revision,
      choiceId: offer.bestChoiceId!,
      selection: { kind: "best" },
    });
    return {
      identity,
      offer,
      choice: selected.choice,
      selection: { kind: "best" } as const,
      directory,
    };
  };
  return {
    root,
    scratchRoot,
    directory,
    config,
    raw,
    close,
    healthy,
    verify,
    egress,
    run,
    port,
    requests,
    signals,
    input,
  };
}

describe("owner yt-dlp adapter with injected synthetic ports", () => {
  it("is inert and rejects a noncanonical identity before tools, broker or metadata", async () => {
    const setup = await fixture();
    expect(setup.run).toHaveBeenCalledTimes(0);
    expect(setup.verify).toHaveBeenCalledTimes(0);
    expect(setup.egress).toHaveBeenCalledTimes(0);
    await expect(
      setup.port.metadata(
        { ...identity, canonicalUrl: "https://untrusted.invalid/" },
        controller().signal,
      ),
    ).rejects.toThrow("acquisition_source_invalid");
    expect(setup.verify).toHaveBeenCalledTimes(0);
    expect(setup.egress).toHaveBeenCalledTimes(0);
    expect(setup.run).toHaveBeenCalledTimes(0);
    expect(await readdir(setup.scratchRoot)).toEqual([
      setup.directory.split(/[\\/]/u).at(-1),
    ]);
  });

  it("uses stdin-only private values, exact fixed arguments and a minimal child environment", async () => {
    const setup = await fixture();
    const offer = await setup.port.metadata(identity, controller().signal);
    expect(offer.mode).toBe("provider-source");
    expect(setup.verify).toHaveBeenCalledTimes(1);
    expect(setup.egress).toHaveBeenCalledTimes(1);
    expect(setup.run).toHaveBeenCalledTimes(1);
    const execution = setup.requests[0]!;
    expect(execution.args).toEqual([
      "--ignore-config",
      "--config-locations",
      "-",
      "--",
    ]);
    expect(JSON.stringify(execution.args)).not.toContain(identity.videoId);
    expect(JSON.stringify(execution.args)).not.toContain(proxy);
    const args = tokens(execution.input);
    expect(args.at(-1)).toBe(identity.canonicalUrl);
    expect(option(args, "--proxy")).toBe(proxy);
    expect(option(args, "--js-runtimes")).toBe(
      `deno:${setup.config.tools.challenge}`,
    );
    expect(option(args, "--use-extractors")).toBe("^youtube$");
    expect(option(args, "--downloader")).toBe("native");
    expect(args).not.toContain("--");
    expect(args).not.toContain("--no-config-locations");
    for (const flag of [
      "--no-cookies",
      "--no-cookies-from-browser",
      "--no-plugin-dirs",
      "--no-update",
      "--no-remote-components",
      "--no-exec",
    ])
      expect(args).toContain(flag);
    for (const flag of [
      "--retries",
      "--fragment-retries",
      "--extractor-retries",
      "--file-access-retries",
    ])
      expect(option(args, flag)).toBe("0");
    expect(Object.keys(execution.env).sort()).toEqual(
      [
        "DENO_DIR",
        "DENO_NO_PACKAGE_JSON",
        "DENO_NO_PROMPT",
        "DENO_NO_UPDATE_CHECK",
        "NO_COLOR",
        "SystemRoot",
        "TEMP",
        "TMP",
        "WINDIR",
      ].sort(),
    );
    expect(execution.env.DENO_DIR).toBe(join(execution.cwd, "deno"));
    expect(setup.close).toHaveBeenCalledTimes(1);
    expect(setup.signals[0]?.aborted).toBe(true);
    expect(await readdir(setup.scratchRoot)).toEqual([
      setup.directory.split(/[\\/]/u).at(-1),
    ]);
  });

  it("uses an explicit literal completion template rather than yt-dlp field shorthand", async () => {
    const setup = await fixture();
    const input = await setup.input();
    await setup.port.download(input, vi.fn(), controller().signal);
    const transfers = setup.requests.filter(
      (request) => !tokens(request.input).includes("--skip-download"),
    );
    expect(transfers).toHaveLength(2);
    for (const transfer of transfers)
      expect(option(tokens(transfer.input), "--print")).toBe(
        "after_move:%(id&CB_DONE|CB_DONE)s",
      );
  });

  it("does not admit broker or child work when cancellation arrives during tool verification", async () => {
    const setup = await fixture();
    const cancellation = controller();
    setup.verify.mockImplementationOnce(async () => {
      cancellation.abort();
    });
    await expect(
      setup.port.metadata(identity, cancellation.signal),
    ).rejects.toThrow();
    expect(setup.egress).toHaveBeenCalledTimes(0);
    expect(setup.run).toHaveBeenCalledTimes(0);
    expect(await readdir(setup.scratchRoot)).toEqual([
      setup.directory.split(/[\\/]/u).at(-1),
    ]);
  });

  it("removes the owned cache even if closing the broker fails", async () => {
    const setup = await fixture();
    setup.close.mockRejectedValueOnce(
      new Error("synthetic_broker_close_failed"),
    );
    await expect(
      setup.port.metadata(identity, controller().signal),
    ).rejects.toThrow();
    expect(setup.close).toHaveBeenCalledTimes(1);
    expect(await readdir(setup.scratchRoot)).toEqual([
      setup.directory.split(/[\\/]/u).at(-1),
    ]);
  });

  it("downloads the exact separate IDs once each and reports independent transfer stages", async () => {
    const setup = await fixture();
    const input = await setup.input();
    const progress = vi.fn();
    await setup.port.download(input, progress, controller().signal);
    expect(setup.run).toHaveBeenCalledTimes(4);
    const transfers = setup.requests.filter(
      (request) => !tokens(request.input).includes("--skip-download"),
    );
    expect(
      transfers.map((request) => option(tokens(request.input), "--format")),
    ).toEqual(["137", "140"]);
    expect(
      transfers.map((request) => option(tokens(request.input), "--output")),
    ).toEqual([
      join(setup.directory, "acquisition.video"),
      join(setup.directory, "acquisition.audio"),
    ]);
    expect(progress.mock.calls.map(([value]) => value.stage)).toEqual([
      "video",
      "video",
      "audio",
      "audio",
    ]);
    expect(progress.mock.calls.at(-1)?.[0]).toEqual({
      stage: "audio",
      downloadedBytes: 30,
      totalBytes: 30,
    });
    expect(
      await readFile(join(setup.directory, "acquisition.video"), "utf8"),
    ).toBe("synthetic-video");
    expect(
      await readFile(join(setup.directory, "acquisition.audio"), "utf8"),
    ).toBe("synthetic-audio");
    expect(setup.close).toHaveBeenCalledTimes(2);
  });

  it("does not download a second audio copy for an admitted progressive stream", async () => {
    const setup = await fixture(true);
    await setup.port.download(
      await setup.input(),
      vi.fn(),
      controller().signal,
    );
    expect(setup.run).toHaveBeenCalledTimes(3);
    expect(await readdir(setup.directory)).toEqual(["acquisition.video"]);
    expect(option(tokens(setup.requests.at(-1)!.input), "--format")).toBe("18");
    expect(setup.close).toHaveBeenCalledTimes(2);
  });

  it("rejects a changed offered stream before transferring any bytes", async () => {
    const setup = await fixture();
    const input = await setup.input();
    setup.raw.formats[0]!.fps = 60;
    await expect(
      setup.port.download(input, vi.fn(), controller().signal),
    ).rejects.toThrow("acquisition_stale_format");
    expect(setup.run).toHaveBeenCalledTimes(2);
    expect(
      setup.requests.every((request) =>
        tokens(request.input).includes("--skip-download"),
      ),
    ).toBe(true);
    expect(await readdir(setup.directory)).toEqual([]);
    expect(setup.close).toHaveBeenCalledTimes(2);
  });

  it.each([
    "not-json synthetic-private-marker",
    "CB_UNKNOWN:synthetic-private-marker",
    "CB_META:{bad-json-synthetic-private-marker",
  ])(
    "keeps malformed/unknown metadata private and closes owned resources",
    async (line) => {
      const setup = await fixture();
      setup.run.mockImplementationOnce(async (_request, onLine) => {
        onLine(line);
      });
      const failure = await setup.port
        .metadata(identity, controller().signal)
        .catch((error: unknown) => error);
      expect(failure).toBeInstanceOf(Error);
      expect((failure as Error).message).not.toContain(
        "synthetic-private-marker",
      );
      expect((failure as Error).message).toMatch(
        /^(?:acquisition_[a-z_]+|owner_youtube_metadata_invalid)$/u,
      );
      expect(setup.close).toHaveBeenCalledTimes(1);
      expect(await readdir(setup.scratchRoot)).toEqual([
        setup.directory.split(/[\\/]/u).at(-1),
      ]);
    },
  );

  it.each([
    `CB_PROGRESS:${JSON.stringify({ status: "downloading", downloaded_bytes: OWNER_LIMITS.sourceBytes + 1 })}`,
    `CB_PROGRESS:${JSON.stringify({ status: "downloading", downloaded_bytes: -1 })}`,
    "CB_PROGRESS:{malformed-synthetic-private-marker",
  ])(
    "fails malformed or excessive progress without publishing a completion",
    async (line) => {
      const setup = await fixture();
      const input = await setup.input();
      const defaultRun = setup.run.getMockImplementation()!;
      setup.run.mockImplementation(async (request, onLine, signal) => {
        if (tokens(request.input).includes("--skip-download"))
          return defaultRun(request, onLine, signal);
        onLine(line);
      });
      const progress = vi.fn();
      const failure = await setup.port
        .download(input, progress, controller().signal)
        .catch((error: unknown) => error);
      expect(failure).toBeInstanceOf(Error);
      expect((failure as Error).message).not.toContain(
        "synthetic-private-marker",
      );
      expect((failure as Error).message).toMatch(/^acquisition_[a-z_]+$/u);
      expect(progress).toHaveBeenCalledTimes(0);
      expect(setup.close).toHaveBeenCalledTimes(2);
      expect(await readdir(setup.directory)).toEqual([]);
    },
  );

  it("requires the explicit completion record and matching nonempty file size", async () => {
    for (const completed of [false, true]) {
      const setup = await fixture();
      const input = await setup.input();
      const defaultRun = setup.run.getMockImplementation()!;
      setup.run.mockImplementation(async (request, onLine, signal) => {
        const args = tokens(request.input);
        if (args.includes("--skip-download"))
          return defaultRun(request, onLine, signal);
        await writeFile(option(args, "--output"), Buffer.from("partial"));
        onLine(
          `CB_PROGRESS:${JSON.stringify({ status: "finished", downloaded_bytes: 100 })}`,
        );
        if (completed) onLine("CB_DONE");
      });
      await expect(
        setup.port.download(input, vi.fn(), controller().signal),
      ).rejects.toThrow("acquisition_transfer_incomplete");
      expect(setup.close).toHaveBeenCalledTimes(2);
      expect(await readdir(setup.directory)).not.toContain("acquisition.audio");
    }
  });

  it("propagates cancellation to the held child, drains broker/cache and never starts the sibling transfer", async () => {
    const setup = await fixture();
    const input = await setup.input();
    const defaultRun = setup.run.getMockImplementation()!;
    const cancellation = controller();
    let admitted!: () => void;
    const started = new Promise<void>((resolve) => {
      admitted = resolve;
    });
    let childSignal: AbortSignal | undefined;
    setup.run.mockImplementation(async (request, onLine, signal) => {
      if (tokens(request.input).includes("--skip-download"))
        return defaultRun(request, onLine, signal);
      childSignal = signal;
      admitted();
      await new Promise<never>((_resolve, reject) =>
        signal.addEventListener(
          "abort",
          () => reject(new Error("acquisition_canceled")),
          { once: true },
        ),
      );
    });
    const job = setup.port.download(input, vi.fn(), cancellation.signal);
    const outcome = expect(job).rejects.toThrow("acquisition_canceled");
    await started;
    cancellation.abort();
    await outcome;
    expect(childSignal?.aborted).toBe(true);
    expect(setup.run).toHaveBeenCalledTimes(3);
    expect(setup.close).toHaveBeenCalledTimes(2);
    expect(await readdir(setup.scratchRoot)).toEqual([
      setup.directory.split(/[\\/]/u).at(-1),
    ]);
  });

  it("rejects control characters, format expressions and noncanonical configuration inputs", () => {
    const base = {
      canonicalUrl: identity.canonicalUrl,
      proxy,
      challenge: join(resolve(tmpdir()), "runtime's folder", "deno.exe"),
      action: "video" as const,
      formatId: "137",
      output: join(resolve(tmpdir()), "synthetic.video"),
    };
    for (const patch of [
      { canonicalUrl: "https://127.0.0.1" },
      { formatId: "137+140/best" },
      { formatId: "137\n--exec" },
      { output: "relative" },
      { challenge: "relative" },
      { proxy: "http://127.0.0.1:1" },
    ])
      expect(() => ytDlpAcquisitionInput({ ...base, ...patch })).toThrow(
        "acquisition_config_invalid",
      );
    const decoded = tokens(ytDlpAcquisitionInput(base));
    expect(option(decoded, "--js-runtimes")).toBe(`deno:${base.challenge}`);
    expect(option(decoded, "--format")).toBe("137");
    expect(option(decoded, "--output")).toBe(base.output);
  });
});

describe("synthetic local child framing without downloader or network", () => {
  async function execution(script: string): Promise<AcquisitionProcessRequest> {
    const root = await mkdtemp(
      join(tmpdir(), "clipbuilder-acquisition-child-"),
    );
    roots.push(root);
    return {
      executable: process.execPath,
      args: ["--eval", script],
      input: "synthetic-input",
      cwd: root,
      env: {
        SystemRoot: process.env.SystemRoot ?? parse(root).root,
        NODE_ENV: "test",
        FAKE_MODE: "true",
        PROVIDER_MODE: "fake",
        PAID_DEMO_ENABLED: "false",
      },
      timeoutMs: 5000,
    };
  }

  it("assembles UTF-8 split chunks, CRLF and final records while discarding stderr", async () => {
    const request = await execution(
      `const bytes=Buffer.from('CB_META:{"synthetic":"é"}\\r\\nCB_DONE'); const index=bytes.indexOf(0xc3); process.stdout.write(bytes.subarray(0,index+1)); setTimeout(()=>{process.stderr.write('synthetic-private-stderr-marker'); process.stdout.end(bytes.subarray(index+1));},10);`,
    );
    const lines: string[] = [];
    await runAcquisitionProcess(
      request,
      (line) => {
        lines.push(line);
      },
      controller().signal,
    );
    expect(lines).toEqual(['CB_META:{"synthetic":"é"}', "CB_DONE"]);
    expect(JSON.stringify(lines)).not.toContain(
      "synthetic-private-stderr-marker",
    );
  });

  it("returns a fixed failure instead of exposing a child error body", async () => {
    const request = await execution(
      "process.stderr.write('synthetic-private-stderr-marker'); process.exitCode=7;",
    );
    await expect(
      runAcquisitionProcess(request, () => {}, controller().signal),
    ).rejects.toThrow(/^acquisition_process_failed$/u);
  });

  it("bounds an oversized unterminated record and reaps the synthetic child", async () => {
    const request = await execution(
      "process.stdout.write('x'.repeat(1024*1024+1)); setInterval(()=>{},1000);",
    );
    await expect(
      runAcquisitionProcess(request, () => {}, controller().signal),
    ).rejects.toThrow(/^acquisition_process_failed$/u);
  });

  it("aborts and reaps its held synthetic child without a timer survivor", async () => {
    const request = await execution(
      "console.log('CB_PID:'+process.pid); setInterval(()=>{},1000);",
    );
    const cancellation = controller();
    let pid = 0;
    await expect(
      runAcquisitionProcess(
        request,
        (line) => {
          pid = Number(line.slice(7));
          cancellation.abort();
        },
        cancellation.signal,
      ),
    ).rejects.toThrow(/^acquisition_canceled$/u);
    expect(pid).toBeGreaterThan(0);
    expect(() => process.kill(pid, 0)).toThrow();
  });
});
