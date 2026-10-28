import { createHash, randomUUID } from "node:crypto";
import { ownerPresentationFrames } from "../../../packages/contracts/local/hook.ts";
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
  ownerClipPlanSchema,
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
import { OWNER_CAPTION_PRESETS } from "../../../packages/contracts/local/editor.ts";
import { ownerAgentValidation } from "./agent-view.ts";
import { normalizeOwnerPicture } from "./personal-picture.ts";
import {
  ownerAnalysisSchema,
  type OwnerAnalysis,
  type OwnerMoment,
  type OwnerWord,
} from "../../../packages/contracts/local/selection.ts";
import { compileFixedCaptions } from "../src/assembly/fixed-captions.ts";
import { WorkspaceFiles, requireDisk } from "./workspace-files.ts";
import { CONTEXTUAL_PICTURE_POLICY } from "../../../packages/contracts/src/contextual-picture.schema.ts";
import { normalizePicture } from "../src/assembly/picture-raster.ts";
import type { OwnerAiMode } from "../../../packages/contracts/local/policy.ts";

import { LocalDiagnostics } from "./diagnostics.ts";
import { FAKE_CAPTIONS_ENABLED } from "./fake-content.ts";
import {
  ownerCaptionGenerationRequestSchema,
  ownerFakeCaptionGenerationRequestSchema,
  OWNER_CAPTION_GENERATION_ATTEMPTS,
} from "../../../packages/contracts/local/caption-generation.ts";
import { ownerWordsSchema } from "../../../packages/contracts/local/selection.ts";
import { ownerEditDocumentSchema } from "../../../packages/contracts/local/editor.ts";
import type { ClipCaptionTranscription } from "./clip-caption-port.ts";
import { critiqueOwnerVisualCue, ownerVisualClock } from "./gemini-critique.ts";
import {
  defaultOwnerFocus,
  ownerFocusCounts,
  type OwnerFocus,
} from "../../../packages/contracts/local/focus.ts";

export { ownerClipPlanSchema } from "../../../packages/contracts/local/clips.ts";
export type OwnerClipPorts = {
  readonly mode: OwnerAiMode;
  focus?(request: {
    workspace: OwnerWorkspace;
    clipId: string;
    moment: OwnerMoment;
  }): OwnerFocus;
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
  ): Promise<{ bytes: Buffer; origin: "synthetic" | "generated" } | null>;
  resume?(request: {
    workspaceId: string;
    clipId: string;
    words: OwnerWord[];
    frames: number;
    plan: z.infer<typeof ownerClipPlanSchema>;
  }): void;
  render(job: OwnerMediaJob, signal: AbortSignal): Promise<OwnerMediaResult>;
};
const digest = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
type Work = { clip: OwnerClip } & (
  | { kind: "prepare"; moment?: OwnerMoment }
  | {
      kind: "export";
      renderRevision: number;
      snapshot: OwnerClipBase;
      overlay: OwnerOverlay;
      editRevision: number;
    }
);
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
  private readonly failedCaptionAttempts = new Set<string>();
  private captionProcessing = false;
  constructor(
    private readonly workspace: OwnerWorkspace,
    private readonly files: WorkspaceFiles,
    private readonly ports: OwnerClipPorts,
    private readonly changed: () => void = () => {},
    private readonly diagnostics = new LocalDiagnostics(),
    private readonly capacity = requireDisk,
    private readonly clipLimit: number = OWNER_LIMITS.clips,
    private readonly exported: () => Promise<void> = async () => {},
  ) {
    this.workspace = ownerWorkspaceSchema.parse(workspace);
  }
  get active() {
    return (
      this.queue.length > 0 || Boolean(this.current) || this.captionProcessing
    );
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
        (clip.preview &&
          (!clip.base || clip.preview.frames !== clip.base.overlay.frames)) ||
        clip.sourceRevision !== this.workspace.revision ||
        (clip.base &&
          (clip.base.fingerprint !== this.workspace.source.fingerprint ||
            digest(clip.base) !== clip.baseHash))
      )
        throw new Error("stale_saved_clip");
      const preparation = clip.preparation;
      if (preparation) {
        const moment = preparation.moment;
        const frames = moment.cut.endFrame - moment.cut.startFrame;
        if (
          moment.id !== clip.momentId ||
          moment.cut.endFrame >
            Math.floor((this.workspace.source.durationMs * OWNER_FPS) / 1000) ||
          moment.processingIdentity !==
            createHash("sha256")
              .update(
                `${this.workspace.source.fingerprint}:${moment.cut.startFrame}:${moment.cut.endFrame}`,
              )
              .digest("hex") ||
          new Set(preparation.pictures.map((picture) => picture.index)).size !==
            preparation.pictures.length ||
          preparation.pictures.some(
            (picture) =>
              !preparation.plan?.[picture.index] ||
              (picture.visual &&
                (picture.visual.endFrame > frames ||
                  !clip.assets.some(
                    (asset) =>
                      asset.id === picture.visual!.assetId &&
                      asset.digest === picture.visual!.digest,
                  ))),
          )
        )
          throw new Error("stale_saved_clip");
      }
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
      delete clip.preparationStage;
    }
    for (const clip of restored) this.clips.set(clip.id, clip);
  }
  async validateEdit(id: string, value: unknown) {
    return this.serialize(async () => {
      const clip = this.clips.get(id);
      if (this.closing || !clip) throw new Error("workspace_closed");
      return ownerAgentValidation(
        clip,
        applyOwnerEdit(clip, value, this.workspace.source),
      );
    });
  }
  async edit(id: string, value: unknown) {
    const request = ownerEditRequestSchema.parse(value);
    return this.serialize(async () => {
      const key = `edit:${id}:${request.operationId}`;
      if (this.receipt(key, request)) return this.snapshot();
      const clip = this.clips.get(id);
      if (this.closing || !clip) throw new Error("workspace_closed");
      const edit = applyOwnerEdit(clip, request, this.workspace.source);
      if (
        edit.focus &&
        request.operations.some(
          (o) =>
            o.kind === "focus" || (o.kind === "reset" && o.panel === "focus"),
        )
      )
        this.diagnostics.focus("focus_edit", ownerFocusCounts(edit.focus));
      clip.edit = edit;
      clip.revision = edit.revision;
      if (!working(clip)) clip.state = "validated-revision";
      this.receipts.set(key, digest(request));
      this.changed();
      return this.snapshot();
    });
  }
  async generateCaptions(
    id: string,
    value: unknown,
    transcribe: ClipCaptionTranscription,
    signal: AbortSignal,
    fake = false,
  ) {
    const request = (
      fake
        ? ownerFakeCaptionGenerationRequestSchema
        : ownerCaptionGenerationRequestSchema
    ).parse(value);
    return this.serialize(async () => {
      const key = `captions:${fake ? "fake" : "gemini"}:${id}:${request.operationId}`;
      if (this.receipt(key, request)) {
        if (this.failedCaptionAttempts.has(key))
          throw new Error("caption_attempt_failed");
        return this.snapshot();
      }
      const clip = this.clips.get(id);
      if (
        this.closing ||
        this.active ||
        !clip?.base ||
        !clip.baseHash ||
        !["ready", "review-ready", "validated-revision"].includes(clip.state)
      )
        throw new Error("clip_unavailable");
      if (clip.revision !== request.expectedRevision)
        throw new Error("stale_edit_revision");
      if (
        clip.base.overlay.captions.length ||
        (!fake &&
          (clip.captionAttempts ?? 0) >= OWNER_CAPTION_GENERATION_ATTEMPTS)
      )
        throw new Error("caption_generation_unavailable");
      signal.throwIfAborted();
      this.receipts.set(key, digest(request));
      if (!fake) clip.captionAttempts = (clip.captionAttempts ?? 0) + 1;
      this.captionProcessing = true;
      this.changed();
      try {
        const words = ownerWordsSchema.parse(
          await transcribe(this.workspace, structuredClone(clip), signal),
        );
        const captions = compileFixedCaptions(
          {
            words,
            range: {
              startMs: 0,
              endMs: Math.round((clip.base.overlay.frames * 1000) / OWNER_FPS),
            },
          },
          () => this.diagnostics.critique("transcript_validate"),
        );
        const base = ownerClipBaseSchema.parse({
          ...clip.base,
          words,
          overlay: {
            ...clip.base.overlay,
            captions,
            captionStyle:
              clip.base.overlay.captionStyle ?? OWNER_CAPTION_PRESETS.tiktok,
          },
        });
        const baseHash = digest(base),
          revision = clip.revision + 1;
        const edit = ownerEditDocumentSchema.parse({
          ...(clip.edit ??
            automaticOwnerEdit(clip.base, clip.id, clip.baseHash)),
          baseHash,
          revision,
          captionText: [],
          captionSpeakers: clip.edit?.captionSpeakers
            ? { ...clip.edit.captionSpeakers, assignments: [] }
            : undefined,
        });
        compileOwnerOverlay(base, edit, clip.assets);
        clip.base = base;
        clip.baseHash = baseHash;
        clip.edit = edit;
        clip.revision = revision;
        clip.state = "validated-revision";
        this.captionProcessing = false;
        this.changed();
        return this.snapshot();
      } catch (error) {
        this.failedCaptionAttempts.add(key);
        throw error;
      } finally {
        this.captionProcessing = false;
        this.changed();
      }
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
        ...(picture.format === "png" ? { format: picture.format } : {}),
      });
      const file = await this.files.asset(
        this.workspace.id,
        asset.id,
        asset.format,
      );
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
    const choices = request.momentIds.map((id) => {
      const moment = [...analysis.manual, ...analysis.suggestions].find(
        (item) => item.id === id,
      );
      if (!moment) throw new Error("moment_missing");
      return structuredClone(moment);
    });
    // Identical returned passages stay visible; processing the same cut once
    // avoids a second metered preparation for duplicate recommendations.
    const moments = [
      ...new Map(
        choices.map((moment) => [moment.processingIdentity, moment]),
      ).values(),
    ];
    const existing = (moment: OwnerMoment) =>
      [...this.clips.values()].find(
        (clip) =>
          clip.analysisId === analysis.id &&
          (clip.momentId === moment.id ||
            clip.preparation?.moment.processingIdentity ===
              moment.processingIdentity ||
            clip.base?.processingIdentity === moment.processingIdentity),
      );
    const fresh = moments.filter((moment) => {
      const clip = existing(moment);
      return !clip || (clip.state === "canceled" && clip.calls.plan === 0);
    });
    const additions = fresh.filter((moment) => !existing(moment)).length;
    if (this.clips.size + additions > this.clipLimit)
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
        preparation: { moment, plan: null, pictures: [] },
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
        this.queue.push({ kind: "prepare", clip, moment });
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
    await this.capacity(
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
  async retry(id: string, value: unknown, analysis?: OwnerAnalysis) {
    const request = ownerClipRenderRequestSchema.parse(value),
      cancelVersion = this.cancelVersion;
    return this.serialize(async () => {
      const key = `retry:${id}:${request.operationId}`;
      if (this.receipt(key, request)) return this.snapshot();
      const clip = this.clips.get(id);
      if (
        this.closing ||
        !clip ||
        clip.revision !== request.expectedRevision ||
        !["failed", "canceled"].includes(clip.state)
      )
        throw new Error("stale_or_busy_clip");
      if (clip.base && (clip.preview || clip.outputs.length)) {
        // Rendering a completed base never invokes planning or image generation.
        const result = await this.renderOne(id, request, cancelVersion);
        this.receipts.set(key, digest(request));
        return result;
      }
      const moment =
        clip.preparation?.moment ??
        (analysis?.id === clip.analysisId
          ? [...analysis.manual, ...analysis.suggestions].find(
              (candidate) => candidate.id === clip.momentId,
            )
          : undefined);
      if (!clip.base && !moment) throw new Error("moment_missing");
      await this.reserve(0, 1);
      this.receipts.set(key, digest(request));
      if (cancelVersion !== this.cancelVersion) return this.snapshot();
      if (moment)
        clip.preparation ??= {
          moment: structuredClone(moment),
          plan: null,
          pictures: [],
        };
      clip.state = "queued";
      clip.error = null;
      this.queue.push({
        kind: "prepare",
        clip,
        ...(moment ? { moment: structuredClone(moment) } : {}),
      });
      this.changed();
      this.start();
      return this.snapshot();
    });
  }
  private async renderOne(id: string, value: unknown, cancelVersion: number) {
    const request = ownerClipRenderRequestSchema.parse(value),
      clip = this.clips.get(id),
      key = `render:${id}:${request.operationId}`;
    if (this.receipt(key, request)) return this.snapshot();
    if (
      this.closing ||
      !clip?.base ||
      !(clip.preview || clip.outputs.length) ||
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
      kind: "export",
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
    const frames = moment.cut.endFrame - moment.cut.startFrame;
    const preparation = (clip.preparation ??= {
      moment: structuredClone(moment),
      plan: null,
      pictures: [],
    });
    if (preparation.plan === null) {
      clip.preparationStage = "planning";
      this.changed();
      clip.calls.plan++;
      preparation.plan = ownerClipPlanSchema.parse(
        await this.ports.plan(
          {
            workspace: structuredClone(this.workspace),
            clipId: clip.id,
            moment: structuredClone(moment),
          },
          signal,
        ),
      );
      preparation.focus =
        this.ports.focus?.({
          workspace: structuredClone(this.workspace),
          clipId: clip.id,
          moment: structuredClone(moment),
        }) ?? defaultOwnerFocus(this.workspace.source, frames);
      this.diagnostics.focus(
        "focus_compile",
        ownerFocusCounts(preparation.focus),
      );
      this.changed();
    }
    const plan = preparation.plan;
    this.ports.resume?.({
      workspaceId: this.workspace.id,
      clipId: clip.id,
      words: moment.cues,
      frames,
      plan,
    });
    signal.throwIfAborted();
    const visuals: OwnerClipBase["overlay"]["visuals"] = [];
    for (const [index, cue] of plan.entries()) {
      critiqueOwnerVisualCue(cue, moment.cues, frames, this.diagnostics);
      const retained = preparation.pictures.find(
        (picture) => picture.index === index,
      );
      if (retained) {
        if (retained.visual) visuals.push(retained.visual);
        continue;
      }
      clip.calls.image++;
      clip.preparationStage = "pictures";
      this.changed();
      const picture = await this.ports.image(
        {
          clipId: clip.id,
          cue: structuredClone(cue),
          words: structuredClone(moment.cues),
        },
        signal,
      );
      signal.throwIfAborted();
      if (!picture) {
        this.diagnostics.critique("image_generate", "gemini_output_unusable");
        preparation.pictures.push({ index, visual: null });
        this.changed();
        continue;
      }
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
      const visual = {
        id: randomUUID(),
        assetId: asset.id,
        digest: asset.digest,
        ...ownerVisualClock(cue, frames),
        box: {
          x: 80 / 1080,
          y: 900 / 1920,
          width: 920 / 1080,
          height: 520 / 1920,
        },
        fit: "contain" as const,
        entrance: "fade" as const,
        exit: "fade" as const,
        animationFrames: 9,
        origin: picture.origin,
      };
      visuals.push(visual);
      preparation.pictures.push({ index, visual });
      this.changed();
    }
    const captionWords =
      this.ports.mode === "synthetic-ai" && !FAKE_CAPTIONS_ENABLED
        ? []
        : moment.cues;
    if (captionWords.length) {
      clip.preparationStage = "captions";
      this.changed();
    }
    const captions = compileFixedCaptions(
      {
        words: captionWords,
        range: { startMs: 0, endMs: Math.round((frames * 1000) / OWNER_FPS) },
      },
      () => this.diagnostics.critique("clip_prepare"),
    );
    return ownerClipBaseSchema.parse({
      version: 1,
      analysisId: clip.analysisId,
      momentId: clip.momentId,
      sourceRevision: clip.sourceRevision,
      fingerprint: this.workspace.source.fingerprint,
      processingIdentity: moment.processingIdentity,
      cut: moment.cut,
      words: moment.cues,
      overlay: {
        version: 1,
        frames,
        captions,
        ...(captions.length
          ? { captionStyle: OWNER_CAPTION_PRESETS.tiktok }
          : {}),
        texts: [],
        visuals,
        focus:
          preparation.focus ?? defaultOwnerFocus(this.workspace.source, frames),
      },
    });
  }
  private async pump() {
    while (this.queue.length && !this.closing) {
      const work = this.queue.shift()!,
        { clip } = work;
      const controller = new AbortController();
      this.current = { clip, controller };
      try {
        await this.diagnostics.run(
          "clip_build",
          async () => {
            if (work.kind === "prepare") {
              clip.state = "preparing";
              if (!clip.base) {
                const moment = work.moment;
                if (!moment) throw new Error("moment_missing");
                clip.base = await this.diagnostics.run("clip_prepare", () =>
                  this.prepare(clip, moment, controller.signal),
                );
                clip.baseHash = digest(clip.base);
                clip.edit = automaticOwnerEdit(
                  clip.base,
                  clip.id,
                  clip.baseHash,
                );
              }
              controller.signal.throwIfAborted();
              const frames = clip.base.overlay.frames;
              clip.preparationStage = "preview";
              this.changed();
              const result = await this.ports.render(
                {
                  operation: "clip-preview",
                  workspaceId: this.workspace.id,
                  jobId: randomUUID(),
                  clipId: clip.id,
                  cut: structuredClone(clip.base.cut),
                  fingerprint: clip.base.fingerprint,
                },
                controller.signal,
              );
              controller.signal.throwIfAborted();
              if (
                result.operation !== "clip-preview" ||
                result.frames !== frames ||
                result.bytes <= 0 ||
                result.bytes > OWNER_BATCH_POLICY.clipReservationBytes ||
                result.durationMs !== Math.round((frames * 1000) / OWNER_FPS)
              )
                throw new Error("invalid_clip_output");
              clip.preview = { frames: result.frames, bytes: result.bytes };
              clip.state = "review-ready";
              clip.error = null;
              return;
            }
            controller.signal.throwIfAborted();
            if (!clip.base) throw new Error("bundle_missing");
            const snapshot = work.snapshot,
              editRevision = work.editRevision,
              overlay = work.overlay,
              jobId = randomUUID();
            clip.state = "rendering";
            if (overlay.focus)
              this.diagnostics.focus(
                "focus_export",
                ownerFocusCounts(overlay.focus),
              );
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
              result.frames !== ownerPresentationFrames(overlay) ||
              result.bytes <= 0 ||
              result.bytes > OWNER_BATCH_POLICY.clipReservationBytes ||
              result.durationMs !==
                Math.round(
                  (ownerPresentationFrames(overlay) * 1000) / OWNER_FPS,
                )
            )
              throw new Error("invalid_clip_output");
            await this.exported();
            controller.signal.throwIfAborted();
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
          },
          { independent: true },
        );
      } catch {
        clip.state = controller.signal.aborted ? "canceled" : "failed";
        clip.error = controller.signal.aborted
          ? "canceled"
          : "local_clip_failed";
        // Failed output is derived scratch only. The admitted master and sibling
        // bundles/assets/outputs retain their independent workspace ownership.
        if (work.kind === "export")
          await rm(
            await this.files.output(
              this.workspace.id,
              clip.id,
              work.renderRevision,
            ),
            { force: true },
          ).catch((error: unknown) =>
            this.diagnostics.failure("cleanup", error),
          );
      } finally {
        delete clip.preparationStage;
        this.current = undefined;
        this.changed();
      }
    }
  }
}
