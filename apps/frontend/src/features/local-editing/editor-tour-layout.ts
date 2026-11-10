export type TourBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};
export type TourViewport = TourBox;
type TourLayout = {
  spotlight: TourBox | null;
  card: Omit<TourBox, "height"> & { maxHeight: number };
};
const edge = 12;
const gap = 14;

/** Retrosum-style placement, clipped to the real visible target rather than moving its hole. */
export function editorTourLayout(
  raw: TourBox | null,
  view: TourViewport,
  measuredHeight: number,
  navigation: TourBox | null = null,
): TourLayout {
  const width = Math.max(1, Math.min(360, view.width - edge * 2));
  const height = Math.max(
    1,
    Math.min(
      measuredHeight,
      Math.max(180, view.height * 0.48),
      view.height - edge * 2,
    ),
  );
  const right = view.left + view.width - edge;
  const bottom = view.top + view.height - edge;
  const clamp = (n: number, low: number, high: number) =>
    Math.max(low, Math.min(n, Math.max(low, high)));
  const centered = {
    left: view.left + (view.width - width) / 2,
    top: view.top + (view.height - height) / 2,
    width,
    maxHeight: height,
  };
  if (!raw) return { spotlight: null, card: centered };
  const left = Math.max(view.left, raw.left - 5);
  const top = Math.max(view.top, raw.top - 5);
  const spotlight: TourBox = {
    left,
    top,
    width: Math.min(view.left + view.width, raw.left + raw.width + 5) - left,
    height: Math.min(view.top + view.height, raw.top + raw.height + 5) - top,
  };
  if (spotlight.width < 1 || spotlight.height < 1)
    return { spotlight: null, card: centered };
  const alignedLeft = clamp(left, view.left + edge, right - width);
  const alignedTop = clamp(top, view.top + edge, bottom - height);
  const positions = [
    { left: left + spotlight.width + gap, top: alignedTop },
    { left: left - width - gap, top: alignedTop },
    { left: alignedLeft, top: top + spotlight.height + gap },
    { left: alignedLeft, top: top - height - gap },
  ];
  const fits = (p: { left: number; top: number }) =>
    p.left >= view.left + edge &&
    p.top >= view.top + edge &&
    p.left + width <= right &&
    p.top + height <= bottom;
  const beside = positions.find(fits);
  if (beside)
    return { spotlight, card: { ...beside, width, maxHeight: height } };
  const room = Math.max(
    spotlight.top - gap - view.top - edge,
    bottom - spotlight.top - spotlight.height - gap,
  );
  if (raw.height <= 100 && room >= 176 && room < height - 0.5) {
    return editorTourLayout(raw, view, room, navigation);
  }
  // A tall preview/panel can share a phone viewport with a card by showing its visible portion.
  const alternatives = [false, true].map((above) => {
    const card = {
      left: centered.left,
      top: above ? view.top + edge : bottom - height,
      width,
      maxHeight: height,
    };
    const clippedTop = above
      ? Math.max(spotlight.top, card.top + height + gap)
      : spotlight.top;
    const clippedBottom = above
      ? spotlight.top + spotlight.height
      : Math.min(spotlight.top + spotlight.height, card.top - gap);
    return {
      spotlight:
        clippedBottom > clippedTop
          ? {
              ...spotlight,
              top: clippedTop,
              height: clippedBottom - clippedTop,
            }
          : null,
      card,
    };
  });
  // Around the middle of a short screen, the opposite side can preserve a real window.
  const navigationArea = (box: TourBox | null) =>
    box && navigation
      ? Math.max(
          0,
          Math.min(box.left + box.width, navigation.left + navigation.width) -
            Math.max(box.left, navigation.left),
        ) *
        Math.max(
          0,
          Math.min(box.top + box.height, navigation.top + navigation.height) -
            Math.max(box.top, navigation.top),
        )
      : 0;
  return alternatives.sort(
    (a, b) =>
      navigationArea(b.spotlight) - navigationArea(a.spotlight) ||
      (b.spotlight?.height ?? 0) - (a.spotlight?.height ?? 0),
  )[0]!;
}

/** Four panels leave a sharp, rectangular window without cloning the application UI. */
export function editorTourMasks(
  spotlight: TourBox | null,
  view: TourViewport,
): TourBox[] {
  if (!spotlight) return [view];
  const right = spotlight.left + spotlight.width,
    bottom = spotlight.top + spotlight.height;
  return [
    {
      left: view.left,
      top: view.top,
      width: view.width,
      height: spotlight.top - view.top,
    },
    {
      left: view.left,
      top: spotlight.top,
      width: spotlight.left - view.left,
      height: spotlight.height,
    },
    {
      left: right,
      top: spotlight.top,
      width: view.left + view.width - right,
      height: spotlight.height,
    },
    {
      left: view.left,
      top: bottom,
      width: view.width,
      height: view.top + view.height - bottom,
    },
  ];
}
