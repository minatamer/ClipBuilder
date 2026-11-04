import { createHash } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  lstat,
  realpath,
  open,
  rm,
  rename,
  readFile,
  writeFile,
} from "node:fs/promises";
import { join, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  LOCAL_SPEECH_PIN as pin,
  localSpeechTools,
} from "./local-speech-tools.ts";

// Explicit owner/AFK setup only. Runtime and test imports never download tools.
if (process.platform !== "win32" || process.arch !== "x64")
  throw new Error("local_speech_unavailable");
const repository = resolve(import.meta.dirname, ".."),
  directory = join(repository, ".local-build/tools/speech-parakeet");
for (const path of [
  join(repository, ".local-build"),
  join(repository, ".local-build/tools"),
  directory,
]) {
  await mkdir(path, { recursive: true });
  if ((await lstat(path)).isSymbolicLink() || (await realpath(path)) !== path)
    throw new Error("local_speech_unavailable");
}
const scratch = await mkdtemp(join(directory, ".prepare-"));
async function download(name, url, expected, limit) {
  const file = join(scratch, name),
    handle = await open(file, "wx", 0o600),
    hash = createHash("sha256");
  let size = 0;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(300_000) });
    if (!response.ok || !response.body)
      throw new Error("local_speech_download_failed");
    for await (const chunk of response.body) {
      size += chunk.length;
      if (size > limit) throw new Error("local_speech_download_failed");
      hash.update(chunk);
      await handle.write(chunk);
    }
    if (!size || (expected && hash.digest("hex") !== expected))
      throw new Error("local_speech_checksum");
  } finally {
    await handle.close();
  }
  return file;
}
const quote = (value) => "'" + value.replaceAll("'", "''") + "'";
async function removePreparation() {
  if (!(await realpath(scratch)).startsWith(directory + "\\.prepare-"))
    throw new Error("local_speech_cleanup");
  await rm(scratch, { recursive: true, force: true });
}
try {
  let ready = false;
  // Existing complete installations are checked after removing our empty scratch.
  try {
    await lstat(join(directory, pin.model));
    ready = true;
  } catch {
    // A missing model requires the explicit preparation below.
  }
  if (!ready) {
    const archive = await download(
      "whisper.zip",
      `https://github.com/ggml-org/whisper.cpp/releases/download/${pin.build}/whisper-blas-bin-x64.zip`,
      pin.archiveSha256,
      32 * 1024 ** 2,
    );
    const model = await download(
      pin.model,
      `https://huggingface.co/ggml-org/parakeet-GGUF/resolve/main/${pin.model}?download=true&clipbuilder=${Date.now()}`,
      pin.modelSha256,
      pin.modelBytes,
    );
    const script = `Add-Type -AssemblyName System.IO.Compression.FileSystem; $zip=[IO.Compression.ZipFile]::OpenRead(${quote(archive)}); try { ${Object.keys(
      pin.files,
    )
      .map(
        (name) =>
          `[IO.Compression.ZipFileExtensions]::ExtractToFile($zip.GetEntry(${quote("Release/" + name)}),${quote(join(scratch, name))},$false);`,
      )
      .join(" ")} } finally { $zip.Dispose() }`;
    await promisify(execFile)(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-Command", script],
      { windowsHide: true, timeout: 30000 },
    );
    for (const [name, expected] of Object.entries(pin.files)) {
      const file = join(scratch, name);
      if (
        createHash("sha256")
          .update(await readFile(file))
          .digest("hex") !== expected
      )
        throw new Error("local_speech_checksum");
      try {
        await lstat(join(directory, name));
        throw new Error("local_speech_output_exists");
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
    await download(
      "parakeet.LICENSE",
      `https://raw.githubusercontent.com/ggml-org/whisper.cpp/${pin.build}/LICENSE`,
      undefined,
      65536,
    );
    await download(
      "model.LICENSE",
      "https://creativecommons.org/licenses/by/4.0/legalcode.txt",
      undefined,
      65536,
    );
    await download(
      "openblas.LICENSE",
      "https://raw.githubusercontent.com/OpenMathLib/OpenBLAS/v0.3.29/LICENSE",
      undefined,
      65536,
    );
    await writeFile(
      join(scratch, "model.NOTICE"),
      "NVIDIA Parakeet TDT 0.6B v3, CC BY 4.0. Original: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3 . GGUF Q8_0 conversion: https://huggingface.co/ggml-org/parakeet-GGUF . Conversion/quantization changes the original representation. No endorsement implied.\n",
      { flag: "wx", mode: 0o600 },
    );
    for (const name of [
      ...Object.keys(pin.files),
      pin.model,
      "parakeet.LICENSE",
      "model.LICENSE",
      "model.NOTICE",
      "openblas.LICENSE",
    ])
      await rename(
        name === pin.model ? model : join(scratch, name),
        join(directory, name),
      );
  }
} finally {
  await removePreparation();
}
await localSpeechTools(repository);
process.stdout.write(
  "Pinned local speech tools prepared; no inference or provider call performed.\n",
);
