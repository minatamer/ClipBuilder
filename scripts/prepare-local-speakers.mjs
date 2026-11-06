import { createHash } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  lstat,
  realpath,
  open,
  rm,
  writeFile,
  rename,
} from "node:fs/promises";
import { resolve, join, dirname } from "node:path";
import {
  LOCAL_SPEAKER_PIN as pin,
  localSpeakerTools,
} from "./local-speaker-tools.ts";

// Explicit free preparation only; runtime/test imports never download assets.
if (process.platform !== "win32" || process.arch !== "x64")
  throw Error("local_speech_unavailable");
const repository = resolve(import.meta.dirname, ".."),
  parent = join(repository, ".local-build/tools"),
  destination = join(parent, pin.directory);
await mkdir(parent, { recursive: true });
for (const path of [dirname(parent), parent])
  if ((await lstat(path)).isSymbolicLink() || (await realpath(path)) !== path)
    throw Error("local_speech_unavailable");
if (await localSpeakerTools(repository))
  process.stdout.write("Local speaker tools already verified.\n");
else {
  const staged = await mkdtemp(join(parent, ".speaker-windows-"));
  const cleanup = async () => {
    try {
      const actual = await realpath(staged);
      if (
        dirname(actual) !== (await realpath(parent)) ||
        !(await lstat(actual)).isDirectory() ||
        (await lstat(actual)).isSymbolicLink()
      )
        throw Error("local_speech_cleanup");
      await rm(actual, { recursive: true, force: true });
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  };
  try {
    const file = await open(join(staged, pin.model), "wx", 0o600),
      hash = createHash("sha256");
    let size = 0;
    try {
      const response = await fetch(
        `https://github.com/k2-fsa/sherpa-onnx/releases/download/speaker-recongition-models/${pin.model}`,
        { signal: AbortSignal.timeout(180000) },
      );
      if (!response.ok || !response.body)
        throw Error("local_speech_download_failed");
      for await (const bytes of response.body) {
        size += bytes.length;
        if (size > pin.maximumBytes)
          throw Error("local_speech_download_failed");
        hash.update(bytes);
        await file.write(bytes);
      }
      if (!size || hash.digest("hex") !== pin.sha256)
        throw Error("local_speech_checksum");
    } finally {
      await file.close();
    }
    await writeFile(
      join(staged, "embedding.NOTICE"),
      "WeSpeaker English VoxCeleb ResNet34, WeSpeaker team. Model: https://huggingface.co/Wespeaker/wespeaker-voxceleb-resnet34 ; ONNX distribution: https://github.com/k2-fsa/sherpa-onnx/releases/tag/speaker-recongition-models . See docs/operations/THIRD_PARTY_SOFTWARE.md for model attribution/license.\n",
      { flag: "wx" },
    );
    await rename(staged, destination);
    await localSpeakerTools(repository);
    process.stdout.write(
      "Local short-window speaker model verified; no inference performed.\n",
    );
  } finally {
    await cleanup();
  }
}
