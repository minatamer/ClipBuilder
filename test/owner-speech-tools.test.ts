import { expect, it } from "vitest";
import { link, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { localSpeechTools } from "../scripts/local-speech-tools.ts";

it.skipIf(process.platform !== "win32").each(["missing", "empty", "linked"])(
  "rejects %s license prerequisites before reading any model",
  async (mode) => {
    const root = await mkdtemp(
      join(tmpdir(), "clipbuilder-speech-prerequisite-"),
    );
    const directory = join(root, ".local-build/tools/speech-parakeet");
    await mkdir(directory, { recursive: true });
    try {
      for (const notice of [
        "parakeet.LICENSE",
        "model.LICENSE",
        "model.NOTICE",
      ])
        await writeFile(join(directory, notice), "Synthetic notice");
      if (mode === "empty")
        await writeFile(join(directory, "openblas.LICENSE"), "");
      if (mode === "linked") {
        const source = join(root, "synthetic-notice");
        await writeFile(source, "Synthetic notice");
        await link(source, join(directory, "openblas.LICENSE"));
      }
      await expect(localSpeechTools(root)).rejects.toThrow(
        "local_speech_unavailable",
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);
