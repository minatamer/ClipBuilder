import { expect, it } from "vitest";
import {
  ownerCameraFollowKey,
  ownerCameraTrackSchema,
  ownerCameraTracksFit,
  ownerCameraTracksSchema,
  type OwnerCameraTrack,
  ownerCameraWithoutTrack,
} from "./camera-follow.ts";
import {
  defaultOwnerFocus,
  ownerFocusCrop,
  ownerSourceContent,
} from "./focus.ts";
import { ownerCameraCropAt, ownerCameraEffectsFit } from "./camera-motion.ts";

const focus = defaultOwnerFocus({ width: 1280, height: 720 }, 120);
const track: OwnerCameraTrack = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  occurrence: "body",
  personId: null,
  startFrame: 0,
  endFrame: 60,
  sourceStartFrame: 0,
  focusKey: ownerCameraFollowKey(focus, null),
  seed: { x: 0.2, y: 0.2, width: 0.1, height: 0.2 },
  outcome: "complete",
  points: Array.from({ length: 31 }, (_, i) => ({
    frame: Math.min(i * 2, 59),
    x: 0.25 + i * 0.01,
    y: 0.3,
  })),
};
it("validates bounded finite paths and exact source/focus/Hook binding", () => {
  expect(ownerCameraTrackSchema.safeParse(track).success).toBe(true);
  expect(ownerCameraTracksFit([track], focus, { frames: 120 })).toBe(true);
  for (const bad of [
    { ...track, endFrame: 1000 },
    { ...track, points: [track.points[1]!] },
    { ...track, seed: { ...track.seed, width: 2 } },
    {
      ...track,
      points: track.points.map((p, i) => (i === 2 ? { ...p, x: NaN } : p)),
    },
  ])
    expect(ownerCameraTrackSchema.safeParse(bad).success).toBe(false);
  expect(
    ownerCameraTracksFit(
      [track],
      { ...focus, shots: focus.shots.map((s) => ({ ...s, zoom: 2 })) },
      { frames: 120 },
    ),
  ).toBe(false);
  expect(
    ownerCameraTracksFit([{ ...track, occurrence: "hook" }], focus, {
      frames: 120,
      hook: { startFrame: 30, endFrame: 90 },
    }),
  ).toBe(false);
  expect(
    ownerCameraTracksFit(
      [{ ...track, occurrence: "hook", sourceStartFrame: 30 }],
      focus,
      { frames: 120, hook: { startFrame: 30, endFrame: 90 } },
    ),
  ).toBe(true);
});
it("joins explicitly linked chunks without baseline dips or vertical-anchor resets and safely detaches removed predecessors", () => {
  const camera = structuredClone(focus);
  camera.shots[0]!.zoom = 2;
  const first = {
    ...track,
    focusKey: ownerCameraFollowKey(camera, null),
    points: track.points.map((p, i) => ({ ...p, y: 0.3 + i * 0.003 })),
  };
  const last = first.points.at(-1)!;
  const next: OwnerCameraTrack = {
    ...first,
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    continues: first.id,
    startFrame: 60,
    endFrame: 120,
    sourceStartFrame: 60,
    seed: { ...first.seed, x: last.x - 0.05, y: last.y - 0.1 },
    points: first.points.map((p, i) => ({
      frame: p.frame,
      x: last.x + i * 0.002,
      y: last.y + i * 0.002,
    })),
  };
  const paths = [first, next];
  expect(ownerCameraTracksSchema.safeParse(paths).success).toBe(true);
  expect(ownerCameraTracksFit(paths, camera, { frames: 120 })).toBe(true);
  const before = ownerCameraCropAt(camera, [], 59, "body", 59, paths),
    after = ownerCameraCropAt(camera, [], 60, "body", 60, paths);
  expect(before).toEqual(after);
  expect(after.y).toBeGreaterThan(ownerFocusCrop(camera, camera.shots[0]!).y);
  const detached = ownerCameraWithoutTrack(paths, first.id);
  expect(detached[0]).not.toHaveProperty("continues");
  expect(ownerCameraTracksSchema.safeParse(detached).success).toBe(true);
  expect(next.continues).toBe(first.id);
  for (const change of [
    { continues: next.id },
    { continues: "cccccccc-cccc-4ccc-8ccc-cccccccccccc" },
    { occurrence: "hook" },
    { sourceStartFrame: 61 },
  ])
    expect(
      ownerCameraTracksSchema.safeParse([first, { ...next, ...change }])
        .success,
    ).toBe(false);
  expect(
    ownerCameraTracksSchema.safeParse([{ ...first, outcome: "lost" }, next])
      .success,
  ).toBe(false);
  camera.shots = [
    { ...camera.shots[0]!, endFrame: 60 },
    { ...camera.shots[0]!, startFrame: 60, centerX: 0.8 },
  ];
  const cutKey = ownerCameraFollowKey(camera, null);
  expect(
    ownerCameraTracksFit(
      paths.map((p) => ({ ...p, focusKey: cutKey })),
      camera,
      { frames: 120 },
    ),
  ).toBe(false);
});
it("rejects duplicate/overlapping Motion and Zoom while keeping occurrences independent", () => {
  expect(
    ownerCameraTracksSchema.safeParse([
      track,
      { ...track, id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" },
    ]).success,
  ).toBe(false);
  expect(
    ownerCameraTracksSchema.safeParse([
      track,
      {
        ...track,
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        occurrence: "hook",
      },
    ]).success,
  ).toBe(true);
  const effect = {
    id: track.id,
    occurrence: "body" as const,
    startFrame: 0,
    zoomFrames: 15,
    holdFrames: 9 as const,
    returnFrames: 12 as const,
    target: { centerX: 0.5, centerY: 0.5, zoom: 2 },
  };
  expect(
    ownerCameraEffectsFit([effect], { frames: 120, cameraTracks: [track] }),
  ).toBe(false);
});
it("uses a smoothed bounded camera path in its own occurrence with exact baseline edges", () => {
  const baseline = ownerCameraCropAt(focus, [], 0, "body", 0);
  expect(ownerCameraCropAt(focus, [], 0, "body", 0, [track])).toEqual(baseline);
  const moved = ownerCameraCropAt(focus, [], 30, "body", 30, [track]);
  expect(moved.x).toBeGreaterThan(baseline.x);
  expect(moved.width).toBe(baseline.width);
  expect(ownerCameraCropAt(focus, [], 30, "hook", 30, [track])).toEqual(
    baseline,
  );
  expect(ownerCameraCropAt(focus, [], 59, "body", 59, [track])).toEqual(
    baseline,
  );
  expect(moved.x).toBeGreaterThanOrEqual(0);
});
it("preserves other people's cuts, clamps source edges and invalidates only the bound person's positions", () => {
  const camera = structuredClone(focus);
  camera.people = ["person_1", "person_2"].map((id) => ({
    id,
    observations: [
      {
        startFrame: 0,
        endFrame: 120,
        box: { x: 0.1, y: 0.1, width: 0.2, height: 0.4 },
      },
    ],
  }));
  camera.shots = [
    { ...focus.shots[0]!, startFrame: 0, endFrame: 40, personId: "person_1" },
    {
      ...focus.shots[0]!,
      startFrame: 40,
      endFrame: 80,
      personId: "person_2",
      centerX: 0.8,
    },
    { ...focus.shots[0]!, startFrame: 80, endFrame: 120, personId: "person_1" },
  ];
  const path: OwnerCameraTrack = {
    ...track,
    personId: "person_1",
    endFrame: 120,
    focusKey: ownerCameraFollowKey(camera, "person_1"),
    points: Array.from({ length: 61 }, (_, i) => ({
      frame: Math.min(i * 2, 119),
      x: i === 0 ? 0.25 : 1,
      y: 0.3,
    })),
  };
  expect(ownerCameraCropAt(camera, [], 60, "body", 60, [path])).toEqual(
    ownerFocusCrop(camera, camera.shots[1]!),
  );
  const followed = ownerCameraCropAt(camera, [], 90, "body", 90, [path]),
    content = ownerSourceContent(camera.source);
  expect(followed.x + followed.width).toBeLessThanOrEqual(
    content.x + content.width,
  );
  const other = structuredClone(camera);
  other.shots[1]!.centerX = 0.9;
  expect(ownerCameraTracksFit([path], other, { frames: 120 })).toBe(true);
  other.shots[0]!.zoom = 2;
  expect(ownerCameraTracksFit([path], other, { frames: 120 })).toBe(false);
});
