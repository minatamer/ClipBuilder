import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import type { OwnerTextLayer } from "../../../../../packages/contracts/local/text-layers.ts";
import {
  editOwnerStyledText,
  ownerCharacterStyleAt,
  ownerTextBoundaries,
} from "../../../../../packages/contracts/local/text-ranges.ts";
import { OwnerStyledTextLayer } from "../../../../../packages/composition/local/styled-text-layer.tsx";

export type TextSelection = {
  layerId: string;
  text: string;
  occurrence: string;
  start: number;
  end: number;
  editing: boolean;
};
type TextSession = {
  layer: OwnerTextLayer | null;
  selection: TextSelection | null;
  begin: (layer: OwnerTextLayer) => void;
  select: (
    layer: OwnerTextLayer,
    start: number,
    end: number,
    editing?: boolean,
  ) => void;
  whole: () => void;
  change: (layer: OwnerTextLayer, start?: number, end?: number) => void;
  report: (message: string) => void;
};
export const TextSelectionContext = createContext<TextSession | null>(null);
export function TextSelectionScope({
  session,
  children,
}: {
  session: TextSession;
  children: ReactNode;
}) {
  return (
    <TextSelectionContext value={session}>{children}</TextSelectionContext>
  );
}

/** A real native text selection in the scaled preview; no move/resize overlay. */
export function PreviewTextEditor({ layer }: { layer: OwnerTextLayer }) {
  const session = useContext(TextSelectionContext)!;
  const root = useRef<HTMLDivElement>(null),
    composing = useRef(false);
  const restore = useRef(false),
    replacement = useRef<{ start: number; end: number } | null>(null),
    history = useRef<OwnerTextLayer[]>([]),
    redo = useRef<OwnerTextLayer[]>([]);
  const latest = useRef({ layer, session });
  useLayoutEffect(() => {
    latest.current = { layer, session };
  });
  function offsets(element: HTMLElement) {
    const selection = window.getSelection();
    if (
      !selection?.rangeCount ||
      !selection.anchorNode ||
      !selection.focusNode ||
      !element.contains(selection.anchorNode) ||
      !element.contains(selection.focusNode)
    )
      return null;
    const range = selection.getRangeAt(0),
      prefix = range.cloneRange();
    prefix.selectNodeContents(element);
    prefix.setEnd(range.startContainer, range.startOffset);
    const start = prefix.toString().length;
    return { start, end: start + range.toString().length };
  }
  useEffect(() => {
    const editor =
      root.current?.querySelector<HTMLElement>("[contenteditable]");
    if (!editor) return;
    editor.focus();
    const read = () => {
      if (composing.current || document.activeElement !== editor) return;
      const selected = offsets(editor);
      if (selected)
        latest.current.session.select(
          latest.current.layer,
          selected.start,
          selected.end,
        );
    };
    document.addEventListener("selectionchange", read);
    return () => document.removeEventListener("selectionchange", read);
  }, []);
  useLayoutEffect(() => {
    if (!restore.current) return;
    restore.current = false;
    const editor =
      root.current?.querySelector<HTMLElement>("[contenteditable]");
    const selected = session.selection;
    if (!editor || document.activeElement !== editor || !selected) return;
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    let node = walker.nextNode(),
      used = 0,
      started = false;
    while (node) {
      const length = node.textContent?.length ?? 0;
      if (!started && selected.start <= used + length) {
        range.setStart(node, Math.max(0, selected.start - used));
        started = true;
      }
      if (started && selected.end <= used + length) {
        range.setEnd(node, Math.max(0, selected.end - used));
        break;
      }
      used += length;
      node = walker.nextNode();
    }
    if (started) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  });
  function input(element: HTMLDivElement) {
    if (composing.current) return;
    const selected = offsets(element);
    try {
      const at = session.selection?.start ?? 0;
      const next = editOwnerStyledText(
        layer.text,
        layer.spans ?? [],
        element.innerText.replace(/\r\n?/gu, "\n"),
        ownerCharacterStyleAt(
          layer.spans ?? [],
          Math.max(0, at - (at === layer.text.length ? 1 : 0)),
        ),
        replacement.current ?? undefined,
      );
      replacement.current = null;
      if (
        next.text === layer.text &&
        JSON.stringify(next.spans) === JSON.stringify(layer.spans ?? [])
      )
        return;
      history.current.push(layer);
      if (history.current.length > 100) history.current.shift();
      redo.current = [];
      restore.current = true;
      session.change(
        { ...layer, ...next },
        selected?.start ?? next.text.length,
        selected?.end ?? next.text.length,
      );
    } catch (error) {
      session.report(
        error instanceof Error ? error.message : "Couldn’t change this text.",
      );
      session.whole();
    }
  }
  return (
    <div ref={root}>
      <OwnerStyledTextLayer
        layer={layer}
        editingProps={{
          contentEditable: "plaintext-only",
          role: "textbox",
          "aria-label": "Edit title in preview",
          "aria-multiline": true,
          style: {
            pointerEvents: "auto",
            cursor: "text",
            userSelect: "text",
            outline: "2px solid #b7d3ff",
          },
          onPointerDown: (event) => event.stopPropagation(),
          onDoubleClick: (event) => event.stopPropagation(),
          onCompositionStart: () => {
            composing.current = true;
          },
          onCompositionEnd: (event) => {
            composing.current = false;
            input(event.currentTarget);
          },
          onInput: (event) => input(event.currentTarget),
          onBeforeInput: (event) => {
            replacement.current = offsets(event.currentTarget);
          },
          onKeyDown: (event) => {
            event.stopPropagation();
            if (event.key === "Escape") {
              event.preventDefault();
              session.whole();
            }
            if (
              (event.ctrlKey || event.metaKey) &&
              (event.key.toLowerCase() === "z" ||
                event.key.toLowerCase() === "y")
            ) {
              event.preventDefault();
              const forward = event.shiftKey || event.key.toLowerCase() === "y",
                source = forward ? redo.current : history.current,
                target = forward ? history.current : redo.current;
              const next = source.pop();
              if (next) {
                target.push(layer);
                if (target.length > 100) target.shift();
                restore.current = true;
                session.change(next, next.text.length, next.text.length);
              }
            }
          },
        }}
      />
    </div>
  );
}

export function boundedTextSelection(text: string, start: number, end: number) {
  const boundaries = [...ownerTextBoundaries(text)];
  return {
    start: boundaries.filter((value) => value <= start).at(-1) ?? 0,
    end: boundaries.find((value) => value >= end) ?? text.length,
  };
}
