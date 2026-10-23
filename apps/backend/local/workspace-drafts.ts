import {
  ownerDraftStatusSchema,
  type OwnerDraftSnapshot,
  type OwnerDraftStatus,
} from "../../../packages/contracts/local/drafts.ts";
import type { OwnerDraftStore } from "./draft-store.ts";
import type { WorkspaceFiles } from "./workspace-files.ts";

type Binding = {
  id: string | null;
  savedAt: string | null;
  state: OwnerDraftStatus["state"];
  generation: number;
  timer?: ReturnType<typeof setTimeout> | undefined;
  running?: Promise<OwnerDraftStatus> | undefined;
};
/** Explicit Save opts in; only acknowledged local changes then autosave. */
export class OwnerWorkspaceDrafts {
  private readonly bindings = new Map<string, Binding>();
  private closing = false;
  constructor(
    private readonly store: Pick<OwnerDraftStore, "save">,
    private readonly files: WorkspaceFiles,
    private readonly snapshot: (id: string) => OwnerDraftSnapshot,
  ) {}
  status(id: string): OwnerDraftStatus {
    const entry = this.bindings.get(id);
    return ownerDraftStatusSchema.parse(
      entry
        ? { id: entry.id, savedAt: entry.savedAt, state: entry.state }
        : { id: null, savedAt: null, state: "session-only" },
    );
  }
  bind(workspaceId: string, draftId: string, savedAt: string) {
    this.bindings.set(workspaceId, {
      id: draftId,
      savedAt,
      state: "saved",
      generation: 0,
    });
  }
  changed(id: string) {
    const entry = this.bindings.get(id);
    if (!entry || this.closing) return;
    entry.generation++;
    entry.state = "unsaved";
    this.schedule(id, entry);
  }
  private schedule(id: string, entry: Binding) {
    if (entry.timer) clearTimeout(entry.timer);
    entry.timer = setTimeout(() => {
      entry.timer = undefined;
      if (this.bindings.get(id) === entry && !this.closing) void this.save(id);
    }, 500);
    entry.timer.unref();
  }
  async save(id: string): Promise<OwnerDraftStatus> {
    let entry = this.bindings.get(id);
    if (!entry) {
      entry = { id: null, savedAt: null, state: "session-only", generation: 0 };
      this.bindings.set(id, entry);
    }
    if (entry.timer) clearTimeout(entry.timer);
    entry.timer = undefined;
    if (entry.running) return entry.running;
    const current = entry,
      generation = entry.generation;
    current.state = "saving";
    current.running = Promise.resolve().then(async () => {
      let succeeded = false;
      try {
        const saved = await this.store.save(
          current.id ?? undefined,
          this.snapshot(id),
          this.files,
        );
        current.id = saved.id;
        current.savedAt = saved.savedAt;
        succeeded = true;
        current.state = generation === current.generation ? "saved" : "unsaved";
      } catch {
        current.state = "unsaved";
      } finally {
        current.running = undefined;
      }
      if (succeeded && current.state === "unsaved" && !this.closing)
        this.schedule(id, current);
      return this.status(id);
    });
    return current.running;
  }
  async flush(id: string) {
    const entry = this.bindings.get(id);
    if (!entry) return this.status(id);
    if (entry.running) await entry.running;
    if (entry.state === "unsaved") await this.save(id);
    return this.status(id);
  }
  async forget(id: string) {
    const entry = this.bindings.get(id);
    if (entry?.timer) clearTimeout(entry.timer);
    await entry?.running;
    if (entry?.timer) clearTimeout(entry.timer);
    this.bindings.delete(id);
  }
  async forgetSaved(draftId: string) {
    for (const [id, entry] of this.bindings)
      if (entry.id === draftId) await this.forget(id);
  }
  async close() {
    this.closing = true;
    for (const [id, entry] of this.bindings) {
      if (entry.timer) clearTimeout(entry.timer);
      if (entry.id) await this.flush(id);
      else await entry.running;
      if (entry.timer) clearTimeout(entry.timer);
    }
    this.bindings.clear();
  }
}
