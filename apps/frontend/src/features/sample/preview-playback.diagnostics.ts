import { uuidV4Schema } from "@clipbuilder/contracts";

type PreviewSummary = {
  captions: number;
  cards: number;
  matched: number;
  held: number;
  wide: number;
};
export type PreviewDiagnostic = PreviewSummary & {
  traceId: string;
  event: "started" | "buffering" | "resumed" | "ended" | "failed" | "closed";
  samples: number;
  bufferingEvents: number;
  automaticSeeks: number;
  userSeeks: number;
  backwardsMediaJumps: number;
  shownVisuals: number;
  maxDriftMs: number;
  elapsedMs: number;
};

/** Aggregates clocks in memory; no source URL, transcript, or exact clocks escape. */
export class PreviewPlaybackTrace {
  private samples = 0;
  private bufferingEvents = 0;
  private automaticSeeks = 0;
  private userSeeks = 0;
  private backwardsMediaJumps = 0;
  private maxDriftMs = 0;
  private readonly visuals = new Set<number>();
  private previousMediaMs: number | undefined;
  private intentUntil = 0;
  private records = 0;
  private closed = false;
  private readonly started: number;
  constructor(
    private readonly traceId: string,
    private readonly summary: PreviewSummary,
    private readonly sink: (record: PreviewDiagnostic) => void,
    private readonly now = () => performance.now(),
  ) {
    uuidV4Schema.parse(traceId);
    if (
      Object.values(summary).some(
        (n) => !Number.isSafeInteger(n) || n < 0 || n > 12000,
      )
    )
      throw new Error("invalid-preview-summary");
    this.started = now();
    this.record("started");
  }
  userSeek() {
    if (this.closed) return;
    this.userSeeks++;
    this.intentUntil = this.now() + 1500;
    this.previousMediaMs = undefined;
  }
  seeking() {
    if (!this.closed && this.now() > this.intentUntil) this.automaticSeeks++;
  }
  visualShown(index: number) {
    if (
      !this.closed &&
      Number.isSafeInteger(index) &&
      index >= 0 &&
      index < this.summary.cards
    )
      this.visuals.add(index);
  }
  sample(frame: number, mediaMs: number, fps: number) {
    if (
      this.closed ||
      this.samples >= 10000 ||
      !Number.isFinite(frame) ||
      frame < 0 ||
      !Number.isFinite(mediaMs) ||
      mediaMs < 0 ||
      !Number.isFinite(fps) ||
      fps <= 0
    )
      return;
    this.samples++;
    if (this.now() > this.intentUntil) {
      if (
        this.previousMediaMs !== undefined &&
        mediaMs < this.previousMediaMs - 100
      )
        this.backwardsMediaJumps++;
      this.maxDriftMs = Math.min(
        60000,
        Math.max(
          this.maxDriftMs,
          Math.ceil(Math.abs((frame * 1000) / fps - mediaMs) / 50) * 50,
        ),
      );
    }
    this.previousMediaMs = mediaMs;
  }
  event(event: "buffering" | "resumed" | "ended" | "failed") {
    if (this.closed) return;
    if (event === "buffering") this.bufferingEvents++;
    this.record(event);
  }
  close() {
    if (this.closed) return;
    this.record("closed");
    this.closed = true;
  }
  private record(event: PreviewDiagnostic["event"]) {
    // Reserve a final record even when buffering events fill the bounded budget.
    if (this.records >= 24 && event !== "closed") return;
    this.records++;
    try {
      this.sink({
        ...this.summary,
        traceId: this.traceId,
        event,
        samples: this.samples,
        bufferingEvents: this.bufferingEvents,
        automaticSeeks: this.automaticSeeks,
        userSeeks: this.userSeeks,
        backwardsMediaJumps: this.backwardsMediaJumps,
        shownVisuals: this.visuals.size,
        maxDriftMs: this.maxDriftMs,
        elapsedMs: Math.min(
          120000,
          Math.max(0, Math.round(this.now() - this.started)),
        ),
      });
    } catch {
      // A diagnostic sink cannot interrupt playback.
    }
  }
}
