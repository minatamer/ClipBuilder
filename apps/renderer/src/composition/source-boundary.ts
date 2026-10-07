import { basename, dirname, resolve } from "node:path";

/** Remotion may only decode the separately encoded, server-owned selected copy. */
export function assertSelectedSource(
  jobPath: string,
  source: string,
  output: string,
) {
  const directory = dirname(resolve(jobPath));
  if (
    basename(source) !== "selected.mp4" ||
    dirname(resolve(source)) !== directory ||
    dirname(resolve(output)) !== directory
  )
    throw new Error("invalid");
}
