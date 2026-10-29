import { createHash } from "node:crypto";
import { lstat, readFile, rename, rm } from "node:fs/promises";
import { z } from "zod";
import {
  OWNER_AUDIO_LIMITS,
  ownerAudioAssetSchema,
} from "../../../packages/contracts/local/audio.ts";
import type { OwnerMediaJob } from "../../../packages/contracts/local/index.ts";
import { ownerAudioMediaPath, type OwnerNativeTools } from "./media.ts";
import { runOwnedProcess } from "../src/media/process-runner.ts";
import { OWNER_FPS } from "../../../packages/contracts/local/policy.ts";

const inputOptions = [
  "-protocol_whitelist",
  "file,pipe",
  "-format_whitelist",
  "wav,mp3,mov,mp4",
  "-codec_whitelist",
  "mp3,mp3float,aac,pcm_s16le,pcm_s24le,pcm_s32le,pcm_f32le,pcm_u8",
  "-max_streams",
  "1",
];
const audioProbe = z.object({
  streams: z
    .array(
      z.object({
        codec_type: z.literal("audio"),
        codec_name: z.enum([
          "mp3",
          "aac",
          "pcm_s16le",
          "pcm_s24le",
          "pcm_s32le",
          "pcm_f32le",
          "pcm_u8",
        ]),
        channels: z.number().int().min(1).max(2),
        sample_rate: z.coerce.number().finite().min(8000).max(192000),
      }),
    )
    .length(1),
  format: z.object({
    duration: z.coerce
      .number()
      .finite()
      .positive()
      .max(OWNER_AUDIO_LIMITS.durationMs / 1000),
  }),
});
export async function normalizeOwnerAudio(
  root: string,
  job: Extract<OwnerMediaJob, { operation: "normalize-audio" }>,
  tools: OwnerNativeTools,
  signal: AbortSignal,
) {
  const input = await ownerAudioMediaPath(
      root,
      job.workspaceId,
      job.assetId,
      true,
    ),
    output = await ownerAudioMediaPath(root, job.workspaceId, job.assetId),
    temporary = `${output}.partial.wav`,
    bounded = AbortSignal.any([signal, AbortSignal.timeout(30_000)]);
  const info = await lstat(input);
  if (
    !info.isFile() ||
    info.isSymbolicLink() ||
    info.nlink !== 1 ||
    info.size < 1 ||
    info.size > OWNER_AUDIO_LIMITS.inputBytes
  )
    throw new Error("invalid_audio_asset");
  try {
    await lstat(output);
    throw new Error("audio_output_exists");
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT"))
      throw error;
  }
  try {
    const inspected = audioProbe.parse(
      JSON.parse(
        await runOwnedProcess(
          tools.ffprobe,
          [
            "-v",
            "error",
            ...inputOptions,
            "-show_streams",
            "-show_format",
            "-of",
            "json",
            input,
          ],
          bounded,
        ),
      ),
    );
    const frames = Math.ceil(inspected.format.duration * OWNER_FPS - 1e-8),
      duration = frames / OWNER_FPS;
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-n",
        "-v",
        "error",
        ...inputOptions,
        "-threads",
        "2",
        "-i",
        input,
        "-map",
        "0:a:0",
        "-vn",
        "-sn",
        "-dn",
        "-t",
        String(duration),
        "-af",
        `apad,atrim=duration=${duration}`,
        "-ar",
        "48000",
        "-ac",
        "2",
        "-c:a",
        "pcm_s16le",
        "-map_metadata",
        "-1",
        "-fflags",
        "+bitexact",
        "-fs",
        String(OWNER_AUDIO_LIMITS.bytes),
        temporary,
      ],
      bounded,
    );
    const receipt = audioProbe.parse(
      JSON.parse(
        await runOwnedProcess(
          tools.ffprobe,
          [
            "-v",
            "error",
            ...inputOptions,
            "-show_streams",
            "-show_format",
            "-of",
            "json",
            temporary,
          ],
          bounded,
        ),
      ),
    );
    const normalized = await lstat(temporary);
    if (
      receipt.streams[0]!.codec_name !== "pcm_s16le" ||
      receipt.streams[0]!.sample_rate !== 48000 ||
      receipt.streams[0]!.channels !== 2 ||
      Math.abs(receipt.format.duration - duration) > 0.001
    )
      throw new Error("invalid_audio_asset");
    if (
      !normalized.isFile() ||
      normalized.isSymbolicLink() ||
      normalized.size > OWNER_AUDIO_LIMITS.bytes
    )
      throw new Error("invalid_audio_asset");
    const bytes = await readFile(temporary);
    const asset = ownerAudioAssetSchema.parse({
      id: job.assetId,
      bytes: bytes.length,
      durationMs: Math.round(duration * 1000),
      frames,
      digest: createHash("sha256").update(bytes).digest("hex"),
    });
    bounded.throwIfAborted();
    await rename(temporary, output);
    return { operation: "normalize-audio" as const, asset };
  } finally {
    await rm(temporary, { force: true });
  }
}
