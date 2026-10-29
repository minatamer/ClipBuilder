import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { lstat, realpath, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

export const LOCAL_SPEAKER_PIN = {
  release: "v2.0.1",
  archive: "sherpa-onnx-v2.0.1-win-x64-shared-MD-Release-no-tts",
  archiveSha256:
    "11fd6a50b97eed38b54fb16d8219f49b16aa7f6a8e43a042316469ef47652e82",
  segmentationArchiveSha256:
    "24615ee884c897d9d2ba09bb4d30da6bb1b15e685065962db5b02e76e4996488",
  files: {
    "sherpa-onnx-offline-speaker-diarization.exe":
      "812af169e79ba87ead097129d736c439ea95c687b98aa5699ab6e6edfeeb710f",
    "onnxruntime.dll":
      "422d776ab0e3218260f7f628fcb84606aaa5c21116f720c8619a6da5e0b2e0f9",
    "onnxruntime_providers_shared.dll":
      "0190137dee4933261c065c5d030c3568a68c7aa43cad942b4726a07011738bc2",
    "segmentation.onnx":
      "220ad67ca923bef2fa91f2390c786097bf305bceb5e261d4af67b38e938e1079",
    "embedding.onnx":
      "ad4a1802485d8b34c722d2a9d04249662f2ece5d28a7a039063ca22f515a789e",
  },
} as const;
export type LocalSpeakerTools = {
  executable: string;
  segmentation: string;
  embedding: string;
  directory: string;
};
export async function localSpeakerTools(
  repository: string,
): Promise<LocalSpeakerTools | undefined> {
  const directory = resolve(repository, ".local-build/tools/speakers");
  try {
    await lstat(directory);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT")
      return undefined;
    throw new Error("local_speech_unavailable");
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
      throw new Error("local_speech_unavailable");
  }
  for (const name of await readdir(directory)) {
    const expected = Object.entries(LOCAL_SPEAKER_PIN.files).find(
      ([file]) => file === name,
    )?.[1];
    const info = await lstat(join(directory, name));
    if (
      !info.isFile() ||
      info.isSymbolicLink() ||
      info.nlink !== 1 ||
      info.size > 64 * 1024 ** 2
    )
      throw new Error("local_speech_unavailable");
    if (!expected) {
      if (
        ![
          "sherpa.LICENSE",
          "segmentation.LICENSE",
          "embedding.NOTICE",
        ].includes(name) ||
        info.size > 65536
      )
        throw new Error("local_speech_unavailable");
      continue;
    }
    const hash = createHash("sha256");
    for await (const chunk of createReadStream(join(directory, name)))
      hash.update(chunk);
    if (hash.digest("hex") !== expected)
      throw new Error("local_speech_unavailable");
  }
  for (const name of Object.keys(LOCAL_SPEAKER_PIN.files))
    if (!(await lstat(join(directory, name))).isFile())
      throw new Error("local_speech_unavailable");
  return {
    directory,
    executable: join(directory, "sherpa-onnx-offline-speaker-diarization.exe"),
    segmentation: join(directory, "segmentation.onnx"),
    embedding: join(directory, "embedding.onnx"),
  };
}
