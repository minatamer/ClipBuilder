import { createHash } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  lstat,
  realpath,
  open,
  rm,
  copyFile,
  writeFile,
  rename,
} from "node:fs/promises";
import { resolve, join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  LOCAL_SPEAKER_PIN as pin,
  localSpeakerTools,
} from "./local-speaker-tools.ts";

// Explicit free local preparation. Runtime/test imports never download assets.
if (process.platform !== "win32" || process.arch !== "x64")
  throw new Error("local_speech_unavailable");
const repository = resolve(import.meta.dirname, ".."),
  parent = join(repository, ".local-build/tools"),
  destination = join(parent, "speakers");
await mkdir(parent, { recursive: true });
for (const path of [dirname(parent), parent])
  if ((await lstat(path)).isSymbolicLink() || (await realpath(path)) !== path)
    throw new Error("local_speech_unavailable");
if (await localSpeakerTools(repository)) {
  process.stdout.write("Local speaker tools already verified.\n");
} else {
  const scratch = await mkdtemp(join(tmpdir(), "clipbuilder-speaker-setup-")),
    staged = await mkdtemp(join(parent, ".speakers-"));
  const download = async (name, url, expected, maximum) => {
    const file = join(scratch, name),
      handle = await open(file, "wx", 0o600),
      hash = createHash("sha256");
    let size = 0;
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(180000),
      });
      if (!response.ok || !response.body)
        throw new Error("local_speech_download_failed");
      for await (const bytes of response.body) {
        size += bytes.length;
        if (size > maximum) throw new Error("local_speech_download_failed");
        hash.update(bytes);
        await handle.write(bytes);
      }
      if (!size || (expected && hash.digest("hex") !== expected))
        throw new Error("local_speech_checksum");
    } finally {
      await handle.close();
    }
    return file;
  };
  const cleanup = async () => {
    if (dirname(await realpath(scratch)) !== (await realpath(tmpdir())))
      throw new Error("local_speech_cleanup");
    await rm(scratch, { recursive: true, force: true });
    try {
      if (dirname(await realpath(staged)) !== (await realpath(parent)))
        throw new Error("local_speech_cleanup");
      await rm(staged, { recursive: true, force: true });
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  };
  try {
    const tools = await download(
      "tools.tar.bz2",
      `https://github.com/k2-fsa/sherpa-onnx/releases/download/${pin.release}/${pin.archive}.tar.bz2`,
      pin.archiveSha256,
      24 * 1024 ** 2,
    );
    const segmentation = await download(
      "segmentation.tar.bz2",
      "https://github.com/k2-fsa/sherpa-onnx/releases/download/speaker-segmentation-models/sherpa-onnx-pyannote-segmentation-3-0.tar.bz2",
      pin.segmentationArchiveSha256,
      8 * 1024 ** 2,
    );
    const embedding = await download(
      "embedding.onnx",
      "https://github.com/k2-fsa/sherpa-onnx/releases/download/speaker-recongition-models/nemo_en_titanet_small.onnx",
      pin.files["embedding.onnx"],
      48 * 1024 ** 2,
    );
    const tar = join(
        process.env.SystemRoot ?? "C:/Windows",
        "System32/tar.exe",
      ),
      execute = promisify(execFile);
    const binaries = [
      "sherpa-onnx-offline-speaker-diarization.exe",
      "onnxruntime.dll",
      "onnxruntime_providers_shared.dll",
    ];
    await execute(
      tar,
      [
        "-xf",
        tools,
        "-C",
        scratch,
        ...binaries.map((name) => `${pin.archive}/bin/${name}`),
      ],
      { windowsHide: true, maxBuffer: 65536 },
    );
    await execute(
      tar,
      [
        "-xf",
        segmentation,
        "-C",
        scratch,
        "sherpa-onnx-pyannote-segmentation-3-0/model.onnx",
        "sherpa-onnx-pyannote-segmentation-3-0/LICENSE",
      ],
      { windowsHide: true, maxBuffer: 65536 },
    );
    for (const name of binaries)
      await copyFile(
        join(scratch, pin.archive, "bin", name),
        join(staged, name),
      );
    await copyFile(
      join(scratch, "sherpa-onnx-pyannote-segmentation-3-0/model.onnx"),
      join(staged, "segmentation.onnx"),
    );
    await copyFile(
      join(scratch, "sherpa-onnx-pyannote-segmentation-3-0/LICENSE"),
      join(staged, "segmentation.LICENSE"),
    );
    await copyFile(embedding, join(staged, "embedding.onnx"));
    const license = await download(
      "sherpa.LICENSE",
      `https://raw.githubusercontent.com/k2-fsa/sherpa-onnx/${pin.release}/LICENSE`,
      null,
      65536,
    );
    await copyFile(license, join(staged, "sherpa.LICENSE"));
    await writeFile(
      join(staged, "embedding.NOTICE"),
      "NeMo TitaNet-small speaker embedding, NVIDIA; ONNX conversion distributed by k2-fsa/sherpa-onnx. Model card: https://catalog.ngc.nvidia.com/orgs/nvidia/teams/nemo/models/titanet_small\nONNX source: https://github.com/k2-fsa/sherpa-onnx/releases/tag/speaker-recongition-models\n",
      { flag: "wx" },
    );
    await rename(staged, destination);
    await localSpeakerTools(repository);
    process.stdout.write(
      "Local CPU speaker tools and models verified; no inference performed.\n",
    );
  } finally {
    await cleanup();
  }
}
