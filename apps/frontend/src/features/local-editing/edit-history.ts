import type {
  OwnerEditDocument,
  OwnerCaptionStyle,
} from "../../../../../packages/contracts/local/editor.ts";
import { reconcileEditorEdit } from "./reconcile-editor-edit";
import { sameOwnerEdit } from "./editor-state";
import type { OwnerHookDraft } from "./hook-range-draft";

export type EditorHistorySnapshot = {
  draft: OwnerEditDocument;
  hookDraft: OwnerHookDraft | undefined;
};
type Entry = { value: EditorHistorySnapshot; bytes: number };
type History = {
  back: Entry[];
  forward: Entry[];
  group: string | undefined;
  at: number;
  baseHash: string;
};
const MAX_ENTRIES = 50;
const MAX_BYTES = 8 * 1024 * 1024;

/** Workspace-owned, bounded edit values only. Assets and provider actions never enter history. */
export class WorkspaceEditHistory {
  private clips = new Map<string, History>();
  private bytes = 0;
  private entry(value: EditorHistorySnapshot): Entry {
    return {
      value: structuredClone(value),
      bytes: new TextEncoder().encode(JSON.stringify(value)).length,
    };
  }
  private drop(entries: Entry[]) {
    this.bytes -= entries.reduce((sum, entry) => sum + entry.bytes, 0);
  }
  private get(id: string, value: OwnerEditDocument) {
    let history = this.clips.get(id);
    if (history?.baseHash !== value.baseHash) {
      if (history) {
        this.drop(history.back);
        this.drop(history.forward);
      }
      history = {
        back: [],
        forward: [],
        group: undefined,
        at: 0,
        baseHash: value.baseHash,
      };
    }
    this.clips.delete(id);
    this.clips.set(id, history);
    return history;
  }
  record(
    id: string,
    before: EditorHistorySnapshot,
    after: EditorHistorySnapshot,
    group?: string,
    now = performance.now(),
  ) {
    const history = this.get(id, after.draft);
    if (
      before.draft.baseHash !== after.draft.baseHash ||
      (sameOwnerEdit(before.draft, after.draft) &&
        JSON.stringify(before.hookDraft) === JSON.stringify(after.hookDraft))
    )
      return;
    this.drop(history.forward);
    history.forward = [];
    if (!group || history.group !== group || now - history.at > 900) {
      const entry = this.entry(before);
      history.back.push(entry);
      this.bytes += entry.bytes;
    }
    history.group = group;
    history.at = now;
    this.trim();
  }
  private trim() {
    for (const history of this.clips.values()) {
      while (
        history.back.length + history.forward.length > MAX_ENTRIES ||
        this.bytes > MAX_BYTES
      ) {
        const entry = history.back.shift() ?? history.forward.shift();
        if (!entry) break;
        this.bytes -= entry.bytes;
      }
    }
  }
  availability(id: string, value: OwnerEditDocument) {
    const history = this.clips.get(id);
    return {
      undo: history?.baseHash === value.baseHash && history.back.length > 0,
      redo: history?.baseHash === value.baseHash && history.forward.length > 0,
    };
  }
  /** Incoming changes must survive Undo; an acknowledgement is not an action. */
  reconcile(
    id: string,
    base: OwnerEditDocument,
    saved: OwnerEditDocument,
    inheritedCaption: OwnerCaptionStyle,
  ) {
    const history = this.get(id, saved);
    if (sameOwnerEdit(base, saved)) return;
    // A historical null style means inherited typography, not an instruction to
    // erase an incoming property when undoing an unrelated earlier action.
    const captionChanged =
      JSON.stringify(base.captions) !== JSON.stringify(saved.captions);
    const explicitCaption = (edit: OwnerEditDocument) =>
      captionChanged
        ? {
            ...edit,
            captions: edit.captions ?? inheritedCaption,
          }
        : edit;
    for (const entries of [history.back, history.forward]) {
      for (let i = 0; i < entries.length; i++) {
        const previous = entries[i]!;
        const merged = reconcileEditorEdit(
          explicitCaption(base),
          explicitCaption(previous.value.draft),
          explicitCaption(saved),
          true,
          inheritedCaption,
        );
        if (!merged.compatible) continue;
        const entry = this.entry({ ...previous.value, draft: merged.draft });
        entries[i] = entry;
        this.bytes += entry.bytes - previous.bytes;
      }
    }
    history.group = undefined;
    this.trim();
  }
  move(id: string, current: EditorHistorySnapshot, direction: "undo" | "redo") {
    const history = this.get(id, current.draft);
    const from = direction === "undo" ? history.back : history.forward;
    const to = direction === "undo" ? history.forward : history.back;
    const entry = from.pop();
    if (!entry) return null;
    this.bytes -= entry.bytes;
    const present = this.entry(current);
    to.push(present);
    this.bytes += present.bytes;
    history.group = undefined;
    this.trim();
    return {
      hookDraft: structuredClone(entry.value.hookDraft),
      draft: {
        ...structuredClone(entry.value.draft),
        revision: current.draft.revision,
        baseHash: current.draft.baseHash,
        fingerprint: current.draft.fingerprint,
      },
    };
  }
  retain(ids: ReadonlySet<string>) {
    for (const [id, history] of this.clips)
      if (!ids.has(id)) {
        this.drop(history.back);
        this.drop(history.forward);
        this.clips.delete(id);
      }
  }
}
