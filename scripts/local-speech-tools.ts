import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { lstat, realpath, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  localSpeakerTools,
  type LocalSpeakerTools,
} from "./local-speaker-tools.ts";

export const LOCAL_SPEECH_PIN = {
  build: "b5454",
  archiveSha256:
    "b1158bd10edf92c9799149a6fc5d3e58da3f495241d6fb3423088130e88ffbf3",
  model: "ggml-parakeet-tdt-0.6b-v3-q8_0.bin",
  modelSha256:
    "4d64e9e96c2792186d072fde0034df0ad670cf680a2f53069052ead827fd600e",
  modelBytes: 668757119,
  files: {
    "ggml-base.dll":
      "8e50a3eb9f9a945060e0d4e3902d841aad64241aaf7859788d838367988142d9",
    "ggml-blas.dll":
      "3f33cc13fa48f75ea929422b9f25f4e722be9249035e709f08c3b65c13e0b088",
    "ggml-cpu-alderlake.dll":
      "6808a18b5559a68a24211dd240204981a499c6aecf997ba75ae294c937922c00",
    "ggml-cpu-cannonlake.dll":
      "b41e9dee611e98125217554d38416af61b6d4dcab6f32732f7a57770a3cefd8b",
    "ggml-cpu-cascadelake.dll":
      "9e9381b82c9b710410a4e49556ff9893f87d63fe26c3b46bcb06a8dcfb5b3401",
    "ggml-cpu-haswell.dll":
      "46b7ba057ce2d3f9671a5b0cad5d33917c4be3f4c7e96753947e01eb7bcccc5b",
    "ggml-cpu-icelake.dll":
      "3ecc05a8ac3804edab9bea31b3d9bb837a5435df7b1530aa688d30dfddbc26e1",
    "ggml-cpu-sandybridge.dll":
      "4454713fa196360e3b10702de0d94d3ffc9914312297fe8c41a27fbb1a0a76df",
    "ggml-cpu-skylakex.dll":
      "687cce2b1f57614a02e43ac1c8c9f9a38f7d377b6ae264867bc13f89b4f9a340",
    "ggml-cpu-sse42.dll":
      "01965f2177c8c5added32267019251c10d695dd571badfe7b7a8e30371406028",
    "ggml-cpu-x64.dll":
      "d9f359e4bc76229eb5cfd8d3978094d46c99da95edf994cd549cd917ca863428",
    "ggml.dll":
      "7f6629f4d6eb63ba5a57f1336bb720aa0243fef059891026c6b6722f410430eb",
    "libopenblas.dll":
      "4c7fb23e900bd637cf771ad4ae3d1b51112a897385906433f2f1e58fe053ff70",
    "parakeet-cli.exe":
      "b1a23fdcc519f95e7df23422a2be05cf0a42617bef501b9ef02a77991e0973b8",
    "parakeet.dll":
      "be1bc545f5a7df23a4b3edc26c7e053bb0e6327d6e57e8c054fdcc0e50bc3ec9",
  },
} as const;
export const LOCAL_SPEECH_POLICY = {
  threads: 4,
  coreMs: 60000,
  overlapMs: 2000,
  compatibility: "parakeet-60s-2s-v1",
} as const;

export type LocalSpeechTools = {
  engine?: "parakeet" | undefined;
  executable: string;
  model: string;
  directory: string;
  speakers?: LocalSpeakerTools | undefined;
};
const SPEECH_NOTICES = [
  "parakeet.LICENSE",
  "model.LICENSE",
  "model.NOTICE",
  "openblas.LICENSE",
] as const;
export async function localSpeechTools(
  repository: string,
): Promise<LocalSpeechTools> {
  if (process.platform !== "win32" || process.arch !== "x64")
    throw new Error("local_speech_unavailable");
  const directory = resolve(repository, ".local-build/tools/speech-parakeet");
  for (const path of [
    resolve(repository, ".local-build"),
    resolve(repository, ".local-build/tools"),
    directory,
  ]) {
    if ((await lstat(path)).isSymbolicLink() || (await realpath(path)) !== path)
      throw new Error("local_speech_unavailable");
  }
  const files: Record<string, string> = {
    ...LOCAL_SPEECH_PIN.files,
    [LOCAL_SPEECH_PIN.model]: LOCAL_SPEECH_PIN.modelSha256,
  };
  for (const name of await readdir(directory))
    if (
      !Object.hasOwn(files, name) &&
      !SPEECH_NOTICES.some((notice) => notice === name)
    )
      throw new Error("local_speech_unavailable");
  for (const notice of SPEECH_NOTICES) {
    const info = await lstat(join(directory, notice)).catch(() => {
      throw new Error("local_speech_unavailable");
    });
    if (
      !info.isFile() ||
      info.isSymbolicLink() ||
      info.nlink !== 1 ||
      info.size < 1 ||
      info.size > 65536
    )
      throw new Error("local_speech_unavailable");
  }
  for (const [name, expected] of Object.entries(files)) {
    const file = join(directory, name),
      info = await lstat(file);
    if (
      !info.isFile() ||
      info.isSymbolicLink() ||
      info.nlink !== 1 ||
      info.size > LOCAL_SPEECH_PIN.modelBytes
    )
      throw new Error("local_speech_unavailable");
    const hash = createHash("sha256");
    for await (const chunk of createReadStream(file)) hash.update(chunk);
    if (hash.digest("hex") !== expected)
      throw new Error("local_speech_unavailable");
  }
  const speakers = await localSpeakerTools(repository);
  return {
    engine: "parakeet",
    executable: join(directory, "parakeet-cli.exe"),
    model: join(directory, LOCAL_SPEECH_PIN.model),
    directory,
    ...(speakers ? { speakers } : {}),
  };
}
