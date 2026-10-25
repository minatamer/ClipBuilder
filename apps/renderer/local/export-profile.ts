import {
  OWNER_FPS,
  type OwnerCut,
  type OwnerSource,
} from "../../../packages/contracts/local/index.ts";
import {
  ownerFocusCrop,
  type OwnerFocus,
  type OwnerFocusShot,
} from "../../../packages/contracts/local/focus.ts";

export type OwnerOutputProfile = {
  width: number;
  height: number;
  fps: number;
  frames: number;
};

/** Final output preserves upright source height/cadence; codec dimensions are even. */
export function ownerOutputProfile(
  source: Pick<OwnerSource, "width" | "height" | "fps">,
  logicalFrames: number,
): OwnerOutputProfile {
  if (
    ![source.width, source.height, source.fps, logicalFrames].every(
      Number.isFinite,
    ) ||
    source.width < 2 ||
    source.height < 2 ||
    source.height > 3840 ||
    source.width > 3840 ||
    source.fps < 12 ||
    source.fps > 60 ||
    logicalFrames < 1 ||
    !Number.isInteger(logicalFrames)
  )
    throw new Error("invalid_export_profile");
  const height = Math.max(4, Math.ceil(source.height / 2) * 2);
  return {
    width: Math.min(height - 2, Math.ceil((height * 9) / 32) * 2),
    height,
    fps: source.fps,
    frames: Math.max(1, Math.round((logicalFrames * source.fps) / OWNER_FPS)),
  };
}

/** Same source-time anchor as the editor; only physical encoding cadence changes. */
export function ownerCutVideoFilter(
  videoStart: number,
  cut: OwnerCut,
  profile: OwnerOutputProfile,
): string {
  // Include the source frame displayed at the cut, rather than a later frame
  // which can fall outside a very short selection at a lower native cadence.
  const start = Math.floor((cut.startFrame * profile.fps) / OWNER_FPS + 1e-9);
  return `setpts=PTS-(${videoStart.toFixed(6)})/TB,fps=fps=${profile.fps}:start_time=0:round=near,trim=start_frame=${start}:end_frame=${start + profile.frames},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=${1 / profile.fps},trim=end_frame=${profile.frames}`;
}

export function ownerCutAudioFilter(videoStart: number, cut: OwnerCut): string {
  return `asetpts=PTS-(${videoStart.toFixed(6)})/TB,aresample=async=1:first_pts=0,apad,atrim=start=${cut.startFrame / OWNER_FPS}:end=${cut.endFrame / OWNER_FPS},asetpts=PTS-STARTPTS`;
}

/** Project accepted preview geometry to original pixels, never through preview video. */
export function ownerOriginalFocusCrop(
  focus: OwnerFocus,
  shot: OwnerFocusShot,
) {
  const crop = ownerFocusCrop(focus, shot),
    source = focus.source;
  // FFmpeg force_original_aspect_ratio rounds to an integer before applying its
  // even-divisibility constraint. This is the actual old preview picture area,
  // which can differ by two pixels from the logical content rectangle.
  const scale = Math.min(1080 / source.width, 1920 / source.height);
  const width = Math.max(
    2,
    Math.floor(Math.round(source.width * scale) / 2) * 2,
  );
  const height = Math.max(
    2,
    Math.floor(Math.round(source.height * scale) / 2) * 2,
  );
  const left = Math.floor((1080 - width) / 4) * 2,
    top = Math.floor((1920 - height) / 4) * 2;
  const even = (value: number) => Math.round(value / 2) * 2;
  const sourceWidth = Math.floor(source.width / 2) * 2,
    sourceHeight = Math.floor(source.height / 2) * 2;
  const cropWidth = Math.max(
    2,
    Math.min(sourceWidth, even((crop.width / width) * source.width)),
  );
  const cropHeight = Math.max(
    2,
    Math.min(sourceHeight, even((crop.height / height) * source.height)),
  );
  return {
    width: cropWidth,
    height: cropHeight,
    x: Math.max(
      0,
      Math.min(
        sourceWidth - cropWidth,
        even(((crop.x - left) / width) * source.width),
      ),
    ),
    y: Math.max(
      0,
      Math.min(
        sourceHeight - cropHeight,
        even(((crop.y - top) / height) * source.height),
      ),
    ),
  };
}
