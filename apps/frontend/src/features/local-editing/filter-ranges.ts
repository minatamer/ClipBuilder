import type { OwnerOverlay } from "../../../../../packages/contracts/local/clips.ts";
import {
  clipOwnerVideoLooks,
  subtractOwnerVideoLookWindow,
  type OwnerVideoLookRange,
} from "../../../../../packages/contracts/local/video-look.ts";
import { focusPositions, focusPositionName } from "./focus-positions.ts";

export const filterRangeKey = (range: {
  startFrame: number;
  endFrame: number;
}) => `${range.startFrame}:${range.endFrame}`;

/** Authored intervals replace camera portions; the remaining gaps stay editable. */
export function filterTimelineRanges(
  content: OwnerOverlay,
  window: { startFrame: number; endFrame: number },
): (OwnerVideoLookRange & { title: string })[] {
  const cameras = content.focus
    ? focusPositions(content.focus).map((position) => ({
        ...content.focus!.shots[position.index]!,
        title: focusPositionName(position),
      }))
    : [{ ...window, title: "Custom position 1" }];
  const ranges = clipOwnerVideoLooks(content.videoLooks ?? [], window);
  let gaps: OwnerVideoLookRange[] = [
    {
      ...window,
      ...(content.videoLook ?? { preset: "original" as const, strength: 100 }),
    },
  ];
  for (const range of ranges) gaps = subtractOwnerVideoLookWindow(gaps, range);
  const name = (range: OwnerVideoLookRange) => {
    const positions = cameras.filter(
      (camera) =>
        camera.startFrame < range.endFrame &&
        camera.endFrame > range.startFrame,
    );
    const first = positions[0]?.title ?? "Custom position 1",
      last = positions[positions.length - 1]?.title;
    return last && last !== first ? `${first} → ${last}` : first;
  };
  return [
    ...ranges.map((range) => ({ ...range, title: name(range) })),
    ...gaps.flatMap((gap) =>
      cameras.flatMap((camera) => {
        const startFrame = Math.max(gap.startFrame, camera.startFrame),
          endFrame = Math.min(gap.endFrame, camera.endFrame);
        return startFrame < endFrame
          ? [{ ...gap, startFrame, endFrame, title: camera.title }]
          : [];
      }),
    ),
  ].sort((a, b) => a.startFrame - b.startFrame);
}
