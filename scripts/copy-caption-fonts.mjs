import {
  lstat,
  mkdir,
  readFile,
  writeFile,
  rename,
  rm,
} from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const source = fileURLToPath(
  new URL("../packages/composition/fonts/", import.meta.url),
);
/** Copy the single code-owned font/license into an owned public or raster bundle. */
export async function copyCaptionFonts(directory) {
  const destination = join(directory, "fonts");
  await mkdir(destination, { recursive: true });
  if ((await lstat(destination)).isSymbolicLink())
    throw Error("caption_font_path_invalid");
  for (const name of ["league-spartan.woff2", "League-Spartan-OFL.txt"]) {
    const file = join(source, name),
      info = await lstat(file);
    if (!info.isFile() || info.isSymbolicLink() || info.size > 256 * 1024)
      throw Error("caption_font_invalid");
    const bytes = await readFile(file);
    if (
      name.endsWith(".woff2") &&
      bytes.subarray(0, 4).toString("ascii") !== "wOF2"
    )
      throw Error("caption_font_invalid");
    const target = join(destination, name);
    const current = await lstat(target).catch((error) => {
      if (error.code !== "ENOENT") throw error;
      return null;
    });
    if (
      current &&
      (!current.isFile() || current.isSymbolicLink() || current.nlink !== 1)
    )
      throw Error("caption_font_path_invalid");
    if (
      current?.size === bytes.length &&
      (await readFile(target)).equals(bytes)
    )
      continue;
    const partial = join(destination, `.${name}.${randomUUID()}.partial`);
    try {
      await writeFile(partial, bytes, { flag: "wx", mode: 0o644 });
      await rename(partial, target);
    } finally {
      await rm(partial, { force: true });
    }
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await copyCaptionFonts(
    fileURLToPath(new URL("../apps/frontend/public/", import.meta.url)),
  );
