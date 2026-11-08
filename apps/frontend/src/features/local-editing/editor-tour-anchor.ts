import type { TourBox, TourViewport } from "./editor-tour-layout";

/** Cache ancestry, never geometry: scrollers and sticky headers can still move. */
export function createTourMeasurement() {
  let ancestors = new WeakMap<
    HTMLElement,
    { node: HTMLElement; x: boolean; y: boolean }[]
  >();
  let width = 0,
    height = 0;
  return (node: HTMLElement, view: TourViewport): TourBox | null => {
    if (view.width !== width || view.height !== height) {
      ancestors = new WeakMap();
      width = view.width;
      height = view.height;
    }
    let clipping = ancestors.get(node);
    if (!clipping) {
      clipping = [];
      for (
        let parent = node.parentElement;
        parent;
        parent = parent.parentElement
      ) {
        const style = getComputedStyle(parent);
        const x = /auto|scroll|hidden|clip/.test(style.overflowX);
        const y = /auto|scroll|hidden|clip/.test(style.overflowY);
        if (x || y) clipping.push({ node: parent, x, y });
      }
      ancestors.set(node, clipping);
    }
    const raw = node.getBoundingClientRect();
    let left = Math.max(raw.left, view.left),
      top = Math.max(raw.top, view.top),
      right = Math.min(raw.right, view.left + view.width),
      bottom = Math.min(raw.bottom, view.top + view.height);
    for (const clip of clipping) {
      const bounds = clip.node.getBoundingClientRect();
      if (clip.x) {
        left = Math.max(left, bounds.left + clip.node.clientLeft);
        right = Math.min(
          right,
          bounds.left + clip.node.clientLeft + clip.node.clientWidth,
        );
      }
      if (clip.y) {
        top = Math.max(top, bounds.top + clip.node.clientTop);
        bottom = Math.min(
          bottom,
          bounds.top + clip.node.clientTop + clip.node.clientHeight,
        );
      }
    }
    return right > left && bottom > top
      ? { left, top, width: right - left, height: bottom - top }
      : null;
  };
}

/** Include navigation in the same rectangle, including Media's nested tabs. */
export function editorTourNavigation(node: HTMLElement): HTMLElement[] {
  const panel = node.closest<HTMLElement>("[data-editor-panel]");
  const tab = panel?.getAttribute("aria-labelledby");
  const main = tab ? document.getElementById(tab) : null;
  return [
    ...(main?.getAttribute("aria-selected") === "true" ? [main] : []),
    ...(panel?.querySelectorAll<HTMLElement>(
      ':scope > [role="tablist"] [aria-selected="true"]',
    ) ?? []),
  ].filter((item) => item.getClientRects().length > 0);
}

export function tourBoxUnion(boxes: readonly TourBox[]): TourBox | null {
  if (!boxes.length) return null;
  const left = Math.min(...boxes.map((box) => box.left));
  const top = Math.min(...boxes.map((box) => box.top));
  return {
    left,
    top,
    width: Math.max(...boxes.map((box) => box.left + box.width)) - left,
    height: Math.max(...boxes.map((box) => box.top + box.height)) - top,
  };
}
