import {
  operationStageOrdinal,
  operationStatusSchema,
} from "@clipbuilder/contracts";
import { describe, expect, it, vi } from "vitest";

import { FakeClock, SystemClock } from "./fakeClock.js";
import {
  FakeFixtureFailure,
  FakeFixtureProvider,
  FakeIdSource,
  FakeOperationStore,
} from "./fakeFixtures.js";
import { createSampleFakes } from "./sampleFakes.js";

const revision = `rev_${"r".repeat(22)}`;

describe("deterministic fake foundations", () => {
  it.each(["succeeded", "failed"] as const)(
    "keeps %s terminal evidence unchanged across overlapping advances",
    async (state) => {
      const clock = new FakeClock();
      const store = new FakeOperationStore(clock, {
        overlap: {
          kind: "analysis",
          stages: ["analysis.queued", "analysis.complete"],
          latencyMs: 100,
          terminal:
            state === "succeeded"
              ? { state, resultRevision: revision }
              : {
                  state,
                  code: "MODEL_OUTPUT_REJECTED",
                  ruleId: "fixture.rejected",
                },
        },
      });
      const operation = store.start("overlap");
      const first = store.advance(operation.operationId);
      clock.advanceBy(50);
      const second = store.advance(operation.operationId);
      clock.advanceBy(50);
      const terminal = await first;
      clock.advanceBy(50);
      expect(await second).toBe(terminal);
      expect(store.get(operation.operationId)).toBe(terminal);
      expect(store.callCount()).toBe(1);
      expect(clock.pendingWaitCount).toBe(0);
    },
  );

  it("removes successful system-clock abort listeners on a reused signal", async () => {
    const controller = new AbortController();
    const add = vi.spyOn(controller.signal, "addEventListener");
    const remove = vi.spyOn(controller.signal, "removeEventListener");
    const clock = new SystemClock();
    await clock.sleep(0, controller.signal);
    await clock.sleep(0, controller.signal);
    expect(remove).toHaveBeenCalledTimes(2);
    expect(remove.mock.calls[0]?.[1]).toBe(add.mock.calls[0]?.[1]);
    expect(remove.mock.calls[1]?.[1]).toBe(add.mock.calls[1]?.[1]);
    controller.abort();
  });

  it("does not write operation progress when abort wins before or after a wait resolves", async () => {
    for (const resolveFirst of [false, true]) {
      const clock = new FakeClock();
      const store = new FakeOperationStore(clock, {
        aborted: {
          kind: "analysis",
          stages: ["analysis.queued", "analysis.complete"],
          latencyMs: 100,
          terminal: { state: "succeeded", resultRevision: revision },
        },
      });
      const operation = store.start("aborted");
      const controller = new AbortController();
      const pending = store.advance(operation.operationId, controller.signal);
      if (resolveFirst) clock.advanceBy(100);
      controller.abort();
      await expect(pending).rejects.toMatchObject({ name: "AbortError" });
      expect(store.get(operation.operationId)).toBe(operation);
      expect(store.callCount()).toBe(1);
      expect(clock.pendingWaitCount).toBe(0);
    }
  });

  it("lets an overlapping advance finish after the other waiter aborts", async () => {
    const clock = new FakeClock();
    const store = new FakeOperationStore(clock, {
      overlap: {
        kind: "analysis",
        stages: ["analysis.queued", "analysis.complete"],
        latencyMs: 100,
        terminal: { state: "succeeded", resultRevision: revision },
      },
    });
    const operation = store.start("overlap");
    const controller = new AbortController();
    const aborted = store.advance(operation.operationId, controller.signal);
    const surviving = store.advance(operation.operationId);
    controller.abort();
    await expect(aborted).rejects.toMatchObject({ name: "AbortError" });
    clock.advanceBy(100);
    const completed = await surviving;
    expect(completed.state).toBe("succeeded");
    expect(await store.advance(operation.operationId)).toBe(completed);
    expect(clock.pendingWaitCount).toBe(0);
    expect(store.callCount()).toBe(1);
  });

  it.each(["string", "error", "object"])(
    "normalizes a custom %s abort reason before and after clock resolution",
    async (reasonKind) => {
      for (const resolveFirst of [false, true]) {
        const clock = new FakeClock();
        const store = new FakeOperationStore(clock, {
          aborted: {
            kind: "analysis",
            stages: ["analysis.queued", "analysis.complete"],
            latencyMs: 100,
            terminal: { state: "succeeded", resultRevision: revision },
          },
        });
        const operation = store.start("aborted");
        const controller = new AbortController();
        const add = vi.spyOn(controller.signal, "addEventListener");
        const remove = vi.spyOn(controller.signal, "removeEventListener");
        const reason =
          reasonKind === "string"
            ? "synthetic-abort-sentinel"
            : reasonKind === "error"
              ? new Error("synthetic-abort-sentinel")
              : { detail: "synthetic-abort-sentinel" };
        const pending = store.advance(operation.operationId, controller.signal);
        if (resolveFirst) clock.advanceBy(100);
        controller.abort(reason);
        await expect(pending).rejects.toBeInstanceOf(Error);
        await expect(pending).rejects.toMatchObject({
          name: "AbortError",
          message: "The deterministic operation was stopped.",
        });
        await expect(pending).rejects.not.toBe(reason);
        expect(store.get(operation.operationId)).toBe(operation);
        expect(store.callCount("aborted")).toBe(1);
        expect(store.callCount()).toBe(1);
        expect(clock.pendingWaitCount).toBe(0);
        expect(add).toHaveBeenCalledOnce();
        if (resolveFirst) {
          expect(remove).toHaveBeenCalledOnce();
          expect(remove.mock.calls[0]?.[1]).toBe(add.mock.calls[0]?.[1]);
        }
        clock.advanceBy(100);
        expect(store.get(operation.operationId)).toBe(operation);
        expect(clock.pendingWaitCount).toBe(0);
      }
    },
  );

  it("clears system-clock timers and listeners on abort and pre-abort", async () => {
    vi.useFakeTimers();
    try {
      const clock = new SystemClock();
      const controller = new AbortController();
      const remove = vi.spyOn(controller.signal, "removeEventListener");
      const pending = clock.sleep(1_000, controller.signal);
      controller.abort();
      await expect(pending).rejects.toMatchObject({ name: "AbortError" });
      expect(remove).toHaveBeenCalledOnce();
      expect(vi.getTimerCount()).toBe(0);
      await expect(clock.sleep(1_000, controller.signal)).rejects.toMatchObject(
        { name: "AbortError" },
      );
      expect(vi.getTimerCount()).toBe(0);
      const withoutSignal = clock.sleep(0);
      await vi.runAllTimersAsync();
      await withoutSignal;
    } finally {
      vi.useRealTimers();
    }
  });

  it.each([
    "analysis-success-v1",
    "assembly-success-v1",
    "analysis-rejected-v1",
  ])("uses canonical schema-valid monotonic progress in %s", async (key) => {
    const clock = new FakeClock();
    const fakes = createSampleFakes(clock);
    let current = fakes.operations.start(key);
    expect(current).toMatchObject({ state: "queued", startedAt: null });
    expect(
      operationStageOrdinal(current.kind, current.stageCode),
    ).toBeGreaterThanOrEqual(0);
    while (current.completedAt === null) {
      const pending = fakes.operations.advance(current.operationId);
      clock.advanceBy(50);
      const next = await pending;
      expect(operationStatusSchema.safeParse(next).success).toBe(true);
      expect(operationStageOrdinal(next.kind, next.stageCode)).toBeGreaterThan(
        operationStageOrdinal(current.kind, current.stageCode),
      );
      current = next;
    }
    expect(fakes.operations.callCount(key)).toBe(1);
    expect(fakes.analysis.callCount()).toBe(0);
    expect(fakes.assembly.callCount()).toBe(0);
    expect(fakes.storage.callCount()).toBe(0);
    expect(clock.pendingWaitCount).toBe(0);
  });

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
        stages: [
          "analysis.queued",
          "analysis.transcribing",
          "analysis.complete",
        ],
        latencyMs: 1_000,
        terminal: { state: "succeeded", resultRevision: revision },
      },
    });
    const started = operations.start("analysis");
    const firstAdvance = operations.advance(started.operationId);
    clock.advanceBy(1_000);
    const running = await firstAdvance;
    expect(running.stageCode).toBe("analysis.transcribing");
    expect(running.state).toBe("running");

    const secondAdvance = operations.advance(started.operationId);
    clock.advanceBy(1_000);
    const terminal = await secondAdvance;
    expect(terminal).toMatchObject({
      stageCode: "analysis.complete",
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
        stages: ["analysis.queued", "analysis.complete"],
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
