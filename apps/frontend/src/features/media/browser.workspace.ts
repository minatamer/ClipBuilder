import {
  LOCAL_WORKSPACE_LIMITS,
  PUBLIC_LIMITS,
  type AnalysisBundleV1,
} from "@clipbuilder/contracts";
import { LocalMediaError } from "./media.errors";
import { BrowserSourceProcessor, type SourceProcessor } from "./source.client";
import {
  IndexedWorkspaceJournal,
  type WorkspaceJournal,
} from "./workspace.journal";
import {
  BrowserWorkspaceLock,
  type WorkspaceLease,
  type WorkspaceLock,
} from "./workspace.lock";
import { assertWorkspaceQuota } from "./workspace.quota";
import {
  cleanupRecord,
  parseWorkspaceRecord,
  type WorkspaceRecord,
} from "./workspace.schema";

export interface WorkspacePorts {
  journal: WorkspaceJournal;
  processor: SourceProcessor;
  lock: WorkspaceLock;
  estimate(): Promise<StorageEstimate>;
  now(): number;
  createUrl(file: Blob): string;
  revokeUrl(url: string): void;
  releaseConsumers(): void;
  cleanupRequired(): boolean;
  markCleanup(): void;
  finishCleanup(): void;
}

function opaque(prefix: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return `${prefix}_${btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "")}`;
}

export class BrowserWorkspace {
  private lease: WorkspaceLease | null = null;
  private lifetime = new AbortController();
  private generation = 0;
  private record: WorkspaceRecord | null = null;
  private work: Promise<WorkspaceRecord> | null = null;
  private task: AbortController | null = null;
  private clearing: Promise<void> | null = null;
  private writes: Promise<void> = Promise.resolve();
  private url: string | null = null;
  private file: Blob | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private expiry: (() => void) | null = null;
  private disposed = false;
  constructor(private readonly ports: WorkspacePorts) {}

  get sourceUrl(): string | null {
    return this.url;
  }
  get snapshot(): WorkspaceRecord | null {
    return this.record;
  }

  private check(generation: number): void {
    if (
      this.disposed ||
      this.lifetime.signal.aborted ||
      generation !== this.generation
    )
      throw new LocalMediaError("canceled");
    if (
      this.record &&
      (this.ports.now() < this.record.admittedAtMs ||
        this.ports.now() >= this.record.expiresAtMs)
    )
      throw new LocalMediaError("expired");
  }

  private write(record: WorkspaceRecord, generation: number): Promise<void> {
    const next = this.writes
      .catch(() => {})
      .then(async () => {
        this.check(generation);
        await this.ports.journal.write(record);
        this.check(generation);
      });
    this.writes = next;
    return next;
  }

  private releaseMedia(): void {
    this.ports.releaseConsumers();
    if (this.url) this.ports.revokeUrl(this.url);
    this.url = null;
    this.file = null;
  }

  onExpiry(callback: () => void): void {
    this.expiry = callback;
    this.armExpiry();
  }

  private armExpiry(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    if (!this.record || !this.expiry || this.disposed) return;
    this.timer = setTimeout(
      () => this.checkExpiry(),
      Math.max(0, this.record.expiresAtMs - this.ports.now()),
    );
  }

  checkExpiry(): void {
    if (
      this.record &&
      (this.ports.now() < this.record.admittedAtMs ||
        this.ports.now() >= this.record.expiresAtMs)
    )
      this.expiry?.();
  }

  async initialize(): Promise<WorkspaceRecord | null> {
    const generation = this.generation;
    const lease = await this.ports.lock.acquire(this.lifetime.signal);
    if (this.disposed || generation !== this.generation) {
      lease.release();
      throw new LocalMediaError("canceled");
    }
    this.lease = lease;
    this.check(generation);
    let record: WorkspaceRecord | null;
    try {
      record = await this.ports.journal.read();
    } catch (error) {
      if (!(error instanceof LocalMediaError) || error.code !== "corrupt")
        throw error;
      await this.clear();
      return null;
    }
    this.check(generation);
    this.record = record;
    if (
      this.ports.cleanupRequired() ||
      !record ||
      record.status !== "ready" ||
      !record.source ||
      this.ports.now() < record.admittedAtMs ||
      this.ports.now() >= record.expiresAtMs
    ) {
      await this.clear();
      return null;
    }
    try {
      await this.ports.processor.run({ action: "probe" }, this.lifetime.signal);
      this.check(generation);
      const reopened = await this.ports.processor.run(
        {
          action: "reopen",
          artifactId: record.source.artifact.artifactId,
          mediaId: record.source.media.mediaId,
          sourceRevision: record.source.media.sourceRevision,
        },
        this.lifetime.signal,
      );
      this.check(generation);
      if (
        !reopened.file ||
        reopened.fingerprint !== record.source.fingerprint ||
        JSON.stringify(reopened.media) !== JSON.stringify(record.source.media)
      )
        throw new LocalMediaError("missing");
      this.file = reopened.file;
      this.url = this.ports.createUrl(reopened.file);
      this.armExpiry();
      return record;
    } catch (error) {
      if (this.disposed || generation !== this.generation)
        throw new LocalMediaError("canceled");
      await this.clear();
      throw error instanceof LocalMediaError
        ? error
        : new LocalMediaError("missing");
    }
  }

  prepare(
    file: File,
    progress: (bytes: number) => void,
  ): { pending: WorkspaceRecord; completion: Promise<WorkspaceRecord> } {
    if (!this.lease || this.disposed) throw new LocalMediaError("unavailable");
    if (this.record || this.work || this.clearing)
      throw new LocalMediaError("busy");
    if (!file.size || file.size > PUBLIC_LIMITS.maxSourceBytes)
      throw new LocalMediaError("limits");
    const admittedAtMs = this.ports.now();
    const revision = opaque("rev");
    const pending = parseWorkspaceRecord({
      version: 1,
      sessionId: opaque("ses"),
      epoch: crypto.randomUUID(),
      admittedAtMs,
      expiresAtMs: admittedAtMs + LOCAL_WORKSPACE_LIMITS.ttlMs,
      status: "pending",
      artifacts: [
        {
          artifactId: opaque("loc"),
          sourceRevision: revision,
          bytes: file.size,
        },
      ],
      source: null,
      analysis: null,
      assembly: null,
      selectedId: null,
    });
    this.record = pending;
    this.file = file;
    this.url = this.ports.createUrl(file);
    this.task = new AbortController();
    const generation = this.generation;
    const signal = this.task.signal;
    const artifact = pending.artifacts[0]!;
    const mediaId = opaque("med");
    this.armExpiry();
    const completion = (async () => {
      await this.write(pending, generation);
      await this.ports.processor.run({ action: "probe" }, signal);
      this.check(generation);
      const inspected = await this.ports.processor.run(
        { action: "inspect", file, mediaId, sourceRevision: revision },
        signal,
      );
      this.check(generation);
      if (!inspected.media || !inspected.fingerprint)
        throw new LocalMediaError("unsupported");
      assertWorkspaceQuota(await this.ports.estimate(), file.size);
      this.check(generation);
      await this.ports.processor.run(
        { action: "copy", file, artifactId: artifact.artifactId },
        signal,
        (bytes) => {
          if (generation === this.generation && !signal.aborted)
            progress(bytes);
        },
      );
      this.check(generation);
      const ready = parseWorkspaceRecord({
        ...pending,
        status: "ready",
        source: {
          artifact,
          media: inspected.media,
          fingerprint: inspected.fingerprint,
        },
      });
      await this.write(ready, generation);
      this.check(generation);
      this.record = ready;
      return ready;
    })();
    this.work = completion;
    void completion.then(
      () => {
        if (generation === this.generation) this.work = null;
      },
      () => {
        if (generation === this.generation) this.work = null;
      },
    );
    return { pending, completion };
  }

  async cacheAnalysis(analysis: AnalysisBundleV1): Promise<WorkspaceRecord> {
    const generation = this.generation;
    this.check(generation);
    if (this.record?.status !== "ready") throw new LocalMediaError("missing");
    const record = parseWorkspaceRecord({
      ...this.record,
      analysis,
      selectedId: null,
      assembly: null,
    });
    await this.write(record, generation);
    this.record = record;
    return record;
  }

  async select(candidateId: string | null): Promise<void> {
    const generation = this.generation;
    this.check(generation);
    if (this.record?.status !== "ready") throw new LocalMediaError("missing");
    const record = parseWorkspaceRecord({
      ...this.record,
      selectedId: candidateId,
      assembly: null,
    });
    await this.write(record, generation);
    this.record = record;
  }

  clear(): Promise<void> {
    if (this.clearing) return this.clearing;
    if (!this.lease || this.disposed)
      return Promise.reject(new LocalMediaError("busy"));
    // Fence synchronously, before even the cleanup-journal transaction starts.
    this.generation++;
    this.task?.abort();
    try {
      this.ports.markCleanup();
    } catch {
      // IDB's clearing record remains the recovery fence if sessionStorage is denied.
    }
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.releaseMedia();
    const tombstone = this.record ? cleanupRecord(this.record) : null;
    this.record = tombstone;
    this.clearing = (async () => {
      await this.writes.catch(() => {});
      // The legacy content-free marker still fences recovery if IDB is denied.
      if (tombstone)
        try {
          await this.ports.journal.write(tombstone);
        } catch {
          /* The legacy marker remains until deletion commits. */
        }
      await this.ports.processor.stop();
      await this.work?.catch(() => {});
      await this.ports.processor.run(
        { action: "delete" },
        this.lifetime.signal,
      );
      await this.ports.journal.delete();
      this.record = null;
      this.work = null;
      this.ports.finishCleanup();
    })().finally(() => {
      this.clearing = null;
    });
    return this.clearing;
  }

  async dispose(): Promise<void> {
    this.disposed = true;
    this.generation++;
    this.lifetime.abort();
    this.task?.abort();
    if (this.timer) clearTimeout(this.timer);
    this.releaseMedia();
    await this.ports.processor.stop();
    await this.writes.catch(() => {});
    await this.clearing?.catch(() => {});
    this.ports.journal.close();
    this.lease?.release();
    this.lease = null;
  }
}

export function createBrowserWorkspace(
  bridge: Pick<
    WorkspacePorts,
    "cleanupRequired" | "markCleanup" | "finishCleanup" | "releaseConsumers"
  > & { onOtherRelease?: () => void },
): BrowserWorkspace {
  return new BrowserWorkspace({
    ...bridge,
    journal: new IndexedWorkspaceJournal(),
    processor: new BrowserSourceProcessor(),
    lock: new BrowserWorkspaceLock(
      () => navigator.locks,
      bridge.onOtherRelease,
    ),
    now: () => Date.now(),
    estimate: () => navigator.storage.estimate(),
    createUrl: (file) => URL.createObjectURL(file),
    revokeUrl: (url) => URL.revokeObjectURL(url),
  });
}
