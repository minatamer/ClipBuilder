import { readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  analysisBundleSchema,
  GROUNDED_ANALYSIS_LIMITS,
} from "@clipbuilder/contracts";
import type { BackendConfig } from "../config/env.schema.js";
import { ApplicationError } from "../http/errorMapper.js";

export const LOCAL_SAMPLE_REPLAY_WORKSPACE = fileURLToPath(
  new URL("../../../../", import.meta.url),
);
export const SAMPLE_REPLAY_PATH = join(
  tmpdir(),
  "clipbuilder-runtime",
  "private-sample-replay",
  "sample.json",
);
export const sampleReplayCacheSchema = z
  .object({
    version: z.literal(2),
    workspace: z.string(),
    createdAtMs: z.number().int().nonnegative(),
    retainedSampleIdentity: z.string().regex(/^[a-f0-9]{64}$/),
    analysis: analysisBundleSchema,
  })
  .strict();

export function retainedSampleIdentity(
  sample: BackendConfig["retainedSample"],
) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        bucket: sample.bucket,
        object: sample.object,
        generation: sample.generation,
        bytes: sample.bytes,
      }),
    )
    .digest("hex");
}

export class LocalSampleReplay {
  private readonly cache;
  constructor(
    value: unknown,
    identity: string,
    private readonly now = Date.now,
  ) {
    this.cache = sampleReplayCacheSchema.parse(value);
    if (
      resolve(this.cache.workspace) !==
        resolve(LOCAL_SAMPLE_REPLAY_WORKSPACE) ||
      this.cache.retainedSampleIdentity !== identity ||
      this.cache.analysis.candidates.length !== 3
    )
      throw new Error("invalid-local-sample-replay");
    this.options();
  }
  available() {
    return this.cache.createdAtMs <= this.now();
  }
  options(revision?: string) {
    if (!this.available())
      throw new ApplicationError({ code: "FEATURE_DISABLED" });
    if (revision !== undefined && revision !== this.cache.analysis.revision)
      throw new ApplicationError({ code: "INVALID_REQUEST" });
    return structuredClone(this.cache.analysis);
  }
}

export function composeLocalSampleReplay(
  config: BackendConfig,
  read = () => {
    if (
      statSync(SAMPLE_REPLAY_PATH).size > GROUNDED_ANALYSIS_LIMITS.responseBytes
    )
      throw new Error("local-sample-replay-too-large");
    return JSON.parse(readFileSync(SAMPLE_REPLAY_PATH, "utf8")) as unknown;
  },
) {
  if (
    config.nodeEnv !== "development" ||
    config.appEnv !== "local" ||
    config.providerMode !== "live" ||
    !config.paidDemoEnabled ||
    !config.retainedSample.enabled ||
    !config.features.liveAnalysis ||
    !config.features.liveAssembly
  )
    return null;
  try {
    const replay = new LocalSampleReplay(
      read(),
      retainedSampleIdentity(config.retainedSample),
    );
    if (replay.options().media.bytes !== config.retainedSample.bytes)
      return null;
    return replay;
  } catch {
    return null;
  }
}
