import type {
  AnalysisBundleV1,
  AssemblyBundleV1,
} from "@clipbuilder/contracts";

import type { Clock } from "./fakeClock.js";
import { FakeFixtureProvider, FakeOperationStore } from "./fakeFixtures.js";
import {
  SAMPLE_ANALYSIS,
  SAMPLE_ASSEMBLY,
  SAMPLE_NO_CANDIDATES,
} from "./sampleAnalysis.js";
import { SAMPLE_MANIFEST } from "./sampleManifest.js";

export function createSampleFakes(clock: Clock) {
  const analysis = new FakeFixtureProvider<AnalysisBundleV1>(
    "provider",
    clock,
    {
      "sample-analysis-v1": {
        outcome: "success",
        value: SAMPLE_ANALYSIS,
        latencyMs: 25,
      },
      "no-candidates-v1": {
        outcome: "success",
        value: SAMPLE_NO_CANDIDATES,
        latencyMs: 25,
      },
      "analysis-timeout-v1": {
        outcome: "timeout",
        code: "REQUEST_TIMEOUT",
        ruleId: "fixture.timeout",
        latencyMs: 100,
      },
      "analysis-provider-error-v1": {
        outcome: "error",
        code: "TRANSCRIPTION_FAILED",
        ruleId: "fixture.provider-rejected",
        latencyMs: 25,
      },
    },
  );
  const assembly = new FakeFixtureProvider<AssemblyBundleV1>("job", clock, {
    "sample-assembly-v1": {
      outcome: "success",
      value: SAMPLE_ASSEMBLY,
      latencyMs: 25,
    },
    "assembly-rejected-v1": {
      outcome: "error",
      code: "ASSEMBLY_OUTPUT_REJECTED",
      ruleId: "fixture.assembly-rejected",
      latencyMs: 25,
    },
  });
  const storage = new FakeFixtureProvider("storage", clock, {
    "sample-manifest-v1": {
      outcome: "success",
      value: SAMPLE_MANIFEST,
      latencyMs: 10,
    },
  });
  const operations = new FakeOperationStore(clock, {
    "analysis-success-v1": {
      kind: "analysis",
      stages: [
        "analysis.queued",
        "analysis.transcribing",
        "analysis.normalizing-transcript",
        "analysis.selecting-candidates",
        "analysis.complete",
      ],
      latencyMs: 50,
      terminal: {
        state: "succeeded",
        resultRevision: SAMPLE_ANALYSIS.revision,
      },
    },
    "assembly-success-v1": {
      kind: "assembly",
      stages: [
        "assembly.queued",
        "assembly.detecting-shots",
        "assembly.detecting-active-speaker",
        "assembly.planning-visuals",
        "assembly.complete",
      ],
      latencyMs: 50,
      terminal: {
        state: "succeeded",
        resultRevision: SAMPLE_ASSEMBLY.revision,
      },
    },
    "analysis-rejected-v1": {
      kind: "analysis",
      stages: ["analysis.queued", "analysis.complete"],
      latencyMs: 50,
      terminal: {
        state: "failed",
        code: "MODEL_OUTPUT_REJECTED",
        ruleId: "fixture.model-rejected",
      },
    },
  });

  return Object.freeze({ analysis, assembly, storage, operations });
}
