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
    "6ba69e3482d7826214f90a6a9c84ca07782aec1e1d0c6a7c30c994fd5d816ccb",
  model: "ggml-small.bin",
  modelSha256:
    "1be3a9b2063867b937e64e2ec7483364a79917e157fa98c5d94b5c1fffea987b",
  modelBytes: 487601967,
  files: {
    "ggml-base.dll":
      "bede0d6b2d387236ecd2b5dd676d51c8984b5b6e0ae461a12174e9c01345c5f0",
    "ggml-cpu-alderlake.dll":
      "d8f5c56ea490394eeae8b271650f2647aecd039a542d6df9e0140726e62a4603",
    "ggml-cpu-cannonlake.dll":
      "74127b40abd4f595d9db6af0fa313a02e18ff42fc228bfa05281e7c788dd4507",
    "ggml-cpu-cascadelake.dll":
      "4b11c427b844eeac87529af9a8d94b35aad2024666beb2a35e59fe3077e4b81e",
    "ggml-cpu-haswell.dll":
      "1306b1014c8118d27234d8ddc0e66ced1f8c8476bf85071595fd182ea9b7263b",
    "ggml-cpu-icelake.dll":
      "2b4dc4c66e7d8fe2807283816e9cf3b7f7d0556f59df34069871e37eab8aed40",
    "ggml-cpu-sandybridge.dll":
      "04edbdebc01a1d421062a960881a4f34d520d99693999518243f332406444c6e",
    "ggml-cpu-skylakex.dll":
      "1774714cf93621406ff35344b54715619a83242ae3e331e44d98a3b35ce801be",
    "ggml-cpu-sse42.dll":
      "f060318772c4c2dbac312bbfff6ea700b85dbc502bb38585a7186d06d549301a",
    "ggml-cpu-x64.dll":
      "4b4b05caba40d4309b5d710ef74c59ba190516b8489f27bdb1ba11ae33c6e9d3",
    "ggml.dll":
      "31fe18616d872af9b6134b47a6dff8072ae4ecbe5df0273f4f8dc36766c9db8e",
    "whisper-cli.exe":
      "331dba46d6427105d2b802cdbc7eae916ea1c5abf9b0d3b5cfe460d8db8e4366",
    "whisper.dll":
      "034396d75bb5720c1851674ff64a96192b58f6927b68d334ebd254ce6cad9674",
  },
} as const;
export type LocalSpeechTools = {
  executable: string;
  model: string;
  directory: string;
  speakers?: LocalSpeakerTools | undefined;
};
export async function localSpeechTools(
  repository: string,
): Promise<LocalSpeechTools> {
  if (process.platform !== "win32" || process.arch !== "x64")
    throw new Error("local_speech_unavailable");
  const directory = resolve(repository, ".local-build/tools/speech");
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
      !["whisper.LICENSE", "model.LICENSE"].includes(name)
    )
      throw new Error("local_speech_unavailable");
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
    executable: join(directory, "whisper-cli.exe"),
    model: join(directory, LOCAL_SPEECH_PIN.model),
    directory,
    ...(speakers ? { speakers } : {}),
  };
}
