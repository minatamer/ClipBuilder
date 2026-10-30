import { createHash } from "node:crypto";
import { lstat, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  ownerAudioSegments,
  ownerAudioTrackSchema,
  OWNER_AUDIO_LIMITS,
} from "../../../packages/contracts/local/audio.ts";
import type { OwnerOverlay } from "../../../packages/contracts/local/clips.ts";
import { ownerSoundAudio } from "../../../packages/composition/local/audio-sources.ts";
import { ownerAudioMediaPath } from "./media.ts";

/** Closed catalogue/PCM inputs and bounded segments; no user path or filter syntax. */
export async function prepareOwnerAudioMix(options: {
  root: string;
  workspaceId: string;
  overlay: OwnerOverlay;
  scratch: string;
  firstInput: number;
  hookSeconds: number;
  bodySeconds: number;
  hookSourceSeconds: number;
  fps: number;
  signal: AbortSignal;
}) {
  const audio = options.overlay.audio
    ? ownerAudioTrackSchema.parse(options.overlay.audio)
    : undefined;
  const segments = ownerAudioSegments(
    audio,
    options.overlay.frames,
    options.overlay.hook,
    options,
    options.overlay.visuals,
  );
  if (!segments.length && (audio?.originalVolume ?? 100) === 100)
    return { inputs: [] as string[], graph: "", label: "audio" };
  const files = new Map<string, { file: string; format: "wav" | "flac" }>(),
    inputs: string[] = [],
    filters: string[] = [];
  const duration = options.hookSeconds + options.bodySeconds;
  for (const [index, segment] of segments.entries()) {
    options.signal.throwIfAborted();
    const source = segment.cue.source;
    const key = `${source.kind}:${source.id}`;
    let prepared = files.get(key);
    if (!prepared) {
      if (source.kind === "builtin") {
        const sample = ownerSoundAudio(source.id);
        const file = join(
          options.scratch,
          `audio-${source.id}.${sample.extension}`,
        );
        await writeFile(file, new Uint8Array(sample.bytes), {
          flag: "wx",
          mode: 0o600,
        });
        prepared = { file, format: sample.extension };
      } else {
        const asset = audio!.assets.find((item) => item.id === source.id);
        if (!asset) throw new Error("invalid_audio_asset");
        const file = await ownerAudioMediaPath(
          options.root,
          options.workspaceId,
          source.id,
        );
        const info = await lstat(file);
        if (
          !info.isFile() ||
          info.isSymbolicLink() ||
          info.size !== asset.bytes ||
          info.size > OWNER_AUDIO_LIMITS.bytes
        )
          throw new Error("invalid_audio_asset");
        if (
          createHash("sha256")
            .update(await readFile(file))
            .digest("hex") !== asset.digest
        )
          throw new Error("invalid_audio_asset");
        prepared = { file, format: "wav" };
      }
      files.set(key, prepared);
    }
    inputs.push(
      ...(segment.cue.loop ? ["-stream_loop", "-1"] : []),
      "-protocol_whitelist",
      "file,pipe",
      "-format_whitelist",
      prepared.format,
      "-codec_whitelist",
      prepared.format === "flac" ? "flac" : "pcm_s16le",
      "-threads",
      "1",
      "-i",
      prepared.file,
    );
    const span = segment.end - segment.start,
      fade = Math.min(OWNER_AUDIO_LIMITS.fadeSeconds, span / 2);
    filters.push(
      `[${options.firstInput + index}:a:0]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,atrim=start=${segment.offset}:duration=${span},asetpts=PTS-STARTPTS,afade=t=in:d=${fade},afade=t=out:st=${span - fade}:d=${fade},volume=${segment.cue.volume / 100},adelay=${Math.round(segment.start * OWNER_AUDIO_LIMITS.sampleRate)}S:all=1,apad,atrim=duration=${duration}[added${index}]`,
    );
  }
  filters.push(
    `[audio]volume=${(audio?.originalVolume ?? 100) / 100},apad,atrim=duration=${duration}[originalAudio]`,
  );
  filters.push(
    `[originalAudio]${segments.map((_, index) => `[added${index}]`).join("")}amix=inputs=${segments.length + 1}:duration=first:dropout_transition=0:normalize=0,alimiter=limit=0.95:level=0,atrim=duration=${duration}[mixedAudio]`,
  );
  return { inputs, graph: filters.join(";"), label: "mixedAudio" };
}
