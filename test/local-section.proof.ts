import { expect, it } from "vitest";
import { createServer } from "node:https";
import { connect } from "node:net";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { ownerAcquisitionTools } from "../apps/backend/local/acquisition-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { runAcquisitionProcess } from "../apps/backend/local/acquisition-process.ts";
import { listenOwner } from "./owner-http.ts";
import { ytDlpAcquisitionInput } from "../apps/backend/local/yt-dlp-acquisition.ts";
import { prepareOwnerAcquisition } from "../apps/renderer/local/acquisition-media.ts";
import {
  ownerPortrait,
  inspectOwnerSource,
} from "../apps/renderer/local/media.ts";
import { mkdir, copyFile } from "node:fs/promises";
import { createAcquisitionEgress } from "../apps/backend/local/acquisition-egress.ts";
import { probeOwnerSectionClock } from "../apps/backend/local/section-clock.ts";

async function clearSectionScratch(root: string) {
  if (
    !resolve(root).startsWith(resolve(tmpdir(), "clipbuilder-section-proof-"))
  )
    throw Error("section_scratch_invalid");
  await rm(root, { recursive: true, force: true });
}

it.each([0, 5])(
  "downloads a stream-copied section through checked TLS with original clocks and exact export parity (stream offset %s)",
  async (streamOffset) => {
    const root = await mkdtemp(join(tmpdir(), "clipbuilder-section-proof-"));
    const signal = AbortSignal.timeout(90_000),
      tools = await ownerNativeTools(resolve(".")),
      acquisition = await ownerAcquisitionTools(
        resolve("."),
        process.env.SystemRoot,
        signal,
      );
    const source = join(root, "synthetic.mp4"),
      section = join(root, "section.mp4");
    const certFile = join(root, "cert.pem"),
      keyFile = join(root, "key.pem");
    await runOwnedProcess(
      "C:/Program Files/Git/usr/bin/openssl.exe",
      [
        "req",
        "-x509",
        "-newkey",
        "rsa:2048",
        "-nodes",
        "-days",
        "1",
        "-subj",
        "/CN=rr1-synthetic.googlevideo.com",
        "-addext",
        "subjectAltName=DNS:rr1-synthetic.googlevideo.com",
        "-keyout",
        keyFile,
        "-out",
        certFile,
      ],
      signal,
    ).catch(async (error) => {
      await clearSectionScratch(root);
      throw error;
    });
    let transferred = 0,
      ranges = 0;
    const server = createServer(
      { key: await readFile(keyFile), cert: await readFile(certFile) },
      async (req, res) => {
        const bytes = await readFile(source),
          range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range ?? "");
        if (!range) {
          res.writeHead(416).end();
          return;
        }
        ranges++;
        const start = Number(range[1]),
          end = Math.min(
            bytes.length - 1,
            range[2] ? Number(range[2]) : bytes.length - 1,
          );
        if (start > end) {
          res.writeHead(416).end();
          return;
        }
        res.writeHead(206, {
          "Content-Type": "video/mp4",
          "Content-Length": end - start + 1,
          "Content-Range": `bytes ${start}-${end}/${bytes.length}`,
          "Accept-Ranges": "bytes",
        });
        // Slow chunks make cancellation/early stream closure observable.
        for (let at = start; at <= end && !res.destroyed; at += 4096) {
          const part = bytes.subarray(at, Math.min(end + 1, at + 4096));
          transferred += part.length;
          res.write(part);
          await new Promise((done) => setTimeout(done, 1));
        }
        res.end();
      },
    );
    let broker: Awaited<ReturnType<typeof createAcquisitionEgress>> | undefined;
    const resolved: string[] = [];
    try {
      await runOwnedProcess(
        tools.ffmpeg,
        [
          "-nostdin",
          "-v",
          "error",
          "-f",
          "lavfi",
          "-i",
          "testsrc2=size=320x180:rate=30:duration=60",
          "-f",
          "lavfi",
          "-i",
          "anoisesrc=color=white:amplitude=0.3:sample_rate=48000:duration=60:seed=1",
          "-c:v",
          "libx264",
          "-preset",
          "ultrafast",
          "-crf",
          "15",
          "-g",
          "60",
          "-bf",
          "3",
          "-c:a",
          "aac",
          "-movflags",
          "+faststart",
          "-threads",
          "2",
          ...(streamOffset ? ["-output_ts_offset", String(streamOffset)] : []),
          source,
        ],
        signal,
      );
      const port = await listenOwner(server),
        info = join(root, "info.json");
      broker = await createAcquisitionEgress(signal, {
        resolve: async (host) => {
          resolved.push(host);
          return [{ address: "93.184.216.34", family: 4 }];
        },
        connect: () => connect({ host: "127.0.0.1", port }),
      });
      await writeFile(
        info,
        JSON.stringify({
          id: "SYNTHETIC01",
          title: "Synthetic",
          url: "https://rr1-synthetic.googlevideo.com/source.mp4",
          ext: "mp4",
          duration: 60,
          extractor: "generic",
          extractor_key: "Generic",
          protocol: "https",
          format_id: "synthetic",
        }),
      );
      const lines: string[] = [];
      const fixtureInput = (input: string) =>
        input
          .split("\n")
          .slice(0, -2)
          .join("\n")
          .replace(
            "ffmpeg_i:",
            `ffmpeg_i:-ca_file "${certFile.replaceAll("\\", "/")}" `,
          ) + "\n";
      const clockLines: string[] = [];
      await runAcquisitionProcess(
        {
          executable: acquisition.downloader,
          args: [
            "--ignore-config",
            "--config-locations",
            "-",
            "--load-info-json",
            info,
          ],
          input: fixtureInput(
            ytDlpAcquisitionInput({
              canonicalUrl: "https://www.youtube.com/watch?v=SYNTHETIC01",
              proxy: broker.proxy,
              challenge: acquisition.challenge,
              action: "clock",
              formatId: "synthetic",
            }),
          ),
          cwd: root,
          env: { SystemRoot: acquisition.systemRoot, TEMP: root, TMP: root },
          timeoutMs: 30_000,
        },
        (line) => clockLines.push(line),
        signal,
      );
      expect(clockLines).toEqual([
        `CB_CLOCK:${JSON.stringify("https://rr1-synthetic.googlevideo.com/source.mp4")}`,
      ]);
      const clockUrl: unknown = JSON.parse(clockLines[0]!.slice(9));
      if (typeof clockUrl !== "string")
        throw Error("synthetic_clock_projection_invalid");
      const clockOffsetMs = await probeOwnerSectionClock(
        {
          ffprobe: tools.ffprobe,
          url: clockUrl,
          proxy: broker.proxy,
          directory: root,
          systemRoot: acquisition.systemRoot,
          run: (request, line, scope) =>
            runAcquisitionProcess(
              { ...request, args: ["-ca_file", certFile, ...request.args] },
              line,
              scope,
            ),
        },
        signal,
      );
      // Preserve production flags; replace extraction with an owned synthetic info
      // document and trust only this test's ephemeral CA in the native TLS input.
      const generated = ytDlpAcquisitionInput({
        canonicalUrl: "https://www.youtube.com/watch?v=SYNTHETIC01",
        proxy: broker.proxy,
        challenge: acquisition.challenge,
        action: "video",
        formatId: "synthetic",
        output: section,
        section: { window: { startMs: 5200, endMs: 8900 }, durationMs: 60000 },
        ffmpeg: tools.ffmpeg,
      });
      const configInput = fixtureInput(generated);
      await runAcquisitionProcess(
        {
          executable: acquisition.downloader,
          args: [
            "--ignore-config",
            "--config-locations",
            "-",
            "--load-info-json",
            info,
          ],
          input: configInput,
          cwd: root,
          env: {
            SystemRoot: acquisition.systemRoot,
            TEMP: root,
            TMP: root,
          },
          timeoutMs: 80000,
        },
        (line) => lines.push(line),
        signal,
      );
      expect(lines).toContain("CB_DONE");
      expect(resolved.length).toBeGreaterThan(0);
      expect(new Set(resolved)).toEqual(
        new Set(["rr1-synthetic.googlevideo.com"]),
      );
      broker.assertHealthy();
      expect(ranges).toBeGreaterThan(0);
      expect(transferred).toBeLessThan((await readFile(source)).length);
      const probe = JSON.parse(
        await runOwnedProcess(
          tools.ffprobe,
          [
            "-v",
            "error",
            "-show_entries",
            "stream=codec_type,start_time,duration:format=start_time,duration",
            "-of",
            "json",
            section,
          ],
          signal,
        ),
      );
      expect(
        probe.streams.find(
          (s: { codec_type: string }) => s.codec_type === "video",
        ),
      ).toMatchObject({ start_time: expect.any(String) });
      expect(
        probe.streams.find(
          (s: { codec_type: string }) => s.codec_type === "video",
        ),
      ).toMatchObject({ start_time: expect.any(String) });
      expect(
        Number(
          probe.streams.find(
            (s: { codec_type: string }) => s.codec_type === "video",
          ).start_time,
        ) *
          1000 -
          clockOffsetMs,
      ).toBeCloseTo(2000, 0);
      const workspaceId = crypto.randomUUID(),
        directory = join(root, workspaceId);
      await mkdir(directory);
      await copyFile(section, join(directory, "acquisition.video"));
      const imported = await prepareOwnerAcquisition(
        root,
        workspaceId,
        {
          width: 320,
          height: 180,
          fps: 30,
          durationMs: 7700,
          videoCodec: "h264",
          audioCodec: "aac",
          audioChannels: 1,
          audioSampleRate: 48000,
        },
        tools,
        signal,
        true,
        undefined,
        {
          window: { startMs: 5200, endMs: 8900 },
          durationMs: 60000,
          clockOffsetMs,
        },
      );
      expect(imported.source).toMatchObject({
        origin: { startMs: 2000, durationMs: 60000 },
        availableWindow: { startMs: 3200, endMs: 6900 },
      });
      const output = join(root, "output.mp4"),
        reference = join(root, "reference.mp4");
      await ownerPortrait(
        join(directory, "source.mp4"),
        output,
        tools,
        signal,
        { startFrame: 96, endFrame: 207 },
        imported.source.fingerprint,
      );
      await ownerPortrait(
        source,
        reference,
        tools,
        signal,
        {
          startFrame: 156,
          endFrame: 267,
        },
        (await inspectOwnerSource(source, tools, signal)).fingerprint,
      );
      const hashes = async (file: string) =>
        (
          await runOwnedProcess(
            tools.ffmpeg,
            [
              "-nostdin",
              "-v",
              "error",
              "-i",
              file,
              "-map",
              "0:v:0",
              "-f",
              "framemd5",
              "-",
            ],
            signal,
          )
        )
          .split(/\r?\n/)
          .filter((line) => line && !line.startsWith("#"))
          .map((line) => line.split(",").at(-1)?.trim());
      expect(await hashes(output)).toEqual(await hashes(reference));
      const pcm = async (file: string, name: string) => {
        const path = join(root, name);
        await runOwnedProcess(
          tools.ffmpeg,
          [
            "-nostdin",
            "-v",
            "error",
            "-i",
            file,
            "-map",
            "0:a:0",
            "-ac",
            "1",
            "-ar",
            "16000",
            "-c:a",
            "pcm_s16le",
            "-f",
            "s16le",
            path,
          ],
          signal,
        );
        const bytes = await readFile(path);
        return Array.from({ length: bytes.length / 2 }, (_, index) =>
          bytes.readInt16LE(index * 2),
        );
      };
      const actualAudio = await pcm(output, "output.pcm"),
        referenceAudio = await pcm(reference, "reference.pcm");
      let best = { lag: 0, correlation: -1 };
      let distantCorrelation = -1;
      for (let lag = -1600; lag <= 1600; lag++) {
        let product = 0,
          aa = 0,
          bb = 0;
        for (
          let index = 3200;
          index < Math.min(actualAudio.length, referenceAudio.length) - 3200;
          index += 8
        ) {
          const a = actualAudio[index]!,
            b = referenceAudio[index + lag]!;
          product += a * b;
          aa += a * a;
          bb += b * b;
        }
        const correlation = product / Math.sqrt(aa * bb);
        if (Math.abs(lag) >= 16)
          distantCorrelation = Math.max(distantCorrelation, correlation);
        if (correlation > best.correlation) best = { lag, correlation };
      }
      expect(best).toMatchObject({ lag: 0 });
      // Lossy AAC/re-sampling changes samples; the unique peak still identifies
      // the same instant within one 16-kHz sample, rather than a delayed signal.
      expect(best.correlation).toBeGreaterThan(0.7);
      expect(distantCorrelation).toBeLessThan(best.correlation / 2);
    } finally {
      await broker?.close();
      server.closeAllConnections();
      if (server.listening)
        await new Promise<void>((done) => server.close(() => done()));
      expect(
        resolve(root).startsWith(
          resolve(tmpdir(), "clipbuilder-section-proof-"),
        ),
      ).toBe(true);
      await clearSectionScratch(root);
    }
  },
  100_000,
);
