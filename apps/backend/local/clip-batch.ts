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
} from "../../../packages/contracts/local/index.ts";
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
  type OwnerOverlay,
} from "../../../packages/contracts/local/clips.ts";
import { ownerEditRequestSchema } from "../../../packages/contracts/local/editor.ts";
import {
  automaticOwnerEdit,
  compileOwnerOverlay,
} from "../../../packages/contracts/local/edit-overlay.ts";
import { OWNER_PICTURE_LIMITS } from "../../../packages/contracts/local/assets.ts";
import { applyOwnerEdit } from "./edit-clip.ts";
import { ownerAgentValidation } from "./agent-view.ts";
import { normalizeOwnerPicture } from "./personal-picture.ts";
import {
  ownerAnalysisSchema,
  ownerWordsSchema,
  type OwnerAnalysis,
  type OwnerMoment,
  type OwnerWord,
} from "../../../packages/contracts/local/selection.ts";
import { compileFixedCaptions } from "../src/assembly/fixed-captions.ts";
import { WorkspaceFiles, requireDisk } from "./workspace-files.ts";
import {
  contextualPictureBriefSchema,
  CONTEXTUAL_PICTURE_POLICY,
} from "../../../packages/contracts/src/contextual-picture.schema.ts";
import { normalizePicture } from "../src/assembly/picture-raster.ts";
import type { OwnerAiMode } from "../../../packages/contracts/local/policy.ts";

export const ownerClipPlanSchema = z
  .array(
    z
      .object({
        startFrame: z.number().int().nonnegative(),
        endFrame: z.number().int().positive(),
        brief: contextualPictureBriefSchema,
        evidenceWordIds: z
          .array(ownerWordsSchema.element.shape.id)
          .min(1)
          .max(CONTEXTUAL_PICTURE_POLICY.maxSupportingPhraseWords),
      })
      .strict(),
  )
  .max(OWNER_BATCH_POLICY.imageAttemptsPerClip);
export type OwnerClipPorts = {
  readonly mode: OwnerAiMode;
  plan(
    request: { workspace: OwnerWorkspace; clipId: string; moment: OwnerMoment },
    signal: AbortSignal,
  ): Promise<z.infer<typeof ownerClipPlanSchema>>;
  image(
    request: {
      clipId: string;
      cue: z.infer<typeof ownerClipPlanSchema>[number];
      words: OwnerWord[];
    },
    signal: AbortSignal,
  ): Promise<{ bytes: Buffer; origin: "synthetic" | "generated" }>;
  render(job: OwnerMediaJob, signal: AbortSignal): Promise<OwnerMediaResult>;
};
const digest = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
type Work = {
  clip: OwnerClip;
  moment?: OwnerMoment;
  renderRevision: number;
  snapshot?: OwnerClipBase;
  overlay?: OwnerOverlay;
  editRevision?: number;
};
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
    private readonly changed: () => void = () => {},
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
  restore(value: unknown) {
    if (this.clips.size || this.active || this.closing)
      throw new Error("workspace_busy");
    const restored = ownerClipListSchema.shape.clips.parse(value);
    const ids = new Set<string>();
    for (const clip of restored) {
      if (ids.has(clip.id)) throw new Error("duplicate_clip");
      ids.add(clip.id);
      if (
        clip.sourceRevision !== this.workspace.revision ||
        (clip.base &&
          (clip.base.fingerprint !== this.workspace.source.fingerprint ||
            digest(clip.base) !== clip.baseHash))
      )
        throw new Error("stale_saved_clip");
      if (clip.base && clip.baseHash) {
        clip.edit ??= automaticOwnerEdit(clip.base, clip.id, clip.baseHash);
        if (
          clip.edit.clipId !== clip.id ||
          clip.edit.baseHash !== clip.baseHash ||
          clip.edit.revision !== clip.revision
        )
          throw new Error("stale_saved_edit");
        compileOwnerOverlay(clip.base, clip.edit, clip.assets);
      }
      if (working(clip)) {
        clip.state = "canceled";
        clip.error = "canceled";
      }
    }
    for (const clip of restored) this.clips.set(clip.id, clip);
  }
  async validateEdit(id: string, value: unknown) {
    return this.serialize(async () => {
      const clip = this.clips.get(id);
      if (this.closing || !clip) throw new Error("workspace_closed");
      return ownerAgentValidation(clip, applyOwnerEdit(clip, value));
    });
  }
  async edit(id: string, value: unknown) {
    const request = ownerEditRequestSchema.parse(value);
    return this.serialize(async () => {
      const key = `edit:${id}:${request.operationId}`;
      if (this.receipt(key, request)) return this.snapshot();
      const clip = this.clips.get(id);
      if (this.closing || !clip) throw new Error("workspace_closed");
      const edit = applyOwnerEdit(clip, request);
      clip.edit = edit;
      clip.revision = edit.revision;
      if (!working(clip)) clip.state = "validated-revision";
      this.receipts.set(key, digest(request));
      this.changed();
      return this.snapshot();
    });
  }
  async picture(id: string, bytes: Buffer, signal: AbortSignal) {
    return this.serialize(async () => {
      const clip = this.clips.get(id);
      if (this.closing || !clip?.base) throw new Error("picture_unavailable");
      signal.throwIfAborted();
      const picture = await normalizeOwnerPicture(bytes, signal),
        hash = createHash("sha256").update(picture.bytes).digest("hex");
      const existing = clip.assets.find(
        (asset) => asset.digest === hash && asset.origin === "owner-supplied",
      );
      if (existing) return { ...this.snapshot(), pictureAssetId: existing.id };
      if (clip.assets.length >= OWNER_PICTURE_LIMITS.assetsPerClip)
        throw new Error("picture_unavailable");
      await this.reserve(0, 0, picture.bytes.length);
      signal.throwIfAborted();
      if (this.closing) throw new Error("workspace_closed");
      const asset = ownerAssetSchema.parse({
        id: randomUUID(),
        digest: hash,
        width: picture.width,
        height: picture.height,
        bytes: picture.bytes.length,
        origin: "owner-supplied",
      });
      const file = await this.files.asset(this.workspace.id, asset.id);
      try {
        await writeFile(file, picture.bytes, { flag: "wx", mode: 0o600 });
        signal.throwIfAborted();
        clip.assets.push(asset);
      } catch (error) {
        await rm(file, { force: true });
        throw error;
      }
      this.changed();
      return { ...this.snapshot(), pictureAssetId: asset.id };
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
      analysis.mode !== this.ports.mode ||
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
      return !clip || (clip.state === "canceled" && clip.calls.plan === 0);
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
        mode: this.ports.mode,
        analysisId: analysis.id,
        sourceRevision: this.workspace.revision,
        revision: 0,
        assemblyRevision: 0,
        baseHash: null,
        state: "queued",
        base: null,
        edit: null,
        assets: [],
        outputs: [],
        calls: { plan: 0, image: 0, render: 0 },
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
  private async reserve(additional: number, outputs = 0, assets = 0) {
    const retained =
      this.clips.size +
      [...this.clips.values()].reduce(
        (sum, clip) => sum + Math.max(1, clip.outputs.length),
        0,
      );
    await requireDisk(
      this.files.root,
      this.workspace.source.bytes +
        assets +
        [...this.clips.values()].reduce(
          (sum, clip) =>
            sum + clip.assets.reduce((total, asset) => total + asset.bytes, 0),
          0,
        ) +
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
    this.queue.push({
      clip,
      renderRevision,
      snapshot: ownerClipBaseSchema.parse(clip.base),
      overlay: compileOwnerOverlay(clip.base, clip.edit, clip.assets),
      editRevision: clip.revision,
    });
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
    clip.calls.plan++;
    const frames = moment.cut.endFrame - moment.cut.startFrame;
    const plan = ownerClipPlanSchema.parse(
      await this.ports.plan(
        {
          workspace: structuredClone(this.workspace),
          clipId: clip.id,
          moment: structuredClone(moment),
        },
        signal,
      ),
    );
    if (
      plan.some(
        (cue) =>
          cue.endFrame <= cue.startFrame ||
          cue.endFrame > frames ||
          new Set(cue.evidenceWordIds).size !== cue.evidenceWordIds.length ||
          cue.evidenceWordIds.some(
            (id) =>
              !moment.cues.some(
                (word) =>
                  word.id === id &&
                  word.endMs > (cue.startFrame * 1000) / OWNER_FPS &&
                  word.startMs < (cue.endFrame * 1000) / OWNER_FPS,
              ),
          ),
      )
    )
      throw new Error("invalid_plan_clock");
    signal.throwIfAborted();
    const visuals = [];
    for (const cue of plan) {
      clip.calls.image++;
      const picture = await this.ports.image(
        {
          clipId: clip.id,
          cue: structuredClone(cue),
          words: structuredClone(moment.cues),
        },
        signal,
      );
      signal.throwIfAborted();
      if (
        picture.origin !==
        (this.ports.mode === "synthetic-ai" ? "synthetic" : "generated")
      )
        throw new Error("invalid_picture_provenance");
      if (picture.bytes.length > CONTEXTUAL_PICTURE_POLICY.maxDownloadBytes)
        throw new Error("picture_capacity");
      const raster = await normalizePicture(picture.bytes);
      signal.throwIfAborted();
      const asset = ownerAssetSchema.parse({
        id: randomUUID(),
        digest: createHash("sha256").update(raster.bytes).digest("hex"),
        width: raster.width,
        height: raster.height,
        bytes: raster.bytes.length,
        origin: picture.origin,
      });
      await writeFile(
        await this.files.asset(this.workspace.id, asset.id),
        raster.bytes,
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
        origin: picture.origin,
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
          clip.edit = automaticOwnerEdit(clip.base, clip.id, clip.baseHash);
          clip.state = "review-ready";
        }
        controller.signal.throwIfAborted();
        if (!clip.base) throw new Error("bundle_missing");
        const snapshot = work.snapshot ?? ownerClipBaseSchema.parse(clip.base),
          editRevision = work.editRevision ?? clip.revision,
          overlay =
            work.overlay ??
            compileOwnerOverlay(snapshot, clip.edit, clip.assets),
          jobId = randomUUID();
        clip.state = "rendering";
        clip.calls.render++;
        const result = await this.ports.render(
          {
            workspaceId: this.workspace.id,
            operation: "clip",
            jobId,
            clipId: clip.id,
            renderRevision: work.renderRevision,
            cut: structuredClone(snapshot.cut),
            fingerprint: snapshot.fingerprint,
            overlay: structuredClone(overlay),
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
            overlayHash: digest(overlay),
            jobId,
            editRevision,
            renderRevision: work.renderRevision,
          }),
          revision: work.renderRevision,
          editRevision,
          frames: result.frames,
          bytes: result.bytes,
        });
        clip.state =
          clip.revision === editRevision ? "ready" : "validated-revision";
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
        this.changed();
      }
    }
  }
}
