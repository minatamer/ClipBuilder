import { describe, expect, it, vi } from "vitest";
import { SAMPLE_ANALYSIS } from "../demo/sampleAnalysis.js";
import { loadConfig } from "../config/loadConfig.js";
import {
  LocalSampleReplay,
  LOCAL_SAMPLE_REPLAY_WORKSPACE,
  SAMPLE_REPLAY_WINDOW_MS,
  composeLocalSampleReplay,
  retainedSampleIdentity,
} from "./sample-replay.js";

const sample = {
  enabled: true,
  bucket: "synthetic-retained",
  object: "synthetic.mp4",
  generation: "1",
  bytes: SAMPLE_ANALYSIS.media.bytes,
};
const value = () => ({
  version: 1,
  workspace: LOCAL_SAMPLE_REPLAY_WORKSPACE,
  createdAtMs: 1000,
  expiresAtMs: 1000 + SAMPLE_REPLAY_WINDOW_MS,
  retainedSampleIdentity: retainedSampleIdentity(sample),
  analysis: structuredClone(SAMPLE_ANALYSIS),
});

describe("private sample replay composition and expiry", () => {
  it.each([
    "fake",
    "test",
    "preview",
    "production",
    "paid-off",
    "assembly-off",
  ])("never reads saved content in %s composition", (mode) => {
    const config = {
      ...loadConfig({ NODE_ENV: "test" }),
      nodeEnv: "development" as const,
      appEnv: "local" as const,
      providerMode: "live" as const,
      paidDemoEnabled: true,
      retainedSample: sample,
    };
    config.features = {
      ...config.features,
      liveAnalysis: true,
      liveAssembly: true,
    };
    const adjusted =
      mode === "fake"
        ? { ...config, providerMode: "fake" as const }
        : mode === "test"
          ? { ...config, nodeEnv: "test" as const }
          : mode === "preview"
            ? { ...config, appEnv: "preview" as const }
            : mode === "production"
              ? { ...config, nodeEnv: "production" as const }
              : mode === "paid-off"
                ? { ...config, paidDemoEnabled: false }
                : {
                    ...config,
                    features: { ...config.features, liveAssembly: false },
                  };
    const read = vi.fn(() => {
      throw new Error("private file should not be read");
    });
    expect(composeLocalSampleReplay(adjusted, read)).toBeNull();
    expect(read).not.toHaveBeenCalled();
  });
  it("returns independent copies and rejects expiry and changed revision", () => {
    let now = 1000;
    const replay = new LocalSampleReplay(
      value(),
      retainedSampleIdentity(sample),
      () => now,
    );
    const result = replay.options();
    result.candidates.length = 0;
    expect(replay.options().candidates).toHaveLength(3);
    expect(() => replay.options("rev_" + "x".repeat(22))).toThrow();
    now += SAMPLE_REPLAY_WINDOW_MS;
    expect(replay.available()).toBe(false);
    expect(() => replay.options()).toThrow();
  });
  it.each(["source", "workspace", "window", "count", "future"])(
    "rejects invalid %s cache metadata",
    (kind) => {
      const record = value();
      if (kind === "source") record.retainedSampleIdentity = "b".repeat(64);
      if (kind === "workspace") record.workspace += "-different";
      if (kind === "window") record.expiresAtMs++;
      if (kind === "count") record.analysis.candidates.pop();
      if (kind === "future") {
        record.createdAtMs++;
        record.expiresAtMs++;
      }
      expect(
        () =>
          new LocalSampleReplay(
            record,
            retainedSampleIdentity(sample),
            () => 1000,
          ),
      ).toThrow();
    },
  );
});
