import { OWNER_BATCH_POLICY } from "../../../packages/contracts/local/clips.ts";
import { OWNER_CAMERA_FOLLOW } from "../../../packages/contracts/local/camera-follow.ts";
import type { BulkHeadPlan } from "../../../packages/contracts/local/camera-follow-plan.ts";
import type { OwnerFocus } from "../../../packages/contracts/local/focus.ts";

/** Bound scratch independently of clip length, without a hidden short-clip cutoff. */
export function preparedCameraPixels(
  focus: OwnerFocus,
  intervals: BulkHeadPlan["intervals"],
  preparedBytes: number,
) {
  if (
    !intervals.length ||
    !Number.isSafeInteger(preparedBytes) ||
    preparedBytes <= 0
  )
    return null;
  const indices = [
    ...new Set(
      intervals.flatMap((interval) => {
        const end =
          interval.sourceStartFrame + interval.endFrame - interval.startFrame;
        const frames: number[] = [];
        for (
          let frame = interval.sourceStartFrame;
          frame < end;
          frame += OWNER_CAMERA_FOLLOW.sampleFrames
        )
          frames.push(frame);
        frames.push(end - 1);
        return frames;
      }),
    ),
  ].sort((a, b) => a - b);
  const budget = Math.min(
    192 * 1024 ** 2,
    OWNER_BATCH_POLICY.clipReservationBytes - preparedBytes - 16 * 1024 ** 2,
  );
  if (budget <= 0) return null;
  const longest = Math.max(focus.source.width, focus.source.height);
  const baseWidth = Math.max(
    32,
    Math.round((focus.source.width / longest) * 512),
  );
  const baseHeight = Math.max(
    32,
    Math.round((focus.source.height / longest) * 512),
  );
  const scale = Math.min(
    1,
    Math.sqrt(budget / (indices.length * baseWidth * baseHeight)),
  );
  const width = Math.max(32, Math.floor(baseWidth * scale)),
    height = Math.max(32, Math.floor(baseHeight * scale));
  if (width * height * indices.length > budget) return null;
  // At most twenty interval expressions, safely below Windows command-line limits.
  const select = intervals
    .map((interval) => {
      const start = interval.sourceStartFrame,
        end = start + interval.endFrame - interval.startFrame;
      return `(gte(n,${start})*lt(n,${end})*not(mod(n-${start},${OWNER_CAMERA_FOLLOW.sampleFrames}))+eq(n,${end - 1}))`;
    })
    .join("+");
  return {
    indices,
    width,
    height,
    select,
    bytes: width * height * indices.length,
  };
}
