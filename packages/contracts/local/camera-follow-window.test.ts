import { expect, it } from "vitest";
import {
  defaultOwnerFocus,
  ownerFocusCrop,
  ownerSourceContent,
} from "./focus.ts";
import {
  ownerCameraFollowCrop,
  ownerCameraFollowKey,
  ownerCameraTrackSchema,
  type OwnerCameraTrack,
} from "./camera-follow.ts";
import {
  headEscapesCamera,
  ownerFollowWindow,
  setOwnerFollowWindow,
} from "./camera-follow-window.ts";
import { ownerMediaJobSchema, ownerMediaResultSchema } from "./index.ts";

const focus = defaultOwnerFocus({ width: 480, height: 270 }, 120);
focus.people = [
  {
    id: "person_1",
    observations: [
      {
        startFrame: 0,
        endFrame: 120,
        box: { x: 0.45, y: 0.3, width: 0.1, height: 0.2 },
      },
    ],
  },
];
focus.shots[0]!.personId = "person_1";
focus.shots[0]!.centerX = 0.5;
const path = (x: (frame: number) => number): OwnerCameraTrack => ({
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  personId: "person_1",
  occurrence: "body",
  startFrame: 0,
  endFrame: 120,
  sourceStartFrame: 0,
  focusKey: ownerCameraFollowKey(focus, "person_1"),
  seed: { x: 0.45, y: 0.3, width: 0.1, height: 0.2 },
  outcome: "complete",
  followWindow: 30,
  points: Array.from({ length: 61 }, (_, i) => {
    const frame = Math.min(i * 2, 119);
    return { frame, x: x(frame), y: 0.4 };
  }),
});
it("bounds optional automatic-follow requests to the clip clock and returned framing data", () => {
  const job = {
    operation: "clip-preview",
    workspaceId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    jobId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    clipId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    fingerprint: "a".repeat(64),
    cut: { startFrame: 0, endFrame: 120 },
    followFocus: focus,
  };
  expect(ownerMediaJobSchema.safeParse(job).success).toBe(true);
  expect(
    ownerMediaJobSchema.safeParse({
      ...job,
      cut: { startFrame: 0, endFrame: 121 },
    }).success,
  ).toBe(false);
  const result = {
    operation: "clip-preview",
    frames: 120,
    bytes: 100,
    durationMs: 4000,
    cameraTracks: [path((frame) => 0.5 + (0.1 * frame) / 119)],
  };
  expect(ownerMediaResultSchema.safeParse(result).success).toBe(true);
  expect(
    ownerMediaResultSchema.safeParse({
      ...result,
      cameraTracks: [{ ...result.cameraTracks[0], followWindow: 61 }],
    }).success,
  ).toBe(false);
});
it("holds small head jitter perfectly still without altering legacy paths", () => {
  const track = path((frame) => 0.5 + 0.01 * Math.sin(frame));
  const legacy = { ...track };
  delete legacy.followWindow;
  const baseline = ownerFocusCrop(focus, focus.shots[0]!);
  const xs: number[] = [];
  for (let frame = 0; frame < 120; frame++) {
    expect(ownerCameraFollowCrop(focus, [track], frame, "body", frame)).toEqual(
      baseline,
    );
    xs.push(ownerCameraFollowCrop(focus, [legacy], frame, "body", frame).x);
  }
  expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(5);
  expect(headEscapesCamera(focus, track)).toBe(false);
});
it("follows escaping translation, keeps the head inside and holds through the camera's last frame", () => {
  const track = path((frame) => 0.5 + (0.2 * frame) / 119),
    content = ownerSourceContent(focus.source);
  expect(headEscapesCamera(focus, track)).toBe(true);
  for (let frame = 0; frame < 120; frame++) {
    const crop = ownerCameraFollowCrop(focus, [track], frame, "body", frame),
      head = 0.5 + (0.2 * frame) / 119;
    expect((crop.x - content.x) / content.width).toBeLessThanOrEqual(
      head - 0.05 + 1e-6,
    );
    expect(
      (crop.x + crop.width - content.x) / content.width,
    ).toBeGreaterThanOrEqual(head + 0.05 - 1e-6);
  }
  expect(
    ownerCameraFollowCrop(focus, [track], 119, "body", 119).x,
  ).toBeGreaterThan(ownerFocusCrop(focus, focus.shots[0]!).x + 100);
});
it("preserves same-person camera resets, linked window edits and bounded tolerance", () => {
  const track = path((frame) => 0.5 + (0.2 * frame) / 119),
    other = {
      ...track,
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      continues: track.id,
    };
  expect(
    setOwnerFollowWindow([track, other], other.id, 50).map(
      (t) => t.followWindow,
    ),
  ).toEqual([50, 50]);
  const camera = structuredClone(focus);
  camera.shots = [
    { ...camera.shots[0]!, endFrame: 60 },
    { ...camera.shots[0]!, startFrame: 60, centerX: 0.2 },
  ];
  expect(ownerCameraFollowCrop(camera, [track], 60, "body", 60)).toEqual(
    ownerFocusCrop(camera, camera.shots[1]!),
  );
  const window = ownerFollowWindow(focus, track);
  expect(window.box.width).toBeGreaterThan(track.seed.width);
  expect(window.radius.x).toBeGreaterThan(0);
  for (const followWindow of [-1, 61, NaN, 1.5])
    expect(
      ownerCameraTrackSchema.safeParse({ ...track, followWindow }).success,
    ).toBe(false);
});
