import { expect, it } from "vitest";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { ownerAcquisitionTools } from "./acquisition-tools.ts";

it("rejects a forged executable receipt even when its claimed hash matches the local binary", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-tool-receipt-test-"));
  try {
    const directory = join(root, ".local-build/tools/youtube");
    await mkdir(directory, { recursive: true });
    const bytes = Buffer.from("synthetic executable, never run");
    const digest = createHash("sha256")
      .update(bytes)
      .digest("hex")
      .toUpperCase();
    for (const name of [
      "yt-dlp.LICENSE",
      "yt-dlp.THIRD_PARTY_LICENSES.txt",
      "deno.LICENSE.md",
    ])
      await writeFile(join(directory, name), "synthetic notice");
    await writeFile(join(directory, "deno.exe"), bytes);
    await writeFile(
      join(directory, "deno.sha256sum"),
      `Algorithm : SHA256\nHash : ${digest}\nPath : deno.exe\n`,
    );
    await expect(
      ownerAcquisitionTools(
        root,
        process.env.SystemRoot,
        new AbortController().signal,
      ),
    ).rejects.toThrow("acquisition_tools_unavailable");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
