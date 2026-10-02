import { afterEach, describe, expect, it, vi } from "vitest";
import { LOCAL_WORKSPACE_LIMITS } from "@clipbuilder/contracts";
import { analysis, media } from "../session/session.test-fixtures";
import { BrowserWorkspace, type WorkspacePorts } from "./browser.workspace";
import { LocalMediaError } from "./media.errors";
import type { SourceCommand, SourceResult } from "./source.protocol";
import { parseWorkspaceRecord, type WorkspaceRecord } from "./workspace.schema";
import { requiredWorkspaceBytes } from "./workspace.quota";
import { restoreLocalWorkspace } from "./workspace.restore";
import { BrowserWorkspaceLock } from "./workspace.lock";

function drainGate() {
  let finish = () => {};
  const pending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  return { pending, finish };
}

function exclusiveLockFixture(order: string[]) {
  let held = false;
  const request = vi.fn(
    async (
      _name: string,
      _options: LockOptions,
      hold: (lock: Lock | null) => Promise<void>,
    ) => {
      if (held) return hold(null);
      held = true;
      try {
        await hold({ name: "clipbuilder.workspace.v1", mode: "exclusive" });
      } finally {
        held = false;
      }
    },
  );
  const channels: { postMessage: ReturnType<typeof vi.fn> }[] = [];
  const lock = new BrowserWorkspaceLock(
    () => ({ request }) as unknown as LockManager,
    () => {},
    () => {
      const channel = Object.assign(new EventTarget(), {
        postMessage: vi.fn(() => order.push("released")),
        close: vi.fn(),
      });
      channels.push(channel);
      return channel as unknown as BroadcastChannel;
    },
  );
  async function expectRefused() {
    // Let the lock callback settle before simulating another tab's next task.
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    const controller = new AbortController();
    try {
      await expect(
        lock.acquire(controller.signal).then((lease) => {
          lease.release();
          throw new Error("Acquired before the previous owner drained");
        }),
      ).rejects.toMatchObject({ code: "busy" });
    } finally {
      controller.abort();
    }
  }
  return { lock, channels, held: () => held, expectRefused };
}

function fixture() {
  let stored: WorkspaceRecord | null = null;
  let time = 1000;
  let marker = false;
  const file = new File([new Uint8Array(8192)], "synthetic-only.mp4", {
    type: "video/mp4",
  });
  const run = vi.fn(
    async (command: Omit<SourceCommand, "jobId">): Promise<SourceResult> => {
      if (command.action === "inspect")
        return {
          media: {
            ...media,
            mediaId: command.mediaId!,
            sourceRevision: command.sourceRevision!,
            bytes: file.size,
          },
          fingerprint: "a".repeat(64),
        };
      if (command.action === "reopen")
        return {
          media: stored!.source!.media,
          fingerprint: "a".repeat(64),
          file,
        };
      return {};
    },
  );
  const ports: WorkspacePorts = {
    journal: {
      read: vi.fn(async () => stored),
      write: vi.fn(async (record) => {
        stored = parseWorkspaceRecord(record);
      }),
      delete: vi.fn(async () => {
        stored = null;
      }),
      close: vi.fn(),
    },
    processor: { run, stop: vi.fn(async () => {}) },
    lock: { acquire: vi.fn(async () => ({ release: vi.fn() })) },
    estimate: vi.fn(async () => ({
      usage: 0,
      quota: requiredWorkspaceBytes(file.size),
    })),
    now: () => time,
    createUrl: vi.fn(() => "blob:local-synthetic"),
    revokeUrl: vi.fn(),
    releaseConsumers: vi.fn(),
    cleanupRequired: () => marker,
    markCleanup: () => {
      marker = true;
    },
    finishCleanup: () => {
      marker = false;
    },
  };
  const owner = new BrowserWorkspace(ports);
  return {
    owner,
    ports,
    file,
    run,
    stored: () => stored,
    marker: () => marker,
    setRecord: (record: WorkspaceRecord | null) => {
      stored = record;
    },
    setTime: (value: number) => {
      time = value;
    },
  };
}

describe("local audio workspace ownership", () => {
  it("extracts only from the admitted source and retains the source after scratch cleanup", async () => {
    const f = fixture();
    await f.owner.initialize();
    await f.owner.prepare(f.file, () => {}).completion;
    const snapshot = f.owner.snapshot;
    const audio = {
      profile: "opus-webm" as const,
      file: new Blob([new Uint8Array(4)], { type: "audio/webm" }),
      sourceDurationMs: snapshot!.source!.media.durationMs,
      sourceFirstSampleMs: 0,
      sourceLastSampleMs: snapshot!.source!.media.durationMs,
      presentationDurationMs: snapshot!.source!.media.durationMs,
      decodedFirstSampleMs: 0,
      decodedLastSampleMs: snapshot!.source!.media.durationMs,
      decodedSampleRate: 48_000,
      bytes: 4,
    };
    f.run.mockImplementation(async (command) =>
      command.action === "extract-audio" ? { audio } : {},
    );
    expect(
      await f.owner.extractAudio(new AbortController().signal, () => {}),
    ).toBe(audio);
    const command = f.run.mock.calls.find(
      (call) => call[0].action === "extract-audio",
    )![0];
    expect(command.file).toBe(f.file);
    expect(command.sourceDurationMs).toBe(snapshot!.source!.media.durationMs);
    expect(f.owner.snapshot).toBe(snapshot);
    expect(f.owner.sourceUrl).not.toBeNull();
    expect(f.run.mock.calls.at(-1)![0]).toEqual({ action: "clear-audio" });
    await f.owner.dispose();
  });
  it("fences a late extraction result and drains it before releasing the lease", async () => {
    const f = fixture();
    const release = vi.fn();
    f.ports.lock.acquire = vi.fn(async () => ({ release }));
    await f.owner.initialize();
    await f.owner.prepare(f.file, () => {}).completion;
    const gate = drainGate();
    const entered = drainGate();
    f.run.mockImplementation(async (command) => {
      if (command.action === "extract-audio") {
        entered.finish();
        await gate.pending;
        return {};
      }
      return {};
    });
    const work = f.owner.extractAudio(new AbortController().signal, () => {});
    const rejected = expect(work).rejects.toMatchObject({ code: "canceled" });
    await entered.pending;
    const disposal = f.owner.dispose();
    await Promise.resolve();
    expect(release).not.toHaveBeenCalled();
    gate.finish();
    await disposal;
    await rejected;
    expect(release).toHaveBeenCalledOnce();
    expect(f.owner.sourceUrl).toBeNull();
  });
});

afterEach(() => vi.useRealTimers());
describe("browser workspace publication and lifecycle", () => {
  it("publishes pending then ready, retains no filename, restores without any remote calls", async () => {
    const f = fixture();
    await f.owner.initialize();
    f.run.mockClear();
    const { pending, completion } = f.owner.prepare(f.file, () => {});
    expect(f.owner.sourceUrl).toBe("blob:local-synthetic");
    expect(pending.status).toBe("pending");
    const ready = await completion;
    expect(f.run.mock.calls.map(([command]) => command.action)).toEqual([
      "probe",
      "inspect",
      "copy",
    ]);
    expect(f.ports.journal.write).toHaveBeenCalledTimes(2);
    expect(JSON.stringify(ready)).not.toContain(f.file.name);
    await f.owner.dispose();
    const reopened = new BrowserWorkspace(f.ports);
    await reopened.initialize();
    expect(restoreLocalWorkspace(reopened.snapshot!).stage).toBe(
      "analysis-confirmation",
    );
    expect(reopened.snapshot?.expiresAtMs).toBe(pending.expiresAtMs);
    await reopened.dispose();
  });
  it("rejects quota before copy, preserving cleanup intent until deletion succeeds", async () => {
    const f = fixture();
    await f.owner.initialize();
    f.run.mockClear();
    f.ports.estimate = async () => ({ usage: 0, quota: 1 });
    await expect(
      f.owner.prepare(f.file, () => {}).completion,
    ).rejects.toMatchObject({ code: "storage" });
    expect(
      f.run.mock.calls.some(([command]) => command.action === "copy"),
    ).toBe(false);
    f.run.mockImplementationOnce(async () => {
      throw new LocalMediaError("storage");
    });
    await expect(f.owner.clear()).rejects.toThrow();
    expect(f.marker()).toBe(true);
    expect(f.stored()?.status).toBe("clearing");
    expect(f.stored()?.source).toBeNull();
    await f.owner.clear();
    expect(f.marker()).toBe(false);
    await f.owner.dispose();
  });
  it("fences a late inspection result during clear", async () => {
    const f = fixture();
    await f.owner.initialize();
    let resolve: (result: SourceResult) => void = () => {};
    f.run.mockImplementation(async (command) =>
      command.action === "inspect"
        ? new Promise((done) => {
            resolve = done;
          })
        : {},
    );
    const preparation = f.owner.prepare(f.file, () => {});
    const rejected = expect(preparation.completion).rejects.toMatchObject({
      code: "canceled",
    });
    await vi.waitFor(() =>
      expect(f.run).toHaveBeenCalledWith(
        expect.objectContaining({ action: "inspect" }),
        expect.anything(),
      ),
    );
    const clear = f.owner.clear();
    resolve({ media, fingerprint: "a".repeat(64) });
    await clear;
    await rejected;
    expect(f.stored()).toBeNull();
    expect(f.owner.sourceUrl).toBeNull();
    await f.owner.dispose();
  });
  it("sweeps expired/pending/legacy-marked workspaces on next open", async () => {
    for (const kind of ["expired", "pending", "legacy"] as const) {
      const f = fixture();
      await f.owner.initialize();
      const record = await f.owner.prepare(f.file, () => {}).completion;
      await f.owner.dispose();
      if (kind === "expired") f.setTime(record.expiresAtMs);
      if (kind === "pending")
        f.setRecord({ ...record, status: "pending", source: null });
      if (kind === "legacy") f.ports.markCleanup();
      const owner = new BrowserWorkspace(f.ports);
      expect(await owner.initialize()).toBeNull();
      expect(f.stored()).toBeNull();
      await owner.dispose();
    }
  });
  it("rejects missing or wrong source and cleans cached results", async () => {
    const f = fixture();
    await f.owner.initialize();
    const record = await f.owner.prepare(f.file, () => {}).completion;
    await f.owner.dispose();
    f.run.mockImplementation(async (command) =>
      command.action === "reopen"
        ? {
            media: record.source!.media,
            fingerprint: "b".repeat(64),
            file: f.file,
          }
        : {},
    );
    const owner = new BrowserWorkspace(f.ports);
    await expect(owner.initialize()).rejects.toMatchObject({ code: "missing" });
    expect(f.stored()).toBeNull();
    await owner.dispose();
  });
  it("rejects another-tab ownership without touching existing storage", async () => {
    const f = fixture();
    f.ports.lock.acquire = async () => {
      throw new LocalMediaError("busy");
    };
    await expect(f.owner.initialize()).rejects.toMatchObject({ code: "busy" });
    expect(f.run).not.toHaveBeenCalled();
    expect(f.ports.journal.delete).not.toHaveBeenCalled();
    await f.owner.dispose();
  });
  it("uses a fixed expiry callback and does not renew it on cached selection", async () => {
    vi.useFakeTimers();
    const f = fixture();
    await f.owner.initialize();
    const record = await f.owner.prepare(f.file, () => {}).completion;
    const expired = vi.fn();
    f.owner.onExpiry(expired);
    f.setTime(record.expiresAtMs);
    await vi.advanceTimersByTimeAsync(LOCAL_WORKSPACE_LIMITS.ttlMs);
    expect(expired).toHaveBeenCalledOnce();
    await expect(f.owner.select(null)).rejects.toMatchObject({
      code: "expired",
    });
    await f.owner.clear();
    await f.owner.dispose();
  });
  it("rejects cached results for another media revision", async () => {
    const f = fixture();
    await f.owner.initialize();
    await f.owner.prepare(f.file, () => {}).completion;
    await expect(f.owner.cacheAnalysis(analysis)).rejects.toThrow();
    await f.owner.clear();
    await f.owner.dispose();
  });
  it("still deletes media when the legacy marker write is denied, and never releases consumers after URL revocation", async () => {
    const f = fixture();
    await f.owner.initialize();
    await f.owner.prepare(f.file, () => {}).completion;
    f.ports.markCleanup = () => {
      throw new Error("denied");
    };
    const order: string[] = [];
    f.ports.releaseConsumers = () => {
      order.push("consumers");
    };
    f.ports.revokeUrl = () => {
      order.push("url");
    };
    await f.owner.clear();
    expect(order).toEqual(["consumers", "url"]);
    expect(f.stored()).toBeNull();
    await f.owner.dispose();
  });
  it("releases a lease that finishes acquiring after disposal", async () => {
    const f = fixture();
    const release = vi.fn();
    let finish: (lease: { release(): void }) => void = () => {};
    f.ports.lock.acquire = () =>
      new Promise((resolve) => {
        finish = resolve;
      });
    const opening = f.owner.initialize();
    const rejected = expect(opening).rejects.toMatchObject({
      code: "canceled",
    });
    await f.owner.dispose();
    finish({ release });
    await rejected;
    expect(release).toHaveBeenCalledOnce();
    expect(f.ports.journal.read).not.toHaveBeenCalled();
  });
  it("rejects a journal whose cached analysis alters the inspected source descriptor", async () => {
    const f = fixture();
    await f.owner.initialize();
    const record = await f.owner.prepare(f.file, () => {}).completion;
    const cached = {
      ...analysis,
      media: { ...record.source!.media, bytes: record.source!.media.bytes + 1 },
    };
    await expect(f.owner.cacheAnalysis(cached)).rejects.toThrow();
    expect(f.stored()?.analysis).toBeNull();
    await f.owner.clear();
    await f.owner.dispose();
  });
  it("holds the actual lock until worker stop and an in-flight journal write drain", async () => {
    const order: string[] = [];
    const locking = exclusiveLockFixture(order);
    const f = fixture();
    f.ports.lock = locking.lock;
    await f.owner.initialize();
    const worker = drainGate();
    const workerStopped = drainGate();
    const writing = drainGate();
    const writeStarted = drainGate();
    const write = f.ports.journal.write;
    f.ports.journal.write = vi.fn(async (record) => {
      writeStarted.finish();
      await writing.pending;
      await write(record);
      order.push("write-drained");
    });
    f.ports.processor.stop = vi.fn(async () => {
      await worker.pending;
      order.push("worker-stopped");
      workerStopped.finish();
    });
    f.ports.journal.close = vi.fn(() => order.push("journal-closed"));
    const preparation = f.owner.prepare(f.file, () => {});
    const canceled = expect(preparation.completion).rejects.toMatchObject({
      code: "canceled",
    });
    await writeStarted.pending;
    const disposing = f.owner.dispose();
    try {
      expect(locking.held()).toBe(true);
      await locking.expectRefused();
      expect(locking.channels[0]!.postMessage).not.toHaveBeenCalled();
      worker.finish();
      await workerStopped.pending;
      await locking.expectRefused();
      expect(f.ports.journal.close).not.toHaveBeenCalled();
      expect(locking.channels[0]!.postMessage).not.toHaveBeenCalled();
    } finally {
      worker.finish();
      writing.finish();
      await canceled;
      await disposing;
    }
    expect(order).toEqual([
      "worker-stopped",
      "write-drained",
      "journal-closed",
      "released",
    ]);
    expect(locking.channels[0]!.postMessage).toHaveBeenCalledOnce();
    await vi.waitFor(() => expect(locking.held()).toBe(false));
    const next = await locking.lock.acquire(new AbortController().signal);
    next.release();
    next.release();
    expect(locking.channels.at(-1)!.postMessage).toHaveBeenCalledOnce();
  });
  it("holds the actual lock through an already-started clear transaction and journal closure", async () => {
    const order: string[] = [];
    const locking = exclusiveLockFixture(order);
    const f = fixture();
    f.ports.lock = locking.lock;
    await f.owner.initialize();
    await f.owner.prepare(f.file, () => {}).completion;
    const deleting = drainGate();
    const deleteStarted = drainGate();
    const remove = f.ports.journal.delete;
    f.ports.journal.delete = vi.fn(async () => {
      deleteStarted.finish();
      await deleting.pending;
      await remove();
      order.push("clear-drained");
    });
    f.ports.journal.close = vi.fn(() => order.push("journal-closed"));
    const clearing = f.owner.clear();
    await deleteStarted.pending;
    const disposing = f.owner.dispose();
    try {
      expect(locking.held()).toBe(true);
      await locking.expectRefused();
      expect(f.ports.journal.close).not.toHaveBeenCalled();
      expect(locking.channels[0]!.postMessage).not.toHaveBeenCalled();
    } finally {
      deleting.finish();
      await clearing;
      await disposing;
    }
    expect(order).toEqual(["clear-drained", "journal-closed", "released"]);
    expect(f.stored()).toBeNull();
    await vi.waitFor(() => expect(locking.held()).toBe(false));
    const next = await locking.lock.acquire(new AbortController().signal);
    next.release();
    next.release();
    expect(locking.channels.at(-1)!.postMessage).toHaveBeenCalledOnce();
  });
});
