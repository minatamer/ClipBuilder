import { createHash, randomUUID } from "node:crypto";
import { dirname, join } from "node:path";
import { lstat } from "node:fs/promises";
import {
  OWNER_ACQUISITION_LIMITS,
  ownerAcquisitionProgressSchema,
  ownerYoutubeOfferSchema,
  type OwnerAcquisitionProgress,
  type OwnerSavedSourceVariant,
  type OwnerYoutubeOffer,
} from "../../../packages/contracts/owner/acquisition.ts";
import {
  ownerSourceImportSchema,
  ownerSourceOpenSchema,
  type OwnerSavedSourceEntry,
  type OwnerSourceCatalog,
  type OwnerSourceDestination,
} from "../../../packages/contracts/owner/acquisition-flow.ts";
import {
  OWNER_LIMITS,
  type OwnerMediaJob,
  type OwnerMediaResult,
  type OwnerSource,
  type OwnerWorkspace,
} from "../../../packages/contracts/owner/index.ts";
import { OwnerSourceLibrary } from "./source-library.ts";
import { WorkspaceFiles, requireDisk } from "./workspace-files.ts";
import { canonicalOwnerYoutubeSource } from "./youtube-url.ts";
import {
  ownerYoutubeChoiceDescriptor,
  selectOwnerYoutubeFormat,
} from "./youtube-formats.ts";
import type {
  OwnerAcquisitionPort,
  OwnerLinkedIdentity,
} from "./acquisition-port.ts";
import type { OwnerAcquisitionNativeStage } from "../../../packages/contracts/owner/acquisition-profile.ts";

type SourceAcquisitionOptions = {
  files: WorkspaceFiles;
  roots: Partial<Record<OwnerSourceDestination, string>>;
  port?: OwnerAcquisitionPort;
  media: (
    job: OwnerMediaJob,
    signal: AbortSignal,
    stage?: (value: OwnerAcquisitionNativeStage) => void,
  ) => Promise<OwnerMediaResult>;
  available: () => boolean;
  opened: (id: string, source: OwnerSource) => OwnerWorkspace;
  capacity?: typeof requireDisk;
};
const overhead = 32 * 1024 ** 2;
const maximumMaster = Math.floor((OWNER_LIMITS.scratchBytes - overhead) / 2);
const stableFormat = (
  value:
    | OwnerSavedSourceVariant
    | {
        video: OwnerSavedSourceVariant["video"];
        audio: OwnerSavedSourceVariant["audio"] | null;
      },
) =>
  JSON.stringify([
    value.video.formatId,
    value.video.width,
    value.video.height,
    value.video.fps,
    value.video.codec,
    value.video.dynamicRange,
    value.audio?.formatId,
    value.audio?.codec,
    value.audio?.trackId,
    value.audio?.language,
    value.audio?.role,
    value.audio?.channels,
    value.audio?.sampleRate,
  ]);

/** One bounded action, with completed immutable source retention independent of processing. */
export class OwnerSourceAcquisition {
  private readonly libraries = new Map<
    OwnerSourceDestination,
    OwnerSourceLibrary
  >();
  private readonly offers = new Map<
    string,
    { identity: OwnerLinkedIdentity; offer: OwnerYoutubeOffer }
  >();
  private readonly receipts = new Map<string, OwnerAcquisitionProgress>();
  private readonly scopes = new Set<AbortController>();
  private running: Promise<void> | undefined;
  private controller: AbortController | undefined;
  private metadataActive = false;
  private metadataDrain: Promise<void> = Promise.resolve();
  private closed = false;
  private current: OwnerAcquisitionProgress | null = null;
  constructor(private readonly options: SourceAcquisitionOptions) {
    for (const destination of ["downloads", "desktop"] as const) {
      const root = options.roots[destination];
      if (root) this.libraries.set(destination, new OwnerSourceLibrary(root));
    }
  }
  get active() {
    return Boolean(this.running || this.metadataActive);
  }
  snapshot() {
    return this.current
      ? ownerAcquisitionProgressSchema.parse(this.current)
      : null;
  }
  private library(destination: OwnerSourceDestination) {
    const library = this.libraries.get(destination);
    if (!library || this.closed) throw new Error("source_storage_unavailable");
    return library;
  }
  private admit() {
    if (this.closed || this.active || !this.options.available())
      throw new Error("source_operation_busy");
  }
  async catalog(signal: AbortSignal): Promise<OwnerSourceCatalog> {
    signal.throwIfAborted();
    const entries: OwnerSavedSourceEntry[] = [];
    let bytes = 0;
    for (const [destination, library] of this.libraries) {
      const variants = await library.list(undefined, signal);
      entries.push(...variants.map((variant) => ({ destination, variant })));
      bytes += (await library.usage()).bytes;
    }
    return {
      entries,
      bytes,
      warning: bytes >= OWNER_LIMITS.libraryWarningBytes,
      destinations: [...this.libraries.keys()],
    };
  }
  async lookup(url: string, signal: AbortSignal) {
    const identity = canonicalOwnerYoutubeSource(url);
    const saved: OwnerSavedSourceEntry[] = [];
    for (const [destination, library] of this.libraries) {
      const variants = await library.list(identity.videoId, signal);
      saved.push(
        ...variants
          .filter(
            (variant) =>
              !this.options.port || variant.mode === this.options.port.mode,
          )
          .map((variant) => ({ destination, variant })),
      );
    }
    return {
      sourceId: identity.sourceId,
      mode: this.options.port?.mode ?? null,
      metadataAvailable: Boolean(this.options.port && this.libraries.size),
      saved,
    };
  }
  async metadata(url: string, signal: AbortSignal) {
    this.admit();
    const port = this.options.port;
    if (!port || !this.libraries.size)
      throw new Error("source_metadata_unavailable");
    const identity = canonicalOwnerYoutubeSource(url);
    this.metadataActive = true;
    const controller = new AbortController();
    this.scopes.add(controller);
    const abort = () => controller.abort();
    signal.addEventListener("abort", abort, { once: true });
    const timer = setTimeout(abort, OWNER_ACQUISITION_LIMITS.metadataMs);
    const task = (async () => {
      // Metadata is an explicit availability refresh, admitted after local lookup.
      signal.throwIfAborted();
      await this.lookup(url, controller.signal);
      const offer = ownerYoutubeOfferSchema.parse(
        await port.metadata(identity, controller.signal),
      );
      if (offer.mode !== port.mode || offer.sourceId !== identity.sourceId)
        throw new Error("source_metadata_invalid");
      controller.signal.throwIfAborted();
      while (this.offers.size >= 8)
        this.offers.delete(this.offers.keys().next().value!);
      this.offers.set(offer.revision, { identity, offer });
      return offer;
    })().finally(() => {
      clearTimeout(timer);
      this.metadataActive = false;
      signal.removeEventListener("abort", abort);
      this.scopes.delete(controller);
    });
    this.metadataDrain = task.then(
      () => undefined,
      () => undefined,
    );
    return task;
  }
  start(value: unknown) {
    const input = ownerSourceImportSchema.parse(value);
    const key = createHash("sha256")
      .update(JSON.stringify(input))
      .digest("hex");
    const receipt = this.receipts.get(key);
    if (receipt && (this.active || !this.options.available()))
      return ownerAcquisitionProgressSchema.parse(receipt);
    this.admit();
    const prepared = this.offers.get(input.request.revision);
    const port = this.options.port;
    if (!prepared || !port || prepared.offer.mode !== port.mode)
      throw new Error("source_selection_stale");
    const { choice, expected } = selectOwnerYoutubeFormat(
      prepared.offer,
      input.request,
    );
    const library = this.library(input.destination);
    const controller = new AbortController();
    this.controller = controller;
    this.current = {
      id: randomUUID(),
      mode: port.mode,
      stage: "queued",
      downloadedBytes: 0,
      totalBytes: null,
      variantId: null,
      error: null,
    };
    const update = (patch: Partial<OwnerAcquisitionProgress>) => {
      this.current = ownerAcquisitionProgressSchema.parse({
        ...this.current,
        ...patch,
      });
      this.receipts.set(key, this.current);
    };
    update({});
    while (this.receipts.size > 8)
      this.receipts.delete(this.receipts.keys().next().value!);
    this.running = (async () => {
      let workspaceId: string | undefined;
      let terminal: Partial<OwnerAcquisitionProgress> | undefined;
      try {
        // Reuse precedes port/tool/network readiness, even after explicit metadata refresh.
        for (const [, candidate] of this.libraries) {
          const variants = await candidate.list(
            prepared.identity.videoId,
            controller.signal,
          );
          const saved = variants.find(
            (variant) =>
              variant.mode === port.mode &&
              variant.state === "ready" &&
              stableFormat(variant) === stableFormat(choice),
          );
          if (!saved) continue;
          update({ stage: "inspecting" });
          const opened = await this.openFrom(
            candidate,
            saved,
            controller.signal,
          );
          try {
            controller.signal.throwIfAborted();
            this.options.opened(opened.workspaceId, opened.source);
          } catch (error) {
            await this.options.files.remove(opened.workspaceId);
            throw error;
          }
          update({ stage: "ready", variantId: saved.id });
          return;
        }
        const known =
          choice.bytes !== null && !choice.bytesEstimated ? choice.bytes : null;
        const reservation =
          known === null
            ? OWNER_LIMITS.scratchBytes
            : Math.max(known * 2 + overhead * 2, overhead * 2);
        await (this.options.capacity ?? requireDisk)(
          this.options.files.root,
          reservation,
        );
        controller.signal.throwIfAborted();
        workspaceId = await this.options.files.create();
        const directory = dirname(
          await this.options.files.file(workspaceId, "source.mp4"),
        );
        await port.download(
          {
            ...prepared,
            choice,
            selection: input.request.selection,
            directory,
          },
          (progress) => {
            if (progress.downloadedBytes > maximumMaster - overhead) {
              controller.abort(new Error("source_capacity"));
              throw new Error("source_capacity");
            }
            update({
              stage: progress.stage,
              downloadedBytes: progress.downloadedBytes,
              totalBytes: progress.totalBytes,
            });
          },
          controller.signal,
        );
        if (port.mode === "provider-source") {
          let components = 0;
          for (const part of choice.video.formatId === choice.audio?.formatId
            ? ["video"]
            : ["video", "audio"]) {
            const info = await lstat(join(directory, `acquisition.${part}`));
            if (!info.isFile() || info.isSymbolicLink() || info.nlink !== 1)
              throw new Error("source_invalid");
            components += info.size;
          }
          if (components > maximumMaster - overhead)
            throw new Error("source_capacity");
          await (this.options.capacity ?? requireDisk)(
            this.options.files.root,
            components + overhead * 2,
          );
        }
        update({ stage: "merging" });
        const result = await this.options.media(
          {
            operation:
              port.mode === "synthetic-source"
                ? "synthesize-acquisition"
                : "prepare-acquisition",
            workspaceId,
            expected,
            ...(port.mode === "provider-source"
              ? { combined: choice.video.formatId === choice.audio?.formatId }
              : {}),
          },
          controller.signal,
          (stage) => {
            if (!controller.signal.aborted) update({ stage });
          },
        );
        controller.signal.throwIfAborted();
        if (
          (result.operation !== "synthesize-acquisition" &&
            result.operation !== "prepare-acquisition") ||
          result.source.bytes > maximumMaster
        )
          throw new Error("source_capacity");
        update({ stage: "inspecting" });
        update({ stage: "publishing" });
        const variant = await library.publish(
          {
            videoId: prepared.identity.videoId,
            mode: port.mode,
            selection: input.request.selection,
            video: choice.video,
            audio: choice.audio!,
            ...(port.mode === "provider-source"
              ? {
                  tools: {
                    downloader: "2026.10.21",
                    challenge: "2.9.8",
                    ffmpeg: "9.0.2",
                  },
                }
              : {}),
          },
          { id: workspaceId, source: result.source },
          this.options.files,
          controller.signal,
        );
        controller.signal.throwIfAborted();
        this.options.opened(workspaceId, result.source);
        workspaceId = undefined;
        update({ stage: "ready", variantId: variant.id });
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        const capacity =
          message.includes("capacity") ||
          message.includes("disk") ||
          (controller.signal.reason instanceof Error &&
            controller.signal.reason.message === "source_capacity");
        terminal = {
          stage: controller.signal.aborted && !capacity ? "canceled" : "failed",
          error: capacity
            ? "capacity"
            : controller.signal.aborted
              ? "canceled"
              : message.includes("stale")
                ? "stale"
                : "failed",
        };
      } finally {
        if (workspaceId) await this.options.files.remove(workspaceId);
        if (terminal) update(terminal);
      }
    })()
      .finally(() => {
        this.running = undefined;
        this.controller = undefined;
      })
      .catch(() => {
        this.closed = true;
        update({ stage: "failed", error: "failed" });
      });
    return this.snapshot()!;
  }
  private async openFrom(
    library: OwnerSourceLibrary,
    variant: OwnerSavedSourceVariant,
    signal: AbortSignal,
  ) {
    const expected = ownerYoutubeChoiceDescriptor(
      { durationMs: variant.actual.durationMs },
      variant,
    );
    return library.open(
      variant.id,
      this.options.files,
      async (workspaceId, operationSignal) => {
        const result = await this.options.media(
          { operation: "inspect-acquisition", workspaceId, expected },
          operationSignal,
        );
        if (result.operation !== "inspect-acquisition")
          throw new Error("source_inspection_invalid");
        return result.source;
      },
      signal,
    );
  }
  async open(value: unknown, signal: AbortSignal) {
    this.admit();
    const input = ownerSourceOpenSchema.parse(value);
    const library = this.library(input.destination);
    this.metadataActive = true;
    try {
      const variant = (await library.list(undefined, signal)).find(
        (item) => item.id === input.variantId,
      );
      if (!variant || variant.state !== "ready")
        throw new Error("source_saved_unavailable");
      const opened = await this.openFrom(library, variant, signal);
      try {
        signal.throwIfAborted();
        return this.options.opened(opened.workspaceId, opened.source);
      } catch (error) {
        await this.options.files.remove(opened.workspaceId);
        throw error;
      }
    } finally {
      this.metadataActive = false;
    }
  }
  async locate(
    value: unknown,
    receive: (workspaceId: string, signal: AbortSignal) => Promise<void>,
    signal: AbortSignal,
  ) {
    this.admit();
    const input = ownerSourceOpenSchema.parse(value);
    const library = this.library(input.destination);
    this.metadataActive = true;
    let workspaceId: string | undefined;
    try {
      const variant = (await library.list(undefined, signal)).find(
        (item) => item.id === input.variantId,
      );
      if (!variant || variant.state === "ready")
        throw new Error("source_locate_unavailable");
      workspaceId = await this.options.files.create();
      await receive(workspaceId, signal);
      const expected = ownerYoutubeChoiceDescriptor(
        { durationMs: variant.actual.durationMs },
        variant,
      );
      const located = await library.locate(
        variant.id,
        workspaceId,
        this.options.files,
        async (id, operationSignal) => {
          const result = await this.options.media(
            { operation: "inspect-acquisition", workspaceId: id, expected },
            operationSignal,
          );
          if (result.operation !== "inspect-acquisition")
            throw new Error("source_inspection_invalid");
          return result.source;
        },
        signal,
      );
      const workspace = this.options.opened(workspaceId, located.actual);
      workspaceId = undefined;
      return workspace;
    } finally {
      this.metadataActive = false;
      if (workspaceId) await this.options.files.remove(workspaceId);
    }
  }
  async delete(value: unknown, signal: AbortSignal) {
    this.admit();
    const input = ownerSourceOpenSchema.parse(value);
    await this.library(input.destination).delete(input.variantId, signal);
  }
  cancel() {
    if (this.controller && this.current) {
      this.current = { ...this.current, stage: "canceling" };
      this.controller.abort();
    }
    for (const scope of this.scopes) scope.abort();
    return this.snapshot();
  }
  async close() {
    this.closed = true;
    this.cancel();
    await this.metadataDrain;
    await this.running;
    await Promise.all(
      [...this.libraries.values()].map((library) => library.cancelPending()),
    );
    this.offers.clear();
    this.receipts.clear();
  }
}
