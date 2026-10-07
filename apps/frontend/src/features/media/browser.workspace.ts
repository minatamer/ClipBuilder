import {
  LOCAL_WORKSPACE_LIMITS,
  PUBLIC_LIMITS,
  type AnalysisBundleV1,
  type GroundedAnalysisResult,
  type SelectedAssemblyResult,
  selectedAssemblyResultSchema,
  finalRenderResultSchema,
  type FinalRenderResult,
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
  type RemoteCleanupObligation,
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
  reportReleaseFailure?(resource: "consumers" | "object-url"): void;
  cleanupRequired(): boolean;
  markCleanup(): void;
  finishCleanup(): void;
}

let workspaceExit: Promise<void> = Promise.resolve();
export const waitForWorkspaceExit = () => workspaceExit;

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
  private remoteObligation: RemoteCleanupObligation | null = null;
  private work: Promise<WorkspaceRecord> | null = null;
  private task: AbortController | null = null;
  private clearing: Promise<void> | null = null;
  private exiting: Promise<void> | null = null;
  private writes: Promise<void> = Promise.resolve();
  private url: string | null = null;
  private file: Blob | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private expiry: (() => void) | null = null;
  private disposed = false;
  private assemblyReservation = false;
  private renderReservation = false;
  constructor(private readonly ports: WorkspacePorts) {}

  get sourceUrl(): string | null {
    return this.url;
  }
  get snapshot(): WorkspaceRecord | null {
    return this.record;
  }
  get sourceFile(): Blob | null {
    return this.file;
  }
  get remoteCleanup(): RemoteCleanupObligation | null {
    return this.remoteObligation ? { ...this.remoteObligation } : null;
  }
  async rememberRemoteCleanup(allowMissingSession = false): Promise<void> {
    if (!this.lease || this.disposed) throw new LocalMediaError("busy");
    this.remoteObligation = {
      version: 1,
      status: this.remoteObligation?.status ?? "pending",
      allowMissingSession:
        (this.remoteObligation?.allowMissingSession ?? true) &&
        allowMissingSession,
    };
    await this.writeRemoteCleanup(this.remoteObligation);
  }
  private writeRemoteCleanup(
    obligation: RemoteCleanupObligation,
  ): Promise<void> {
    const write = this.writes
      .catch(() => {})
      .then(() => this.ports.journal.writeRemoteCleanup(obligation));
    this.writes = write;
    return write;
  }
  async confirmRemoteCleanup(): Promise<void> {
    if (!this.lease || this.disposed) throw new LocalMediaError("busy");
    if (!this.remoteObligation) throw new LocalMediaError("missing");
    this.remoteObligation = { ...this.remoteObligation, status: "confirmed" };
    await this.writeRemoteCleanup(this.remoteObligation);
  }
  async completeRemoteCleanup(): Promise<void> {
    if (!this.lease || this.disposed) throw new LocalMediaError("busy");
    if (this.remoteObligation?.status !== "confirmed")
      throw new LocalMediaError("storage");
    const write = this.writes
      .catch(() => {})
      .then(() => this.ports.journal.deleteRemoteCleanup());
    this.writes = write;
    await write;
    this.remoteObligation = null;
  }
  async markCloudAnalysis(
    status: "pending" | "uncertain",
    cleanupRequired = true,
  ) {
    const generation = this.generation;
    this.check(generation);
    if (
      (!this.record?.source && !this.record?.retainedSample) ||
      this.record.analysis ||
      this.record.cloudAnalysis?.status === "complete"
    )
      throw new LocalMediaError("missing");
    const record = parseWorkspaceRecord({
      ...this.record,
      cloudAnalysis: { status, result: null, cleanupRequired },
    });
    await this.write(record, generation);
    this.record = record;
  }
  async storeGroundedAnalysis(result: GroundedAnalysisResult) {
    const generation = this.generation;
    this.check(generation);
    if (
      (!this.record?.source && !this.record?.retainedSample) ||
      this.record.cloudAnalysis?.status !== "pending"
    )
      throw new LocalMediaError("missing");
    const record = parseWorkspaceRecord({
      ...this.record,
      analysis: result.analysis,
      selectedId: null,
      assembly: null,
      cloudAnalysis: { status: "complete", result },
    });
    await this.write(record, generation);
    this.record = record;
  }

  async markCloudAssembly(
    status: "pending" | "uncertain",
    candidateId?: string,
    signal?: AbortSignal,
  ) {
    const generation = this.generation;
    this.check(generation);
    if (status === "pending") {
      // Selection is visible before its journal transaction commits. Drain all
      // queued selection writes before atomically checking and reserving it.
      let writes: Promise<void>;
      do {
        signal?.throwIfAborted();
        writes = this.writes;
        await writes;
        this.check(generation);
        signal?.throwIfAborted();
      } while (writes !== this.writes);
    }
    if (
      !this.record?.selectedId ||
      (candidateId !== undefined && this.record.selectedId !== candidateId) ||
      this.record.cloudAnalysis?.status !== "complete" ||
      (status === "pending" &&
        (this.assemblyReservation || this.record.cloudAssembly)) ||
      (status === "uncertain" &&
        this.record.cloudAssembly?.status !== "pending")
    )
      throw new LocalMediaError("missing");
    this.assemblyReservation = true;
    const record = parseWorkspaceRecord({
      ...this.record,
      cloudAssembly: {
        status,
        candidateId: this.record.selectedId,
        result: null,
      },
    });
    try {
      await this.write(record, generation);
      this.record = record;
    } catch (error) {
      if (status === "pending") this.assemblyReservation = false;
      throw error;
    }
  }

  private async assertAssemblyIntegrity(result: SelectedAssemblyResult) {
    const bytes = new TextEncoder().encode(JSON.stringify(result.manifest));
    const hash = Array.from(
      new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
    )
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    if (hash !== result.manifestHash) throw new LocalMediaError("missing");
  }
  async markCloudRender(status: "pending" | "uncertain") {
    const generation = this.generation;
    this.check(generation);
    if (
      !this.record?.cloudAssembly?.result ||
      (status === "pending" &&
        (this.renderReservation || this.record.cloudRender)) ||
      (status === "uncertain" && this.record.cloudRender?.status !== "pending")
    )
      throw new LocalMediaError("missing");
    this.renderReservation = true;
    const record = parseWorkspaceRecord({
      ...this.record,
      cloudRender: { status, result: null },
    });
    try {
      await this.write(record, generation);
      this.record = record;
    } catch (error) {
      if (status === "pending") this.renderReservation = false;
      throw error;
    }
  }
  async storeFinalRender(value: FinalRenderResult, signal: AbortSignal) {
    const generation = this.generation;
    this.check(generation);
    signal.throwIfAborted();
    if (
      !this.record?.cloudRender ||
      this.record.cloudRender.status === "complete"
    )
      throw new LocalMediaError("missing");
    const result = finalRenderResultSchema.parse(value);
    const record = parseWorkspaceRecord({
      ...this.record,
      cloudRender: { status: "complete", result },
    });
    await this.write(record, generation);
    signal.throwIfAborted();
    this.record = record;
  }
  async storeSelectedAssembly(
    value: SelectedAssemblyResult,
    signal?: AbortSignal,
  ) {
    const generation = this.generation;
    this.check(generation);
    signal?.throwIfAborted();
    const result = selectedAssemblyResultSchema.parse(value);
    await this.assertAssemblyIntegrity(result);
    this.check(generation);
    signal?.throwIfAborted();
    if (!this.record || this.record.cloudAssembly?.status !== "pending")
      throw new LocalMediaError("missing");
    const record = parseWorkspaceRecord({
      ...this.record,
      cloudAssembly: {
        status: "complete",
        candidateId: this.record.selectedId,
        result,
      },
    });
    await this.write(record, generation);
    signal?.throwIfAborted();
    this.record = record;
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
    const url = this.url;
    this.url = null;
    this.file = null;
    const release = (
      resource: "consumers" | "object-url",
      action: () => void,
    ) => {
      try {
        action();
      } catch {
        try {
          this.ports.reportReleaseFailure?.(resource);
        } catch {
          // A diagnostic sink cannot skip physical media deletion.
        }
      }
    };
    release("consumers", () => this.ports.releaseConsumers());
    if (url?.startsWith("blob:"))
      release("object-url", () => this.ports.revokeUrl(url));
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
    this.remoteObligation = await this.ports.journal.readRemoteCleanup();
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
      this.remoteObligation ||
      this.ports.cleanupRequired() ||
      !record ||
      record.status !== "ready" ||
      (!record.source && !record.retainedSample) ||
      this.ports.now() < record.admittedAtMs ||
      this.ports.now() >= record.expiresAtMs
    ) {
      // Recovery cleanup is application work. Its failure must not restore a
      // user-facing cleanup screen or the abandoned source.
      await this.clear().catch(() => undefined);
      this.record = null;
      this.work = null;
      return null;
    }
    try {
      if (record.cloudAssembly?.result) {
        await this.assertAssemblyIntegrity(record.cloudAssembly.result);
        this.check(generation);
      }
      if (record.retainedSample) {
        this.url = "/api/analysis/sample-source";
        this.armExpiry();
        return record;
      }
      if (!record.source) throw new LocalMediaError("missing");
      await this.ports.processor.run(
        { action: "clear-audio" },
        this.lifetime.signal,
      );
      this.check(generation);
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

  async prepareRetainedSample(signal?: AbortSignal): Promise<WorkspaceRecord> {
    if (!this.lease || this.disposed) throw new LocalMediaError("unavailable");
    if (this.record || this.work || this.clearing || this.remoteObligation)
      throw new LocalMediaError("busy");
    const generation = this.generation;
    signal?.throwIfAborted();
    const admittedAtMs = this.ports.now();
    const ready = parseWorkspaceRecord({
      version: 1,
      sessionId: opaque("ses"),
      epoch: crypto.randomUUID(),
      admittedAtMs,
      expiresAtMs: admittedAtMs + LOCAL_WORKSPACE_LIMITS.ttlMs,
      status: "ready",
      retainedSample: true,
      artifacts: [],
      source: null,
      analysis: null,
      assembly: null,
      selectedId: null,
    });
    this.record = ready;
    const work = this.write(ready, generation).then(() => {
      this.check(generation);
      signal?.throwIfAborted();
      this.url = "/api/analysis/sample-source";
      this.armExpiry();
      return ready;
    });
    this.work = work;
    try {
      return await work;
    } catch (error) {
      if (generation === this.generation && !this.disposed) await this.clear();
      throw error;
    } finally {
      if (generation === this.generation) this.work = null;
    }
  }

  prepare(
    file: File,
    progress: (bytes: number) => void,
  ): { pending: WorkspaceRecord; completion: Promise<WorkspaceRecord> } {
    if (!this.lease || this.disposed) throw new LocalMediaError("unavailable");
    if (this.remoteObligation) throw new LocalMediaError("storage");
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
    if (this.record.cloudAssembly || this.assemblyReservation) {
      if (this.record.selectedId === candidateId) return;
      throw new LocalMediaError("busy");
    }
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
    const cloudAnalysis = this.record?.cloudAnalysis;
    if (cloudAnalysis && this.remoteObligation?.status !== "confirmed")
      this.remoteObligation = {
        version: 1,
        status: "pending",
        allowMissingSession:
          (this.remoteObligation?.allowMissingSession ?? true) &&
          !cloudAnalysis.cleanupRequired,
      };
    const tombstone = this.record ? cleanupRecord(this.record) : null;
    const retainedSampleOnly = this.record?.retainedSample === true;
    this.record = tombstone;
    const cleanupController = new AbortController();
    const cleanupTimer = setTimeout(() => cleanupController.abort(), 5000);
    this.clearing = (async () => {
      await this.writes.catch(() => {});
      let remoteFenceFailed = false;
      if (this.remoteObligation) {
        try {
          await this.writeRemoteCleanup(this.remoteObligation);
        } catch {
          remoteFenceFailed = true;
        }
      }
      // The legacy content-free marker still fences recovery if IDB is denied.
      if (tombstone && !remoteFenceFailed)
        try {
          await this.ports.journal.write(tombstone);
        } catch {
          /* The legacy marker remains until deletion commits. */
        }
      await this.ports.processor.stop();
      await this.work?.catch(() => {});
      // Streaming the retained sample creates no local media files. Clear its
      // session journal without invoking the uploaded-file deletion worker.
      if (!retainedSampleOnly)
        await this.ports.processor.run(
          { action: "delete" },
          AbortSignal.any([this.lifetime.signal, cleanupController.signal]),
        );
      // Keep the existing cloud evidence and legacy fence if its independent
      // obligation could not commit. Physical media deletion is still attempted.
      if (remoteFenceFailed) throw new LocalMediaError("storage");
      await this.ports.journal.delete();
      this.record = null;
      this.assemblyReservation = false;
      this.renderReservation = false;
      this.work = null;
      this.ports.finishCleanup();
    })().finally(() => {
      clearTimeout(cleanupTimer);
      this.clearing = null;
    });
    return this.clearing;
  }

  exit(): Promise<void> {
    if (this.exiting) return this.exiting;
    this.exiting = (async () => {
      try {
        await this.clear().catch(() => undefined);
        await this.ports.journal.deleteRemoteCleanup().catch(() => undefined);
        this.remoteObligation = null;
      } finally {
        await this.disposeResources();
      }
    })();
    workspaceExit = this.exiting.catch(() => undefined);
    return this.exiting;
  }

  async dispose(): Promise<void> {
    // Unmount must not abort the deletion worker started by Exit. Keep the
    // exclusive lease until it drains, before any fresh workspace can open.
    if (this.exiting) return this.exiting;
    await this.disposeResources();
  }

  private async disposeResources(): Promise<void> {
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
  > &
    Pick<WorkspacePorts, "reportReleaseFailure"> & {
      onOtherRelease?: () => void;
    },
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
