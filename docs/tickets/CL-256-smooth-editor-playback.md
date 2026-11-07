# CL-256 — Smooth visual and camera playback

Status: Implemented and verified locally, 2026-11-07; owner device/media acceptance
remains separate. Owner reports consistent playback glitches when
an image appears/is added, sometimes on camera-position changes, and when Zoom or
Motion begins/ends. Requests thorough investigation and professional playback.
The owner also identifies Camera/Zoom/Motion and images as triggers for CL-255's
update-depth warning; carry that correlation into this investigation.

## Scope and acceptance

- Reproduce transition glitches in the normal editor preview with independently
  generated video/images and fake/no-key transports. Measure decoded-frame gaps,
  playback/buffering/seeking events, dropped frames, crop alignment, React update
  warnings and video identity. Cover warm and delayed/cold image loads, changing
  camera rows, gradual Zoom and tracked Motion, plus their boundary frames.
- Fix proven causes rather than mask them with smoothing animations, reduced
  motion, arbitrary waits or loss of image/camera fidelity. Preserve source/audio/
  Hook clocks, immediate camera cuts, native export geometry, live edits, pause/
  seek/Capture, retry and resource cleanup. Never modify the owner's saved clip
  or use it as an automated fixture.
- Preserve playback through already-known visual transitions by preparing assets
  in advance where needed; dynamic image additions must not freeze/seek/remount
  the source video. Preserve error handling and stable contextual feedback.
- Keep expensive editing/preview work off the frame-critical path where evidence
  warrants it. Reuse one shared camera sampler; do not introduce a second canvas
  decoder or migrate saved plans. Extend private bounded diagnostics only where
  existing CL-255 instrumentation cannot identify the measured defect.
- Verify actual continuous playback and edit-time transitions at laptop and
  phone/tablet viewport sizes, with representative source dimensions and image
  sizes. Record objective before/after metrics and hardware/browser limitations;
  synthetic passes cannot guarantee all external devices/networks.
- Review and run scoped unit/browser checks. Shared composition/contract changes
  require current native parity checks/build/reload through verified idle/recovery
  ownership; frontend-only work preserves the normal app. No provider/model call,
  real acquisition, owner clip patch, ignored configuration, Git mutation or
  deployment. Fake/no-key checks prove playback mechanics; real AI quality and
  owner physical-device/hosted acceptance remain separate.

## Evidence

Confirmed causes and changes:

- A picture mounted at its cue start with `Img pauseWhenLoading`, suspending the
  whole Player. A delayed known image produced a **966.5ms** decoded-frame gap;
  a cold dynamic addition produced **950ms**. Even a cached image entered the
  buffering state. `usePreviewImages` now fetches/retains/decode-checks admitted
  bytes as owned Blob URLs, including no-store responses. Known cues use those
  bytes from their first frame. Cold additions become visible when ready without
  suspending/rewinding/remounting the source. Removed/unmounted assets abort and
  release requests, decoded elements and Blob URLs.
- The video's width/height/offsets changed during camera motion, causing **67–68
  layout passes** in the generated sample. Fixed geometry plus one decoded-frame
  compositor transform reduced this to **3** without changing the shared crop
  sampler or native geometry. Independent rendered-rectangle assertions preserve
  CL-212's crop alignment, including Hook/body cuts and CL-250 target hold.
- The Zoom/Motion source inspector sought on Player ticks instead of playing.
  It now uses normal muted playback, with bounded correction only for actual
  jumps/drift, and pauses/settles when editing or seeking. Capture still reads
  the main settled video. No second canvas decoder or corrective main-video seek.
- Full editor playback exposed **three additional video pauses and one source
  seek** at audio cue boundaries (about 3s/4s in generated media). Admitted audio
  is prepared before initial playback; uploaded no-store bytes are retained once
  as owned Blob URLs. Cue tags premount using a noninteractive Sequence wrapper;
  their individual buffering/tag lifecycle no longer suspends the video clock.
  Later source additions prepare without pausing playback. Independent overlapping
  cues keep distinct media identities; unused/unmounted audio releases its bytes,
  elements, abort listeners and preparation timeout. Native mixing is unchanged.

Verification on current frontend source:

- `local-playback-smoothness.proof.ts`: 1080p patterned video, 1920px images,
  delayed no-store responses, known/cold additions, cuts/Zoom/Motion at
  1440×900, 820×1180 and 390×844. Final maximum frame gaps **50–50.2ms**, zero
  buffering events, pauses, source seeks, rewinds, remounts, dropped frames or
  React warnings. Known images are decoded at cue entry. Exactly one completed
  image transfer per session; all owned Blob URLs released on unmount.
- `local-editor-playback.proof.ts`: full styled experience, real fake/no-key HTTP
  clip transport, live Zoom edits, Motion boundaries, image cues and two uploaded
  sound cues. Three widths passed with **zero main-video pauses/seeks/remounts,
  dropped frames or React warnings**; maximum observed callback gaps **66.7–67.1ms**.
  Two uploaded cues reuse one no-store transfer per session. The inspector makes
  only 1–3 bounded resynchronizations over playback, rather than per-tick seeks.
  Zero edit submissions, unexpected requests, plan/image/render calls.
- `local-camera-switch.proof.ts`: all five camera scenarios, ten position-hold
  assertions and seek/edit/replay/replacement/fallback/unmount lifecycle passed;
  zero decoded-frame crop mismatches. The paused edit assertion now waits for
  settled media/paint, instead of assuming an arbitrary 100ms sleep is sufficient.
- `local-visual-sync.proof.ts`: current native synthetic onset/render check
  passed; after retained-byte loading changed, the focused delayed/missing-image
  initial audio/frame gate passed again with exactly one transfer and recovery
  on failure. No provider calls or real source used.
- **17 focused unit tests passed**, including audio ready/error/abort/timeout,
  existing camera clocks/defaults/form guards and diagnostic observer behavior.
  Frontend/root-test TypeScript, scoped ESLint and formatting/whitespace checks
  passed. Final performance runs are isolated from concurrent builds/encodes;
  a deliberately overloaded concurrent run dropped frames and is not reported
  as a successful timing proof. These are local mechanics, not universal hardware
  guarantees or real AI-quality acceptance.
- Codex browser: generated 1080p editor at laptop/tablet/phone sizes, live Zoom
  editing during playback, source/main clocks advancing together, Motion view,
  Discard, no horizontal overflow and no React errors. Only the existing Remotion
  license notice appeared. Screenshot/evidence are outside Git. Agent tab closed,
  viewport reset and generated server stopped. Owner app remains running.

CL-255 continuation repaired and completed the legacy full audio proof. It also
found a real pool lifecycle defect: global-index Sequence keys remounted body
tracks when Hook cues were inserted. Cue/occurrence keys now preserve all twelve
Hook tracks and the exact future body tag. Upload cancel/retry, audible energy,
mute/pause/seek, Apply/Discard, saved reload and synthetic native export pass.
See CL-255 for the expanded strict Next and Codex-browser evidence. No owner
clip was used or repaired; all provider transports remain fake/no-key/paid-off.

## Validation and remaining acceptance

Read-only execute/validate pass: the scoped playback requirements are covered by
the implementation and fresh synthetic checks; no actionable code finding remains.
All changes stay in the frontend and test/documentation surfaces. No shared
native contract/composition change or normal backend/worker reload is required.
No ignored configuration, owner saved clip/source/edit/export, provider/model,
cloud or Git mutation. Preserve all CL-247–255 pending work.

CL-255 remains open for correlation of the original historical owner React
warning. Camera/Zoom/Motion and image-trigger regressions here did not reproduce
it; the existing durable, bounded private diagnostics remain enabled. A read-only
scan found no new captured React issue in the current diagnostic stream. Do not
claim the historical error's exact cause is proved by these passing cases.
Owner physical-device/real-media/hosted review remains separate; keys/live flags
and applicable consent are needed only for real provider processing, not these
playback fixes or fake/no-key checks. Nothing is staged or committed.
