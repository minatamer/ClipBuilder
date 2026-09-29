import { describe, expect, it } from "vitest";

import { FakeClock } from "./fakeClock.js";
import {
  FakeFixtureFailure,
  FakeFixtureProvider,
  FakeIdSource,
  FakeOperationStore,
} from "./fakeFixtures.js";
import { createSampleFakes } from "./sampleFakes.js";

const revision = `rev_${"r".repeat(22)}`;

describe("deterministic fake foundations", () => {
  it("generates stable content-free opaque and request identifiers", () => {
    const first = new FakeIdSource();
    const second = new FakeIdSource();
    expect(first.next("ses")).toBe(second.next("ses"));
    expect(first.next("op")).toMatch(/^op_[a-z0-9_-]{22}$/u);
    expect(first.nextRequestId()).toMatch(/^req_[a-f0-9]{32}$/u);
  });

  it("composes sample provider, job, storage, and operation fakes at zero calls", async () => {
    const clock = new FakeClock();
    const fakes = createSampleFakes(clock);
    expect(fakes.analysis.callCount()).toBe(0);
    expect(fakes.assembly.callCount()).toBe(0);
    expect(fakes.storage.callCount()).toBe(0);
    expect(fakes.operations.callCount()).toBe(0);

    const pending = fakes.analysis.load("sample-analysis-v1");
    clock.advanceBy(25);
    await expect(pending).resolves.toMatchObject({ outcome: "candidates" });
    expect(fakes.analysis.callCount("sample-analysis-v1")).toBe(1);
  });

  it("uses injected time, deterministic latency, and per-key call counts", async () => {
    const clock = new FakeClock();
    const provider = new FakeFixtureProvider("provider", clock, {
      sample: { outcome: "success", value: { revision: 1 }, latencyMs: 250 },
      timeout: {
        outcome: "timeout",
        code: "REQUEST_TIMEOUT",
        ruleId: "fixture.timeout",
        latencyMs: 250,
      },
    });

    const pending = provider.load("sample");
    expect(provider.callCount("sample")).toBe(1);
    expect(clock.pendingWaitCount).toBe(1);
    clock.advanceBy(250);
    await expect(pending).resolves.toEqual({ revision: 1 });

    const timeout = provider.load("timeout");
    clock.advanceBy(250);
    await expect(timeout).rejects.toMatchObject({
      safeError: { code: "REQUEST_TIMEOUT", ruleId: "fixture.timeout" },
    });
    expect(provider.callCount()).toBe(2);
  });

  it("honors abort and rejects unknown fixture keys", async () => {
    const clock = new FakeClock();
    const provider = new FakeFixtureProvider("storage", clock, {
      sample: { outcome: "success", value: "ok", latencyMs: 100 },
    });
    const controller = new AbortController();
    const pending = provider.load("sample", controller.signal);
    controller.abort();

    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    await expect(provider.load("unknown")).rejects.toBeInstanceOf(
      FakeFixtureFailure,
    );
    expect(provider.callCount("unknown")).toBe(0);
  });

  it("advances operation stages monotonically and freezes terminal state", async () => {
    const clock = new FakeClock();
    const operations = new FakeOperationStore(clock, {
      analysis: {
        kind: "analysis",
        stages: ["queued", "transcribe", "complete"],
        latencyMs: 1_000,
        terminal: { state: "succeeded", resultRevision: revision },
      },
    });
    const started = operations.start("analysis");
    const firstAdvance = operations.advance(started.operationId);
    clock.advanceBy(1_000);
    const running = await firstAdvance;
    expect(running.stageCode).toBe("transcribe");
    expect(running.state).toBe("running");

    const secondAdvance = operations.advance(started.operationId);
    clock.advanceBy(1_000);
    const terminal = await secondAdvance;
    expect(terminal).toMatchObject({
      stageCode: "complete",
      state: "succeeded",
      resultRevision: revision,
    });
    expect(Object.isFrozen(terminal)).toBe(true);
    await expect(operations.advance(started.operationId)).resolves.toBe(
      terminal,
    );
    expect(operations.callCount("analysis")).toBe(1);
  });

  it("exposes explicit terminal failure fixtures", async () => {
    const clock = new FakeClock();
    const operations = new FakeOperationStore(clock, {
      rejected: {
        kind: "analysis",
        stages: ["queued", "complete"],
        latencyMs: 1,
        terminal: {
          state: "failed",
          code: "MODEL_OUTPUT_REJECTED",
          ruleId: "fixture.model-rejected",
        },
      },
    });
    const started = operations.start("rejected");
    const advance = operations.advance(started.operationId);
    clock.advanceBy(1);
    await expect(advance).resolves.toMatchObject({
      state: "failed",
      error: {
        code: "MODEL_OUTPUT_REJECTED",
        ruleId: "fixture.model-rejected",
      },
    });
  });
});
