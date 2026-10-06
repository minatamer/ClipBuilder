import { describe, expect, it, vi } from "vitest";
import { SAMPLE_ANALYSIS } from "../demo/sampleAnalysis.js";
import { loadConfig } from "../config/loadConfig.js";
import {
  LocalSampleReplay,
  LOCAL_SAMPLE_REPLAY_WORKSPACE,
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
  version: 2,
  workspace: LOCAL_SAMPLE_REPLAY_WORKSPACE,
  createdAtMs: 1000,
  retainedSampleIdentity: retainedSampleIdentity(sample),
  analysis: structuredClone(SAMPLE_ANALYSIS),
});

describe("private sample replay composition and owner cleanup", () => {
  it.each([
    "fake",
    "test",
    "preview",
    "production",
    "hosted",
    "paid-off",
    "assembly-off",
  ])("never reads saved content in %s composition", (mode) => {
    const config = {
      ...loadConfig({
        NODE_ENV: "test",
        FAKE_MODE: "true",
        PAID_DEMO_ENABLED: "false",
      }),
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
              : mode === "hosted"
                ? { ...config, appEnv: "production" as const }
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
  it("keeps independent saved choices available after six hours and thirty days", () => {
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
    for (const elapsed of [6 * 60 * 60 * 1000, 30 * 24 * 60 * 60 * 1000]) {
      now = 1000 + elapsed;
      expect(replay.available()).toBe(true);
      expect(replay.options().candidates).toHaveLength(3);
    }
  });
  it("rejects the superseded deadline-bearing cache format", () => {
    expect(
      () =>
        new LocalSampleReplay(
          { ...value(), version: 1, expiresAtMs: 1000 + 6 * 60 * 60 * 1000 },
          retainedSampleIdentity(sample),
          () => 1000,
        ),
    ).toThrow();
  });
  it.each(["source", "workspace", "count", "future"])(
    "rejects invalid %s cache metadata",
    (kind) => {
      const record = value();
      if (kind === "source") record.retainedSampleIdentity = "b".repeat(64);
      if (kind === "workspace") record.workspace += "-different";
      if (kind === "count") record.analysis.candidates.pop();
      if (kind === "future") record.createdAtMs++;
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
