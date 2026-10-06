import { Easing, interpolate } from "remotion";

export type CameraPose = {
  x: number;
  y: number;
  scale: number;
  pitch: number;
  yaw: number;
  roll: number;
};
type CameraKey = CameraPose & { frame: number };
export type ScreenBeat = "intake" | "analysis" | "choose" | "review" | "result";

// Close-ups settle face-on at cursor actions; the pointer lives on the screen plane.
const cameras: Record<ScreenBeat, readonly CameraKey[]> = {
  intake: [
    { frame: 0, x: 520, y: 365, scale: 0.7, pitch: 12, yaw: -29, roll: -5 },
    { frame: 28, x: 432, y: 285, scale: 0.73, pitch: 0, yaw: 0, roll: 0 },
    { frame: 50, x: 330, y: 255, scale: 0.86, pitch: 0, yaw: 0, roll: 0 },
    { frame: 64, x: 365, y: 215, scale: 0.86, pitch: -5, yaw: 12, roll: 2 },
    { frame: 94, x: 432, y: 280, scale: 0.73, pitch: 0, yaw: 0, roll: 0 },
    { frame: 150, x: 432, y: 280, scale: 0.73, pitch: 0, yaw: 0, roll: 0 },
  ],
  analysis: [
    { frame: 0, x: 480, y: 325, scale: 0.73, pitch: 5, yaw: -17, roll: -2 },
    { frame: 30, x: 432, y: 280, scale: 0.76, pitch: 0, yaw: -8, roll: 0 },
    { frame: 120, x: 368, y: 230, scale: 0.84, pitch: 0, yaw: -8, roll: 0 },
  ],
  choose: [
    { frame: 0, x: 525, y: 340, scale: 0.76, pitch: 8, yaw: -28, roll: -5 },
    { frame: 28, x: 432, y: 280, scale: 0.73, pitch: 0, yaw: 0, roll: 0 },
    { frame: 68, x: 530, y: -30, scale: 1.2, pitch: 0, yaw: 0, roll: 0 },
    { frame: 87, x: 530, y: -30, scale: 1.2, pitch: 0, yaw: 0, roll: 0 },
    { frame: 120, x: 405, y: 275, scale: 0.75, pitch: 0, yaw: 8, roll: 1 },
    { frame: 157, x: 432, y: 280, scale: 0.73, pitch: 0, yaw: 0, roll: 0 },
    { frame: 184, x: 432, y: 280, scale: 0.73, pitch: 0, yaw: 0, roll: 0 },
    { frame: 210, x: 460, y: 305, scale: 0.73, pitch: -5, yaw: -14, roll: -3 },
  ],
  review: [
    { frame: 0, x: 380, y: 390, scale: 0.76, pitch: -9, yaw: 24, roll: 4 },
    { frame: 32, x: 432, y: 280, scale: 0.73, pitch: 0, yaw: 0, roll: 0 },
    { frame: 70, x: 160, y: 35, scale: 1.09, pitch: 0, yaw: 0, roll: 0 },
    { frame: 98, x: 145, y: 28, scale: 1.11, pitch: 0, yaw: 0, roll: 0 },
    { frame: 130, x: 432, y: 280, scale: 0.73, pitch: 0, yaw: 0, roll: 0 },
    { frame: 165, x: 432, y: 280, scale: 0.73, pitch: 0, yaw: 0, roll: 0 },
    { frame: 210, x: 330, y: 235, scale: 0.84, pitch: 5, yaw: -17, roll: -3 },
  ],
  result: [
    { frame: 0, x: 300, y: 340, scale: 0.78, pitch: 10, yaw: 22, roll: 3 },
    { frame: 26, x: 432, y: 280, scale: 0.73, pitch: 0, yaw: 0, roll: 0 },
    { frame: 60, x: 432, y: 280, scale: 0.73, pitch: 0, yaw: 0, roll: 0 },
    { frame: 90, x: 250, y: 235, scale: 0.8, pitch: 4, yaw: 16, roll: 3 },
  ],
};

export function screenCamera(beat: ScreenBeat, frame: number): CameraPose {
  const keys = cameras[beat];
  const value = (property: keyof CameraPose) =>
    interpolate(
      frame,
      keys.map((key) => key.frame),
      keys.map((key) => key[property]),
      {
        easing:
          beat === "analysis" && frame >= 30
            ? Easing.linear
            : Easing.bezier(0.22, 0.7, 0.2, 1),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    );
  return {
    x: value("x"),
    y: value("y"),
    scale: value("scale"),
    pitch: value("pitch"),
    yaw: value("yaw"),
    roll: value("roll"),
  };
}
