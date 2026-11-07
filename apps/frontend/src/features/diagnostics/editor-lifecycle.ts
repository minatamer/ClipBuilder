import type {
  BrowserDiagnostic,
  EditorDiagnosticState,
} from "@clipbuilder/contracts";
import { reportBrowserDiagnostic } from "./browser.diagnostics";

type Snapshot = Pick<
  EditorDiagnosticState,
  | "section"
  | "occurrence"
  | "revision"
  | "dirty"
  | "pending"
  | "previewReady"
  | "hasHook"
>;
type PreviewSignal = Exclude<EditorDiagnosticState["previewSignal"], "none">;
let active: {
  snapshot: () => EditorDiagnosticState;
  preview: (signal: PreviewSignal) => void;
} | null = null;
let reportWindow = 0,
  reportCount = 0;
export const currentEditorDiagnostic = () => active?.snapshot();
export const noteEditorPreview = (signal: PreviewSignal) =>
  active?.preview(signal);
const add = (value: number) => Math.min(1_000_000, value + 1);

/** Counters/codes only. Monitoring never schedules React state or keeps media. */
export class EditorLifecycleTrace {
  private readonly reader = {
    snapshot: () => this.snapshot(),
    preview: (signal: PreviewSignal) => this.preview(signal),
  };
  private state: EditorDiagnosticState = {
    traceId: crypto.randomUUID(),
    section: "captions",
    occurrence: "body",
    action: "opened",
    revision: 0,
    commits: 0,
    readyReports: 0,
    activityReports: 0,
    selectionReports: 0,
    previewSubscriptions: 0,
    previewReleases: 0,
    previewEvents: 0,
    captures: 0,
    abortedCaptures: 0,
    seeks: 0,
    previewSignal: "none",
    edits: 0,
    applies: 0,
    discards: 0,
    tabChanges: 0,
    dirty: false,
    pending: false,
    previewReady: false,
    hasHook: false,
  };
  private opened = false;
  private windowStart = 0;
  private windowCommits = 0;
  private windowReports = 0;
  private burst = false;
  private burstStart = 0;
  constructor(
    private readonly report: (
      record: BrowserDiagnostic,
    ) => unknown = reportBrowserDiagnostic,
    private readonly now = () => performance.now(),
  ) {}
  snapshot() {
    return { ...this.state };
  }
  private emit(
    event: Extract<BrowserDiagnostic, { kind: "editor-lifecycle" }>["event"],
  ) {
    const now = this.now();
    if (now < reportWindow || now - reportWindow >= 60_000) {
      reportWindow = now;
      reportCount = 0;
    }
    if (reportCount >= 64) return;
    if (this.windowReports >= 24) return;
    reportCount++;
    this.windowReports++;
    try {
      void Promise.resolve(
        this.report({
          kind: "editor-lifecycle",
          event,
          state: this.snapshot(),
        }),
      ).catch(() => undefined);
    } catch {
      /* Diagnostics never affect editing. */
    }
  }
  commit(snapshot: Snapshot) {
    const now = this.now();
    if (now < this.windowStart || now - this.windowStart >= 60_000) {
      this.windowStart = now;
      this.windowReports = 0;
    }
    if (now < this.burstStart || now - this.burstStart >= 1000) {
      this.burstStart = now;
      this.windowCommits = 0;
      this.burst = false;
    }
    this.state = {
      ...this.state,
      ...snapshot,
      commits: add(this.state.commits),
    };
    active = this.reader;
    if (!this.opened) {
      this.opened = true;
      this.emit("opened");
    }
    this.windowCommits++;
    if (this.windowCommits >= 40 && !this.burst) {
      this.burst = true;
      this.emit("render-burst");
    }
  }
  ready() {
    this.state.readyReports = add(this.state.readyReports);
    this.state.previewReady = true;
    if (this.state.readyReports === 1) this.emit("preview-ready");
  }
  activity() {
    this.state.activityReports = add(this.state.activityReports);
  }
  private preview(signal: PreviewSignal) {
    this.state.previewSignal = signal;
    const key =
      signal === "subscribe"
        ? "previewSubscriptions"
        : signal === "dispose"
          ? "previewReleases"
          : signal === "capture"
            ? "captures"
            : signal === "capture-aborted"
              ? "abortedCaptures"
              : signal === "seek"
                ? "seeks"
                : "previewEvents";
    this.state[key] = add(this.state[key]);
  }
  action(action: EditorDiagnosticState["action"]) {
    this.state.action = action;
    if (action === "edit") this.state.edits = add(this.state.edits);
    if (action === "selection")
      this.state.selectionReports = add(this.state.selectionReports);
    if (action === "tab") this.state.tabChanges = add(this.state.tabChanges);
    if (action === "apply") {
      this.state.applies = add(this.state.applies);
      this.emit("applied");
    }
    if (action === "discard") {
      this.state.discards = add(this.state.discards);
      this.emit("discarded");
    }
  }
  close() {
    if (!this.opened) return;
    this.state.action = "closed";
    this.emit("closed");
    this.opened = false;
    this.windowCommits = 0;
    this.burst = false;
    if (active === this.reader) active = null;
  }
}
