import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { createRequire } from "node:module";
import { lstat, realpath, readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

export const LOCAL_SPEAKER_PIN = {
  nodeVersion: "2.0.1",
  directory: "speaker-windows",
  model: "wespeaker_en_voxceleb_resnet34.onnx",
  sha256: "5ef208a9da1453335308a6b6f4e6dfbd7e183a38b604de0a57664f45d257fe94",
  maximumBytes: 32 * 1024 ** 2,
} as const;
export type LocalSpeakerTools = {
  executable: string;
  script: string;
  embedding: string;
  directory: string;
};

/** Explicit normal composition only; the old toolkit is retained, never a fallback. */
export async function localSpeakerTools(
  repository: string,
): Promise<LocalSpeakerTools | undefined> {
  const directory = resolve(
    repository,
    ".local-build/tools",
    LOCAL_SPEAKER_PIN.directory,
  );
  try {
    await lstat(directory);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT")
      return undefined;
    throw Error("local_speech_unavailable");
  }
  const require = createRequire(
    resolve(repository, "apps/renderer/package.json"),
  );
  const nodePackage = require.resolve("sherpa-onnx-node/package.json");
  const nativePackage = createRequire(nodePackage).resolve(
    "sherpa-onnx-win-x64/package.json",
  );
  for (const path of [nodePackage, nativePackage]) {
    const value: unknown = JSON.parse(await readFile(path, "utf8"));
    if (
      typeof value !== "object" ||
      value === null ||
      !("version" in value) ||
      value.version !== LOCAL_SPEAKER_PIN.nodeVersion
    )
      throw Error("local_speech_unavailable");
  }
  for (const path of [
    resolve(repository, ".local-build"),
    resolve(repository, ".local-build/tools"),
    directory,
  ]) {
    const info = await lstat(path);
    if (
      !info.isDirectory() ||
      info.isSymbolicLink() ||
      (await realpath(path)) !== path
    )
      throw Error("local_speech_unavailable");
  }
  for (const name of await readdir(directory)) {
    if (![LOCAL_SPEAKER_PIN.model, "embedding.NOTICE"].includes(name))
      throw Error("local_speech_unavailable");
    const info = await lstat(join(directory, name));
    if (
      !info.isFile() ||
      info.isSymbolicLink() ||
      info.nlink !== 1 ||
      info.size >
        (name === "embedding.NOTICE" ? 65536 : LOCAL_SPEAKER_PIN.maximumBytes)
    )
      throw Error("local_speech_unavailable");
  }
  const embedding = join(directory, LOCAL_SPEAKER_PIN.model),
    hash = createHash("sha256");
  for await (const bytes of createReadStream(embedding)) hash.update(bytes);
  if (hash.digest("hex") !== LOCAL_SPEAKER_PIN.sha256)
    throw Error("local_speech_unavailable");
  await lstat(join(directory, "embedding.NOTICE"));
  const script = resolve(repository, ".local-build/speaker-windows.mjs"),
    info = await lstat(script);
  if (
    !info.isFile() ||
    info.isSymbolicLink() ||
    info.nlink !== 1 ||
    info.size > 1024 ** 2
  )
    throw Error("local_speech_unavailable");
  return { executable: process.execPath, script, embedding, directory };
}
