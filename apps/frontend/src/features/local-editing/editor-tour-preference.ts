export const EDITOR_TOUR_SEEN_KEY = "clipbuilder.editor-tour.v2";
let seenInPage: boolean | undefined;

export function editorTourStorage(): Storage | null {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

export function editorTourSeen(storage: Pick<Storage, "getItem"> | null) {
  try {
    return seenInPage ?? storage?.getItem(EDITOR_TOUR_SEEN_KEY) === "seen";
  } catch {
    return seenInPage ?? false;
  }
}

/** Re-arm automatic guidance after an acknowledged fresh-session action. */
export function resetEditorTour(storage: Pick<Storage, "removeItem"> | null) {
  // Override a stale stored flag in this page even if storage removal is blocked.
  seenInPage = false;
  try {
    storage?.removeItem(EDITOR_TOUR_SEEN_KEY);
  } catch {
    /* Storage restrictions cannot prevent a fresh session in the current page. */
  }
}
export function rememberEditorTour(storage: Pick<Storage, "setItem"> | null) {
  if (seenInPage) return;
  seenInPage = true;
  try {
    storage?.setItem(EDITOR_TOUR_SEEN_KEY, "seen");
  } catch {
    /* A browser preference cannot block the editor. */
  }
}
