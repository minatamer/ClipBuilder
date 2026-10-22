import { createHash, randomUUID } from "node:crypto";
import { writeFile, rm } from "node:fs/promises";
import { z } from "zod";
import {
  OWNER_FPS,
  OWNER_LIMITS,
  type OwnerMediaJob,
  type OwnerMediaResult,
  type OwnerWorkspace,
  ownerWorkspaceSchema,
} from "../../../packages/contracts/owner/index.ts";
import {
  OWNER_BATCH_POLICY,
  ownerAssetSchema,
  ownerBatchRequestSchema,
  ownerClipBaseSchema,
  ownerClipListSchema,
  ownerClipRenderRequestSchema,
  type OwnerClip,
  type OwnerClipBase,
  type OwnerClipList,
} from "../../../packages/contracts/owner/clips.ts";
import {
  ownerAnalysisSchema,
  type OwnerAnalysis,
  type OwnerMoment,
} from "../../../packages/contracts/owner/selection.ts";
import { compileFixedCaptions } from "../src/assembly/fixed-captions.ts";
import { WorkspaceFiles, requireDisk } from "./workspace-files.ts";

export const ownerClipPlanSchema = z
  .array(
    z
      .object({
        startFrame: z.number().int().nonnegative(),
        endFrame: z.number().int().positive(),
      })
      .strict(),
  )
  .max(OWNER_BATCH_POLICY.imageAttemptsPerClip);
export type OwnerClipPorts = {
  plan(
    moment: OwnerMoment,
    signal: AbortSignal,
  ): Promise<z.infer<typeof ownerClipPlanSchema>>;
  image(
    signal: AbortSignal,
  ): Promise<{ bytes: Buffer; width: number; height: number }>;
  render(job: OwnerMediaJob, signal: AbortSignal): Promise<OwnerMediaResult>;
};
const digest = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
type Work = { clip: OwnerClip; moment?: OwnerMoment; renderRevision: number };
const working = (clip: OwnerClip) =>
  ["queued", "preparing", "rendering", "canceling"].includes(clip.state);

/** An ephemeral, workspace-owned ordered work list; one native/provider job globally. */
export class OwnerClipBatch {
  private readonly clips = new Map<string, OwnerClip>();
  private readonly receipts = new Map<string, string>();
  private queue: Work[] = [];
  private current: { clip: OwnerClip; controller: AbortController } | undefined;
  private pumping: Promise<void> | undefined;
  private closing = false;
  private admission = Promise.resolve();
  private cancelVersion = 0;
  constructor(
    private readonly workspace: OwnerWorkspace,
    private readonly files: WorkspaceFiles,
    private readonly ports: OwnerClipPorts,
  ) {
    this.workspace = ownerWorkspaceSchema.parse(workspace);
  }
  get active() {
    return this.queue.length > 0 || Boolean(this.current);
  }
  snapshot(): OwnerClipList {
    return ownerClipListSchema.parse({
      clips: [...this.clips.values()],
      active: this.active,
      workers: OWNER_BATCH_POLICY.workers,
    });
  }
  private receipt(key: string, value: unknown) {
    const hash = digest(value),
      prior = this.receipts.get(key);
    if (prior && prior !== hash) throw new Error("operation_conflict");
    if (prior) return true;
    if (this.receipts.size >= OWNER_BATCH_POLICY.operations)
      throw new Error("operation_limit");
    return false;
  }
  private serialize<T>(work: () => Promise<T>): Promise<T> {
    const next = this.admission.then(work);
    this.admission = next.then(
      () => undefined,
      () => undefined,
    );
    return next;
  }
  async submit(value: unknown, analysis: OwnerAnalysis) {
    const request = ownerBatchRequestSchema.parse(value),
      snapshot = ownerAnalysisSchema.parse(analysis);
    const cancelVersion = this.cancelVersion;
    return this.serialize(() =>
      this.submitOne(request, snapshot, cancelVersion),
    );
  }
  private async submitOne(
    value: unknown,
    analysis: OwnerAnalysis,
    cancelVersion: number,
  ) {
    if (this.closing) throw new Error("workspace_closed");
    const request = ownerBatchRequestSchema.parse(value),
      key = `batch:${request.operationId}`;
    if (this.receipt(key, request)) return this.snapshot();
    if (
      request.analysisId !== analysis.id ||
      request.sourceRevision !== this.workspace.revision ||
      analysis.inputs.sourceRevision !== this.workspace.revision ||
      request.policyRevision !== analysis.inputs.policyRevision
    )
      throw new Error("stale_analysis");
    const moments = request.momentIds.map((id) => {
      const moment = [...analysis.manual, ...analysis.suggestions].find(
        (item) => item.id === id,
      );
      if (!moment) throw new Error("moment_missing");
      return structuredClone(moment);
    });
    const existing = (moment: OwnerMoment) =>
      [...this.clips.values()].find(
        (clip) =>
          clip.analysisId === analysis.id && clip.momentId === moment.id,
      );
    const fresh = moments.filter((moment) => {
      const clip = existing(moment);
      return !clip || (clip.state === "canceled" && clip.fakeCalls.plan === 0);
    });
    const additions = fresh.filter((moment) => !existing(moment)).length;
    if (this.clips.size + additions > OWNER_LIMITS.clips)
      throw new Error("clip_limit");
    await this.reserve(additions);
    if (this.closing) throw new Error("workspace_closed");
    this.receipts.set(key, digest(request));
    for (const moment of fresh) {
      const clip: OwnerClip = existing(moment) ?? {
        id: randomUUID(),
        momentId: moment.id,
        analysisId: analysis.id,
        sourceRevision: this.workspace.revision,
        revision: 0,
        assemblyRevision: 0,
        baseHash: null,
        state: "queued",
        base: null,
        assets: [],
        outputs: [],
        fakeCalls: { plan: 0, image: 0, render: 0 },
        error: null,
      };
      clip.state = cancelVersion === this.cancelVersion ? "queued" : "canceled";
      clip.error = clip.state === "canceled" ? "canceled" : null;
      this.clips.set(clip.id, clip);
      if (clip.state === "queued")
        this.queue.push({ clip, moment, renderRevision: 0 });
    }
    this.start();
    return this.snapshot();
  }
  private async reserve(additional: number, outputs = 0) {
    const retained =
      this.clips.size +
      [...this.clips.values()].reduce(
        (sum, clip) => sum + Math.max(1, clip.outputs.length),
        0,
      );
    await requireDisk(
      this.files.root,
      this.workspace.source.bytes +
        (retained + additional * 2 + outputs) *
          OWNER_BATCH_POLICY.clipReservationBytes +
        OWNER_BATCH_POLICY.overlayBytes,
    );
  }
  async render(id: string, value: unknown) {
    const request = ownerClipRenderRequestSchema.parse(value),
      cancelVersion = this.cancelVersion;
    return this.serialize(() => this.renderOne(id, request, cancelVersion));
  }
  private async renderOne(id: string, value: unknown, cancelVersion: number) {
    const request = ownerClipRenderRequestSchema.parse(value),
      clip = this.clips.get(id),
      key = `render:${id}:${request.operationId}`;
    if (this.receipt(key, request)) return this.snapshot();
    if (
      this.closing ||
      !clip?.base ||
      clip.revision !== request.expectedRevision ||
      working(clip)
    )
      throw new Error("stale_or_busy_clip");
    await this.reserve(0, 1);
    if (this.receipt(key, request)) return this.snapshot();
    if (
      this.closing ||
      working(clip) ||
      clip.revision !== request.expectedRevision
    )
      throw new Error("stale_or_busy_clip");
    const renderRevision = clip.outputs.length
      ? Math.max(...clip.outputs.map((output) => output.revision)) + 1
      : 0;
    if (renderRevision >= OWNER_BATCH_POLICY.outputs)
      throw new Error("output_limit");
    this.receipts.set(key, digest(request));
    if (cancelVersion !== this.cancelVersion) return this.snapshot();
    clip.state = "queued";
    clip.error = null;
    this.queue.push({ clip, renderRevision });
    this.start();
    return this.snapshot();
  }
  cancel(id?: string) {
    if (!id) this.cancelVersion++;
    for (const clip of this.clips.values())
      if ((!id || clip.id === id) && working(clip)) {
        if (this.current?.clip.id === clip.id) {
          clip.state = "canceling";
          this.current.controller.abort();
        } else {
          clip.state = "canceled";
          clip.error = "canceled";
          this.queue = this.queue.filter((work) => work.clip.id !== clip.id);
        }
      }
    return this.snapshot();
  }
  async close() {
    this.closing = true;
    this.cancel();
    await this.admission;
    await this.pumping;
  }
  async drain() {
    while (this.pumping) await this.pumping;
  }
  private start() {
    if (this.pumping || this.closing || !this.queue.length) return;
    this.pumping = this.pump().finally(() => {
      this.pumping = undefined;
      this.start();
    });
  }
  private async prepare(
    clip: OwnerClip,
    moment: OwnerMoment,
    signal: AbortSignal,
  ): Promise<OwnerClipBase> {
    clip.state = "preparing";
    clip.fakeCalls.plan++;
    const frames = moment.cut.endFrame - moment.cut.startFrame;
    const plan = ownerClipPlanSchema.parse(
      await this.ports.plan(structuredClone(moment), signal),
    );
    if (
      plan.some(
        (cue) => cue.endFrame <= cue.startFrame || cue.endFrame > frames,
      )
    )
      throw new Error("invalid_plan_clock");
    signal.throwIfAborted();
    const visuals = [];
    for (const cue of plan) {
      clip.fakeCalls.image++;
      const picture = await this.ports.image(signal);
      signal.throwIfAborted();
      const asset = ownerAssetSchema.parse({
        id: randomUUID(),
        digest: createHash("sha256").update(picture.bytes).digest("hex"),
        width: picture.width,
        height: picture.height,
        bytes: picture.bytes.length,
        origin: "synthetic",
      });
      await writeFile(
        await this.files.asset(this.workspace.id, asset.id),
        picture.bytes,
        { flag: "wx", mode: 0o600 },
      );
      clip.assets.push(asset);
      visuals.push({
        id: randomUUID(),
        assetId: asset.id,
        digest: asset.digest,
        startFrame: cue.startFrame,
        endFrame: cue.endFrame,
        box: {
          x: 80 / 1080,
          y: 900 / 1920,
          width: 920 / 1080,
          height: 520 / 1920,
        },
        fit: "contain" as const,
        origin: "synthetic" as const,
      });
    }
    const captions = compileFixedCaptions({
      words: moment.cues,
      range: { startMs: 0, endMs: Math.round((frames * 1000) / OWNER_FPS) },
    });
    return ownerClipBaseSchema.parse({
      version: 1,
      analysisId: clip.analysisId,
      momentId: clip.momentId,
      sourceRevision: clip.sourceRevision,
      fingerprint: this.workspace.source.fingerprint,
      processingIdentity: moment.processingIdentity,
      cut: moment.cut,
      words: moment.cues,
      overlay: { version: 1, frames, captions, visuals },
    });
  }
  private async pump() {
    while (this.queue.length && !this.closing) {
      const work = this.queue.shift()!,
        { clip } = work;
      const controller = new AbortController();
      this.current = { clip, controller };
      try {
        if (work.moment) {
          clip.base = await this.prepare(clip, work.moment, controller.signal);
          clip.baseHash = digest(clip.base);
          clip.state = "review-ready";
        }
        controller.signal.throwIfAborted();
        if (!clip.base) throw new Error("bundle_missing");
        const snapshot = ownerClipBaseSchema.parse(clip.base),
          editRevision = clip.revision;
        clip.state = "rendering";
        clip.fakeCalls.render++;
        const result = await this.ports.render(
          {
            workspaceId: this.workspace.id,
            operation: "clip",
            jobId: randomUUID(),
            clipId: clip.id,
            renderRevision: work.renderRevision,
            cut: structuredClone(snapshot.cut),
            fingerprint: snapshot.fingerprint,
            overlay: structuredClone(snapshot.overlay),
          },
          controller.signal,
        );
        controller.signal.throwIfAborted();
        if (
          result.operation !== "clip" ||
          result.frames !== snapshot.overlay.frames ||
          result.bytes <= 0 ||
          result.bytes > OWNER_BATCH_POLICY.clipReservationBytes ||
          result.durationMs !==
            Math.round((snapshot.overlay.frames * 1000) / OWNER_FPS)
        )
          throw new Error("invalid_clip_output");
        clip.outputs.push({
          id: digest({
            baseHash: clip.baseHash,
            editRevision,
            renderRevision: work.renderRevision,
          }),
          revision: work.renderRevision,
          editRevision,
          frames: result.frames,
          bytes: result.bytes,
        });
        clip.state = "ready";
        clip.error = null;
      } catch {
        clip.state = controller.signal.aborted ? "canceled" : "failed";
        clip.error = controller.signal.aborted
          ? "canceled"
          : "local_clip_failed";
        // Failed output is derived scratch only. The admitted master and sibling
        // bundles/assets/outputs retain their independent workspace ownership.
        await rm(
          await this.files.output(
            this.workspace.id,
            clip.id,
            work.renderRevision,
          ),
          { force: true },
        ).catch(() => undefined);
      } finally {
        this.current = undefined;
      }
    }
  }
}
